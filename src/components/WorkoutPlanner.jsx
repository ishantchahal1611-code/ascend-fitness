import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronRight, Play, X, Dumbbell, History, Repeat, Trash2, Check, Clock, Copy, Award, Timer } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getExercise, WORKOUT_TEMPLATES } from '../data/presets';

/* ── Active Workout Session ── */
function ActiveSession({ session, onToggleSet, onUpdateSet, onAddSet, onRemoveSet, onFinish, onCancel, restTimer, onStartRest, onCancelRest }) {
  const elapsed = Math.max(0, Math.floor((Date.now() - session.startTime) / 1000));
  const [tick, setTick] = useState(0);
  // Re-render every second for elapsed timer
  useState(() => { const t = setInterval(() => setTick(v => v + 1), 1000); return () => clearInterval(t); });

  const now = Math.floor((Date.now() - session.startTime) / 1000);
  const mins = Math.floor(now / 60);
  const secs = now % 60;

  const totalSets = session.exercises.reduce((s, e) => s + e.loggedSets.length, 0);
  const doneSets = session.exercises.reduce((s, e) => s + e.loggedSets.filter(s2 => s2.completed).length, 0);

  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between" style={{ marginTop: 20, marginBottom: 24 }}>
        <button className="btn-icon" onClick={onCancel}><X size={20} /></button>
        <div className="flex-col align-center">
          <span className="text-caption text-green">Active Workout</span>
          <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{mins}:{String(secs).padStart(2, '0')}</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onFinish} style={{ padding: '8px 16px' }}>Finish</button>
      </header>

      <div className="flex-row justify-between mb-section" style={{ marginBottom: 16 }}>
        <span className="text-h3" style={{ fontSize: 18 }}>{session.dayName}</span>
        <span className="text-label">{doneSets}/{totalSets} sets</span>
      </div>

      {/* Rest Timer Quick Access */}
      <div className="flex-row gap-sm" style={{ marginBottom: 24, overflowX: 'auto' }}>
        {[60, 90, 120, 180].map(dur => (
          <button key={dur} className={`chip ${restTimer.active && restTimer.duration === dur ? 'active' : ''}`}
            onClick={() => onStartRest(dur)}>
            <Timer size={14} /> {dur}s
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="flex-col gap-md">
        {session.exercises.map((ex, exIdx) => {
          const info = ex.info || getExercise(ex.exerciseId);
          return (
            <div key={exIdx} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-row justify-between">
                  <div className="flex-col">
                    <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{info?.name || ex.exerciseId}</span>
                    <span className="text-label" style={{ fontSize: 13 }}>{info?.muscle} • {info?.equipment}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '8px 20px 12px' }}>
                {/* Header row */}
                <div className="set-row" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 6 }}>
                  <span className="text-caption" style={{ width: 32, textAlign: 'center' }}>Set</span>
                  <span className="text-caption" style={{ flex: 1, textAlign: 'center' }}>KG</span>
                  <span className="text-caption" style={{ flex: 1, textAlign: 'center' }}>Reps</span>
                  <span className="text-caption" style={{ width: 36, textAlign: 'center' }}>✓</span>
                </div>

                {ex.loggedSets.map((set, sIdx) => (
                  <div key={sIdx} className="set-row">
                    <span className="text-label" style={{ width: 32, textAlign: 'center', fontWeight: 600, color: set.completed ? 'var(--accent-green)' : 'var(--text-tertiary)' }}>{sIdx + 1}</span>
                    <input className="set-input" type="number" value={set.weight}
                      onChange={e => onUpdateSet(exIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)} />
                    <input className="set-input" type="number" value={set.reps}
                      onChange={e => onUpdateSet(exIdx, sIdx, 'reps', parseInt(e.target.value) || 0)} />
                    <button className={`check-btn ${set.completed ? 'checked' : ''}`}
                      onClick={() => { onToggleSet(exIdx, sIdx); if (!set.completed) onStartRest(90); }}>
                      <Check size={18} />
                    </button>
                  </div>
                ))}

                <div className="flex-row gap-sm" style={{ marginTop: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, gap: 4 }} onClick={() => onAddSet(exIdx)}>
                    <Plus size={14} /> Add Set
                  </button>
                  {ex.loggedSets.length > 1 && (
                    <button className="btn btn-danger btn-sm" onClick={() => onRemoveSet(exIdx, ex.loggedSets.length - 1)} style={{ padding: '8px 12px' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

/* ── Workout History Modal ── */
function HistoryModal({ history, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>Workout History</span>
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {history.length === 0 ? (
            <p className="text-label" style={{ textAlign: 'center', padding: 32 }}>No workouts logged yet</p>
          ) : (
            <div className="flex-col gap-sm">
              {history.map(w => (
                <div key={w.id} className="card" style={{ padding: 16 }}>
                  <div className="flex-row justify-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.planName}</span>
                    <span className="text-label">{w.date}</span>
                  </div>
                  <div className="flex-row gap-md text-label" style={{ fontSize: 13 }}>
                    <span><Clock size={13} style={{ verticalAlign: -2 }} /> {w.duration}m</span>
                    <span><Dumbbell size={13} style={{ verticalAlign: -2 }} /> {w.exercises} exercises</span>
                    <span>{(w.totalVolume / 1000).toFixed(1)}k kg</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Plan Picker Modal ── */
function PlanPickerModal({ plans, activeId, onSelect, onDuplicate, onDelete, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>Workout Plans</span>
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="flex-col gap-sm">
            {plans.map(plan => (
              <div key={plan.id} className={`card flex-row justify-between align-center`}
                style={{ padding: 16, border: plan.id === activeId ? '1px solid var(--accent-blue)' : undefined, cursor: 'pointer' }}
                onClick={() => { onSelect(plan.id); onClose(); }}>
                <div className="flex-col">
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{plan.name}</span>
                  <span className="text-label" style={{ fontSize: 13 }}>{plan.days.length} days • {plan.schedule.filter(d => d !== 'Rest').length}x/week</span>
                </div>
                <div className="flex-row gap-sm">
                  <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={e => { e.stopPropagation(); onDuplicate(plan.id); }}>
                    <Copy size={14} />
                  </button>
                  {!WORKOUT_TEMPLATES.find(t => t.id === plan.id) && (
                    <button className="btn-icon" style={{ width: 32, height: 32, color: 'var(--accent-red)' }} onClick={e => { e.stopPropagation(); onDelete(plan.id); }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── PR Card ── */
function PRSection({ personalRecords }) {
  const prEntries = Object.entries(personalRecords);
  if (prEntries.length === 0) return null;
  return (
    <section className="mb-section">
      <div className="flex-row justify-between" style={{ marginBottom: 16 }}>
        <h2 className="text-h2" style={{ fontSize: 18 }}>Personal Records</h2>
        <Award size={20} className="text-orange" />
      </div>
      <div className="flex-col gap-sm">
        {prEntries.slice(0, 5).map(([exId, weight]) => {
          const ex = getExercise(exId);
          return (
            <div key={exId} className="card flex-row justify-between" style={{ padding: 14 }}>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{ex?.name || exId}</span>
              <span className="badge badge-orange" style={{ gap: 4 }}><Award size={12} /> {weight} kg</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Main WorkoutPlanner ── */
export default function WorkoutPlanner() {
  const {
    activePlan, activePlanId, setActivePlan, allPlans, duplicatePlan, deleteCustomPlan,
    todayDayIndex, todayScheduleLabel, todayWorkout,
    activeSession, startWorkoutSession, toggleSetComplete, updateSetData, addSetToExercise, removeSetFromExercise,
    finishWorkout, cancelWorkout, restTimer, startRestTimer, cancelRestTimer,
    workoutHistory, personalRecords,
    selectedDate, setSelectedDate, dbLoading, mealsByDate
  } = useApp();

  const [showHistory, setShowHistory] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);

  // If active session, show that instead
  if (activeSession) {
    return <ActiveSession session={activeSession} onToggleSet={toggleSetComplete} onUpdateSet={updateSetData}
      onAddSet={addSetToExercise} onRemoveSet={removeSetFromExercise} onFinish={finishWorkout} onCancel={cancelWorkout}
      restTimer={restTimer} onStartRest={startRestTimer} onCancelRest={cancelRestTimer} />;
  }

  const getToday = () => new Date().toISOString().split('T')[0];

  // Check if a workout has been completed on the selectedDate
  const completedWorkout = useMemo(() => {
    return workoutHistory.find(w => w.date === selectedDate) || null;
  }, [workoutHistory, selectedDate]);

  // Calculate Monday of the current week (local time)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDateObj = new Date();
  const todayDay = todayDateObj.getDay();
  const todayDayIdx = todayDay === 0 ? 6 : todayDay - 1; // Mon=0 .. Sun=6
  const mondayDate = new Date(todayDateObj);
  mondayDate.setDate(todayDateObj.getDate() - todayDayIdx);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNumStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNumStr}`;
      
      const hasWorkout = workoutHistory.some(w => w.date === dateStr);
      const hasMeals = (mealsByDate[dateStr] && mealsByDate[dateStr].length > 0);
      const scheduleLabel = activePlan?.schedule?.[i] || 'Rest';
      
      return {
        day: dayLabels[i],
        dateNum: d.getDate(),
        dateStr,
        active: dateStr === selectedDate,
        workout: scheduleLabel,
        hasWorkout,
        hasMeals
      };
    });
  }, [selectedDate, workoutHistory, mealsByDate, activePlan]);

  const todayDayData = todayWorkout;

  // Show skeleton screen if data is loading and cache is completely empty
  const showSkeleton = dbLoading && (workoutHistory.length === 0 && Object.keys(mealsByDate).length === 0 && !localStorage.getItem('ascend_profile'));

  if (showSkeleton) {
    return (
      <div className="p-screen fade-in">
        {/* Header Skeleton */}
        <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
          <div className="skeleton-title" style={{ width: '40%', height: 32 }} />
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        </header>

        {/* Plan Selector Skeleton */}
        <div className="skeleton mb-section" style={{ width: '100%', height: 56 }} />

        {/* Weekly strip Skeleton */}
        <div className="flex-row mb-section" style={{ overflowX: 'auto', gap: 12, paddingBottom: 8, margin: '0 -24px', padding: '0 24px 8px' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ minWidth: 64, height: 78 }} />
          ))}
        </div>

        {/* Routine Card Skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 160 }} />
      </div>
    );
  }

  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
        <h1 className="text-h1">Workout</h1>
        <div className="flex-row gap-sm">
          <button className="btn-icon" onClick={() => setShowHistory(true)}><History size={20} /></button>
        </div>
      </header>

      {/* Plan Selector */}
      <section className="mb-section">
        <button className="card flex-row justify-between align-center" onClick={() => setShowPlanPicker(true)} style={{ width: '100%', padding: 16, cursor: 'pointer' }}>
          <div className="flex-row gap-sm text-label">
            <Repeat size={14} /> <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{activePlan?.name}</span>
          </div>
          <ChevronRight size={18} className="text-tertiary" />
        </button>
      </section>

      {/* Weekly Schedule */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ fontSize: 18, marginBottom: 16 }}>This Week</h2>
        <div className="flex-row" style={{ overflowX: 'auto', gap: 12, paddingBottom: 8, margin: '0 -24px', padding: '0 24px 8px' }}>
          {weekDays.map((item, i) => (
            <button key={i} className={`card ${item.active ? 'card-elevated' : ''}`}
              onClick={() => setSelectedDate(item.dateStr)}
              style={{
                minWidth: 64, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: item.active ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                background: item.active ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                opacity: (!item.active && item.workout === 'Rest') ? 0.5 : 1,
                cursor: 'pointer', outline: 'none'
              }}>
              <span className="text-caption" style={{ color: item.active ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: 11 }}>{item.day}</span>
              <span className="text-h2" style={{ margin: '6px 0', fontSize: 20, color: item.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.dateNum}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: item.active ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>{item.workout}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Selected Date's Routine Details */}
      <section className="mb-section">
        {completedWorkout ? (
          <div className="card" style={{ padding: 24, background: 'linear-gradient(180deg, rgba(50, 215, 75, 0.05) 0%, var(--bg-surface) 100%)', border: '1px solid var(--accent-green-dim)' }}>
            <span className="badge badge-green" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Workout Completed</span>
            <h2 className="text-h2" style={{ marginBottom: 8 }}>{completedWorkout.planName}</h2>
            <div className="flex-row gap-md text-label" style={{ fontSize: 14 }}>
              <span className="flex-row gap-sm" style={{ alignItems: 'center' }}><Clock size={16} /> {completedWorkout.duration} Min</span>
              <span className="flex-row gap-sm" style={{ alignItems: 'center' }}><Dumbbell size={16} /> {completedWorkout.exercises} Exercises</span>
              <span>{(completedWorkout.totalVolume / 1000).toFixed(1)}k kg volume</span>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 24, background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)' }}>
              <span className="text-caption text-orange">{selectedDate === getToday() ? "Today's Routine" : "Scheduled Routine"}</span>
              <h2 className="text-h2" style={{ marginTop: 8, marginBottom: 16 }}>
                {todayDayData ? todayDayData.name : 'Rest Day'}
              </h2>
              {todayDayData && (
                <div className="flex-row gap-md text-label">
                  <span className="flex-row gap-sm"><Dumbbell size={16} /> {todayDayData.exercises.length} Exercises</span>
                  <span className="flex-row gap-sm"><Calendar size={16} /> 45-60 Min</span>
                </div>
              )}
            </div>
            {todayDayData && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)' }}>
                <button className="btn btn-primary" style={{ width: '100%', gap: 8 }} onClick={() => startWorkoutSession(todayDayData)}>
                  <Play size={18} fill="var(--btn-primary-text)" /> Start Workout
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Exercises List (only when routine is scheduled and not completed yet) */}
      {!completedWorkout && todayDayData && (
        <section className="mb-section">
          <h2 className="text-h2" style={{ fontSize: 18, marginBottom: 16 }}>Exercises</h2>
          <div className="flex-col gap-sm">
            {todayDayData.exercises.map((ex, i) => {
              const info = getExercise(ex.exerciseId);
              const pr = personalRecords[ex.exerciseId];
              return (
                <div key={i} className="card flex-row justify-between align-center" style={{ padding: 16 }}>
                  <div className="flex-col">
                    <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{info?.name || ex.exerciseId}</span>
                    <div className="flex-row gap-sm">
                      <span className="text-label">{ex.sets} sets × {ex.reps} reps</span>
                      <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>• {info?.muscle}</span>
                    </div>
                    {pr && <span className="text-caption" style={{ color: 'var(--accent-orange)', marginTop: 4 }}>PR: {pr} kg</span>}
                  </div>
                  <span className="text-label" style={{ fontWeight: 600 }}>{ex.weight} kg</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PRs */}
      <PRSection personalRecords={personalRecords} />

      {/* Modals */}
      {showHistory && <HistoryModal history={workoutHistory} onClose={() => setShowHistory(false)} />}
      {showPlanPicker && (
        <PlanPickerModal plans={allPlans} activeId={activePlanId} onSelect={setActivePlan}
          onDuplicate={duplicatePlan} onDelete={deleteCustomPlan} onClose={() => setShowPlanPicker(false)} />
      )}
    </div>
  );
}
