import { useState } from "react"
import './assets/css/popup.css'
type Props={
  action:"update"|"delete"|null
  id:number|null
  onClose:()=>void
  onSubmit:(reason:string)=>void
}

const Popup = ({action,onClose,onSubmit}:Props) => {

  const [reason,setReason]=useState("")
  const [error,setError]=useState("")
  const handleSubmit = () => {
    if(!reason.trim()){
      setError("Reason is required")
      return
    }
    setError("")
    onSubmit(reason.trim())
  }

  return (
    <div className="modal-overlay">

      <div className="popup-card">

        <h3>
          {action==="update" ? "Reason for update" : "Reason for delete"}
        </h3>

        <textarea
          value={reason}
          onChange={(e)=>{
            setReason(e.target.value)
            setError("")
          }}
          placeholder="Enter reason..."
          required
        />
 {error && <p className="popup-error">{error}</p>}
        <div className="popup-actions">
          <button 
            className="edit-btn"
            onClick={handleSubmit}>
            Submit
          </button>

          <button 
            className="delete-btn"
            onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>

    </div>
  )
}
export default Popup