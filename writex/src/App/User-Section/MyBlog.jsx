import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";

const MyBlog = () => {
  const [data, setData] = useState([]);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

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

  const firstUpperCase = (str) => {
    const capName = str.charAt(0).toUpperCase() + str.slice(1);
    return capName;
  }
  return (
    <div>
      <Navbar />
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
                <div className="flex justify-between">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Navigating to blog:', blog._id);
                    console.log('Blog data:', blog);
                    navigate(`/blog/${blog._id}`);
                  }}
                  className="text-gray-600 text-sm font-semibold mt-3 hover:text-black self-start cursor-pointer"
                >
                  Read More →
                </a>
                <h1
                  className="text-gray-900 text-sm font-semibold mt-3 "
                >
                  {`${blog.status === "draft" ? "!" : "✔️"} ${firstUpperCase(blog.status)}`}
                </h1>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBlog;
