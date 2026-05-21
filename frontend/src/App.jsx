import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Guard from "./Guard";
import { lazy } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react";
import Loader from "./components/Shared/Loader";





const Users = lazy(()=> import( "./components/Shared/Users"));
const Adminlayout = lazy(() => import ("./components/Admin/Adminlayout"));
const Homepage =  lazy(() => import("./components/Home"));
const Signup = lazy(()=> import("./components/Home/Signup"));

const PageNotFound = lazy(()=> import ("./components/PageNotFound"));
const Userlayout = lazy(()=> import("./components/User/Userlayout")) ;
const ForgotPassword = lazy(()=> import("./components/Home/ForgotPassword")) ;

const Dashboard = lazy(()=> import("./components/Shared/Dashboard")) ;
const Report = lazy(()=> import( "./components/Shared/Report"));
const Transactions = lazy(()=> import("./components/Shared/Transactions")) ;


// import { AdminUserGuard } from "../../backend/src/middleware/guard.middleware";

const App = () => {
  return (
    <BrowserRouter>
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

{/* admin related routes */}
 <Route path="/app/admin" element={< Guard
        endpoint="/api/user/session"
        role="admin">
          < Adminlayout />
        </Guard>}
        
        >
          <Route index element={<Dashboard />}/>
          <Route path="dashboard" element={<Dashboard />}/>
          <Route path="report" element={<Report />}/>
          <Route path="users" element={<Users />}/>

        </Route>


{/* user related routes */}
        <Route path="/app/user" element={< Guard
        endpoint="/api/user/session"
        role="user">
          < Userlayout />
        </Guard>}
        
        >
          <Route index element={<Dashboard />}/>
          <Route path="dashboard" element={<Dashboard />}/>
          <Route path="report" element={<Report />}/>
          <Route path="transactions" element={<Transactions />}/>

        </Route>
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
};
export default App;
