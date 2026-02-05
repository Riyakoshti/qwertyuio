import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Auth } from './auth';
const Protected_routes = () => {

  const { isAuthenticated ,loading} = useContext(Auth)

  console.log("\nisAuthenticated: " + isAuthenticated)

   if (loading) return null;

  return (
    isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
  )
}

export default Protected_routes
