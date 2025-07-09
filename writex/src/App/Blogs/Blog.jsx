import React, { useEffect, useState } from 'react'
import Navbar from "../Components/Navbar"
import axios from "axios";

const Blog = () => {
    const [data , setData] = useState([]);
    const handleFetchUserBlogs = async() => {
        try {
            const fetchData = await axios.get("/api/blog/myblogs/" ,{

            });

        } catch (error) {
            
        }
    }
  return (
    <div>
        <Navbar/>
        <div>

        </div>
    </div>
  )
}

export default Blog
