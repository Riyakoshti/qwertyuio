import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { Patientdata, props } from "./context/patientdata";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import "./assets/css/create.css";
import { useLocation, useNavigate } from "react-router-dom";
import Popup from "./popup";
import * as yup from "yup"
import Select from "react-select";
import api from "./context/api";
import {toast } from 'react-toastify'



const Create = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get('/gender/')
      .then((res) => {
        setgender(res.data)
      })
      .catch((err) => {
                const msg =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Something went wrong";

                toast.error(msg);
            });
    api.get('/disease/')
      .then((res) => {
        setdisease(res.data)
      })
      .catch((err) => {
                const msg =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Something went wrong";

                toast.error(msg);
            });
  }, [])

  const mode = location.state?.mode || 'create';
  const pd = location.state?.intialdata || null;
  const [pddata, setpddata] = useState<any>(null)
  const [popupaction, setpopupaction] = useState(mode)
  const [popupid, setPopupId] = useState(0)
  const [openPopup, setOpenPopup] = useState(false)
  const [gender, setgender] = useState([])
  let gen_id: number
  const { data, setdata } = useContext(Patientdata);
  const [disease, setdisease] = useState([])

const userStr = localStorage.getItem("user")
  const user = userStr ? JSON.parse(userStr) : null

  const diseaseOptions = disease.map((d: any) => ({
    value: d.id,
    label: d.name
  }));

  console.log(pd)
  const goHome = () => navigate("/home");

  const createhandle = (values: any) => {
    const formdata = new FormData()
    console.log(values.p_disease)
    const dis = values.p_disease.join(",")
    console.log(dis)

    formdata.append("name", values.p_name || null)
    formdata.append("phone_no", values.p_phone_no || null)
    formdata.append("email", values.p_email || null)
    formdata.append("dob", values.p_dob || null)
    formdata.append("gender_id", String(values.p_gender))
    formdata.append("address", values.p_address || null)
    formdata.append("blood_group", values.p_blood_group || null)
    formdata.append("disease", dis || null)
    formdata.append("created_by",user.user_id || null)
    for (let i = 0; i < values.p_file.length; i++) {
      if (values.p_file[i] instanceof File) {
        console.log(values.p_file[i])
        console.log(formdata.append("document", values.p_file[i]))
      }

    }

    const emailExists = data.some((p: props) => p.email === values.p_email);
    const phonenameexists = data.some(
      (p: props) => p.phone_no === values.p_phone_no && p.name === values.p_name
    );

    if (emailExists) {
      alert("Email already exists!");
      return;
    }

    if (phonenameexists) {
      alert("Same name & mobile already exists!");
      return;
    }

    api.post("/patient/",

      formdata,
      {
        headers: { "Content-Type": 'multipart/form-data' }
      }
    )
      .then((res) => {
        alert("Patient created successfully");
        setdata((prev: any) => [...prev, res.data]);
        navigate("/home");
      })
      .catch((err) => {
                      const msg =
                          err.response?.data?.error ||
                          err.response?.data?.message ||
                          "Something went wrong";
      
                      toast.error(msg);
                  });
  };

  const updatehandle = (values: any) => {
    console.log(values.p_disease)
    setpddata(values)
    setpopupaction("update")
    setPopupId(pd.patient_id)
    setOpenPopup(true)
  }

  const handlePopupSubmit = (reason: string) => {
    const formdata = new FormData()
    gender.map((g: any) => {
      if (pddata.p_gender === g.g_name) {
        gen_id = g.g_id;
      }

    })

    formdata.append("id", pd.patient_id)
    formdata.append("name", pddata.p_name)
    formdata.append("phone_no", pddata.p_phone_no)
    formdata.append("email", pddata.p_email)
    formdata.append("dob", pddata.p_dob)
    formdata.append("gender_id", String(gen_id))
    formdata.append("address", pddata.p_address)
    formdata.append("blood_group", pddata.p_blood_group)
    formdata.append('disease', pddata.p_disease)
    formdata.append("updated_by",user.user_id )

    for (let i = 0; i < pddata.p_file.length; i++) {
      if (pddata.p_file[i] instanceof File) {
        console.log(formdata.append("document", pddata.p_file[i]))
      }

    }

    formdata.append("reason", reason)
    if (popupaction === "update") {
      api.patch("/patient/",

        formdata,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      ).then(() => {

        setdata((prev: any) =>
          prev.map((p: any) =>
            p.patient_id === pd.patient_id
              ? { ...p, ...pd }
              : p
          )
        )
        alert("Updated successfully")
        setOpenPopup(false)
        navigate('/home')
      })
      .catch((err) => {
                      const msg =
                          err.response?.data?.error ||
                          err.response?.data?.message ||
                          "Something went wrong";
      
                      toast.error(msg);
                  });
    }


  }


  const validyup = yup.object({
    p_name: yup.string()
      .trim()
      .required("name is required...")
      .min(2, "min 2 ch is required..."),

    p_phone_no: yup.string()
      .trim()
      .required("phone_no is required...")
      .matches(/^[0-9]\d{9}$/, 'no has to be in 10 digits'),

    p_file: yup
      .array()
      // .min(1, "at least one file is required")
      .test(
        "filetype",
        "only pdf files are allowed",
        (files: any) => {
          if (!files) return false;   // null / undefined
          if (!Array.isArray(files)) return false;

          return files.every(
            (file: any) => file && file.type === "application/pdf"
          );
        }
      ),


    p_email: yup.string()
      .required("email is required...")
      .trim(),

    p_dob: yup.date()
      .required("date of birth is required...")
      .max(new Date(), "date cant be in future..."),

    p_gender: yup.number()
      .required("gender is required..."),

    p_address: yup.string()
      .required("address is also required...")
      .trim(),

    p_blood_group: yup.string()
      .trim()
      .required("blood group is required..."),

  })
  const getDiseaseIds = () => {
    if (!pd?.disease_names) return [];

    const names = pd.disease_names.split(",").map((n: any) => n.trim());
    // console.log(names)

    return disease
      .filter((d: any) => names.includes(d.name))
      .map((d: any) => d.id);
  };


  return (
    <div className="page-bg">
      <div className="form-box">
        <div className="form-header">
          {mode === 'create' ? (<h2>Create Patient</h2>) : <h2>update patient</h2>}
          {/* <h2>Create Patient</h2> */}
          <button type="button" className="exit-btn" onClick={goHome}>
            ✕
          </button>
        </div>
        {mode === 'create' && (
          <Formik
            initialValues={{
              p_name: "",
              p_dob: "",
              p_phone_no: "",
              p_gender: gender,
              p_disease: disease,
              p_email: "",
              p_address: "",
              p_blood_group: "",
              p_file: ""
            }}

            validationSchema={validyup}
            onSubmit={createhandle}
          >
            <Form>

              <div className="row">
                <label>Name</label>
                <Field name="p_name" />

              </div>
              <ErrorMessage name="p_name" component="div" className="error" />

              <div className="row">
                <label>DOB</label>
                <Field name="p_dob" type="date" required />
              </div>
              <ErrorMessage name="p_dob" component="div" className="error" />
              <div className="row">
                <label>Phone</label>
                <Field name="p_phone_no" required />
                {/* <ErrorMessage name="p_phone_no" component="div" className="error"></ErrorMessage> */}
              </div>
              <ErrorMessage name="p_phone_no" component="div" className="error" />
              <div className="row">
                <label>Gender :</label>
                <Field as="select" name="p_gender" className="select-field" required >
                  <option>select</option>
                  {gender.map((g: any) => (
                    <option key={g.g_id} value={g.g_id}>{g.g_name}</option>
                  ))}
                </Field>
              </div>
              <ErrorMessage name="p_gender" component="div" className="error" />


              <div className="row">
                <label>Disease :</label>

                <Field name="p_disease">
                  {({ form, field }: any) => {

                    const selectedValues = diseaseOptions.filter(opt =>
                      field.value?.includes(opt.value)
                    );

                    return (
                      <Select
                        options={diseaseOptions}
                        isMulti
                        placeholder="Search disease..."
                        value={selectedValues}

                        onChange={(selected: any) => {
                          form.setFieldValue(
                            "p_disease",
                            selected.map((s: any) => s.value)
                          );
                        }}

                        className="react-select"
                      />
                    );
                  }}
                </Field>
              </div>

              <ErrorMessage name="p_disease" component="div" className="error" />

              <div className="row">
                <label>Email</label>
                <Field name="p_email" type="email" required />
              </div>
              <ErrorMessage name="p_email" component="div" className="error" />
              <div className="row">
                <label>Address</label>
                <Field name="p_address" required />
              </div>
              <ErrorMessage name="p_address" component="div" className="error" />
              <div className="row">
                <label>Blood Group</label>
                <Field name="p_blood_group" required />
              </div>

              <ErrorMessage name="p_name" component="div" className="error" />
              <div className="row">
                <label>File Upload </label>

                <Field name='p_file'>
                  {({ form }: { form: any }) => (

                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          form.setFieldValue("p_file", Array.from(e.target.files))
                        }
                      }} required
                    />

                  )}</Field>

              </div>
              <ErrorMessage name="p_file" component="div" className="error" />

              <div className="btn-row">
                <button type="submit" className="save-btn">
                  Save
                </button>
              </div>
            </Form>
          </Formik>
        )}

        {mode === 'update' && (
          <Formik
            enableReinitialize
            initialValues={{
              p_name: pd.name,
              p_dob: pd.dob,
              p_phone_no: pd.phone_no,
              p_gender: pd.g_name,
              p_email: pd.email,
              p_address: pd.address,
              p_blood_group: pd.blood_group,
              p_file: [],
              p_disease: getDiseaseIds()
            }}
            // validationSchema={validyup}
            onSubmit={updatehandle}
          >
            <Form>

              <div className="row">
                <label>Name</label>
                <Field name="p_name" required />
              </div>

              <div className="row">
                <label>DOB</label>
                <Field name="p_dob" type="date" required />
              </div>

              <div className="row">
                <label>Phone</label>
                <Field name="p_phone_no" required />
                <ErrorMessage name="p_phone_no" component="div" className="error"></ErrorMessage>
              </div>

              <div className="row">
                <label>Gender :</label>
                <Field as="select" name="p_gender" className="select-field" required>
                  <option>select</option>
                  {gender.map((g: any) => (
                    <option key={g.g_id} value={g.g_name}>{g.g_name}</option>
                  ))}
                </Field>
              </div>

           
              <div className="row">
                <label>Disease :</label>

                <Field name="p_disease">
                  {({ form, field }: any) => {

                    const selectedValues = diseaseOptions.filter(opt =>
                      field.value?.includes(opt.value)
                    );

                    return (
                      <Select
                        options={diseaseOptions}
                        isMulti
                        placeholder="Search disease..."
                        value={selectedValues}

                        onChange={(selected: any) => {
                          form.setFieldValue(
                            "p_disease",
                            selected.map((s: any) => s.value)
                          );
                        }}

                        className="react-select"
                      />
                    );
                  }}
                </Field>
              </div>


              <ErrorMessage name="p_disease" component="div" className="error" />

              <div className="row">
                <label>Email</label>
                <Field name="p_email" type="email" required />
              </div>

              <div className="row">
                <label>Address</label>
                <Field name="p_address" required />
              </div>

              <div className="row">
                <label>Blood Group</label>
                <Field name="p_blood_group" required />
              </div>

              <div className="row">
                <label>File Upload </label>

                {pd?.document && (
                  <div>
                    <p>Existing files:</p>

                    {pd.document.split(" ||,|| ").map((file: any, index: any) => (
                      <div key={index}>
                        <a
                          href={`http://127.0.0.1:8000/media/${file}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View File {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                )}


                <Field name='p_file'>
                  {({ form }: { form: any }) => (

                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          form.setFieldValue("p_file", e.target.files)
                        }
                      }}
                    />
                  )}</Field>

              </div>

              <div className="btn-row">
                <button type="submit" className="save-btn">
                  update
                </button>
              </div>
            </Form>
          </Formik>
        )}
        {openPopup && (
          <Popup
            action={popupaction}
            id={popupid}
            onClose={() => setOpenPopup(false)}
            onSubmit={(reason) => handlePopupSubmit(reason)}
          />
        )}
      </div>
    </div >
  );
};

export default Create;