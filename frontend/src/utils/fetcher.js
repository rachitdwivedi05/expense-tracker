import http, { apiUrl } from "./http";

const fetcher = async (url) => {
    try{
        const {data} = await http.get(apiUrl(url));
       
        return data;
    }catch{
       
        return null; 
}
}

export default fetcher;
