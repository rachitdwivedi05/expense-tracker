import Homepage from "./components/Home";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Signup from "./components/Home/Signup";
 import { ToastContainer, } from 'react-toastify';

const App = () => {
return (  
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
    <ToastContainer />
  </BrowserRouter>
  )
}
export default App;