import { Map, MapPin, Play, Timer, Footprints, Wind, Navigation } from 'lucide-react';

export default function ActivityTracker() {
  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between mb-section" style={{ marginTop: '20px' }}>
        <h1 className="text-h1">Activity</h1>
        <div className="avatar" style={{ backgroundColor: 'var(--accent-orange-dim)', color: 'var(--accent-orange)' }}>
          <Wind size={24} />
        </div>
      </header>

      {/* Start Activity Card */}
      <section className="mb-section">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Map Placeholder */}
          <div style={{ height: '180px', backgroundColor: 'var(--bg-surface-elevated)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'radial-gradient(circle at center, var(--text-primary) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '24px', backgroundColor: 'var(--accent-orange)', borderRadius: '50%', border: '4px solid var(--bg-surface)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '64px', height: '64px', backgroundColor: 'var(--accent-orange)', borderRadius: '50%', opacity: 0.2, animation: 'pulse 2s infinite' }} />
          </div>
          
          <div style={{ padding: '24px', background: 'var(--bg-surface)' }}>
            <div className="flex-row justify-between align-center mb-section" style={{ marginBottom: '24px' }}>
              <div className="flex-col">
                <span className="text-caption text-orange">Current Location</span>
                <span className="text-h2" style={{ marginTop: '4px', fontSize: '20px' }}>Ready to Run</span>
              </div>
              <div className="btn-icon" style={{ backgroundColor: 'var(--accent-orange-dim)', color: 'var(--accent-orange)' }}>
                <Navigation size={20} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', gap: '8px', backgroundColor: 'var(--accent-orange)', color: 'white' }}>
              <Play size={18} fill="white" /> Start Activity
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Stats */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ fontSize: '18px', marginBottom: '16px' }}>This Week</h2>
        <div className="flex-row gap-md">
          <div className="card flex-1" style={{ padding: '20px' }}>
            <div className="flex-row justify-between mb-section" style={{ marginBottom: '12px' }}>
              <span className="text-caption">Distance</span>
              <MapPin size={16} className="text-orange" />
            </div>
            <div className="flex-col">
              <span className="text-h2">24.5</span>
              <span className="text-label">Kilometers</span>
            </div>
          </div>
          
          <div className="card flex-1" style={{ padding: '20px' }}>
            <div className="flex-row justify-between mb-section" style={{ marginBottom: '12px' }}>
              <span className="text-caption">Time</span>
              <Timer size={16} className="text-orange" />
            </div>
            <div className="flex-col">
              <span className="text-h2">2h 15m</span>
              <span className="text-label">Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="mb-section">
        <div className="flex-row justify-between align-center" style={{ marginBottom: '16px' }}>
          <h2 className="text-h2" style={{ fontSize: '18px' }}>Recent</h2>
          <span className="text-body" style={{ fontSize: '14px', color: 'var(--accent-orange)' }}>See All</span>
        </div>
        
        <div className="flex-col gap-sm">
          {[
            { type: 'Evening Run', date: 'Yesterday', dist: '5.2 km', pace: '5:40 /km', time: '29m 30s' },
            { type: 'Morning Walk', date: 'Sunday', dist: '3.1 km', pace: '10:20 /km', time: '32m 00s' },
            { type: 'Interval Run', date: 'Friday', dist: '6.0 km', pace: '5:15 /km', time: '31m 30s' }
          ].map((activity, i) => (
            <div key={i} className="card flex-row align-center" style={{ padding: '16px' }}>
              <div className="avatar" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: '16px' }}>
                <Footprints size={20} className={i === 1 ? "text-blue" : "text-orange"} />
              </div>
              <div className="flex-col flex-1">
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{activity.type}</span>
                <span className="text-label">{activity.date}</span>
              </div>
              <div className="flex-col align-end">
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{activity.dist}</span>
                <span className="text-label" style={{ fontSize: '12px' }}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
