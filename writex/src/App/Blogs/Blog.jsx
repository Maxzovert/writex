import React, { useEffect, useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";

const Blog = () => {
  const [data , setData] = useState([]);
  const hasFatched = useRef(false);

  const handleFetchAllBlogs = async()=> {
    if(hasFatched.current) return;
      hasFatched.current = true;

      try {
        const fetchData = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/public/posts/blogs/`);
        console.log(fetchData.data.allBlogs)
        setData(fetchData.data.allBlogs);
        toast.success("Blog Fetched")
      } catch (error) {
        toast.error("Error in handle fetch all blogs");
      }
  }
  useEffect(()=>{
    handleFetchAllBlogs();
  },[])

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
