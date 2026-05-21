import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import Auth from './components/Auth';
import HomeDashboard from './components/HomeDashboard';
import WorkoutPlanner from './components/WorkoutPlanner';
import CalorieTracker from './components/CalorieTracker';
import ActivityTracker from './components/ActivityTracker';
import ProgressSystem from './components/ProgressSystem';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';

function AppContent({ session }) {
  const [activeTab, setActiveTab] = useState('home');
  const { restTimer, cancelRestTimer, needsOnboarding, dbLoading, syncError, retrySync } = useApp();

  if (needsOnboarding) {
    return <Onboarding />;
  }

  if (dbLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        Syncing your data...
      </div>
    );
  }

  if (syncError) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center', gap: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 600 }}>Could not load your data</p>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 320 }}>{syncError}</p>
        <button className="btn btn-primary" onClick={retrySync}>Try again</button>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeDashboard onNavigate={setActiveTab} />;
      case 'workout': return <WorkoutPlanner />;
      case 'calories': return <CalorieTracker />;
      case 'activity': return <ActivityTracker />;
      case 'progress': return <ProgressSystem />;
      case 'settings': return <Settings session={session} />;
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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading Ascend Fitness...</div>;
  }

  if (!isSupabaseConfigured) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center', gap: 12 }}>
        <p style={{ fontSize: 20, fontWeight: 700 }}>Setup required</p>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 360 }}>
          Copy <code>.env.example</code> to <code>.env</code> and add your Supabase project URL and anon key, then restart the app.
        </p>
      </div>
    );
  }

  if (!session) {
    return <Auth onLogin={setSession} />;
  }

  return (
    <AppProvider session={session}>
      <AppContent session={session} />
    </AppProvider>
  );
}

export default App;
