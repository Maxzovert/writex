import React from "react";
import { DotPattern } from "../../components/magicui/dot-pattern";
import { LineShadowText } from "../../components/magicui/line-shadow-text";
import Login from "./Login";

const layout = () => {
  return (
    <div className="flex flex-row justify-between" >
    <div className="relative w-1/2 rounded-r-[150px] bg-stone-100">
      <div className="absolute inset-0 z-10">
        <DotPattern className="rounded-r-[150px]" />
      </div>

      <div className="flex flex-col justify-center items-center mt-[20%]">
        <h1 className="text-8xl font-bold z-10">Login</h1>
        <h1 className="text-4xl font-bold z-10 mt-8 mb-8">Now To</h1>
        <div className="flex items-center justify-center flex-col relative z-10">
          <div className="text-8xl">
            Write<LineShadowText>X</LineShadowText>
          </div>
        </div>
      </div>
    </div>

      <div className="w-1/2 flex items-center justify-center bg-gray-50 min-h-screen">
        <Login/>
      </div>

    </div>
  );
};

export default layout;
