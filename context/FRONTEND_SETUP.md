# Frontend Setup Guide (React 18+)

## Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Backend server running (see BACKEND_SETUP.md)

---

## Step 1: Create React App

```bash
cd frontend
npx create-react-app . --template cra-template

# Or with TypeScript
npx create-react-app . --template typescript
```

---

## Step 2: Install Dependencies

```bash
npm install react-router-dom
npm install axios
npm install tailwindcss postcss autoprefixer
npm install react-hot-toast
npm install zustand                  # State management
npm install socket.io-client        # Real-time updates
npm install chart.js react-chartjs-2  # Analytics
npm install react-icons
npm install lodash
npm install date-fns
npm install --save-dev prettier eslint
```

---

## Step 3: Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Loading.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── documents/
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   └── DocumentViewer.jsx
│   │   ├── analysis/
│   │   │   ├── AnalysisStatus.jsx
│   │   │   ├── FraudCard.jsx
│   │   │   └── RiskIndicator.jsx
│   │   ├── reports/
│   │   │   ├── ReportViewer.jsx
│   │   │   ├── ReportDownload.jsx
│   │   │   └── ReportHistory.jsx
│   │   └── dashboard/
│   │       ├── Dashboard.jsx
│   │       ├── AnomalySummary.jsx
│   │       └── RecentActivity.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DocumentsPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js             # Axios instance
│   │   ├── authService.js
│   │   ├── documentService.js
│   │   ├── analysisService.js
│   │   └── reportService.js
│   ├── store/
│   │   ├── authStore.js       # Zustand store
│   │   ├── documentStore.js
│   │   └── analysisStore.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── responsive.css
│   ├── App.jsx
│   └── index.js
├── .env.example
├── .gitignore
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Step 4: Environment Configuration

Create `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_ENV=development
```

---

## Step 5: Setup Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fraud: "#ef4444", // Red for fraud
        warning: "#f59e0b", // Orange for warning
        safe: "#10b981", // Green for safe
        neutral: "#6b7280", // Gray
      },
    },
  },
  plugins: [],
};
```

---

## Step 6: Setup API Service

Create `src/services/api.js`:

```javascript
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

## Step 7: Setup State Management (Zustand)

Create `src/store/authStore.js`:

```javascript
import create from "zustand";
import api from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isLoading: false,
  error: null,

  register: async (email, password, organization) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.post("/auth/register", {
        email,
        password,
        organization,
      });
      localStorage.setItem("token", token);
      set({ user, token, isLoading: false });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", token);
      set({ user, token, isLoading: false });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
```

---

## Step 8: Create Authentication Flow

Create `src/components/auth/Login.jsx`:

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">SecureDoc AI</h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## Step 9: Document Upload Component

Create `src/components/documents/DocumentUpload.jsx`:

```javascript
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function DocumentUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = async (files) => {
    if (!files[0]) return;

    const file = files[0];
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only PDF and images allowed");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large (max 50MB)");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { document } = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Document uploaded!");
      onUploadSuccess(document);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input
        type="file"
        id="file"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <label htmlFor="file" className="cursor-pointer">
        <h3 className="text-lg font-semibold">Drop documents here</h3>
        <p className="text-gray-500 text-sm">PDF, JPG, PNG (max 50MB)</p>
        {isLoading && <p className="text-blue-600 mt-2">Uploading...</p>}
      </label>
    </div>
  );
}
```

---

## Step 10: Dashboard Component

Create `src/components/dashboard/Dashboard.jsx`:

```javascript
import { useEffect, useState } from "react";
import api from "../../services/api";
import FraudCard from "./FraudCard";
import RiskIndicator from "../analysis/RiskIndicator";
import Loading from "../common/Loading";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await api.get("/reports");
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  const criticalReports = reports.filter((r) => r.riskLevel === "Critical");
  const highRiskReports = reports.filter((r) => r.riskLevel === "High");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-600 font-semibold">Critical Fraud</p>
          <p className="text-3xl font-bold text-red-700">
            {criticalReports.length}
          </p>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <p className="text-orange-600 font-semibold">High Risk</p>
          <p className="text-3xl font-bold text-orange-700">
            {highRiskReports.length}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <p className="text-green-600 font-semibold">Total Reports</p>
          <p className="text-3xl font-bold text-green-700">{reports.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Reports</h2>
        {reports.slice(0, 5).map((report) => (
          <FraudCard key={report._id} report={report} />
        ))}
      </div>
    </div>
  );
}
```

---

## Step 11: Real-time Updates with WebSocket

```bash
npm install socket.io-client
```

Create `src/services/websocket.js`:

```javascript
import io from "socket.io-client";

const WS_URL = process.env.REACT_APP_WS_URL;

export const socket = io(WS_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
});

socket.on("connect", () => console.log("Connected"));
socket.on("disconnect", () => console.log("Disconnected"));

export const subscribeToAnalysis = (jobId, callback) => {
  socket.on(`analysis:${jobId}`, callback);
};

export const unsubscribeFromAnalysis = (jobId) => {
  socket.off(`analysis:${jobId}`);
};
```

---

## Step 12: Start Development Server

Add to `package.json`:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "lint": "eslint src/",
  "format": "prettier --write src/"
}
```

Run:

```bash
npm start
```

Frontend runs on `http://localhost:3000`

---

## Common Components

### Fraud Card Component

```javascript
export default function FraudCard({ report }) {
  const getRiskColor = (level) => {
    switch (level) {
      case "Critical":
        return "text-red-600 bg-red-50";
      case "High":
        return "text-orange-600 bg-orange-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-green-600 bg-green-50";
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{report.documentId}</h3>
          <p className="text-sm text-gray-600">{report.createdAt}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full font-semibold ${getRiskColor(report.riskLevel)}`}
        >
          {report.riskLevel}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Risk Score</span>
          <span className="font-semibold">{report.riskScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              report.riskScore > 80
                ? "bg-red-500"
                : report.riskScore > 60
                  ? "bg-orange-500"
                  : report.riskScore > 30
                    ? "bg-yellow-500"
                    : "bg-green-500"
            }`}
            style={{ width: `${report.riskScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Testing

```bash
npm test
```

Example test file `src/components/__tests__/Login.test.js`:

```javascript
import { render, screen } from "@testing-library/react";
import Login from "../auth/Login";

test("renders login form", () => {
  render(<Login />);
  expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});
```

---

## Build for Production

```bash
npm run build
```

Output in `build/` folder ready for deployment.
