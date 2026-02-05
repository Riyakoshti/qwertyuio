import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { useNavigate } from "react-router-dom";
import api from "./context/api";
import { toast } from "react-toastify";
import './assets/css/manage_disease.css'

type Mode = "add" | "delete" | "update" | "";

const Manage_disease = () => {
  const [diseases, setDiseases] = useState<any[]>([]);
  const [mode, setMode] = useState<Mode>("");
  const [selectedDisease, setSelectedDisease] = useState("");
  const navigate = useNavigate();

  const fetchDiseases = () => {
    api.get("/disease/").then(res => setDiseases(res.data))
    .catch((err) => {
                          const msg =
                              err.response?.data?.error ||
                              err.response?.data?.message ||
                              "Something went wrong";
          
                          toast.error(msg);
                      });

  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const handleSubmit = (values: any) => {
    if (mode === "add") {
      api.post("/disease/", {
        choise: "add",
        old_name: values.disease,
        new_name: null
      })
      .then(() => {
        toast.success("Disease added");
        setMode("");
        fetchDiseases();
      })
      .catch(err => toast.error(err.response?.data?.error || "Add failed"));
    }

    if (mode === "update") {
      api.post("/disease/", {
        choise: "update",
        old_name: selectedDisease,
        new_name: values.newDisease
      })
      .then(() => {
        toast.success("Disease updated");
        setMode("");
        fetchDiseases();
      })
      .catch(err => toast.error(err.response?.data?.error || "Update failed"));
    }

    if (mode === "delete") {
      api.post("/disease/", {
        choise: "delete",
        old_name: selectedDisease,
        new_name: null
      })
      .then(() => {
        toast.success("Disease deleted");
        setMode("");
        fetchDiseases();
      })
      .catch(err => toast.error(err.response?.data?.error || "Delete failed"));
    }
  };

  return (
    <>
      {/* MAIN CARD */}
      <div className="main-overlay">
        <div className="card">
          <div className="card-header">
            <h2>🩺 Disease Manager</h2>
            <button className="close-btn" onClick={() => navigate(-1)}>✖</button>
          </div>

          <div className="card-body">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Disease</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {diseases.map((d: any) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{new Date(d.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setSelectedDisease(d.name);
                          setMode("update");
                        }}
                      >✏️</button>

                      <button
                        className="delete-btn"
                        onClick={() => {
                          setSelectedDisease(d.name);
                          setMode("delete");
                        }}
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="side-btn">
              <button className="add-btn" onClick={() => setMode("add")}>
                ➕ Add Disease
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION POPUP */}
      {mode && (
        <div className="action-overlay">
          <div className="action-card">
            <button className="close-btn" onClick={() => setMode("")}>✖</button>

            <Formik
              enableReinitialize
              initialValues={{ disease: "", newDisease: "" }}
              onSubmit={handleSubmit}
            >
              <Form>

                {mode === "add" && (
                  <>
                    <h3>➕ Add Disease</h3>
                    <Field name="disease" placeholder="Enter disease name" />
                    <div className="btn-row">
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setMode("")}>Cancel</button>
                    </div>
                  </>
                )}

                {mode === "update" && (
                  <>
                    <h3>✏️ Update Disease</h3>
                    <input value={selectedDisease} disabled />
                    <Field name="newDisease" placeholder="New disease name" />
                    <div className="btn-row">
                      <button type="submit">Update</button>
                      <button type="button" onClick={() => setMode("")}>Cancel</button>
                    </div>
                  </>
                )}

                {mode === "delete" && (
                  <>
                    <h3>🗑️ Delete Disease</h3>
                    <p>Are you sure you want to delete:</p>
                    <strong>{selectedDisease}</strong>
                    <div className="btn-row">
                      <button type="submit" className="danger">Confirm</button>
                      <button type="button" onClick={() => setMode("")}>Cancel</button>
                    </div>
                  </>
                )}

              </Form>
            </Formik>
          </div>
        </div>
      )}
    </>
  );
};

export default Manage_disease;
