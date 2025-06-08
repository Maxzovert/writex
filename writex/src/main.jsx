import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { Pointer } from "./components/magicui/pointer.js"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Pointer/>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
