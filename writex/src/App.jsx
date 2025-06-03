import React from 'react'
import Home from "./Pages/Home"
import { Route, Routes } from "react-router-dom"
import Dashboard from "./App/Dashboard/Dashboard"
import SignUp from "./Pages/AuthPages/SignUp"

const App = () => {
  return (
    <>
    <Routes>
    <Route path="/" element={<Home/>} />
    <Route path="/signup" element={<SignUp/>} />
    <Route path="/dashboard" element={<Dashboard/>} />
    </Routes>
    </>
  )
}

export default App
