import axios from 'axios'
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const Delete = () => {

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {

    axios.delete("http://127.0.0.1:8000/patient/", {
      data: { id: id }
    })
    .then(() => {
      alert("Patient deleted")
      navigate("/")
    })
    .catch(err => console.log(err))

  }, [])

  return <h3>Deleting patient...</h3>
}

export default Delete
