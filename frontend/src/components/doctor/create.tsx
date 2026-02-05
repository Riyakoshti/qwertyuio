import React from 'react'
import { useForm } from 'react-hook-form'
import api from '../context/api'
import "./assets/css/create.css"

type DoctorForm = {
  name: string;
  qualification: string;
  experience: number;
  email: string;
  phone_no: string;
  gender_id: number;
  specialization: string;
};

const Create = () => {
  const { register, handleSubmit, reset } = useForm<DoctorForm>();

  const subhandle = (data: DoctorForm) => {
    console.log(data);

    api.post('/doctor/', data)
      .then((res) => {
        alert("Doctor added successfully");
        reset();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="doctor-container">
      <h1 className="doctor-title">+ Add Doctor</h1>

      <form onSubmit={handleSubmit(subhandle)} className="doctor-form">

        <div className="form-group">
          <label>Name</label>
          <input {...register("name", { required: true })} placeholder="Enter name" />
        </div>

        <div className="form-group">
          <label>Qualification</label>
          <input {...register("qualification", { required: true })} placeholder="MBBS, MD..." />
        </div>

        <div className="form-group">
          <label>Experience (years)</label>
          <input type="number" {...register("experience", { required: true, min: 0 })} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" {...register("email", { required: true })} placeholder="doctor@email.com" />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input {...register("phone_no", { required: true })} placeholder="9876543210" />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select {...register("gender_id", { required: true })}>
            <option value="">Select</option>
            <option value="1">Male</option>
            <option value="2">Female</option>
            <option value="3">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Specialization</label>
          <input {...register("specialization", { required: true })} placeholder="Cardiology" />
        </div>

        <button type="submit" className="submit-btn">Save Doctor</button>
      </form>
    </div>
  )
}

export default Create;
