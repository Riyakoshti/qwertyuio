import React, { useState } from "react";
import "./assets/css/book.css";
import api from "../context/api";

const Book = () => {
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    start_time: "",
    end_time: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/appointment/", {
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        staff_id: null,
        appointment_date: form.appointment_date,
        start_time: form.start_time,
        end_time: form.end_time,
        reason: form.reason,
      });

      setMessage("✅ Appointment created successfully");
      setForm({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        start_time: "",
        end_time: "",
        reason: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-appointment-container">
      <h1 className="title">Add Appointment</h1>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Patient ID</label>
          <input
            type="number"
            name="patient_id"
            value={form.patient_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Doctor ID</label>
          <input
            type="number"
            name="doctor_id"
            value={form.doctor_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Appointment Date</label>
          <input
            type="date"
            name="appointment_date"
            value={form.appointment_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Reason</label>
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Enter symptoms / reason"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Appointment"}
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default Book;
