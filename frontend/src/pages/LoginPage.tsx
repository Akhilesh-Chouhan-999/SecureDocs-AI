import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../constants/routes";
import toast from "react-hot-toast";
import { FiLock } from "react-icons/fi";
import { LoginForm } from "../components/forms/LoginForm";

export default function Login() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[448px] p-8 rounded-2xl glass-card relative z-10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4 transform hover:scale-105 transition-transform">
            <FiLock className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            SecureDoc AI
          </h2>
          <p className="text-neutral-500 mt-2 font-medium">
            Sign in to your intelligent workspace
          </p>
        </div>

        <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />

        <p className="mt-8 text-center text-sm text-neutral-500">
          Don't have an account?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
          >
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
