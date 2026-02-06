import React, { useState } from "react";
import api from "../context/api";
import "./assets/css/action.css";

const Cancel = () => {
  const [appointmentId, setAppointmentId] = useState("");
  const [message, setMessage] = useState("");

  const handleCancel = async () => {
    setMessage("");

    try {
      await api.patch(`/appointment/${appointmentId}/?action=cancel`);
      setMessage("✅ Appointment cancelled successfully");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to cancel appointment");
    }
  };

  return (
    <div className="action-container">
      <h1>Cancel Appointment</h1>

      <input
        type="number"
        placeholder="Appointment ID"
        value={appointmentId}
        onChange={(e) => setAppointmentId(e.target.value)}
      />

      <button className="danger" onClick={handleCancel}>
        Cancel Appointment
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Cancel;
