import React, { useState } from "react";
import api from "../context/api";
import "./assets/css/action.css";

const Reschedule = () => {
  const [appointmentId, setAppointmentId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.patch(
        `/appointment/${appointmentId}/?action=reschedule`,
        {
          appointment_date: date,
          start_time: startTime,
          end_time: endTime,
        }
      );
      setMessage("✅ Appointment rescheduled successfully");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to reschedule appointment");
    }
  };

  return (
    <div className="action-container">
      <h1>Reschedule Appointment</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Appointment ID"
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
          required
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />

        <button type="submit">Reschedule</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default Reschedule;
