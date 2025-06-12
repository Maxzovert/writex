import React from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const {user, setUser} = useAuth();
  const navigate = useNavigate();

  const handleLogout = async() => {
    try {
      const res = await axios.post('/api/users/logout');
      setUser(null);
      toast.success("Logout Successfully");
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout Failed");
    }
  };

  return (
    <div className="w-[200px] h-[200px] bg-amber-100">
      <button onClick={handleLogout}>Logout</button>
      <h1 className="font-bold text-3xl">HELOO</h1>
    </div>
  );
};

export default Dashboard;
