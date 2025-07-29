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


  const firstUpperCase = (str) => {
    const capName = str.charAt(0).toUpperCase() + str.slice(1);
    return capName;
  }

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
      <div className="flex flex-wrap justify-center mt-8">
        {data.length === 0 ? (
          <div className="text-gray-500">No blogs found.</div>
        ) : (
          data.map((blog) => (
            <div
              key={blog._id}
              className="w-[350px] h-[500px] bg-white border border-gray-300 rounded-xl shadow-lg flex-shrink-0 overflow-hidden m-4"
            >
              <div className="h-1/2 w-full">
                {blog.mainImage ? (
                  <img
                    src={blog.mainImage}
                    alt={blog.title || "Blog Image"}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="h-1/2 p-4 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  {blog.profileImage ? (
                    <img
                      src={blog.profileImage}
                      alt={blog.author?.username || "Author"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : null}
                  <span className="font-semibold text-gray-700">
                    {firstUpperCase(blog.author?.username) || "Unknown"}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-2 text-gray-800 truncate">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 text-justify mt-1">
                  {typeof blog.content === "string"
                    ? blog.content
                    : JSON.stringify(blog.content)}
                </p>
                <a
                  href="#"
                  className="text-gray-600 text-sm font-semibold mt-3 hover:text-black self-start"
                >
                  Read More →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Blog;
