import { Field, Form, Formik } from "formik";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "../context/auth";
import "./assets/css/login.css";
import { toast } from "react-toastify";

import api from "../context/api";
import { setuid } from "process";
import { json } from "stream/consumers";

const Login = () => {
    const auth = useContext(Auth)
    console.log(auth)
    const [showPwd, setShowPwd] = useState(false);
    const [data, setdata] = useState<any>()
    const navigate = useNavigate()
    const submithandle = (values: any) => {
        console.log(values);
        api.post('/login/', {
            u_name: values.u_name,
            u_pwd: values.u_pwd,
        })
            .then((res) => {
                console.log(res.data);
                setdata(res.data);
                auth.setu_name(res.data.username)
                localStorage.setItem("access_token", res.data.access_token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                auth.setisAuthenticated(true);
                navigate('/home');
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
        <div className="login-page">
            <div className="login-box">
                <button className="close-btn" onClick={() => navigate("/")}>✕</button>
                <h1>Login</h1>

                <Formik
                    initialValues={{ u_name: "", u_pwd: "" }}
                    onSubmit={submithandle}
                >
                    <Form className="login-form">

                        <label>Username</label>
                        <Field
                            type="text"
                            name="u_name"
                            placeholder="Enter your username"
                        />

                        <label>Password</label>
                        <div className="password-wrapper">
                            <Field
                                type={showPwd ? "text" : "password"}
                                name="u_pwd"
                                placeholder="Enter your password"
                            />
                            <span
                                className="eye"
                                onClick={() => setShowPwd(!showPwd)}
                            >
                                {showPwd ? "🙈" : "👁️"}
                            </span>
                        </div>

                        <button type="submit">Login</button>

                    </Form>
                </Formik>
            </div>
        </div>
    );
};

export default Login;
