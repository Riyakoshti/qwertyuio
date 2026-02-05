// src\components\home.tsx
import React, { useContext, useEffect, useState } from 'react'
import { Patientdata } from './context/patientdata'
import { Formik, Form, Field, useFormikContext } from 'formik'
import { Outlet, useNavigate } from 'react-router-dom'
import "./assets/css/home.css";
import { useLocation } from 'react-router-dom'
import Popup from './popup'
import { Auth } from './context/auth'
import api from './context/api'
import { profile } from 'console'
import {toast} from 'react-toastify'

type props = {
  patient_id: number,
  name: string,
  dob: string,
  email: string,
  blood_group: string,
  phone_no: string,
  status: string,
  gender_id: number,
  g_name: string,
  disease_names: string
}

const HomeInner = () => {
  const { setFieldValue } = useFormikContext<{ search: string; filter: string }>();
  

  const closefilter = () => {
    setFieldValue("search", "");
    setFieldValue("filter", "all");
  };

  return (
    <div >
      <button onClick={closefilter} className="create-btn">
        Clear all filters
      </button>
    </div>
  );
};

const Homesearch = () => {

  const { values } = useFormikContext<{ search: string, filter: string }>();
  const { data: pd } = useContext(Patientdata);
  const [data, setdata] = useState(pd);
  const navigate = useNavigate()
  const [openPopup, setOpenPopup] = useState(false)
  const [popupAction, setPopupAction] = useState<"update" | "delete" | null>(null)
  const [popupId, setPopupId] = useState<number | null>(null)
  const [page, setpage] = useState(1)
  const limit = 5
  const [totaldata, settotaldata] = useState(0)
  const totalpage = Math.ceil(totaldata / limit)
  const userStr = localStorage.getItem("user")
  const user = userStr ? JSON.parse(userStr) : null

// const closefilter = ()=>{
//   values('search','')
//   values('filter','all')
// }
  const editdata = (raws: any) => {
    navigate('create', { state: { mode: 'update', intialdata: raws } })
  }

  const sortById = (arr: any[]) => {
    return [...arr].sort((a, b) => a.patient_id - b.patient_id)
  }

  const details = (id: any) => {
    navigate(`details/${id}`)
  }
  const handlePopupSubmit = (reason: string) => {
    if (!popupId || !user) {
      console.error("popupId or user is null");
      return;
    }

    if (popupAction === "delete") {
      const formdata = new FormData()
      formdata.append('id', popupId.toString());
      formdata.append('delete_reason', reason);
      formdata.append('updated_by', user.user_id);

      api.patch("/patient/",

        formdata,
        {
          headers: { "Content-Type": 'multipart/form-data' }
        }
      ).then(() => {
        api.delete(`/patient/?id=${popupId}`)
          .then(() => {
            setdata((prev: any) =>
              prev.map((p: any) =>
                p.patient_id === popupId
                  ? { ...p, status: "d" }
                  : p
              )
            )
            setOpenPopup(false)
          })
          .catch((err) => {
                const msg =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Something went wrong";

                toast.error(msg);
            });
      })
    }
  }


  useEffect(() => {
    if (!values.filter.trim) {
      console.log(pd)
      setdata(sortById(pd))
      return
    }
    api
      .get(`/patient/?filter=${values.filter}&key=${values.search}&page=${page}&limit=${limit}`)
      .then((res) => {
        console.log(res.data.data)
        setdata(sortById(res.data.data))
        settotaldata(res.data.total)
      })
      .catch((err) => {
                      const msg =
                          err.response?.data?.error ||
                          err.response?.data?.message ||
                          "Something went wrong";
      
                      toast.error(msg);
                  });

  }, [values.search, values.filter, page, pd])

  useEffect(() => {
    setpage(1)
  }, [values.search, values.filter])


  return (
    <>
      {data.map((raws: props) => (
        <tr key={raws.patient_id}>
          <td>{raws.patient_id}</td>
          <td>{raws.name}</td>
          <td>{raws.email}</td>
          <td>{raws.phone_no}</td>
          <td>{raws.dob}</td>
          <td>{raws.g_name}</td>
          <td>{raws.disease_names}</td>
          <td>
            <span className={raws.status === 'a' ? 'status-active' : 'status-deleted'}>
              {raws.status === 'a' ? 'Active' : 'Deleted'}
            </span>
          </td>
          <td className="action-btns">
            {raws.status != 'd' && (
              <button
                type="button"
                className="edit-btn"
                onClick={() => editdata(raws)}>
                Edit
              </button>
            )}

            {raws.status != 'd' && (<button
              type="button"
              className="delete-btn"
              onClick={() => {
                if (!window.confirm("Are you sure you want to delete?")) return;
                setPopupAction("delete")
                setPopupId(raws.patient_id)
                setOpenPopup(true)
              }}>
              Delete
            </button>
            )}


            <button
              type="button"
              className="view-btn"
              onClick={() => details(raws.patient_id)}
            >
              View Details
            </button>
          </td>
        </tr>

      ))}
      {openPopup && (
        <Popup
          action={popupAction}
          id={popupId}
          onClose={() => setOpenPopup(false)}
          onSubmit={(reason) => handlePopupSubmit(reason)}
        />
      )}
      <div className="pagination">

        <button
          disabled={page === 1}
          onClick={() => setpage(page - 1)}>
          Prev
        </button>

        <span>
          Page {page} of {totalpage}
        </span>
        {/* {renderPages()} */}
        <button
          disabled={page >= totalpage}
          onClick={() => setpage(page + 1)}>
          Next
        </button>

      </div>
    </>

  )
}

const Home = () => {
  const { setisAuthenticated } = useContext(Auth)

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    setisAuthenticated(false)
    api.post("/logout/", {}, { withCredentials: true })
      .then((res) => console.log(res))
      .catch((err) => {
                const msg =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Something went wrong";

                toast.error(msg);
            });
    navigate("/login")
  }
  const profile = () => {
    navigate("profile")
  }
  //  const closefilter=()=>{
      
  //  }
  const navigate = useNavigate()
  const location = useLocation()
  const search=''
  const filter=''
  const isCreateOpen = location.pathname.includes('create')
  const isdetailsopen = location.pathname.includes('details')
  const isprofileopen = location.pathname.includes('profile')
  const isdiseaseopen = location.pathname.includes('manage_disease')
  const [u_search,setsearch]=useState()
  const [u_filter,setfilter]=useState()

  return (
    <Formik initialValues={{ search: "", filter: "all" }} onSubmit={() => { }}>
      <div className="container">

        <div className="header">
          <h1>Patient Management</h1>
          <button
            type="button"
            className="create-btn"
            onClick={() => navigate('create')}>
            + Add Patient
          </button>
          <button
            type="button"
            className="create-btn"
            onClick={() => navigate('manage_disease')}>
            + Manage_disease
          </button>
          <button
            type="button"
            className="create-btn"
            onClick={logout}>
            Logout
          </button>
           <button
            type="button"
            className="create-btn"
            onClick={profile}>
            Profile
          </button>
          {/* {/* <button onClick={logout} className='create-btn'>logout</button> */}
          {/* <button onClick={closefilter} className='create-btn'>Close all filters</button>  */}
           <HomeInner />
        </div>


        <Field
          name="search"
          placeholder="Search by name, phone or email..."
          className="search-input"
        />

        <Field
          as="select"
          name="filter"
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="a">Active</option>
          <option value="d">Deleted</option>
        </Field>


        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Disease</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <Homesearch />
            </tbody>


          </table>
        </div>
        {/* <Outlet/> */}
        {/* MODAL OUTLET */}
        {isCreateOpen && (
          <div className="modal-overlay">
            <Outlet />
          </div>
        )}
        {isdetailsopen && (
          <div className="modal-overlay">
            <Outlet />
          </div>
        )}
        {isprofileopen && (
          <div className="modal-overlay">
            <Outlet />
          </div>
        )}
        {isdiseaseopen && (
          <div className="modal-overlay">
            <Outlet />
          </div>
        )}
      </div>
    </Formik>

  )
}

export default Home


