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

const App = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center">
          <SyncLoader color="#000000" />
        </div>
      );
    }
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

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
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs"
          element={
              <Blog />
          }
        />
        <Route
          path="/myblogs"
          element={
            <ProtectedRoute>
              <MyBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
