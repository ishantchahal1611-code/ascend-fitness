import { Flame, Droplets, Target, ChevronRight, Activity, Plus, Minus, Settings } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function HomeDashboard({ onNavigate }) {
  const {
    todayTotals, goals, todayWater, addWater, todaySteps, addSteps,
    streak, todayWorkout, todayScheduleLabel, activePlan,
    startWorkoutSession, units,
  } = useApp();

  const calPct = Math.min(100, Math.round((todayTotals.calories / goals.calories) * 100));
  const proteinPct = Math.min(100, Math.round((todayTotals.protein / goals.protein) * 100));
  const carbsPct = Math.min(100, Math.round((todayTotals.carbs / goals.carbs) * 100));
  const waterPct = Math.min(100, Math.round((todayWater / goals.water) * 100));
  const stepPct = Math.min(100, Math.round((todaySteps / goals.steps) * 100));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const dateStr = `${dayNames[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;

  const weekDots = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;

  return (
    <div className="p-screen fade-in">
      {/* Header */}
      <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
        <div className="flex-col">
          <span className="text-body" style={{ fontSize: 18 }}>{dateStr}</span>
          <h1 className="text-h1">Summary</h1>
        </div>
        <button className="avatar" onClick={() => onNavigate('settings')} style={{ cursor: 'pointer', border: 'none' }}>
          <Settings size={22} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </header>

      {/* Core Stats */}
      <section className="mb-section flex-row gap-md">
        {/* Calories */}
        <div className="card flex-1 flex-col justify-between" style={{ minHeight: 160, position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => onNavigate('calories')}>
          <div className="flex-row justify-between align-start" style={{ zIndex: 2 }}>
            <div className="flex-col">
              <span className="text-caption text-green">Calories</span>
              <span className="text-h2" style={{ marginTop: 4 }}>{todayTotals.calories.toLocaleString()}</span>
            </div>
            <div className="btn-icon" style={{ backgroundColor: 'var(--accent-green-dim)', color: 'var(--accent-green)', width: 36, height: 36 }}>
              <Flame size={18} />
            </div>
          </div>
          <div style={{ zIndex: 2 }}>
            <span className="text-label">Goal: {goals.calories.toLocaleString()} kcal</span>
            <div style={{ height: 6, background: 'var(--bg-surface-elevated)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${calPct}%`, background: 'var(--accent-green)', borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
          </div>
          <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, background: 'var(--accent-green)', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }} />
        </div>

        {/* Macros Mini */}
        <div className="flex-col gap-sm flex-1">
          <div className="card" style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="text-caption" style={{ color: 'var(--accent-blue)' }}>Protein</span>
            <div className="flex-row justify-between" style={{ marginTop: 4 }}>
              <span className="text-h3">{todayTotals.protein}g</span>
              <span className="text-label" style={{ opacity: 0.5 }}>/ {goals.protein}g</span>
            </div>
          </div>
          <div className="card" style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="text-caption" style={{ color: 'var(--accent-orange)' }}>Carbs</span>
            <div className="flex-row justify-between" style={{ marginTop: 4 }}>
              <span className="text-h3">{todayTotals.carbs}g</span>
              <span className="text-label" style={{ opacity: 0.5 }}>/ {goals.carbs}g</span>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Workout */}
      <section className="mb-section">
        <div className="flex-row justify-between" style={{ marginBottom: 16 }}>
          <h2 className="text-h2">Today's Workout</h2>
          <span className="text-body" style={{ color: 'var(--accent-blue)', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('workout')}>See Plan</span>
        </div>
        <div className="card flex-row justify-between" style={{ padding: 24 }}>
          <div className="flex-col">
            <span className="text-caption text-orange" style={{ marginBottom: 4 }}>{activePlan?.shortName || 'PPL'} • {todayScheduleLabel}</span>
            <h3 className="text-h3" style={{ marginBottom: 8 }}>
              {todayWorkout ? todayWorkout.name : 'Rest Day 😌'}
            </h3>
            <span className="text-label">{todayWorkout ? `${todayWorkout.exercises.length} Exercises` : 'Recovery & Stretch'}</span>
          </div>
          {todayWorkout && (
            <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}
              onClick={() => { startWorkoutSession(todayWorkout); onNavigate('workout'); }}>
              Start
            </button>
          )}
        </div>
      </section>

      {/* Daily Activity */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ marginBottom: 16 }}>Daily Activity</h2>
        <div className="flex-col gap-md">
          {/* Steps */}
          <div className="card flex-row" style={{ padding: 16 }}>
            <div className="btn-icon" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: 16 }}>
              <Activity size={20} className="text-orange" />
            </div>
            <div className="flex-col flex-1">
              <span className="text-label">Steps</span>
              <span className="text-h3">{todaySteps.toLocaleString()} <span className="text-body" style={{ fontSize: 14 }}>/ {goals.steps.toLocaleString()}</span></span>
              <div style={{ height: 4, background: 'var(--bg-surface-elevated)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stepPct}%`, background: 'var(--accent-orange)', borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <button className="btn-icon" style={{ width: 32, height: 32, marginLeft: 8 }}
              onClick={() => addSteps(500)}>
              <Plus size={16} />
            </button>
          </div>

          {/* Water */}
          <div className="card flex-row" style={{ padding: 16 }}>
            <div className="btn-icon" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: 16 }}>
              <Droplets size={20} className="text-blue" />
            </div>
            <div className="flex-col flex-1">
              <span className="text-label">Water</span>
              <span className="text-h3">{todayWater.toFixed(1)}L <span className="text-body" style={{ fontSize: 14 }}>/ {goals.water}L</span></span>
              <div style={{ height: 4, background: 'var(--bg-surface-elevated)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${waterPct}%`, background: 'var(--accent-blue)', borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <div className="flex-row gap-sm" style={{ marginLeft: 8 }}>
              <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => addWater(-0.25)}>
                <Minus size={14} />
              </button>
              <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => addWater(0.25)}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Streaks */}
      <section className="mb-section">
        <div className="card flex-row justify-between align-center" style={{ padding: 20, background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(255, 69, 58, 0.05) 100%)' }}>
          <div className="flex-col">
            <span className="text-label">Current Streak</span>
            <div className="flex-row align-center gap-sm" style={{ marginTop: 4 }}>
              <Flame size={24} className="text-red" fill="var(--accent-red)" />
              <span className="text-h2">{streak} Days</span>
            </div>
          </div>
          <div className="flex-row gap-sm">
            {weekDots.map((day, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: '50%',
                backgroundColor: i <= todayIdx ? 'var(--accent-red-dim)' : 'var(--bg-surface-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i <= todayIdx ? 'var(--accent-red)' : 'var(--text-tertiary)',
                fontSize: 12, fontWeight: 600
              }}>
                {day}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
