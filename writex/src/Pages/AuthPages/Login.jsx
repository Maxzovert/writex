import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "@/context/authContext";
import { AuthField, AuthShell, AuthSubmit } from "@/components/auth/AuthShell";

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.warning("Please fill all the fields");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/login`,
        {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }
      );
      localStorage.setItem("token", response.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      await refreshUser();
      toast.success("Login Successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      heading="Log in"
      subheading="Continue drafts, folders, and your feed."
      footer={
        <p className="text-center text-sm text-[var(--wx-mute)]">
          New here?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[var(--wx-accent)] hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@email.com"
          autoComplete="email"
        />
        <AuthField
          id="password"
          label="Password"
          type={isVisible ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          placeholder="Your password"
          autoComplete="current-password"
          rightSlot={
            <button
              type="button"
              onClick={() => setIsVisible((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--wx-mute)] hover:text-[var(--wx-text)]"
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? (
                <FaEyeSlash className="h-4 w-4" />
              ) : (
                <FaEye className="h-4 w-4" />
              )}
            </button>
          }
        />
        <label className="inline-flex items-center gap-2 text-sm text-[var(--wx-mute)]">
          <input
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-[var(--wx-line)] bg-transparent"
          />
          Remember me
        </label>
        <AuthSubmit loading={loading}>Log in</AuthSubmit>
      </form>
    </AuthShell>
  );
};

export default Login;
