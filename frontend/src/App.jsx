import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
      {showDashboard ? (
        <Dashboard onExitDashboard={() => setShowDashboard(false)} />
      ) : (
        <LandingPage onEnterDashboard={() => setShowDashboard(true)} />
      )}
    </>
  );
}

export default App;
