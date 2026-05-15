import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TaskDetailPage from './pages/TaskDetailPage';
import MyTasksPage from './pages/MyTasksPage';
import AdminPage from './pages/AdminPage';
import LoadingSpinner from './components/UI/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// Only superadmins can access this route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.systemRole !== 'superadmin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<DashboardPage />} />
        <Route path="projects"       element={<ProjectsPage />} />
        <Route path="projects/:id"   element={<ProjectDetailPage />} />
        <Route path="tasks/my"       element={<MyTasksPage />} />
        <Route path="tasks/:id"      element={<TaskDetailPage />} />
        <Route path="admin"          element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
