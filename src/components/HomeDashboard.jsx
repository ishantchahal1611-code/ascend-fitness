import { Flame, Droplets, Target, ChevronRight, Activity } from 'lucide-react';

export default function HomeDashboard() {
  return (
    <div className="p-screen fade-in">
      {/* Header */}
      <header className="flex-row justify-between mb-section" style={{ marginTop: '20px' }}>
        <div className="flex-col">
          <span className="text-body" style={{ fontSize: '18px' }}>Monday, 18 May</span>
          <h1 className="text-h1">Summary</h1>
        </div>
        <div className="avatar">
          {/* Placeholder for user avatar */}
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)' }} />
        </div>
      </header>

      {/* Activity Rings / Core Stats */}
      <section className="mb-section flex-row gap-md">
        {/* Calories Card */}
        <div className="card flex-1 flex-col justify-between" style={{ minHeight: '160px', position: 'relative', overflow: 'hidden' }}>
          <div className="flex-row justify-between align-start" style={{ zIndex: 2 }}>
            <div className="flex-col">
              <span className="text-caption text-green">Calories</span>
              <span className="text-h2" style={{ marginTop: '4px' }}>1,840</span>
            </div>
            <div className="btn-icon" style={{ backgroundColor: 'var(--accent-green-dim)', color: 'var(--accent-green)', width: '36px', height: '36px' }}>
              <Flame size={18} />
            </div>
          </div>
          <div style={{ zIndex: 2 }}>
            <span className="text-label">Goal: 2,400 kcal</span>
            <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '76%', background: 'var(--accent-green)', borderRadius: '3px' }} />
            </div>
          </div>
          {/* Background Glow */}
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '100px', height: '100px', background: 'var(--accent-green)', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }} />
        </div>

        {/* Macros Mini Cards */}
        <div className="flex-col gap-sm flex-1">
          <div className="card" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="text-caption" style={{ color: '#0a84ff' }}>Protein</span>
            <div className="flex-row justify-between" style={{ marginTop: '4px' }}>
              <span className="text-h3">145g</span>
              <span className="text-label" style={{ opacity: 0.5 }}>/ 160g</span>
            </div>
          </div>
          <div className="card" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="text-caption" style={{ color: '#ff9f0a' }}>Carbs</span>
            <div className="flex-row justify-between" style={{ marginTop: '4px' }}>
              <span className="text-h3">210g</span>
              <span className="text-label" style={{ opacity: 0.5 }}>/ 250g</span>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Workout */}
      <section className="mb-section">
        <div className="flex-row justify-between" style={{ marginBottom: '16px' }}>
          <h2 className="text-h2">Today's Workout</h2>
          <span className="text-body" style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>See Plan</span>
        </div>
        <div className="card flex-row justify-between" style={{ padding: '24px' }}>
          <div className="flex-col">
            <span className="text-caption text-orange" style={{ marginBottom: '4px' }}>Wk 4 • Day 1</span>
            <h3 className="text-h3" style={{ marginBottom: '8px' }}>Push (Chest & Triceps)</h3>
            <span className="text-label">6 Exercises • 45 Min</span>
          </div>
          <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
            Start
          </button>
        </div>
      </section>

      {/* Daily Activity */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ marginBottom: '16px' }}>Daily Activity</h2>
        <div className="flex-col gap-md">
          {/* Steps */}
          <div className="card flex-row" style={{ padding: '16px' }}>
            <div className="btn-icon" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: '16px' }}>
              <Activity size={20} className="text-orange" />
            </div>
            <div className="flex-col flex-1">
              <span className="text-label">Steps</span>
              <span className="text-h3">6,432 <span className="text-body" style={{ fontSize: '14px' }}>/ 10,000</span></span>
            </div>
            <ChevronRight size={20} className="text-tertiary" />
          </div>
          
          {/* Water */}
          <div className="card flex-row" style={{ padding: '16px' }}>
            <div className="btn-icon" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: '16px' }}>
              <Droplets size={20} className="text-blue" />
            </div>
            <div className="flex-col flex-1">
              <span className="text-label">Water</span>
              <span className="text-h3">1.5L <span className="text-body" style={{ fontSize: '14px' }}>/ 3.0L</span></span>
            </div>
            <ChevronRight size={20} className="text-tertiary" />
          </div>
        </div>
      </section>
      
      {/* Streaks */}
      <section className="mb-section">
        <div className="card flex-row justify-between align-center" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(255, 69, 58, 0.05) 100%)' }}>
          <div className="flex-col">
            <span className="text-label">Current Streak</span>
            <div className="flex-row align-center gap-sm" style={{ marginTop: '4px' }}>
              <Flame size={24} className="text-red" fill="var(--accent-red)" />
              <span className="text-h2">14 Days</span>
            </div>
          </div>
          <div className="flex-row gap-sm">
            {[1, 2, 3, 4, 5].map((day, i) => (
              <div key={day} style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: i < 4 ? 'var(--accent-red-dim)' : 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: i < 4 ? 'var(--accent-red)' : 'var(--text-tertiary)',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {['M', 'T', 'W', 'T', 'F'][i]}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
