import React, { useEffect } from "react";
import Home from "./Pages/Home";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./App/Dashboard/Dashboard";
import SignUp from "./Pages/AuthPages/SignUp";
import Login from "./Pages/AuthPages/Login";
import { useAuth } from "./context/authContext";
import { SyncLoader } from "react-spinners";
import WriteBlog from "./App/WriteBlog/WriteBLog";
import Blog from "./App/Blogs/Blog";
import MyBlog from "./App/User-Section/MyBlog";
import MyProfile from "./App/User-Section/MyProfile";
import BlogPage from "./App/Blog Detail/BlogPage";
import About from "./Pages/About/About";
import CommDash from "./App/Community/CommDash";

const App = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center">
          <SyncLoader color="#000000" />
        </div>
      );
    }
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/write"
          element={
            <PrivateRoute>
              <WriteBlog />
            </PrivateRoute>
          }
        />
        <Route
          path="/blogs"
          element={
              <Blog />
          }
        />
        <Route
          path="/blog/:id"
          element={
              <BlogPage/>
          }
        />
        <Route
          path="/myblogs"
          element={
            <PrivateRoute>
              <MyBlog />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MyProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/about"
          element={
            <PrivateRoute>
              <About />
            </PrivateRoute>
          }
        />
        <Route
          path="/community"
          element={
            <PrivateRoute>
              <CommDash />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
