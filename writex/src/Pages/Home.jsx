import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Dashboard from "../App/Dashboard/Dashboard";
import { DotPattern } from "../components/magicui/dot-pattern";
import { LineShadowText } from "../components/magicui/line-shadow-text";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";
import { TypingAnimation } from "../components/magicui/typing-animation";
const Home = () => {

  const Navigate = useNavigate()

  const handleClick = () => {
    Navigate("/dashboard")
  }
  return (
    <>
      <div className="relative h-[800px] w-full overflow-hidden flex justify-center bg-stone-200 border-b-4 rounded-b-4xl">
        <div className="absolute inset-0 z-0">
          <DotPattern />
        </div>
        <div className="flex items-center justify-center flex-col relative z-10">
          <div className="text-9xl mt-[200px]">
            Write<LineShadowText>X</LineShadowText>
          </div>
            <p>Write Your Thoughts and ideas</p>
          <InteractiveHoverButton className="mt-8" onClick={handleClick}>
            Go To Dashboard
          </InteractiveHoverButton>
        </div>
      </div>
    </>
  );
};

export default Home;
