import React, { lazy, Suspense } from "react";
import Home from "./Pages/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./Pages/AuthPages/SignUp";
import Login from "./Pages/AuthPages/Login";
import { useAuth } from "./context/authContext";
import { useTheme } from "./context/themeContext";
import { SyncLoader } from "react-spinners";
import About from "./Pages/About/About";
import { ThemeToggle } from "./components/ThemeToggle";

const Dashboard = lazy(() => import("./App/Dashboard/Dashboard"));
const WriteBlog = lazy(() => import("./App/WriteBlog/WriteBLog"));
const Blog = lazy(() => import("./App/Blogs/Blog"));
const MyBlog = lazy(() => import("./App/User-Section/MyBlog"));
const MyProfile = lazy(() => import("./App/User-Section/MyProfile"));
const AuthorProfile = lazy(() => import("./App/User-Section/AuthorProfile"));
const BlogPage = lazy(() => import("./App/Blog Detail/BlogPage"));
const CommDash = lazy(() => import("./App/Community/CommDash"));

const RouteFallback = ({ theme }) => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <SyncLoader color={theme === "dark" ? "#fafafa" : "#171717"} />
  </div>
);

const App = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  const PublicRoute = ({ children }) => {
    if (loading) {
      return <RouteFallback theme={theme} />;
    }
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <div className="fixed right-4 top-4 z-[500] md:right-6 md:top-6">
        <ThemeToggle />
      </div>
      <Suspense fallback={<RouteFallback theme={theme} />}>
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
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPage />} />
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
          <Route path="/author/:username" element={<AuthorProfile />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/community"
            element={
              <PrivateRoute>
                <CommDash />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
