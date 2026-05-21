import http from "./http";

const fetcher = async (url) => {
    try{
        const {data} = await http.get(url);
       
        return data;
    }catch{
       
        return null; 
}
}

export default fetcher;
