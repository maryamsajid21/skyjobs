import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobListingsPage from "./pages/JobListingsPage";
import JobDetailPage from "./pages/JobDetailPage";
import PostJobPage from "./pages/PostJobPage";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import MyBidsPage from "./pages/MyBidsPage";
import MyJobsPage from "./pages/MyJobsPage";
import FreelancerProfilePage from "./pages/FreelancerProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobListingsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/freelancer/:id" element={<FreelancerProfilePage />} />

          {/* Client only */}
          <Route path="/dashboard/client" element={<ProtectedRoute roles={["client"]}><ClientDashboard /></ProtectedRoute>} />
          <Route path="/my-jobs" element={<ProtectedRoute roles={["client"]}><MyJobsPage /></ProtectedRoute>} />
          <Route path="/post-job" element={<ProtectedRoute roles={["client"]}><PostJobPage /></ProtectedRoute>} />

          {/* Freelancer only */}
          <Route path="/dashboard/freelancer" element={<ProtectedRoute roles={["freelancer"]}><FreelancerDashboard /></ProtectedRoute>} />
          <Route path="/my-bids" element={<ProtectedRoute roles={["freelancer"]}><MyBidsPage /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute roles={["admin"]}><AdminJobs /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
