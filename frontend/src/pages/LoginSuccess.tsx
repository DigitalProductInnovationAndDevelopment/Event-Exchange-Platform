import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import useApiService from "../services/apiService";
import { getFullName } from "types/employee.ts";
import toast from "react-hot-toast";

export const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isAuthenticated } = useAuth();
  const { getOwnProfile } = useApiService();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  useEffect(() => {
    const doLogin = async () => {
      try {

        const ownProfile = await getOwnProfile();

        const values = {
          name: getFullName(ownProfile!) || "",
          email: ownProfile!.email || "",
          roles: ownProfile!.authorities || [],
        };

        await login(values);
        toast.success("Welcome!");
        navigate(from, { replace: true });
      } catch (err) {
        toast.error("Login failed");
        console.error(err);
        logout();
        navigate("/", { replace: true });
      }
    };
    doLogin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      Success. Redirecting to the dashboard...
    </div>
  );
};
