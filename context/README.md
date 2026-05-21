# SecureDocs AI - Postman Collection

Complete API testing collection for SecureDocs AI Authentication Service.

---

## 📋 Contents

### Postman Files

- **SecureDocs-Auth-API.postman_collection.json** - Complete authentication API collection
- **Development.postman_environment.json** - Development environment variables
- **Production.postman_environment.json** - Production environment variables

---

## 🚀 Quick Start

### 1. Import Collection into Postman

1. Open Postman
2. Click **Import** button
3. Select `SecureDocs-Auth-API.postman_collection.json`
4. Click **Import**

### 2. Import Environment

1. Click **Environments** (left sidebar)
2. Click **Import**
3. Select `Development.postman_environment.json` (or Production)
4. Select the environment from the dropdown (top right)

### 3. Start Testing

Execute requests in order:

```
1. Register → 2. Login → 3. Get Profile → 4. Refresh Token → 5. Logout
```

---

## 📝 API Endpoints

### 1. Register

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "company": "Acme Corp",
  "role": "admin"
}
```

**Response (201):**

```json
{
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "company": "Acme Corp",
      "role": "admin",
      "createdAt": "2026-05-21T10:00:00Z"
    },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Auto-saves to environment:**

- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token
- `userId` - User ID

---

### 2. Login

**POST** `/api/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**

```json
{
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "company": "Acme Corp",
      "role": "admin"
    },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Auto-saves to environment:**

- `accessToken` - New JWT access token
- `refreshToken` - New JWT refresh token
- `userId` - User ID

**Token Expiry:**

- Access Token: 1 hour
- Refresh Token: 7 days

---

### 3. Get Profile

**GET** `/api/auth/profile`

Get authenticated user profile.

**Headers Required:**

```
Authorization: Bearer {{accessToken}}
```

**Response (200):**

```json
{
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "company": "Acme Corp",
      "role": "admin",
      "createdAt": "2026-05-21T10:00:00Z",
      "updatedAt": "2026-05-21T10:30:00Z"
    }
  }
}
```

---

### 4. Refresh Token

**POST** `/api/auth/refresh-token`

Get new access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Response (200):**

```json
{
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Auto-saves to environment:**

- `accessToken` - New JWT access token
- `refreshToken` - New JWT refresh token

**When to Use:**

- When access token expires (check if status 401 on protected endpoints)
- To extend session without re-login

---

### 5. Logout

**POST** `/api/auth/logout`

Logout current user.

**Headers Required:**

```
Authorization: Bearer {{accessToken}}
```

**Response (200):**

```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Note:** After logout, access token becomes invalid.

---

## 🔄 Typical Workflow

### Initial Setup

```
1. Register (or Login)
   ↓
   Tokens auto-saved to environment
   ↓
2. Get Profile (verify authentication works)
```

### Session Management

```
1. Access token expires (1 hour)
   ↓
2. Use Refresh Token endpoint
   ↓
   New tokens auto-saved
   ↓
3. Continue using protected endpoints
```

### Session Cleanup

```
1. Logout
   ↓
   Access token invalidated
   ↓
2. Clear environment variables (optional)
```

---

## 📊 Testing Scenarios

### Scenario 1: New User Registration

```
→ Register endpoint
✓ Creates new user account
✓ Returns access + refresh tokens
✓ Tokens saved to environment
```

### Scenario 2: User Login

```
→ Login endpoint
✓ Validates credentials
✓ Returns access + refresh tokens
✓ Tokens saved to environment
```

### Scenario 3: Access Protected Resource

```
→ Get Profile endpoint
✓ Requires valid access token
✓ Returns user information
✓ Access token in Authorization header
```

### Scenario 4: Token Refresh

```
→ Refresh Token endpoint
✓ Validates refresh token
✓ Returns new access + refresh tokens
✓ New tokens saved to environment
```

### Scenario 5: Session Logout

```
→ Logout endpoint
✓ Invalidates access token
✓ Returns success message
✓ Subsequent calls with same token return 401
```

---

## 🔐 Security Notes

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Example Valid Passwords:**

- `SecurePassword123!`
- `MyStr0ng@Pass`
- `Test#Secure2024`

### Token Security

- **Access Token:** Valid for 1 hour, use in Authorization header
- **Refresh Token:** Valid for 7 days, use only to get new access token
- Never expose tokens in public repositories
- Use HTTPS in production

### Best Practices

1. ✅ Store tokens in environment variables
2. ✅ Use Bearer token in Authorization header
3. ✅ Refresh tokens before expiry
4. ✅ Logout when done
5. ✅ Use HTTPS in production
6. ✅ Never hardcode tokens in code

---

## 🛠️ Environment Variables

### Available Variables

| Variable       | Purpose           | Set By                 |
| -------------- | ----------------- | ---------------------- |
| `baseUrl`      | API base URL      | Manual                 |
| `accessToken`  | JWT access token  | Login/Register/Refresh |
| `refreshToken` | JWT refresh token | Login/Register/Refresh |
| `userId`       | Current user ID   | Login/Register         |

### Switching Environments

**Development:**

- Select `Development` from environment dropdown
- Base URL: `http://localhost:3000`

**Production:**

- Select `Production` from environment dropdown
- Base URL: `https://api.securedocs.example.com`

---

## 📌 Common Issues & Solutions

### Issue: 401 Unauthorized

**Problem:** Access token invalid or expired

**Solution:**

1. Verify token exists in environment
2. Check if token has expired (1 hour)
3. Use Refresh Token endpoint to get new token
4. Re-attempt request

### Issue: 400 Bad Request

**Problem:** Missing or invalid request body

**Solution:**

1. Check required fields are present
2. Verify email format is valid
3. Ensure password meets requirements
4. Check JSON syntax is correct

### Issue: 422 Unprocessable Entity

**Problem:** Validation failed

**Solution:**

1. Check all required fields are provided
2. Verify data types are correct
3. Validate email uniqueness (register)
4. Verify password complexity

### Issue: 500 Internal Server Error

**Problem:** Server-side error

**Solution:**

1. Verify backend server is running
2. Check server logs for errors
3. Verify database connection
4. Try request again

---

## 🔗 Related Documentation

- Phase 3 & 4 Implementation: See `/context/` folder
- Backend Setup: See `BACKEND_SETUP.md`
- API Documentation: Check backend documentation

---

## 📞 Support

For issues or questions:

1. Check troubleshooting section above
2. Review error response messages
3. Check backend logs
4. Consult API documentation

---

**Created**: May 21, 2026  
**Version**: 1.0  
**Status**: Production Ready
