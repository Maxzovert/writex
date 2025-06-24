import axios from "axios";
import { Children, createContext, useContext, useEffect, useState } from "react";

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user , setUser] = useState(null);
    const [loading , setLoading] = useState(true);

    useEffect(()=>{
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}api/users/current`);
                setUser(response.data)
            } catch (error) {
                setUser(null);
            } finally{
                setLoading(false);
            }
        };

        checkAuth();
    },[])

    return (
        <AuthContext.Provider value={{user , setUser , setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)