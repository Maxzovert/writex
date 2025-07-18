import React, { useEffect, useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";

const MyBlog = () => {
  const [data, setData] = useState([]);
  const hasFetched = useRef(false);

  const handleFetchUserBlogs = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const fetchData = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/blog/myblogs/`);
      console.log("User Blogs");
      console.log(fetchData.data.blogs);
      setData(fetchData.data.blogs);
      toast.success("Blog Fetched");
    } catch (error) {
      console.error("Error in fetching Blog", error);
      toast.error("Blog not found");
    }
  };

  useEffect(() => {
    handleFetchUserBlogs();
  }, []);
  return (
    <div>
      <Navbar />
      {/* <div>
        {data.length === 0
          ? "Publish Blog today"
          : data.map((blog) => (
              <div key={blog._id}>
                <h1>{blog._id}</h1>
                <h1>{blog.title}</h1>
                <h1>
                  {typeof blog.content === "string"
                    ? blog.content
                    : JSON.stringify(blog.content)}
                </h1>
              </div>
            ))}
      </div> */}
      {data.map((blog) => (
        <div
          key={blog._id}
          className="w-[350px] h-[500px] bg-white border border-gray-300 rounded-xl shadow-lg flex-shrink-0 overflow-hidden"
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
                {blog.author?.username || "Unknown"}
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
      ))}
    </div>
  );
};

export default MyBlog;
