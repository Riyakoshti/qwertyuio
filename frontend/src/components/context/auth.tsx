// src\components\context\auth.tsx
import { config } from 'process';
import React, { createContext, useEffect, useState } from 'react';

export const Auth = createContext<any>(null)

export const Authlogin = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setisAuthenticated] = useState(false)
    const [u_name,setu_name]=useState(0)
    const [loading, setLoading] = useState(true);
    console.log(isAuthenticated)
    useEffect(() => {
        const accessToken = localStorage.getItem("access_token")
        const user = localStorage.getItem("user")

        if (accessToken && user) {
            setisAuthenticated(true)
            console.log("true")
        }
        setLoading(false);
    }, [])
    return (
        <Auth.Provider value={{ isAuthenticated, setisAuthenticated ,loading,u_name,setu_name}}>
            {children}
        </Auth.Provider>

    );
};


