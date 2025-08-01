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
    <div className="h-screen flex">
    <div className="relative w-1/2 rounded-r-[150px] bg-stone-100">
      <div className="absolute inset-0 z-10">
        <DotPattern className="rounded-r-[150px]" />
      </div>

      <div className="flex flex-col justify-center items-center mt-[20%]">
        <h1 className="text-8xl font-bold z-10">Login</h1>
        <h1 className="text-4xl font-bold z-10 mt-8 mb-8">To</h1>
        <div className="flex items-center justify-center flex-col relative z-10">
          <div className="text-8xl">
            Write<LineShadowText>X</LineShadowText>
          </div>
        </div>
      </div>
    </div>
    <div className="w-1/2 flex items-center justify-center">
      <div className="w-[500px] space-y-8 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Login To Your Account
        </h2>


        <div className="space-y-3">
          <label
            htmlFor="email"
            className="text-base font-medium text-gray-800"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="password"
            className="text-base font-medium text-gray-800"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            onChange={handleChange}
            value={formData.password}
            required
            className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
            placeholder="••••••••"
          />
        </div>

        <button className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
        onClick={handleLogin}
        >
          Login
        </button>

        <p className="text-center text-base text-gray-600">
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
