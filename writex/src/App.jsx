import React from 'react'
import Home from "./Pages/Home"
import { Route, Routes } from "react-router-dom"
import Dashboard from "./App/Dashboard/Dashboard"
import SignUp from "./Pages/AuthPages/SignUp"
import Login from "./Pages/AuthPages/Login"
import { Pointer } from "./components/magicui/pointer"
import Layout from "./Pages/AuthPages/layout"

const App = () => {
  return (
    <>
    <Pointer/>
    <Routes>
    <Route path="/" element={<Home/>} />
    {/* <Route path="/signup" element={<SignUp/>} />
    <Route path="/login" element={<Login/>} /> */}
    <Route path="/auth" element={<Layout/>} />
    <Route path="/dashboard" element={<Dashboard/>} />
    </Routes>
    </>
  )
}

export default App
