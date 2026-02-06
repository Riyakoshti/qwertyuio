import React, { useEffect, useState } from "react";
import "./assets/css/list.css";
import api from "../context/api";

interface Appointment {
  id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  doctor_id: number;
  status: string;
  reason: string | null;
}

const List = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/appointment/")
      .then((res) => {
        // backend returns { success, count, data }
        setAppointments(res.data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching appointments", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="appointment-container">
      <h1 className="title">Your Appointments</h1>

      {appointments.length === 0 ? (
        <p className="empty">No appointments found.</p>
      ) : (
        <table className="appointment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>{appt.id}</td>
                <td>{appt.appointment_date}</td>
                <td>
                  {appt.start_time} – {appt.end_time}
                </td>
                <td>{appt.doctor_id}</td>
                <td>
                  <span className={`status ${appt.status.toLowerCase()}`}>
                    {appt.status}
                  </span>
                </td>
                <td>{appt.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default List;
