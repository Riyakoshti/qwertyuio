import React, { useContext, useEffect, useState } from 'react'
import { Patientdata } from './context/patientdata'
import { useParams, useNavigate } from 'react-router-dom'
import "./assets/css/details.css"
import api from './context/api'

const Details = () => {

  const { id } = useParams()
  console.log(id)
  const navigate = useNavigate()
  // const { data } = useContext(Patientdata)
const [data,setdata]=useState<any>()

  // const patientdata = data?.find(
  //   (p: any) => p.patient_id === Number(id)
  // )
  useEffect(()=>{
      api.get(`/patientdetails/?u_id=${id}`)
      .then((res)=>{
        setdata(res.data[0])
        console.log(res.data[0])
      })
  },[])

  if (!data) {
    return <p className="loading">Loading patient details...</p>
  }

  const gen = () => {
    if (data.gender_id === 2) return "Female"
    if (data.gender_id === 1) return "Male"
    return "Other"
  }

  return (
    <div className="details-container">

      <div className="details-card">

        {/* HEADER */}
        <div className="details-header">
          <h2>🩺 Patient Medical Record</h2>
          <button 
            className="close-btn"
            onClick={() => navigate('/home')}>
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="details-grid">
          <p><span>ID</span>{data.patient_id}</p>
          <p><span>Name</span>{data.name}</p>
          <p><span>Phone</span>{data.phone_no}</p>
          <p><span>DOB</span>{data.dob}</p>
          <p><span>Gender</span>{gen()}</p>
          <p><span>Email</span>{data.email}</p>
          <p><span>Blood Group</span>{data.blood_group}</p>
          <p><span>Status</span>{data.status}</p>
        </div>

      </div>

    </div>
  )
}

export default Details
