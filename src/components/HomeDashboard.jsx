import { useMemo } from 'react';
import { Flame, Droplets, ChevronRight, Activity, Plus, Minus, Settings, RefreshCw, Dumbbell, Clock } from 'lucide-react';
import { useApp } from '../store/AppContext';

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HomeDashboard({ onNavigate }) {
  const {
    todayTotals, goals, todayWater, addWater, todaySteps, addSteps,
    streak, todayWorkout, todayScheduleLabel, activePlan,
    startWorkoutSession,
    selectedDate, setSelectedDate, dbLoading, workoutHistory, mealsByDate
  } = useApp();

  const getToday = () => new Date().toISOString().split('T')[0];

  // Check if a workout has been completed on the selectedDate
  const completedWorkout = useMemo(() => {
    return workoutHistory.find(w => w.date === selectedDate) || null;
  }, [workoutHistory, selectedDate]);

  const weekDays = useMemo(() => {
    const todayDateObj = new Date();
    const todayDay = todayDateObj.getDay();
    const todayDayIdx = todayDay === 0 ? 6 : todayDay - 1; // Mon=0 .. Sun=6
    const mondayDate = new Date(todayDateObj);
    mondayDate.setDate(todayDateObj.getDate() - todayDayIdx);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNumStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNumStr}`;
      
      const hasWorkout = workoutHistory.some(w => w.date === dateStr);
      const hasMeals = (mealsByDate[dateStr] && mealsByDate[dateStr].length > 0);
      
      return {
        day: dayLabels[i],
        dateNum: d.getDate(),
        dateStr,
        active: dateStr === selectedDate,
        hasWorkout,
        hasMeals
      };
    });
  }, [selectedDate, workoutHistory, mealsByDate]);

  const selectedDateObj = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date();
  }, [selectedDate]);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${dayNames[selectedDateObj.getDay()]}, ${selectedDateObj.getDate()} ${months[selectedDateObj.getMonth()]}`;

  const calPct = Math.min(100, Math.round((todayTotals.calories / goals.calories) * 100)) || 0;
  const proteinPct = Math.min(100, Math.round((todayTotals.protein / goals.protein) * 100)) || 0;
  const carbsPct = Math.min(100, Math.round((todayTotals.carbs / goals.carbs) * 100)) || 0;
  const waterPct = Math.min(100, Math.round((todayWater / goals.water) * 100)) || 0;
  const stepPct = Math.min(100, Math.round((todaySteps / goals.steps) * 100)) || 0;

  const streakDots = weekDays.map((item) => ({
    day: item.day[0],
    completed: item.hasWorkout
  }));

  // Show skeleton screen if data is loading and cache is completely empty
  const showSkeleton = dbLoading && (workoutHistory.length === 0 && Object.keys(mealsByDate).length === 0 && !localStorage.getItem('ascend_profile'));

  if (showSkeleton) {
    return (
      <div className="p-screen fade-in">
        {/* Header Skeleton */}
        <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
          <div className="flex-col" style={{ width: '60%' }}>
            <div className="skeleton-text" style={{ width: '40%', height: 16, marginBottom: 8 }} />
            <div className="skeleton-title" style={{ width: '70%', height: 32 }} />
          </div>
          <div className="skeleton-circle" style={{ width: 48, height: 48 }} />
        </header>

        {/* Week Strip Skeleton */}
        <div className="flex-row mb-section" style={{ overflowX: 'auto', gap: 12, paddingBottom: 8, margin: '0 -24px', padding: '0 24px 8px' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ minWidth: 54, height: 68 }} />
          ))}
        </div>

        {/* Rings Chart Card Skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 180, marginBottom: 32 }} />

        {/* Workout Card Skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 140, marginBottom: 32 }} />

        {/* Activity Card Skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 100, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 100, marginBottom: 32 }} />
      </div>
    );
  }

  return (
    <div className="p-screen fade-in">
      {/* Header */}
      <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
        <div className="flex-col">
          <span className="text-body" style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {dateStr}
            {dbLoading && <RefreshCw size={14} className="text-tertiary animate-spin" />}
          </span>
          <h1 className="text-h1">Summary</h1>
        </div>
        <button className="avatar" onClick={() => onNavigate('settings')} style={{ cursor: 'pointer', border: 'none' }}>
          <Settings size={22} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </header>

      {/* Week Dates Selector */}
      <section className="mb-section" style={{ marginTop: -12 }}>
        <div className="flex-row" style={{ overflowX: 'auto', gap: 12, paddingBottom: 8, margin: '0 -24px', padding: '0 24px 8px' }}>
          {weekDays.map((item, i) => (
            <button key={i} className={`card ${item.active ? 'card-elevated' : ''}`}
              onClick={() => setSelectedDate(item.dateStr)}
              style={{
                minWidth: 54, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: item.active ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                background: item.active ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                cursor: 'pointer', outline: 'none', position: 'relative'
              }}>
              <span className="text-caption" style={{ color: item.active ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: 10 }}>{item.day}</span>
              <span className="text-h2" style={{ margin: '4px 0', fontSize: 18, color: item.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.dateNum}</span>
              
              {/* Activity indicators */}
              <div className="flex-row gap-xs" style={{ gap: 3, marginTop: 2 }}>
                {item.hasWorkout && <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--accent-red)' }} />}
                {item.hasMeals && <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Core Stats Overview Card (with Concentric Rings Chart) */}
      <section className="mb-section" onClick={() => onNavigate('calories')} style={{ cursor: 'pointer' }}>
        <div className="card flex-row gap-lg" style={{ padding: '24px 20px', minHeight: 180, position: 'relative', overflow: 'hidden' }}>
          
          {/* Rings Chart */}
          <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="130" height="130" viewBox="0 0 160 160">
              {/* Outer Ring: Calories */}
              <circle cx="80" cy="80" r="68" fill="none" stroke="var(--accent-green-dim)" strokeWidth="9" />
              <circle cx="80" cy="80" r="68" fill="none" stroke="var(--accent-green)" strokeWidth="9"
                strokeDasharray="427.26" strokeDashoffset={427.26 - (calPct / 100) * 427.26}
                strokeLinecap="round" transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />

              {/* Middle Ring: Protein */}
              <circle cx="80" cy="80" r="54" fill="none" stroke="var(--accent-blue-dim)" strokeWidth="9" />
              <circle cx="80" cy="80" r="54" fill="none" stroke="var(--accent-blue)" strokeWidth="9"
                strokeDasharray="339.29" strokeDashoffset={339.29 - (proteinPct / 100) * 339.29}
                strokeLinecap="round" transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />

              {/* Inner Ring: Carbs */}
              <circle cx="80" cy="80" r="40" fill="none" stroke="var(--accent-orange-dim)" strokeWidth="9" />
              <circle cx="80" cy="80" r="40" fill="none" stroke="var(--accent-orange)" strokeWidth="9"
                strokeDasharray="251.33" strokeDashoffset={251.33 - (carbsPct / 100) * 251.33}
                strokeLinecap="round" transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </svg>
            <div className="flex-col align-center" style={{ position: 'absolute', zIndex: 2 }}>
              <Flame size={20} className="text-green" />
              <span style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{calPct}%</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-col justify-between flex-1" style={{ gap: 10 }}>
            <div className="flex-row justify-between align-center">
              <h3 className="text-h3" style={{ fontSize: 16 }}>Nutrition</h3>
              <ChevronRight size={18} className="text-tertiary" />
            </div>
            
            <div className="flex-col gap-sm">
              <div className="flex-row justify-between">
                <span className="flex-row align-center gap-sm text-label" style={{ fontSize: 13 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
                  Calories
                </span>
                <span className="text-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {todayTotals.calories.toLocaleString()} / {goals.calories.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-tertiary)' }}>kcal</span>
                </span>
              </div>
              <div className="flex-row justify-between">
                <span className="flex-row align-center gap-sm text-label" style={{ fontSize: 13 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} />
                  Protein
                </span>
                <span className="text-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {todayTotals.protein} / {goals.protein} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-tertiary)' }}>g</span>
                </span>
              </div>
              <div className="flex-row justify-between">
                <span className="flex-row align-center gap-sm text-label" style={{ fontSize: 13 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-orange)' }} />
                  Carbs
                </span>
                <span className="text-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {todayTotals.carbs} / {goals.carbs} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-tertiary)' }}>g</span>
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, background: 'var(--accent-green)', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)' }} />
        </div>
      </section>

      {/* Today's / Selected Date's Workout */}
      <section className="mb-section">
        <div className="flex-row justify-between" style={{ marginBottom: 16 }}>
          <h2 className="text-h2">{selectedDate === getToday() ? "Today's Workout" : "Scheduled Workout"}</h2>
          <span className="text-body" style={{ color: 'var(--accent-blue)', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('workout')}>See Plan</span>
        </div>
        <div className="card flex-row justify-between" style={{ padding: 24 }}>
          {completedWorkout ? (
            <div className="flex-col flex-1">
              <span className="text-caption text-green" style={{ marginBottom: 4 }}>Completed 🎉</span>
              <h3 className="text-h3" style={{ marginBottom: 8 }}>{completedWorkout.planName}</h3>
              <div className="flex-row gap-md text-label" style={{ fontSize: 13 }}>
                <span className="flex-row gap-sm" style={{ alignItems: 'center' }}><Clock size={13} /> {completedWorkout.duration}m</span>
                <span className="flex-row gap-sm" style={{ alignItems: 'center' }}><Dumbbell size={13} /> {completedWorkout.exercises} exercises</span>
                <span>{(completedWorkout.totalVolume / 1000).toFixed(1)}k kg volume</span>
              </div>
            </div>
          ) : (
            <>
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
            </>
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
            {streakDots.map((dot, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: '50%',
                backgroundColor: dot.completed ? 'var(--accent-red-dim)' : 'var(--bg-surface-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: dot.completed ? 'var(--accent-red)' : 'var(--text-tertiary)',
                fontSize: 12, fontWeight: 600
              }}>
                {dot.day}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
