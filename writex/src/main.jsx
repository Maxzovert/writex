import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { Pointer } from "./components/magicui/pointer.js"
import { ToastContainer, toast } from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Pointer/>
    <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
