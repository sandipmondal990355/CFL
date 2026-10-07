import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import HrPortal from './pages/hr/HrPortal';
import CflDashboard from './pages/cfl/CflDashboard';
import ManagerPortal from './pages/manager/ManagerPortal';
import MentorDashboard from './pages/mentor/MentorDashboard';

// Combined component to handle role checking
const MainContent = () => {
  const { role } = useAuth();
  
  if (role === 'HR') {
    return <HrPortal />;
  }
  
  if (role === 'Manager') {
    return <ManagerPortal />;
  }

  if (role === 'Mentor') {
    return <MentorDashboard />;
  }

  // Render CFL Dashboard for standard users/employees
  return <CflDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
