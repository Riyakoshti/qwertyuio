import React, { useState } from 'react'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import "./assets/css/register.css"
import * as yup from 'yup'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import api from '../context/api'
import { toast } from 'react-toastify'

const Register = () => {
    const [data, setdata] = useState<any>([])
    const [showpwd, setshowpwd] = useState(false)
    const [showcpwd, setshowcpwd] = useState(false)
    const navigate=useNavigate()

    const validate = yup.object({
        u_name: yup
            .string()
            .trim()
            .required("Username is required")
            .min(8, "Minimum 8 characters")
            .matches(
                /^(?=.*_)[a-z0-9_]{8,}$/,
                "Username must contain only lowercase letters, numbers, and _"
            ),

        u_email: yup
            .string()
            .trim()
            .email("Invalid email")
            .required("Email is required"),

        u_pwd: yup
            .string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{6,}$/,
                "Password must contain uppercase, lowercase, number & special character"
            ),


        u_c_pwd: yup
            .string()
            .oneOf([yup.ref("u_pwd")], "Passwords must match")
            .required("Confirm password is required"),
    });


    const submithandle = (values: any) => {
        console.log(values);

        api.post('/register/', {
            u_name: values.u_name,
            u_email: values.u_email,
            u_pwd: values.u_pwd,
        })
            .then((res) => {
                api.post('/emailtoken/',{user_name:values.u_name})
                .then(()=>{
                    navigate('/login')
                })
            })
           .catch((err) => {
                           const msg =
                               err.response?.data?.error ||
                               err.response?.data?.message ||
                               "Something went wrong";
           
                           toast.error(msg);
                       });
    };

    return (
        <div className="register-page">
            <div className="register-box">
                <button className="close-btn" onClick={() => navigate("/")}>✕</button>
                <h1>Register Form</h1>

                <Formik
                    initialValues={{
                        u_name: '',
                        u_email: '',
                        u_pwd: '',
                        u_c_pwd: ''
                    }}
                    validationSchema={validate}
                    onSubmit={submithandle}
                >
                    <Form className="register-form">

                        <label>Username</label>
                        <Field
                            type="text"
                            name="u_name"
                            placeholder="Enter your username"
                        />
                        <ErrorMessage name="u_name"></ErrorMessage>

                        <label>Email</label>
                        <Field
                            type="email"
                            name="u_email"
                            placeholder="Enter your email"
                        />
                        <ErrorMessage name="u_email"></ErrorMessage>
                        <label>Password</label>
                        <div className="password-field">
                            <Field
                                type={showpwd ? "text" : "password"}
                                name="u_pwd"
                                placeholder="Enter your password"
                            />
                            <span
                                className="eye-icon"
                                onClick={() => setshowpwd(!showpwd)}
                            >
                                {showpwd ? "🙈" : "👁️"}
                            </span>
                        </div>
                        <ErrorMessage name="u_pwd" component="div" className="error" />

                        <label>Confirm Password</label>
                        <div className="password-field">
                            <Field
                                type={showcpwd ? "text" : "password"}
                                name="u_c_pwd"
                                placeholder="Confirm password"
                            />
                            <span
                                className="eye-icon"
                                onClick={() => setshowcpwd(!showcpwd)}
                            >
                                {showcpwd ? "🙈" : "👁️"}
                            </span>
                        </div>
                        <ErrorMessage name="u_c_pwd" component="div" className="error" />

                        <button type="submit">Submit</button>

                    </Form>
                </Formik>
            </div>
        </div>
    )
}

export default Register
