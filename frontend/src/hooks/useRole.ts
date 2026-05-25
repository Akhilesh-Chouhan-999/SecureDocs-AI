import { useAuthStore } from '../store/authStore';
import { Role, ROLES, PERMISSIONS } from '../constants/roles';

export function useRole() {
  const { user } = useAuthStore();
  const currentRole = user?.role as Role | undefined;

  const hasRole = (role: Role) => currentRole === role;
  
  const hasAnyRole = (roles: Role[]) => {
    if (!currentRole) return false;
    return roles.includes(currentRole);
  };

  const hasPermission = (permission: keyof typeof PERMISSIONS) => {
    if (!currentRole) return false;
    const allowedRoles = PERMISSIONS[permission] as readonly Role[];
    return allowedRoles.includes(currentRole);
  };

  return {
    currentRole,
    isAdmin: currentRole === ROLES.ADMIN,
    isAnalyst: currentRole === ROLES.ANALYST,
    hasRole,
    hasAnyRole,
    hasPermission,
  };
}
