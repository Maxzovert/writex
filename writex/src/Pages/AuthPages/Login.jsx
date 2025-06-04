import React from "react";

const Login = () => {
  return (
    <div className="w-[500px] space-y-8 p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Login To Your Account</h2>

      <div className="space-y-3">
        <label htmlFor="email" className="text-base font-medium text-gray-800">Email</label>
        <input
          type="email"
          id="email"
          className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="password" className="text-base font-medium text-gray-800">Password</label>
        <input
          type="password"
          id="password"
          className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
          placeholder="••••••••"
        />
      </div>

      <button className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl">
        Sign Up
      </button>

      <p className="text-center text-base text-gray-600">
        Don't have an account?{" "}
        <a href="/signup" className="text-gray-900 font-semibold hover:text-gray-700 transition-colors duration-200">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default Login
