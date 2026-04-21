import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

interface RoleRouteProps {
  role: UserRole;
}

export default function RoleRoute({ role }: RoleRouteProps) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    const redirectMap: Record<UserRole, string> = {
      passenger: "/passenger/dashboard",
      rider: "/rider/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  return <Outlet />;
}
