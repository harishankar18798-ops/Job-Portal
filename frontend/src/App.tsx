import { Routes, Route } from "react-router-dom";
import JobApply from "./pages/jobapply";
import JobTable from "./pages/jobtable";
import CandidateForm from "./pages/candidateform";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import HomePage from "./pages/home";
import ApplicationsTable from "./pages/applications";
import UserTable from "./pages/user";
import AppLayout from "./pages/applayout";
import DepartmentTable from "./pages/dept";
import CreateJob from "./pages/createjob";
//import FirstPage from "./pages/firstpage";
import Dashboard from "./pages/dashboard";
import EmploymentTypeTable from "./pages/employmentType";
import ProtectedRoute from "./pages/ProtectedRoute";
import MyApplications from "./pages/MyApplications";
import { startTokenRefreshTimer } from "./utils/tokenTimer";
import JobDetail from "./pages/jobDetail";
import { useEffect } from "react";

function App() {

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      startTokenRefreshTimer();
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      {/* <Route path="/" element={<FirstPage />} /> */}

      {/* Any authenticated user */}
      <Route element={<AppLayout />}>
        <Route path="/jobapply" element={<JobApply />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* User only */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/profile" element={<CandidateForm />} />
            <Route path="/myapplications" element={<MyApplications />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/table" element={<JobTable />} />
            <Route path="/applications" element={<ApplicationsTable />} />
            <Route path="/users" element={<UserTable />} />
            <Route path="/dept" element={<DepartmentTable />} />
            <Route path="/createjob" element={<CreateJob />} />
            <Route path="/profile/:id" element={<CandidateForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employmenttype" element={<EmploymentTypeTable />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
