import { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import HomeDashboard from './components/HomeDashboard';
import WorkoutPlanner from './components/WorkoutPlanner';
import CalorieTracker from './components/CalorieTracker';
import ActivityTracker from './components/ActivityTracker';
import ProgressSystem from './components/ProgressSystem';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { restTimer, cancelRestTimer } = useApp();

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeDashboard onNavigate={setActiveTab} />;
      case 'workout': return <WorkoutPlanner />;
      case 'calories': return <CalorieTracker />;
      case 'activity': return <ActivityTracker />;
      case 'progress': return <ProgressSystem />;
      case 'settings': return <Settings />;
      default: return <HomeDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Rest Timer Banner */}
      {restTimer.active && (
        <div className="rest-banner">
          <span>Rest: {Math.floor(restTimer.remaining / 60)}:{String(restTimer.remaining % 60).padStart(2, '0')}</span>
          <button onClick={cancelRestTimer} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Skip</button>
        </div>
      )}
      <main className="flex-1 pb-nav">
        {renderTab()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
