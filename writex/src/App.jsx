import React, { useEffect } from "react";
import Home from "./Pages/Home";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./App/Dashboard/Dashboard";
import SignUp from "./Pages/AuthPages/SignUp";
import Login from "./Pages/AuthPages/Login";
import { useAuth } from "./context/authContext";
import { useTheme } from "./context/themeContext";
import { SyncLoader } from "react-spinners";
import WriteBlog from "./App/WriteBlog/WriteBLog";
import Blog from "./App/Blogs/Blog";
import MyBlog from "./App/User-Section/MyBlog";
import MyProfile from "./App/User-Section/MyProfile";
import BlogPage from "./App/Blog Detail/BlogPage";
import About from "./Pages/About/About";
import CommDash from "./App/Community/CommDash";
import { ThemeToggle } from "./components/ThemeToggle";

const App = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <SyncLoader color={theme === "dark" ? "#fafafa" : "#171717"} />
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
      <div className="fixed right-4 top-4 z-[500] md:right-6 md:top-6">
        <ThemeToggle />
      </div>
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
