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
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
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
        password: formData.password
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
    <div className="h-screen flex">
      {/* Left */}
      <div className="relative w-1/2 rounded-r-[150px] bg-stone-100">
        <div className="absolute inset-0 z-10">
          <DotPattern className="rounded-r-[150px]" />
        </div>

        <div className="flex flex-col justify-center items-center mt-[20%]">
          <h1 className="text-8xl font-bold z-10">Signup</h1>
          <h1 className="text-4xl font-bold z-10 mt-8 mb-8">Now To</h1>
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
            Create Account
          </h2>

          <div className="space-y-3">
            <label
              htmlFor="name"
              className="text-base font-medium text-gray-800"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="Max"
            />
          </div>

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
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="max@example.com"
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
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="confirmPassword"
              className="text-base font-medium text-gray-800"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
            onClick={handleSignUp}
          >
            Sign Up
          </button>

          <p className="text-center text-base text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-gray-900 font-semibold hover:text-gray-700 transition-colors duration-200"
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
