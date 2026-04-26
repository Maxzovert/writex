import React, { useState } from "react";
import { DotPattern } from "../../components/magicui/dot-pattern";
import { LineShadowText } from "../../components/magicui/line-shadow-text";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/authContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if(!formData.email || !formData.password || !formData.name || !formData.confirmPassword){
      toast.warning("Please fill all the fields");
      return;
    }
    if(formData.password.length < 6){
      toast.warning("Password must contain 6 Characters");
      return;
    }
    if(formData.password !== formData.confirmPassword){
      toast.error("Passwords Do Not match");
      return;
    }

    try {
      // const response = await axios.post('/api/users/signup', {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/signup`, {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      setUser(response.data);
      toast.success("Account Created Successfully");
      localStorage.setItem('token', response.data.token);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left side - Branding */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-screen rounded-b-[50px] lg:rounded-b-none lg:rounded-r-[150px] bg-stone-100 dark:bg-stone-950">
        <div className="absolute inset-0 z-10">
          <DotPattern className="rounded-b-[50px] lg:rounded-b-none lg:rounded-r-[150px]" />
        </div>

        <div className="flex flex-col justify-center items-center h-full px-4">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold z-10 text-center text-foreground">Signup</h1>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold z-10 mt-4 lg:mt-8 mb-4 lg:mb-8 text-foreground">Now To</h1>
          <div className="flex items-center justify-center flex-col relative z-10">
            <div className="text-4xl sm:text-6xl lg:text-8xl">
              Write<LineShadowText>X</LineShadowText>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-8 lg:py-0">
        <div className="w-full max-w-md lg:max-w-lg xl:w-[500px] space-y-6 lg:space-y-8 px-6 lg:p-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6 lg:mb-8 text-center lg:text-left">
            Create Account
          </h2>

          <div className="space-y-3">
            <label
              htmlFor="name"
              className="text-sm lg:text-base font-medium text-foreground"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 lg:px-5 py-3 text-base lg:text-lg border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="Max"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="email"
              className="text-sm lg:text-base font-medium text-foreground"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 lg:px-5 py-3 text-base lg:text-lg border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="max@example.com"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="password"
              className="text-sm lg:text-base font-medium text-foreground"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 lg:px-5 py-3 text-base lg:text-lg border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="confirmPassword"
              className="text-sm lg:text-base font-medium text-foreground"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 lg:px-5 py-3 text-base lg:text-lg border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
              Remember me 
            </label>
          </div>

          <button
            className="w-full bg-primary text-primary-foreground py-3 lg:py-4 rounded-xl text-base lg:text-lg font-semibold hover:bg-primary/90 transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
            onClick={handleSignUp}
          >
            Sign Up
          </button>

          <p className="text-center text-sm lg:text-base text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-foreground font-semibold hover:text-primary transition-colors duration-200"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
