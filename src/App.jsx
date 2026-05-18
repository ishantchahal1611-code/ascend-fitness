import { useState } from 'react';
import HomeDashboard from './components/HomeDashboard';
import WorkoutPlanner from './components/WorkoutPlanner';
import CalorieTracker from './components/CalorieTracker';
import ActivityTracker from './components/ActivityTracker';
import ProgressSystem from './components/ProgressSystem';
import BottomNav from './components/BottomNav';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'workout':
        return <WorkoutPlanner />;
      case 'calories':
        return <CalorieTracker />;
      case 'activity':
        return <ActivityTracker />;
      case 'progress':
        return <ProgressSystem />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Main Content Area */}
      <main className="flex-1 pb-nav">
        {renderTab()}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
