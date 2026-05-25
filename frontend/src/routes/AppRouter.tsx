import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import DashboardPage from '../pages/DashboardPage';
import DocumentsPage from '../pages/DocumentsPage';
import DetailedRiskReportPage from '../pages/DetailedRiskReportPage';
import SecureVaultPage from '../pages/SecureVaultPage';
import SettingsPage from '../pages/SettingsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AdminRoute } from './AdminRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path={ROUTES.REGISTER} element={<PublicRoute><RegisterPage /></PublicRoute>} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
        <Route path={ROUTES.REPORTS} element={<DetailedRiskReportPage />} />
        <Route path={ROUTES.VAULT} element={<SecureVaultPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        
        {/* Example of a Role-Based Route (Only Admin & Analyst) */}
        <Route 
          path="/advanced-analysis" 
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}>
              <div>Advanced Analysis Tools</div>
            </RoleBasedRoute>
          } 
        />

        {/* Example of a Strict Admin Route */}
        <Route 
          path="/system-logs" 
          element={
            <AdminRoute>
              <div>System Logs</div>
            </AdminRoute>
          } 
        />
      </Route>

      {/* Redirect all unknown routes to dashboard */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};
