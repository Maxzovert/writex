import React, { useState } from 'react'
import { DotPattern } from "../../components/magicui/dot-pattern";
import { LineShadowText } from "../../components/magicui/line-shadow-text";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/authContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })
  const [isVIsible , setISVisible] = useState(false)
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    if(!formData.email || !formData.password){
      toast.warning("Please fill all the fields");
      return;
    }

    try {
      // const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/login`, {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      }
      // , { withCredentials: true}
      );
      setUser(response.data);
      toast.success("Login Successfully");
      navigate("/dashboard");
      localStorage.setItem('token',response.data.token);
      // Set this once after login/signup
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  }

  const toggleVisibility = () => {
    setISVisible(!isVIsible)
  }
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left side - Branding */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-screen rounded-b-[50px] lg:rounded-b-none lg:rounded-r-[150px] bg-stone-100 dark:bg-stone-950">
        <div className="absolute inset-0 z-10">
          <DotPattern className="rounded-b-[50px] lg:rounded-b-none lg:rounded-r-[150px]" />
        </div>

        <div className="flex flex-col justify-center items-center h-full px-4">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold z-10 text-center text-foreground">Login</h1>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold z-10 mt-4 lg:mt-8 mb-4 lg:mb-8 text-foreground">To</h1>
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
            Login To Your Account
          </h2>

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
              onChange={handleChange}
              value={formData.email}
              required
              className="w-full px-4 lg:px-5 py-3 text-base lg:text-lg border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="password"
              className="text-sm lg:text-base font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={isVIsible ? "text" : "password"}
                id="password"
                onChange={handleChange}
                value={formData.password}
                required
                className="w-full pr-12 px-4 lg:px-5 py-3 text-base lg:text-lg border-2 border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                aria-label={isVIsible ? "Hide password" : "Show password"}
              >
                {isVIsible ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
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
            onClick={handleLogin}
          >
            Login
          </button>

          <p className="text-center text-sm lg:text-base text-muted-foreground">
            Dont have an account?{" "}
            <a
              href="/signup"
              className="text-foreground font-semibold hover:text-primary transition-colors duration-200"
            >
              Signup
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
