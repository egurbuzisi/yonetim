import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import HomePage from './components/pages/HomePage';
import ProjectsPage from './components/pages/ProjectsPage';
import AgendaPage from './components/pages/AgendaPage';
import PendingPage from './components/pages/PendingPage';
import ProgramPage from './components/pages/ProgramPage';
import CenazePage from './components/pages/CenazePage';
import RaporPage from './components/pages/RaporPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import NewProjectPage from './pages/NewProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectEditPage from './pages/ProjectEditPage';
import NewAgendaPage from './pages/NewAgendaPage';
import AgendaDetailPage from './pages/AgendaDetailPage';
import AgendaEditPage from './pages/AgendaEditPage';
import NewPendingPage from './pages/NewPendingPage';
import PendingDetailPage from './pages/PendingDetailPage';
import PendingEditPage from './pages/PendingEditPage';
import ScheduleEditPage from './pages/ScheduleEditPage';
import CenazeDetailPage from './pages/CenazeDetailPage';
import TaskTypesPage from './pages/TaskTypesPage';
import ContactsPage from './pages/ContactsPage';
import StaffPage from './pages/StaffPage';
import ProjectTagsPage from './pages/ProjectTagsPage';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/projects/new" element={<NewProjectPage />} />
                      <Route path="/projects/:id" element={<ProjectDetailPage />} />
                      <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
                      <Route path="/agenda" element={<AgendaPage />} />
                      <Route path="/agenda/new" element={<NewAgendaPage />} />
                      <Route path="/agenda/:id" element={<AgendaDetailPage />} />
                      <Route path="/agenda/:id/edit" element={<AgendaEditPage />} />
                      <Route path="/pending" element={<PendingPage />} />
                      <Route path="/pending/new" element={<NewPendingPage />} />
                      <Route path="/pending/:id" element={<PendingDetailPage />} />
                      <Route path="/pending/:id/edit" element={<PendingEditPage />} />
                      <Route path="/program" element={<ProgramPage />} />
                      <Route path="/program/:id/edit" element={<ScheduleEditPage />} />
                      <Route path="/cenaze" element={<CenazePage />} />
                      <Route path="/cenaze/:id" element={<CenazeDetailPage />} />
                      <Route path="/rapor" element={<RaporPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/settings/task-types" element={<TaskTypesPage />} />
                      <Route path="/settings/contacts" element={<ContactsPage />} />
                      <Route path="/settings/staff" element={<StaffPage />} />
                      <Route path="/settings/project-tags" element={<ProjectTagsPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
