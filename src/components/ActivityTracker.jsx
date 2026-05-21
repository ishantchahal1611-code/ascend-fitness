import { useState, useEffect } from 'react';
import { MapPin, Play, Timer, Footprints, Wind, Square, X, Bike } from 'lucide-react';
import { useApp } from '../store/AppContext';

/* ── Live Activity Session ── */
function LiveSession({ activity, onStop, onCancel }) {
  const [elapsed, setElapsed] = useState(0);
  const [simDist, setSimDist] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const secs = Math.floor((Date.now() - activity.startTime) / 1000);
      setElapsed(secs);
      // Simulate distance
      const speed = activity.type === 'run' ? 0.003 : activity.type === 'walk' ? 0.0015 : 0.006;
      setSimDist(parseFloat((secs * speed).toFixed(2)));
    }, 1000);
    return () => clearInterval(t);
  }, [activity]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const pace = simDist > 0 ? (elapsed / 60 / simDist) : 0;
  const paceMin = Math.floor(pace);
  const paceSec = Math.round((pace % 1) * 60);
  const cal = Math.round(simDist * (activity.type === 'run' ? 80 : activity.type === 'walk' ? 55 : 45));

  const typeLabel = activity.type === 'run' ? 'Running' : activity.type === 'walk' ? 'Walking' : 'Cycling';
  const typeColor = activity.type === 'run' ? 'var(--accent-orange)' : activity.type === 'walk' ? 'var(--accent-blue)' : 'var(--accent-green)';

  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between" style={{ marginTop: 20, marginBottom: 32 }}>
        <button className="btn-icon" onClick={onCancel}><X size={20} /></button>
        <span className="text-caption" style={{ color: typeColor }}>{typeLabel}</span>
        <div style={{ width: 44 }} />
      </header>

      {/* Main Timer */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 64, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: -2 }}>
          {mins}:{String(secs).padStart(2, '0')}
        </div>
        <span className="text-label">Duration</span>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <span className="text-caption" style={{ color: typeColor }}>Distance</span>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{simDist.toFixed(2)}</div>
          <span className="text-label">km</span>
        </div>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <span className="text-caption" style={{ color: typeColor }}>Pace</span>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{paceMin}:{String(paceSec).padStart(2, '0')}</div>
          <span className="text-label">/km</span>
        </div>
        <div className="card" style={{ padding: 24, textAlign: 'center', gridColumn: 'span 2' }}>
          <span className="text-caption" style={{ color: typeColor }}>Calories</span>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{cal}</div>
          <span className="text-label">kcal</span>
        </div>
      </div>

      {/* Stop Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="btn" onClick={onStop} style={{
          width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--accent-red)',
          color: 'white', fontSize: 0, padding: 0
        }}>
          <Square size={28} fill="white" />
        </button>
      </div>
    </div>
  );
}

/* ── Main ActivityTracker ── */
export default function ActivityTracker() {
  const { activities, liveActivity, startLiveActivity, stopLiveActivity, cancelLiveActivity, weekActivityStats, units } = useApp();
  const [activityType, setActivityType] = useState('run');

  if (liveActivity) {
    return <LiveSession activity={liveActivity} onStop={stopLiveActivity} onCancel={cancelLiveActivity} />;
  }

  const distUnit = units.distance === 'km' ? 'km' : 'mi';
  const distMultiplier = units.distance === 'mi' ? 0.621 : 1;
  const weekDist = (weekActivityStats.distance * distMultiplier).toFixed(1);
  const weekDurMin = Math.floor(weekActivityStats.duration / 60);
  const weekDurH = Math.floor(weekDurMin / 60);
  const weekDurM = weekDurMin % 60;

  const actTypes = [
    { id: 'run', icon: Footprints, label: 'Run', color: 'var(--accent-orange)' },
    { id: 'walk', icon: Footprints, label: 'Walk', color: 'var(--accent-blue)' },
    { id: 'cycle', icon: Bike, label: 'Cycle', color: 'var(--accent-green)' },
  ];

  const getIcon = (type) => {
    if (type === 'cycle') return Bike;
    return Footprints;
  };

  const getColor = (type) => {
    if (type === 'run') return 'var(--accent-orange)';
    if (type === 'walk') return 'var(--accent-blue)';
    return 'var(--accent-green)';
  };

  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
        <h1 className="text-h1">Activity</h1>
        <div className="avatar" style={{ backgroundColor: 'var(--accent-orange-dim)', color: 'var(--accent-orange)' }}>
          <Wind size={24} />
        </div>
      </header>

      {/* Start Activity Card */}
      <section className="mb-section">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Map Placeholder */}
          <div style={{ height: 160, backgroundColor: 'var(--bg-surface-elevated)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'radial-gradient(circle at center, var(--text-primary) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, backgroundColor: getColor(activityType), borderRadius: '50%', border: '4px solid var(--bg-surface)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 64, height: 64, backgroundColor: getColor(activityType), borderRadius: '50%', opacity: 0.2, animation: 'pulse 2s infinite' }} />
          </div>

          <div style={{ padding: 24 }}>
            {/* Activity Type Selector */}
            <div className="flex-row gap-sm" style={{ marginBottom: 20 }}>
              {actTypes.map(t => (
                <button key={t.id} className={`chip ${activityType === t.id ? 'active' : ''}`}
                  onClick={() => setActivityType(t.id)}
                  style={activityType === t.id ? { backgroundColor: t.color, borderColor: t.color, color: 'white' } : {}}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            <p className="text-label" style={{ marginBottom: 12, fontSize: 12, textAlign: 'center' }}>
              Distance is estimated from time until GPS is added in the mobile app.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', gap: 8, backgroundColor: getColor(activityType), color: 'white' }}
              onClick={() => startLiveActivity(activityType)}>
              <Play size={18} fill="white" /> Start {actTypes.find(t => t.id === activityType)?.label}
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Stats */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ fontSize: 18, marginBottom: 16 }}>This Week</h2>
        <div className="flex-row gap-md">
          <div className="card flex-1" style={{ padding: 20 }}>
            <div className="flex-row justify-between" style={{ marginBottom: 12 }}>
              <span className="text-caption">Distance</span>
              <MapPin size={16} className="text-orange" />
            </div>
            <span className="text-h2">{weekDist}</span>
            <span className="text-label">{distUnit === 'km' ? 'Kilometers' : 'Miles'}</span>
          </div>
          <div className="card flex-1" style={{ padding: 20 }}>
            <div className="flex-row justify-between" style={{ marginBottom: 12 }}>
              <span className="text-caption">Time</span>
              <Timer size={16} className="text-orange" />
            </div>
            <span className="text-h2">{weekDurH}h {weekDurM}m</span>
            <span className="text-label">Active</span>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ fontSize: 18, marginBottom: 16 }}>Recent</h2>
        {activities.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <p className="text-label">No activities logged yet</p>
          </div>
        ) : (
          <div className="flex-col gap-sm">
            {activities.slice(0, 10).map(activity => {
              const Icon = getIcon(activity.type);
              const color = getColor(activity.type);
              const dist = (activity.distance * distMultiplier).toFixed(1);
              const durMin = Math.floor(activity.duration / 60);
              const durSec = activity.duration % 60;
              return (
                <div key={activity.id} className="card flex-row align-center" style={{ padding: 16 }}>
                  <div className="avatar" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: 16 }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div className="flex-col flex-1">
                    <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{activity.label}</span>
                    <div className="flex-row gap-sm text-label" style={{ fontSize: 12 }}>
                      <span>{activity.date}</span>
                      <span>•</span>
                      <span>{activity.pace} /{distUnit}</span>
                    </div>
                  </div>
                  <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                    <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{dist} {distUnit}</span>
                    <span className="text-label" style={{ fontSize: 12 }}>{durMin}m {durSec}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
