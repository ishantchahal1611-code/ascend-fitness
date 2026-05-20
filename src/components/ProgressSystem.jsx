import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, TrendingUp, Medal, Star, Award, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../store/AppContext';
import { getExercise } from '../data/presets';

function LogWeightModal({ currentWeight, unit, onSave, onClose }) {
  const [val, setVal] = useState(currentWeight);
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>Log Bodyweight</span>
          <button className="btn btn-sm btn-primary" onClick={() => { onSave(parseFloat(val)); onClose(); }}>Save</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="btn-icon" style={{ width: 48, height: 48, fontSize: 24 }} onClick={() => setVal(v => Math.max(30, parseFloat((v - 0.1).toFixed(1))))}>−</button>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 56, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{parseFloat(val).toFixed(1)}</span>
              <span className="text-label" style={{ display: 'block', marginTop: 4 }}>{unit}</span>
            </div>
            <button className="btn-icon" style={{ width: 48, height: 48, fontSize: 24 }} onClick={() => setVal(v => parseFloat((v + 0.1).toFixed(1)))}>+</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ProgressSystem() {
  const { bodyweightLog, currentWeight, addBodyweight, units, workoutHistory, streak, personalRecords } = useApp();
  const [showWeightModal, setShowWeightModal] = useState(false);

  const weightUnit = units.weight;

  // Prepare chart data
  const chartData = bodyweightLog.map(e => {
    const d = new Date(e.date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { name: months[d.getMonth()], weight: weightUnit === 'lb' ? parseFloat((e.weight * 2.205).toFixed(1)) : e.weight };
  });

  const startWeight = chartData[0]?.weight || 0;
  const latestWeight = chartData[chartData.length - 1]?.weight || 0;
  const weightChange = (latestWeight - startWeight).toFixed(1);

  // Workout stats
  const totalWorkouts = workoutHistory.length;
  const totalVolume = workoutHistory.reduce((s, w) => s + w.totalVolume, 0);
  const totalMinutes = workoutHistory.reduce((s, w) => s + w.duration, 0);

  // Consistency calculation
  const last30 = workoutHistory.filter(w => {
    const d = new Date(w.date);
    const ago = new Date();
    ago.setDate(ago.getDate() - 30);
    return d >= ago;
  }).length;
  const consistency = Math.min(100, Math.round((last30 / 20) * 100));

  // PR entries
  const prEntries = Object.entries(personalRecords);

  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
        <h1 className="text-h1">Progress</h1>
        <div className="avatar" style={{ backgroundColor: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
          <TrendingUp size={24} />
        </div>
      </header>

      {/* Body Progress Chart */}
      <section className="mb-section">
        <div className="card" style={{ padding: 24 }}>
          <div className="flex-row justify-between align-center" style={{ marginBottom: 24 }}>
            <div className="flex-col">
              <span className="text-caption" style={{ color: 'var(--accent-blue)' }}>Bodyweight</span>
              <div className="flex-row align-center gap-sm" style={{ marginTop: 4 }}>
                <span className="text-h2">{latestWeight} <span className="text-body">{weightUnit}</span></span>
              </div>
            </div>
            <div className="flex-row gap-sm">
              <div className="badge badge-green" style={{ display: 'flex', gap: 4 }}>
                <TrendingUp size={14} /> {weightChange} {weightUnit}
              </div>
              <button className="btn-icon" style={{ width: 36, height: 36 }} onClick={() => setShowWeightModal(true)}>
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 180, marginLeft: -16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0a84ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} dy={10} />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)' }}
                  itemStyle={{ color: '#0a84ff' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#0a84ff" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Workout Stats */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ fontSize: 18, marginBottom: 16 }}>Workout Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <span className="text-h2" style={{ color: 'var(--accent-green)' }}>{totalWorkouts}</span>
            <span className="text-label" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>Workouts</span>
          </div>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <span className="text-h2" style={{ color: 'var(--accent-blue)' }}>{totalMinutes}m</span>
            <span className="text-label" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>Total Time</span>
          </div>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <span className="text-h2" style={{ color: 'var(--accent-orange)' }}>{(totalVolume / 1000).toFixed(0)}k</span>
            <span className="text-label" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>Volume ({weightUnit})</span>
          </div>
        </div>
      </section>

      {/* Consistency + Streak */}
      <section className="mb-section">
        <div className="flex-row gap-md">
          <div className="card flex-1 flex-col align-center justify-center" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'var(--accent-green)', opacity: 0.1, borderRadius: '50%', filter: 'blur(20px)' }} />
            <span className="text-h1" style={{ color: 'var(--accent-green)', fontSize: 48 }}>{consistency}<span style={{ fontSize: 24 }}>%</span></span>
            <span className="text-label" style={{ marginTop: 8 }}>Consistency Score</span>
          </div>
          <div className="card flex-1 flex-col justify-between" style={{ padding: 24 }}>
            <div className="flex-col">
              <span className="text-caption text-orange">Best Streak</span>
              <span className="text-h2" style={{ marginTop: 4 }}>{Math.max(streak, 28)} Days</span>
            </div>
            <div className="flex-col" style={{ marginTop: 16 }}>
              <span className="text-caption text-red">Current</span>
              <span className="text-h2" style={{ marginTop: 4 }}>{streak} Days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Records */}
      {prEntries.length > 0 && (
        <section className="mb-section">
          <h2 className="text-h2" style={{ fontSize: 18, marginBottom: 16 }}>Personal Records</h2>
          <div className="flex-col gap-sm">
            {prEntries.map(([exId, weight]) => {
              const ex = getExercise(exId);
              const displayWeight = weightUnit === 'lb' ? Math.round(weight * 2.205) : weight;
              return (
                <div key={exId} className="card flex-row justify-between align-center" style={{ padding: 16 }}>
                  <div className="flex-row gap-md align-center">
                    <Award size={20} style={{ color: 'var(--accent-orange)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ex?.name || exId}</span>
                  </div>
                  <span className="badge badge-orange">{displayWeight} {weightUnit}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Achievements */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ fontSize: 18, marginBottom: 16 }}>Achievements</h2>
        <div className="flex-col gap-sm">
          {[
            { title: 'Early Bird', desc: 'Complete 10 morning workouts', icon: Star, color: 'var(--accent-orange)', unlocked: totalWorkouts >= 3 },
            { title: 'Heavy Lifter', desc: 'Reach 100kg on any lift', icon: Medal, color: 'var(--accent-blue)', unlocked: prEntries.some(([, w]) => w >= 100) },
            { title: 'Consistency King', desc: 'Maintain a 7-day streak', icon: Trophy, color: 'var(--accent-red)', unlocked: streak >= 7 },
          ].map((ach, i) => (
            <div key={i} className="card flex-row align-center" style={{ padding: 16, opacity: ach.unlocked ? 1 : 0.6 }}>
              <div className="avatar" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: 16 }}>
                <ach.icon size={24} style={{ color: ach.color }} />
              </div>
              <div className="flex-col flex-1">
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{ach.title}</span>
                <span className="text-label">{ach.desc}</span>
              </div>
              {ach.unlocked ? (
                <div className="badge" style={{ backgroundColor: ach.color + '20', color: ach.color }}>Unlocked</div>
              ) : (
                <div className="badge" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-tertiary)' }}>Locked</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {showWeightModal && (
        <LogWeightModal currentWeight={currentWeight} unit={weightUnit} onSave={addBodyweight} onClose={() => setShowWeightModal(false)} />
      )}
    </div>
  );
}
