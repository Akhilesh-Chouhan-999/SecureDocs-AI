# Deployment & DevOps Guide

## Deployment Strategy

SecureDoc AI uses a three-tier deployment: Development → Staging → Production.

---

## 1. Dockerize Backend

Create `backend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY .env.production ./.env

USER node

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```

Create `backend/.dockerignore`:

```
node_modules
npm-debug.log
.env.development
.env.staging
.git
.gitignore
README.md
.DS_Store
__tests__
coverage
logs
uploads/*
!uploads/.gitkeep
```

---

## 2. Docker Compose (Development)

Create `docker-compose.yml`:

```yaml
version: "3.9"

services:
  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: securedoc-backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://mongodb:27017/securedoc_ai
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./backend/src:/app/src
      - ./backend/uploads:/app/uploads
    command: npm run dev
    networks:
      - app-network

  # MongoDB
  mongodb:
    image: mongo:7
    container_name: securedoc-mongo
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  # Redis
  redis:
    image: redis:7-alpine
    container_name: securedoc-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

  # ChromaDB
  chromadb:
    image: chromadb/chroma:latest
    container_name: securedoc-chromadb
    ports:
      - "8000:8000"
    volumes:
      - chromadb_data:/data
    networks:
      - app-network

volumes:
  mongodb_data:
  redis_data:
  chromadb_data:

networks:
  app-network:
    driver: bridge
```

Start services:

```bash
docker-compose up --build
```

---

## 3. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run linter
        run: cd backend && npm run lint

      - name: Run tests
        run: cd backend && npm test
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/securedoc_test
          REDIS_URL: redis://localhost:6379
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/securedoc:latest
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/securedoc:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/securedoc:buildcache,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to AWS EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.AWS_HOST }}
          username: ec2-user
          key: ${{ secrets.AWS_SSH_KEY }}
          script: |
            cd /app/securedoc
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T backend npm run migrate
```

---

## 4. Environment-Specific Deployment

### Staging Deployment

```bash
# Deploy to staging
docker build -f backend/Dockerfile.staging -t securedoc:staging ./backend
docker tag securedoc:staging myregistry/securedoc:staging
docker push myregistry/securedoc:staging

# Start on staging server
ssh staging-server
docker pull myregistry/securedoc:staging
docker-compose -f docker-compose.staging.yml up -d
```

### Production Deployment

```bash
# Backup production database
./scripts/backup-prod.sh

# Blue-green deployment
docker pull myregistry/securedoc:latest
docker tag myregistry/securedoc:latest securedoc-new:latest

# Start new version on different port
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl http://localhost:5001/health

# Switch traffic (if healthy)
# Update load balancer to point to port 5001

# Stop old version
docker-compose -f docker-compose.prod.old.yml down
```

---

## 5. Kubernetes Deployment

Create `k8s/backend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: securedoc-backend
  labels:
    app: securedoc
spec:
  replicas: 3
  selector:
    matchLabels:
      app: securedoc
      tier: backend
  template:
    metadata:
      labels:
        app: securedoc
        tier: backend
    spec:
      containers:
        - name: backend
          image: myregistry/securedoc:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              value: "production"
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: securedoc-secrets
                  key: mongodb-uri
            - name: REDIS_URL
              value: "redis://securedoc-redis:6379"
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: securedoc-secrets
                  key: openai-api-key
          livenessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: securedoc-backend-service
spec:
  selector:
    app: securedoc
    tier: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f k8s/
kubectl rollout status deployment/securedoc-backend
```

---

## 6. Monitoring & Logging

### Sentry Error Tracking

```bash
npm install @sentry/node @sentry/tracing
```

Add to `src/index.js`:

```javascript
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({
      app: true,
      request: true,
    }),
  ],
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Error handler after routes
app.use(Sentry.Handlers.errorHandler());
```

### Winston Logging

```bash
npm install winston winston-daily-rotate-file
```

Create `src/utils/logger.js`:

```javascript
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "securedoc-api" },
  transports: [
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

module.exports = logger;
```

---

## 7. Database Migrations

Create `scripts/migrate.js`:

```javascript
const mongoose = require("mongoose");
require("dotenv").config();

const migrations = [
  {
    version: 1,
    name: "initial-setup",
    up: async () => {
      console.log("Running migration 1...");
      // Add indexes
      const User = require("../src/api/models/User");
      await User.collection.createIndex({ email: 1 }, { unique: true });
    },
    down: async () => {
      console.log("Reverting migration 1...");
    },
  },
];

const migrate = async (direction = "up") => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const migration of migrations) {
      if (direction === "up") {
        await migration.up();
      } else {
        await migration.down();
      }
    }

    console.log(`Migrations completed (${direction})`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate(process.argv[2] || "up");
```

Run:

```bash
node scripts/migrate.js up
```

---

## 8. Health Checks & Readiness

```javascript
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

app.get("/ready", async (req, res) => {
  try {
    // Check MongoDB
    await mongoose.connection.db.admin().ping();

    // Check Redis
    await redis.ping();

    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});
```

---

## 9. Backup Strategy

Create `scripts/backup-prod.sh`:

```bash
#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump \
  --uri=$MONGODB_URI \
  --out=$BACKUP_DIR/mongodb_$TIMESTAMP

# Backup Redis
docker exec securedoc-redis redis-cli BGSAVE

docker cp securedoc-redis:/data/dump.rdb $BACKUP_DIR/redis_$TIMESTAMP.rdb

# Upload to S3
aws s3 cp $BACKUP_DIR s3://securedoc-backups/$TIMESTAMP/ --recursive

echo "Backup completed: $TIMESTAMP"
```

Schedule with cron:

```bash
0 2 * * * /app/scripts/backup-prod.sh
```

---

## 10. Performance Optimization

### Caching Strategy

```javascript
const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

// Cache middleware
app.use((req, res, next) => {
  const key = `${req.method}:${req.originalUrl}`;

  client.get(key, (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    }

    // Wrap res.json to cache response
    const originalJson = res.json;
    res.json = function (data) {
      client.setex(key, 300, JSON.stringify(data)); // Cache 5 min
      originalJson.call(this, data);
    };

    next();
  });
});
```

### Load Balancing

```nginx
upstream backend {
    server securedoc-1:5000;
    server securedoc-2:5000;
    server securedoc-3:5000;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "upgrade";
        proxy_set_header Upgrade $http_upgrade;
    }
}
```

---

## 11. Rollback Procedure

```bash
# If deployment fails, rollback to previous version
docker-compose -f docker-compose.prod.old.yml up -d

# Or with Kubernetes
kubectl rollout undo deployment/securedoc-backend

# Verify health
curl https://api.securedoc.ai/health
```

---

## 12. Deployment Checklist

Before production deployment:

- [ ] All tests passing
- [ ] Security scan completed (npm audit)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backups created
- [ ] Load testing completed
- [ ] Team approval obtained
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
