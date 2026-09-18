import React, { lazy, Suspense } from "react";
import Home from "./Pages/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./Pages/AuthPages/SignUp";
import Login from "./Pages/AuthPages/Login";
import { useAuth } from "./context/authContext";
import { useTheme } from "./context/themeContext";
import { useAuth0Sync } from "./components/auth/Auth0SessionBridge";
import { SyncLoader } from "react-spinners";
import About from "./Pages/About/About";
import Support from "./Pages/Support";
import { AppShell } from "./components/layout/AppShell";

const Dashboard = lazy(() => import("./App/Dashboard/Dashboard"));
const WriteBlog = lazy(() => import("./App/WriteBlog/WriteBLog"));
const Blog = lazy(() => import("./App/Blogs/Blog"));
const MyBlog = lazy(() => import("./App/User-Section/MyBlog"));
const MyProfile = lazy(() => import("./App/User-Section/MyProfile"));
const Settings = lazy(() => import("./App/User-Section/Settings"));
const AuthorProfile = lazy(() => import("./App/User-Section/AuthorProfile"));
const BlogPage = lazy(() => import("./App/Blog Detail/BlogPage"));
const CommDash = lazy(() => import("./App/Community/CommDash"));

const RouteFallback = ({ theme }) => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <SyncLoader color={theme === "dark" ? "#fafafa" : "#0a0a0a"} />
  </div>
);

const App = () => {
  const { user, loading } = useAuth();
  const { syncing: auth0Syncing } = useAuth0Sync();
  const { theme } = useTheme();
  const bootstrapping = (loading || auth0Syncing) && !user;

  const PublicRoute = ({ children }) => {
    if (bootstrapping) {
      return <RouteFallback theme={theme} />;
    }
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (user && token) {
      return <AppShell>{children}</AppShell>;
    }
    if (bootstrapping || auth0Syncing) {
      return <RouteFallback theme={theme} />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <>
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
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route path="/author/:username" element={<AuthorProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
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
