import React, { useState } from 'react'
import { DotPattern } from "../../components/magicui/dot-pattern";
import { LineShadowText } from "../../components/magicui/line-shadow-text";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/authContext';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
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
        password: formData.password
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-screen rounded-b-[50px] lg:rounded-b-none lg:rounded-r-[150px] bg-stone-100">
        <div className="absolute inset-0 z-10">
          <DotPattern className="rounded-b-[50px] lg:rounded-b-none lg:rounded-r-[150px]" />
        </div>

        <div className="flex flex-col justify-center items-center h-full px-4">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold z-10 text-center">Login</h1>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold z-10 mt-4 lg:mt-8 mb-4 lg:mb-8">To</h1>
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
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8 text-center lg:text-left">
            Login To Your Account
          </h2>

          <div className="space-y-3">
            <label
              htmlFor="email"
              className="text-sm lg:text-base font-medium text-gray-800"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              onChange={handleChange}
              value={formData.email}
              required
              className="w-full px-4 lg:px-5 py-3 text-base lg:text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="password"
              className="text-sm lg:text-base font-medium text-gray-800"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              onChange={handleChange}
              value={formData.password}
              required
              className="w-full px-4 lg:px-5 py-3 text-base lg:text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button 
            className="w-full bg-gray-900 text-white py-3 lg:py-4 rounded-xl text-base lg:text-lg font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
            onClick={handleLogin}
          >
            Login
          </button>

          <p className="text-center text-sm lg:text-base text-gray-600">
            Dont have an account?{" "}
            <a
              href="/signup"
              className="text-gray-900 font-semibold hover:text-gray-700 transition-colors duration-200"
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
