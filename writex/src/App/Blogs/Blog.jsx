import React from "react";
import Navbar from "../Components/Navbar";

const Blog = () => {

  const CATAGORY = [
    {
      type: "General",
    },
    {
      type: "Personal",
    },
    {
      type: "Business",
    },
    {
      type: "Tech",
    },
  ];

  return (
    <div>
      <Navbar />
      <div className="flex-row flex justify-center items-center w-full mt-12">
        {CATAGORY.map((type, index) => (
          <div key={index}>
            <div className="font-medium text-gray-500 mr-12 ml-12 hover:text-gray-900 cursor-pointer">{type.type}</div>
            <div className="border-b-2 mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
