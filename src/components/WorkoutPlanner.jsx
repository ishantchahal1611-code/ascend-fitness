import { Calendar, ChevronRight, Play, MoreHorizontal, Dumbbell, History, Repeat } from 'lucide-react';

export default function WorkoutPlanner() {
  const weekDays = [
    { day: 'Mon', date: '18', active: true, workout: 'Push' },
    { day: 'Tue', date: '19', active: false, workout: 'Pull' },
    { day: 'Wed', date: '20', active: false, workout: 'Legs' },
    { day: 'Thu', date: '21', active: false, workout: 'Rest' },
    { day: 'Fri', date: '22', active: false, workout: 'Upper' },
    { day: 'Sat', date: '23', active: false, workout: 'Lower' },
  ];

  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between mb-section" style={{ marginTop: '20px' }}>
        <h1 className="text-h1">Workout</h1>
        <div className="btn-icon">
          <History size={20} />
        </div>
      </header>

      {/* Weekly Schedule */}
      <section className="mb-section">
        <div className="flex-row justify-between align-center" style={{ marginBottom: '16px' }}>
          <h2 className="text-h2" style={{ fontSize: '18px' }}>This Week</h2>
          <div className="flex-row gap-sm text-tertiary" style={{ fontSize: '14px', fontWeight: 500 }}>
            <Repeat size={14} /> Repeating PPL
          </div>
        </div>
        
        <div className="flex-row" style={{ overflowX: 'auto', gap: '12px', paddingBottom: '8px', margin: '0 -24px', padding: '0 24px 8px' }}>
          {weekDays.map((item, i) => (
            <div key={i} className={`card ${item.active ? 'card-elevated' : ''}`} style={{ 
              minWidth: '72px', 
              padding: '16px 12px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: item.active ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
              opacity: (!item.active && item.workout === 'Rest') ? 0.5 : 1
            }}>
              <span className="text-caption" style={{ color: item.active ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{item.day}</span>
              <span className="text-h2" style={{ margin: '8px 0', color: item.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.date}</span>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: item.active ? 'var(--text-primary)' : (item.workout !== 'Rest' ? 'var(--text-tertiary)' : 'transparent') }} />
            </div>
          ))}
        </div>
      </section>

      {/* Today's Routine */}
      <section className="mb-section">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)' }}>
            <span className="text-caption text-orange">Today's Routine</span>
            <h2 className="text-h2" style={{ marginTop: '8px', marginBottom: '16px' }}>Push (Chest, Shoulders & Triceps)</h2>
            <div className="flex-row gap-md text-label">
              <span className="flex-row gap-sm"><Dumbbell size={16} /> 6 Exercises</span>
              <span className="flex-row gap-sm"><Calendar size={16} /> 45-60 Min</span>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
              <Play size={18} fill="var(--bg-amoled)" /> Start Workout
            </button>
          </div>
        </div>
      </section>

      {/* Exercises List */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ fontSize: '18px', marginBottom: '16px' }}>Exercises</h2>
        <div className="flex-col gap-sm">
          {[
            { name: 'Barbell Bench Press', sets: '4 sets x 8-10 reps', target: 'Chest' },
            { name: 'Incline Dumbbell Press', sets: '3 sets x 10-12 reps', target: 'Upper Chest' },
            { name: 'Overhead Press', sets: '3 sets x 8-10 reps', target: 'Shoulders' },
            { name: 'Lateral Raises', sets: '4 sets x 15 reps', target: 'Shoulders' },
            { name: 'Triceps Pushdown', sets: '3 sets x 12-15 reps', target: 'Triceps' }
          ].map((ex, i) => (
            <div key={i} className="card flex-row justify-between align-center" style={{ padding: '16px' }}>
              <div className="flex-col">
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{ex.name}</span>
                <div className="flex-row gap-sm">
                  <span className="text-label">{ex.sets}</span>
                  <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>• {ex.target}</span>
                </div>
              </div>
              <MoreHorizontal size={20} className="text-tertiary" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
