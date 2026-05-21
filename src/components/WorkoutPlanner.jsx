import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronRight, ChevronLeft, Play, X, Dumbbell, History, Repeat, Trash2, Check, Clock, Copy, Award, Timer, Plus, Edit } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getExercise, WORKOUT_TEMPLATES, EXERCISE_DB } from '../data/presets';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ── Active Workout Session ── */
function ActiveSession({ session, onToggleSet, onUpdateSet, onAddSet, onRemoveSet, onFinish, onCancel, restTimer, onStartRest }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - session.startTime) / 1000)));
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, [session.startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

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
function PlanPickerModal({ plans, activeId, onSelect, onDuplicate, onDelete, onEdit, onCreateNew, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>Workout Plans</span>
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ paddingBottom: 16 }}>
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
                    <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={e => { e.stopPropagation(); onEdit(plan.id); }}>
                      <Edit size={14} />
                    </button>
                  )}
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
        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ width: '100%', gap: 8 }} onClick={() => { onCreateNew(); onClose(); }}>
            <Plus size={16} /> Create Custom Split
          </button>
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
    activePlan, activePlanId, setActivePlan, allPlans, duplicatePlan, deleteCustomPlan, addCustomPlan, editCustomPlan,
    todayWorkout,
    activeSession, startWorkoutSession, toggleSetComplete, updateSetData, addSetToExercise, removeSetFromExercise,
    finishWorkout, cancelWorkout, restTimer, startRestTimer, cancelRestTimer,
    workoutHistory, personalRecords,
    selectedDate, setSelectedDate, dbLoading, mealsByDate
  } = useApp();

  const [showHistory, setShowHistory] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const getToday = () => new Date().toISOString().split('T')[0];

  // Check if a workout has been completed on the selectedDate
  const completedWorkout = useMemo(() => {
    return workoutHistory.find(w => w.date === selectedDate) || null;
  }, [workoutHistory, selectedDate]);

  const weekDays = useMemo(() => {
    const parts = selectedDate.split('-');
    let refDate;
    if (parts.length === 3) {
      refDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      refDate = new Date();
    }
    const dayOfWeek = refDate.getDay(); // Sun=0 .. Sat=6
    const sundayDate = new Date(refDate);
    sundayDate.setDate(refDate.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sundayDate);
      d.setDate(sundayDate.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNumStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNumStr}`;
      
      const hasWorkout = workoutHistory.some(w => w.date === dateStr);
      const hasMeals = (mealsByDate[dateStr] && mealsByDate[dateStr].length > 0);
      
      // Fix index mismatch: schedule starts at Monday (index 0) and ends on Sunday (index 6).
      // Sunday here is i = 0, Monday is i = 1, Saturday is i = 6.
      const schedIdx = i === 0 ? 6 : i - 1;
      const scheduleLabel = activePlan?.schedule?.[schedIdx] || 'Rest';
      
      return {
        day: dayLabels[i],
        dateNum: d.getDate(),
        dateStr,
        active: dateStr === selectedDate,
        isToday: dateStr === getToday(),
        workout: scheduleLabel,
        hasWorkout,
        hasMeals
      };
    });
  }, [selectedDate, workoutHistory, mealsByDate, activePlan]);

  const changeWeek = (offset) => {
    const parts = selectedDate.split('-');
    let d;
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      d = new Date();
    }
    d.setDate(d.getDate() + offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateNum = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${dateNum}`);
  };

  const goToPrevWeek = () => changeWeek(-7);
  const goToNextWeek = () => changeWeek(7);
  const goToToday = () => setSelectedDate(getToday());

  const handleCreateNew = () => {
    setEditingPlan({
      id: null,
      name: '',
      shortName: '',
      schedule: ['Rest', 'Rest', 'Rest', 'Rest', 'Rest', 'Rest', 'Rest'],
      days: [
        { name: 'Workout Day A', shortName: 'Day A', exercises: [] }
      ]
    });
  };

  const handleEditPlan = (planId) => {
    const plan = allPlans.find(p => p.id === planId);
    if (plan) {
      setEditingPlan(JSON.parse(JSON.stringify(plan)));
    }
  };

  const todayDayData = todayWorkout;

  // If active session, show that instead
  if (activeSession) {
    return <ActiveSession session={activeSession} onToggleSet={toggleSetComplete} onUpdateSet={updateSetData}
      onAddSet={addSetToExercise} onRemoveSet={removeSetFromExercise} onFinish={finishWorkout} onCancel={cancelWorkout}
      restTimer={restTimer} onStartRest={startRestTimer} onCancelRest={cancelRestTimer} />;
  }

  // Show skeleton screen if data is loading and cache is completely empty
  const showSkeleton = dbLoading && workoutHistory.length === 0 && Object.keys(mealsByDate).length === 0;

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
        <div className="flex-row justify-between align-center" style={{ marginBottom: 16 }}>
          <h2 className="text-h2" style={{ fontSize: 18 }}>Weekly Schedule</h2>
          <div className="flex-row gap-xs">
            <button className="btn-icon" onClick={goToPrevWeek} style={{ width: 28, height: 28, borderRadius: 6 }}><ChevronLeft size={16} /></button>
            <button className="btn btn-secondary btn-sm" onClick={goToToday} style={{ padding: '2px 10px', fontSize: 11, height: 28, borderRadius: 6 }}>Today</button>
            <button className="btn-icon" onClick={goToNextWeek} style={{ width: 28, height: 28, borderRadius: 6 }}><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex-row" style={{ overflowX: 'auto', gap: 12, paddingBottom: 8, margin: '0 -24px', padding: '0 24px 8px' }}>
          {weekDays.map((item, i) => (
            <button key={i} className={`card ${item.active ? 'card-elevated' : ''}`}
              onClick={() => setSelectedDate(item.dateStr)}
              style={{
                minWidth: 64, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: item.active ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                background: item.active ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                opacity: (!item.active && item.workout === 'Rest') ? 0.5 : 1,
                cursor: 'pointer', outline: 'none', flexShrink: 0
              }}>
              <span className="text-caption" style={{ color: item.active ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: 11 }}>{item.day}</span>
              <span className="text-h2" style={{ margin: '6px 0', fontSize: 20, color: item.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.dateNum}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: item.active ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>{item.workout}</span>
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
          onDuplicate={duplicatePlan} onDelete={deleteCustomPlan}
          onEdit={(planId) => { handleEditPlan(planId); setShowPlanPicker(false); }}
          onCreateNew={() => { handleCreateNew(); setShowPlanPicker(false); }}
          onClose={() => setShowPlanPicker(false)} />
      )}
      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onSave={async (savedPlan) => {
            if (savedPlan.id) {
              await editCustomPlan(savedPlan.id, savedPlan);
            } else {
              const newId = await addCustomPlan(savedPlan);
              setActivePlan(newId);
            }
            setEditingPlan(null);
          }}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}

/* ── Edit Plan Modal ── */
function EditPlanModal({ plan, onSave, onClose }) {
  const [editedPlan, setEditedPlan] = useState(plan);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingExerciseToDayIdx, setAddingExerciseToDayIdx] = useState(null);

  const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSave = () => {
    if (!editedPlan.name.trim()) {
      alert('Please enter a split name.');
      return;
    }
    const planToSave = !editedPlan.shortName.trim()
      ? { ...editedPlan, shortName: editedPlan.name.substring(0, 3).toUpperCase() }
      : editedPlan;
    onSave(planToSave);
  };

  const handleAddDay = () => {
    const defaultShort = `Day ${String.fromCharCode(65 + editedPlan.days.length)}`;
    setEditedPlan({
      ...editedPlan,
      days: [
        ...editedPlan.days,
        { name: `Workout ${defaultShort}`, shortName: defaultShort, exercises: [] }
      ]
    });
  };

  const handleDeleteDay = (dayIdx) => {
    const dayToDelete = editedPlan.days[dayIdx];
    const updatedDays = editedPlan.days.filter((_, i) => i !== dayIdx);
    const updatedSchedule = editedPlan.schedule.map(s => s === dayToDelete.shortName ? 'Rest' : s);
    setEditedPlan({ ...editedPlan, days: updatedDays, schedule: updatedSchedule });
  };

  const handleUpdateDayShortName = (dayIdx, newShortName) => {
    const oldShortName = editedPlan.days[dayIdx].shortName;
    const updatedDays = editedPlan.days.map((d, i) => i === dayIdx ? { ...d, shortName: newShortName } : d);
    const updatedSchedule = editedPlan.schedule.map(s => s === oldShortName ? newShortName : s);
    setEditedPlan({ ...editedPlan, days: updatedDays, schedule: updatedSchedule });
  };

  const handleUpdateDayName = (dayIdx, newName) => {
    const updatedDays = editedPlan.days.map((d, i) => i === dayIdx ? { ...d, name: newName } : d);
    setEditedPlan({ ...editedPlan, days: updatedDays });
  };

  const handleUpdateExercise = (dayIdx, exIdx, field, value) => {
    const updatedDays = [...editedPlan.days];
    updatedDays[dayIdx].exercises[exIdx] = {
      ...updatedDays[dayIdx].exercises[exIdx],
      [field]: value
    };
    setEditedPlan({ ...editedPlan, days: updatedDays });
  };

  const handleDeleteExercise = (dayIdx, exIdx) => {
    const updatedDays = [...editedPlan.days];
    updatedDays[dayIdx].exercises = updatedDays[dayIdx].exercises.filter((_, i) => i !== exIdx);
    setEditedPlan({ ...editedPlan, days: updatedDays });
  };

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return EXERCISE_DB;
    return EXERCISE_DB.filter(ex => 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleAddExercise = (dayIdx, exerciseId) => {
    const updatedDays = [...editedPlan.days];
    updatedDays[dayIdx].exercises.push({
      exerciseId,
      sets: 3,
      reps: '10',
      weight: 40
    });
    setEditedPlan({ ...editedPlan, days: updatedDays });
    setAddingExerciseToDayIdx(null);
    setSearchQuery('');
  };

  const handleAddCustomExercise = (dayIdx) => {
    if (!searchQuery.trim()) return;
    const updatedDays = [...editedPlan.days];
    updatedDays[dayIdx].exercises.push({
      exerciseId: searchQuery.trim(),
      sets: 3,
      reps: '10',
      weight: 40
    });
    setEditedPlan({ ...editedPlan, days: updatedDays });
    setAddingExerciseToDayIdx(null);
    setSearchQuery('');
  };

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 200 }}>
      <div className="modal-sheet modal-sheet-full" style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-surface)' }}>
          <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }} onClick={onClose}>Cancel</button>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{plan.id ? 'Edit Workout Split' : 'Create Custom Split'}</span>
          <button className="btn btn-primary btn-sm" style={{ padding: '6px 16px' }} onClick={handleSave}>Save</button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          
          {/* Plan Settings */}
          <section className="mb-section">
            <h3 className="text-h3" style={{ fontSize: 16, marginBottom: 12 }}>Split Profile</h3>
            <div className="flex-col gap-sm">
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Split Name</label>
                <input type="text" className="input" placeholder="e.g. My Arnold Split" 
                  value={editedPlan.name} onChange={e => setEditedPlan({ ...editedPlan, name: e.target.value })} />
              </div>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Abbreviation (max 6 letters)</label>
                <input type="text" className="input" placeholder="e.g. ARN" maxLength={6}
                  value={editedPlan.shortName} onChange={e => setEditedPlan({ ...editedPlan, shortName: e.target.value.toUpperCase() })} />
              </div>
            </div>
          </section>

          {/* Schedule Configuration */}
          <section className="mb-section">
            <h3 className="text-h3" style={{ fontSize: 16, marginBottom: 12 }}>Weekly Schedule</h3>
            <div className="card flex-col gap-sm" style={{ padding: 16 }}>
              {weekdayNames.map((name, idx) => (
                <div key={name} className="flex-row justify-between align-center" style={{ padding: '4px 0' }}>
                  <span className="text-body" style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
                  <select className="input" style={{ width: 160, padding: '6px 10px', borderRadius: 8, fontSize: 14, background: 'var(--input-bg)' }}
                    value={editedPlan.schedule[idx] || 'Rest'}
                    onChange={e => {
                      const updatedSchedule = [...editedPlan.schedule];
                      updatedSchedule[idx] = e.target.value;
                      setEditedPlan({ ...editedPlan, schedule: updatedSchedule });
                    }}
                  >
                    <option value="Rest">Rest Day</option>
                    {editedPlan.days.map(d => (
                      <option key={d.shortName} value={d.shortName}>{d.name} ({d.shortName})</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* Workout Days List */}
          <section className="mb-section">
            <h3 className="text-h3" style={{ fontSize: 16, marginBottom: 12 }}>Workout Days & Exercises</h3>
            <div className="flex-col gap-md">
              {editedPlan.days.map((day, dayIdx) => (
                <div key={dayIdx} className="card" style={{ padding: 18, border: '1px solid var(--border-subtle)' }}>
                  
                  {/* Day header */}
                  <div className="flex-row justify-between align-center" style={{ marginBottom: 14, gap: 10 }}>
                    <div className="flex-col flex-1">
                      <input type="text" className="input" style={{ padding: '6px 10px', fontSize: 15, fontWeight: 700, border: 'none', background: 'transparent', borderBottom: '1px dashed var(--border-strong)', borderRadius: 0 }}
                        placeholder="Day Title" value={day.name} onChange={e => handleUpdateDayName(dayIdx, e.target.value)} />
                    </div>
                    <div style={{ width: 70 }}>
                      <input type="text" className="input" style={{ padding: '6px 8px', fontSize: 12, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}
                        placeholder="Abbr" value={day.shortName} onChange={e => handleUpdateDayShortName(dayIdx, e.target.value)} />
                    </div>
                    <button className="btn-icon text-red" style={{ width: 32, height: 32, backgroundColor: 'transparent' }}
                      onClick={() => handleDeleteDay(dayIdx)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Exercises list */}
                  <div className="flex-col" style={{ marginBottom: 12 }}>
                    {day.exercises.length === 0 ? (
                      <span className="text-caption" style={{ textAlign: 'center', padding: '12px 0', display: 'block' }}>No exercises added yet</span>
                    ) : (
                      <>
                        {/* Header Row */}
                        <div className="flex-row" style={{ paddingBottom: 6, borderBottom: '1px solid var(--divider)' }}>
                          <span className="text-caption" style={{ flex: 1, fontSize: 10 }}>Exercise</span>
                          <span className="text-caption" style={{ width: 44, textAlign: 'center', fontSize: 10 }}>Sets</span>
                          <span className="text-caption" style={{ width: 50, textAlign: 'center', fontSize: 10 }}>Reps</span>
                          <span className="text-caption" style={{ width: 50, textAlign: 'center', fontSize: 10 }}>KG</span>
                          <span className="text-caption" style={{ width: 28, fontSize: 10 }} />
                        </div>
                        {/* Exercise Rows */}
                        {day.exercises.map((ex, exIdx) => {
                          const info = getExercise(ex.exerciseId);
                          return (
                            <div key={exIdx} className="flex-row align-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--divider)', gap: 6 }}>
                              <span className="text-body" style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                                {info?.name || ex.exerciseId}
                              </span>
                              
                              <input type="number" className="set-input" style={{ width: 44, padding: '4px 6px', fontSize: 12 }}
                                value={ex.sets} onChange={e => handleUpdateExercise(dayIdx, exIdx, 'sets', parseInt(e.target.value) || 0)} />
                              
                              <input type="text" className="set-input" style={{ width: 50, padding: '4px 6px', fontSize: 12 }}
                                value={ex.reps} onChange={e => handleUpdateExercise(dayIdx, exIdx, 'reps', e.target.value)} />
                              
                              <input type="number" className="set-input" style={{ width: 50, padding: '4px 6px', fontSize: 12 }}
                                value={ex.weight} onChange={e => handleUpdateExercise(dayIdx, exIdx, 'weight', parseFloat(e.target.value) || 0)} />
                              
                              <button className="btn-icon" style={{ width: 24, height: 24, backgroundColor: 'transparent', color: 'var(--text-tertiary)' }}
                                onClick={() => handleDeleteExercise(dayIdx, exIdx)}>
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Add Exercise UI */}
                  {addingExerciseToDayIdx === dayIdx ? (
                    <div className="card flex-col gap-sm" style={{ padding: 12, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', marginTop: 8 }}>
                      <div className="flex-row gap-xs">
                        <input type="text" className="input" style={{ padding: '8px 12px', fontSize: 14 }}
                          placeholder="Search or enter custom..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <button className="btn btn-secondary btn-sm" style={{ padding: '0 12px', height: 38 }} onClick={() => { setAddingExerciseToDayIdx(null); setSearchQuery(''); }}>Cancel</button>
                      </div>
                      
                      <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                        {filteredExercises.slice(0, 15).map(ex => (
                          <button key={ex.id} className="search-item" style={{ borderBottom: '1px solid var(--divider)', padding: '10px 8px', width: '100%', textAlign: 'left', background: 'none', color: 'var(--text-primary)', outline: 'none' }}
                            onClick={() => handleAddExercise(dayIdx, ex.id)}>
                            <div className="flex-col">
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</span>
                              <span className="text-caption" style={{ fontSize: 10 }}>{ex.muscle} • {ex.equipment}</span>
                            </div>
                            <Plus size={14} className="text-secondary" />
                          </button>
                        ))}
                        {searchQuery.trim() && !EXERCISE_DB.some(e => e.name.toLowerCase() === searchQuery.toLowerCase()) && (
                          <button className="btn btn-secondary btn-sm" style={{ marginTop: 6, justifyContent: 'flex-start', padding: 10, borderRadius: 8, fontSize: 13 }}
                            onClick={() => handleAddCustomExercise(dayIdx)}>
                            ➕ Add Custom Exercise "{searchQuery}"
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%', gap: 6, borderRadius: 10, padding: 10, fontSize: 13 }}
                      onClick={() => setAddingExerciseToDayIdx(dayIdx)}>
                      <Plus size={14} /> Add Exercise
                    </button>
                  )}

                </div>
              ))}
              
              <button className="btn btn-secondary" style={{ width: '100%', gap: 8, borderStyle: 'dashed', background: 'transparent' }}
                onClick={handleAddDay}>
                <Plus size={16} /> Add Workout Day
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>,
    document.body
  );
}
