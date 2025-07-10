import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../Components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";

const Blog = () => {
  const [data, setData] = useState([]);
  const hasFetched = useRef(false);

  const handleFetchUserBlogs = async () => {
    if(hasFetched.current) return;
    hasFetched.current = true;
    
    try {
      const fetchData = await axios.get("/api/blog/myblogs/");
      console.log("User Blogs");
      console.log(fetchData.data.blogs);
      setData(fetchData.data.blogs);
      toast.success("Blog Fetched");
    } catch (error) {
      console.error("Error in fetching Blog", error);
      toast.error("Blog not found")
    }
  };

  useEffect(() => {
    handleFetchUserBlogs();
  }, []);

  return (
    <div>
      <Navbar />
      <div>
        {data.length === 0 ? (
          "Publish Blog today"
        ) : (
          data.map((blog) => (
            <div key={blog._id}>
              <h1>{blog._id}</h1>
              <h1>{blog.title}</h1>
              <h1>
                {typeof blog.content === "string"
                  ? blog.content
                  : JSON.stringify(blog.content)}
              </h1>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Blog;
