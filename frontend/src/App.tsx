import React from 'react';
import logo from './logo.svg';
import Home from './components/home';
import { Route, Routes } from 'react-router-dom';
import Create from './components/create';
// import Delete from './components/delete';
import './App.css';
import Details from './components/details';
import Popup from './components/popup';
import Register from './components/authentication/register';
import Login from './components/authentication/login';
import Homepage from './components/homepage';
import Protected_routes from './components/context/protected_routes';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Changepassword from './components/authentication/changepassword';
import Profile from './components/authentication/profile';
// import Edit from './components/edit';
import Verifyemail from './components/authentication/verifyemail';
import EmailVerification from './components/authentication/EmailVerification';
import Manage_disease from './components/manage_disease';
import Create_doctor from './components/doctor/create'
import Dashboard from './components/dashboard/dashboard';
import List from './components/appointments/list'
import Book_app from './components/appointments/book'
import Reschedule from './components/appointments/reshedule';
import Cancel from './components/appointments/cancel';
import Change_status from './components/appointments/change_status';
function App() {
  return (
    <div className="App">
      <>
        <Routes>
          <Route path='/' element={<Homepage />}>
            <Route path='register' element={<Register />}></Route>
            <Route path='login' element={<Login />}></Route>
            <Route path="emailverify" element={<Verifyemail />} />
            <Route path='verifyemail' element={<EmailVerification />}></Route>

          </Route>
          <Route element={<Protected_routes />}>

            <Route path='/home' element={<Home />}>
              <Route path='create' element={<Create />}></Route>
              <Route path='details/:id' element={<Details />}></Route>
              <Route path='manage_disease' element={<Manage_disease />}></Route>
              <Route path='profile' element={<Profile />}>
                <Route path='changepassword' element={<Changepassword />}></Route>
              </Route>
            </Route>

            <Route path='/create_doctor' element={<Create_doctor />}></Route>
            <Route path='/dashboard' element={<Dashboard />}></Route>
            <Route path="/appointments-list" element={<List />}></Route>
            <Route path="/appointments-book" element={<Book_app />}></Route>
            <Route path="/appointments-reschedule" element={<Reschedule />}></Route>
            <Route path="/appointments-cancel" element={<Cancel />}></Route>
            <Route path="/appointments-changestatus" element={<Change_status />}></Route>
          </Route>


        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    </div>
  );
}

export default App;
