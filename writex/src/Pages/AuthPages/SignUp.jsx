import React from "react";
import { DotPattern } from "../../components/magicui/dot-pattern";
import { LineShadowText } from "../../components/magicui/line-shadow-text";
import { Pointer } from "../../components/magicui/pointer";

const SignUp = () => {
  return (
    <div className="h-screen flex">
      <Pointer />
      {/* Left */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-[500px] space-y-8 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Create Account</h2>
          
          <div className="space-y-3">
            <label htmlFor="name" className="text-base font-medium text-gray-800">Full Name</label>
            <input
              type="text"
              id="name"
              className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="John Doe"
            />
          </div>

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

          <div className="space-y-3">
            <label htmlFor="confirmPassword" className="text-base font-medium text-gray-800">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-5 py-3 text-lg border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl">
            Sign Up
          </button>

          <p className="text-center text-base text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-gray-900 font-semibold hover:text-gray-700 transition-colors duration-200">
              Sign in
            </a>
          </p>
        </div>
      </div>
      {/* right */}
      <div className="relative w-1/2 rounded-l-[150px] bg-stone-100">
        <div className="absolute inset-0 z-10">
          <DotPattern className="rounded-l-[150px]"/>
        </div>

        <div className="flex flex-col justify-center items-center mt-[20%]">
          <h1 className="text-8xl font-bold z-10">Sign in</h1>
          <h1 className="text-4xl font-bold z-10 mt-8 mb-8">Now To</h1>
          <div className="flex items-center justify-center flex-col relative z-10">
            <div className="text-8xl">
              Write<LineShadowText>X</LineShadowText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
