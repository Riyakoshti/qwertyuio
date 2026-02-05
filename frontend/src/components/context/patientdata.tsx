// import axios from 'axios'
// import React, { useEffect, useState } from 'react'
// import { createContext } from 'react'

// export type props={
//     patient_id:number,
//     name:string,
//     dob:string,
//     email:string,
//     gender:string,
//     phone_no:string,
//     blood_group:string,
//     status:string
// }

// export const Patientdata = createContext<props[]>([]);

// export const Patient=({children}:{children:React.ReactNode})=>{
//     const [data,setdata]=useState<props[]>([])
//     useEffect(()=>{
//         axios.get("http://127.0.0.1:8000/patient/?key=")
//         .then((res) => setdata(res.data))
//         .catch((err) => console.error(err))
//     },[]);
//     return(
//         <div>
//             <Patientdata.Provider value={data}>
//                 {children}
//             </Patientdata.Provider>
//         </div>
//     )
// }

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { createContext } from 'react'
import api from './api'

export type props = {
    patient_id: number,
    name: string,
    dob: string,
    email: string,
    phone_no: string,
    blood_group: string,
    status: string,
    gender_id: number
}

export const Patientdata = createContext<any>(null);

export const Patient = ({ children }: { children: React.ReactNode }) => {
    const [data, setdata] = useState<props[]>([])

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            console.log("No token, not calling patient API");
            return; // 🚫 stop here
        }
        api.get("/patient/")
            .then((res) => setdata(res.data.data))
            .catch((err) => console.error(err))
    }, []);
    return (
        <div>
            <Patientdata.Provider value={{ data, setdata }}>
                {children}
            </Patientdata.Provider>
        </div>
    )
}