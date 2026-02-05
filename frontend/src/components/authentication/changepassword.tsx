
import React, { useContext, useState } from 'react'
import { Form, Formik, Field, ErrorMessage } from 'formik'
import * as yup from 'yup'
import api from '../context/api'
import { Auth } from '../context/auth'
import './assets/css/changepassword.css'
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'

const Changepassword = () => {
    const auth = useContext(Auth)
    const navigate = useNavigate()

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const username = user?.username;

    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const validate = yup.object({
        e_pwd: yup.string().required("Existing password is required"),
        n_pwd: yup.string().required("New password is required").matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{6,}$/,
            "Password must contain uppercase, lowercase, number & special character"
        ),
        n_c_pwd: yup
            .string()
            .oneOf([yup.ref("n_pwd")], "Passwords must match")
            .required("Confirm password is required"),
    });

    return (
        <div className="profile-page">
            <div className="profile-card transparent-card">

                <button className="close-btn" onClick={() => navigate(-1)}>✕</button>

                <h1>Change Password</h1>

                <Formik
                    initialValues={{ e_pwd: "", n_pwd: "", n_c_pwd: "" }}
                    validationSchema={validate}
                    onSubmit={(values) => {
                        api.post("/profile/", {
                            u_name: username,
                            e_pwd: values.e_pwd,
                            n_pwd: values.n_pwd,
                            n_c_pwd: values.n_c_pwd,
                        })
                            .then(() => {
                                toast.success("Password updated successfully")
                                navigate(-1)
                                })
                            .catch((err) => {
                                const msg =
                                    err.response?.data?.error ||
                                    err.response?.data?.message ||
                                    "Something went wrong";
                                toast.error(msg);
                            });
                    }}
                >
                    <Form className="profile-form">

                        <label>Existing password</label>
                        <div className="password-field">
                            <Field type={showOld ? "text" : "password"} name="e_pwd" />
                            <span onClick={() => setShowOld(!showOld)}>
                                {showOld ? "🙈" : "👁️"}
                            </span>

                        </div>
                        <ErrorMessage name="e_pwd" component="div" className="error" />

                        <label>New password</label>
                        <div className="password-field">
                            <Field type={showNew ? "text" : "password"} name="n_pwd" />
                            <span onClick={() => setShowNew(!showNew)}>
                                {showNew ? "🙈" : "👁️"}
                            </span>

                        </div>
                        <ErrorMessage name="n_pwd" component="div" className="error" />

                        <label>Confirm new password</label>
                        <div className="password-field">
                            <Field type={showConfirm ? "text" : "password"} name="n_c_pwd" />
                            <span onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? "🙈" : "👁️"}
                            </span>

                        </div>
                        <ErrorMessage name="n_c_pwd" component="div" className="error" />

                        <button type="submit">Update Password</button>

                    </Form>
                </Formik>
            </div>
        </div>
    )
}

export default Changepassword
