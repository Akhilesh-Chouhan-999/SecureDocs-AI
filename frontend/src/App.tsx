import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/shared/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import DocumentsPage from "./pages/DocumentsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { ROUTES } from "./constants/routes";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "glass",
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />

      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path={ROUTES.HOME}
            element={
              <MainLayout>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />

          <Route
            path={ROUTES.DOCUMENTS}
            element={
              <MainLayout>
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                      Documents
                    </h1>
                    <p className="text-neutral-400 mt-1">
                      Upload and manage documents for analysis
                    </p>
                  </div>
                  <DocumentsPage />
                </div>
              </MainLayout>
            }
          />

          <Route
            path={ROUTES.REPORTS}
            element={
              <MainLayout>
                <ReportsPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </>
  );
}
