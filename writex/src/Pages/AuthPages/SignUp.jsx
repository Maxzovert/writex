import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "@/context/authContext";
import { AuthField, AuthShell, AuthSubmit } from "@/components/auth/AuthShell";
import { Auth0SocialActions } from "@/components/auth/Auth0SocialActions";
import { isAuth0Configured } from "@/lib/auth0-config";

const SignUp = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.confirmPassword
    ) {
      toast.warning("Please fill all the fields");
      return;
    }
    if (formData.password.length < 6) {
      toast.warning("Password must contain 6 Characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords Do Not match");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/signup`,
        {
          username: formData.name,
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }
      );
      localStorage.setItem("token", response.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      await refreshUser();
      toast.success("Account Created Successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="signup"
      heading="Create account"
      subheading="Canvas, folders, bookmarks, PDF — free forever."
      footer={
        <p className="text-center text-sm text-[var(--wx-mute)]">
          Already writing here?{" "}
          <Link
            to="/login"
            className="font-semibold text-[var(--wx-accent)] hover:underline"
          >
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSignUp} className="space-y-3.5">
        <AuthField
          id="name"
          label="Username"
          value={formData.name}
          onChange={handleChange}
          placeholder="yourname"
          autoComplete="username"
        />
        <AuthField
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@email.com"
          autoComplete="email"
        />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AuthField
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--wx-mute)] hover:text-[var(--wx-text)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-4 w-4" />
                ) : (
                  <FaEye className="h-4 w-4" />
                )}
              </button>
            }
          />
          <AuthField
            id="confirmPassword"
            label="Confirm"
            type={showConfirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat"
            autoComplete="new-password"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--wx-mute)] hover:text-[var(--wx-text)]"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <FaEyeSlash className="h-4 w-4" />
                ) : (
                  <FaEye className="h-4 w-4" />
                )}
              </button>
            }
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-[var(--wx-mute)]">
          <input
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-[var(--wx-line)] bg-transparent"
          />
          Keep me signed in
        </label>

        <AuthSubmit loading={loading}>Start writing</AuthSubmit>
      </form>

      {isAuth0Configured() ? (
        <div className="mt-5">
          <Auth0SocialActions mode="signup" />
        </div>
      ) : null}
    </AuthShell>
  );
};

export default SignUp;
