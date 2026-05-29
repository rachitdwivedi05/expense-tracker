import { useEffect, useState } from "react";
import http, { apiUrl } from "../utils/http";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/Shared/Loader";

const Guard = ({endpoint,role,children}) => {

    const [authorised,setAuthorised] = useState(false);
    const [loader,setLoader] = useState(true);
    const [user,setUser] = useState(null);

    useEffect(() => {
        const verifyToken = async() => {
            try {
                const {data} = await http.get(apiUrl(endpoint));
            sessionStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data?.role);
            setLoader(false);
            setAuthorised(true);
            } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            sessionStorage.removeItem("userInfo");
            setUser(null);
            setLoader(false);
            setAuthorised(false);  
            }
        }
        verifyToken();
    }, [endpoint]);

    if(loader) return <Loader />
    
    if (authorised && role === user){
        return children;
    }else{
        return <Navigate to="/" />
    }
}

export default Guard;
