import React, { useState } from "react";
import api from "../context/api";
import "./assets/css/action.css";

const Change_status = () => {
  const [appointmentId, setAppointmentId] = useState("");
  const [status, setStatus] = useState("CONFIRMED");
  const [message, setMessage] = useState("");

  const handleStatusChange = async () => {
    setMessage("");

    try {
      await api.patch(
        `/appointment/${appointmentId}/?action=status`,
        { status }
      );
      setMessage("✅ Status updated successfully");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update status");
    }
  };

  return (
    <div className="action-container">
      <h1>Change Appointment Status</h1>

      <input
        type="number"
        placeholder="Appointment ID"
        value={appointmentId}
        onChange={(e) => setAppointmentId(e.target.value)}
      />

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="NO_SHOW">NO_SHOW</option>
      </select>

      <button onClick={handleStatusChange}>Update Status</button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Change_status;
