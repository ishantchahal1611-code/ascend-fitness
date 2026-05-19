import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Moon, Sun, Monitor, User, Bell, Ruler, Target, Droplets, Footprints, Flame, ChevronRight, Scale } from 'lucide-react';
import { useApp } from '../store/AppContext';

function Toggle({ value, onChange }) {
  return (
    <button className={`toggle-track ${value ? 'active' : ''}`} onClick={() => onChange(!value)}>
      <div className="toggle-thumb" />
    </button>
  );
}

function SettingRow({ icon: Icon, iconColor, label, children, sub }) {
  return (
    <div className="settings-row">
      <div className="flex-row gap-md" style={{ flex: 1 }}>
        {Icon && (
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: iconColor || 'var(--bg-surface-elevated)' }}>
            <Icon size={18} style={{ color: iconColor ? 'white' : 'var(--text-secondary)' }} />
          </div>
        )}
        <div className="flex-col" style={{ flex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
          {sub && <span className="text-label" style={{ fontSize: 13 }}>{sub}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

function EditGoalModal({ label, value, unit, onSave, onClose, step = 1, max }) {
  const [val, setVal] = useState(value);
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>{label}</span>
          <button className="btn btn-sm btn-primary" onClick={() => { onSave(parseFloat(val)); onClose(); }}>Save</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="btn-icon" style={{ width: 48, height: 48, fontSize: 24 }} onClick={() => setVal(v => Math.max(0, v - step))}>−</button>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 48, fontWeight: 700 }}>{val}</span>
              <span className="text-label" style={{ display: 'block', marginTop: 4 }}>{unit}</span>
            </div>
            <button className="btn-icon" style={{ width: 48, height: 48, fontSize: 24 }} onClick={() => setVal(v => v + step)}>+</button>
          </div>
          <input type="range" min={step} max={max || (step > 1 ? 20000 : 10)} step={step} value={val} onChange={e => setVal(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-blue)' }} />
        </div>
      </div>
    </div>,
    document.body
  );
}

function ProfileModal({ profile, currentWeight, weightUnit, onSaveProfile, onSaveWeight, onClose }) {
  const [name, setName] = useState(profile.name || '');
  const [age, setAge] = useState(profile.age || '');
  const [height, setHeight] = useState(profile.height || '');
  const [gender, setGender] = useState(profile.gender || 'Other');
  const [weight, setWeight] = useState(currentWeight || '');

  const handleSave = () => {
    onSaveProfile({ name, age: parseInt(age) || 0, height: parseFloat(height) || 0, gender });
    if (parseFloat(weight) !== currentWeight && parseFloat(weight) > 0) {
      onSaveWeight(parseFloat(weight));
    }
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>Edit Profile</span>
          <button className="btn btn-sm btn-primary" onClick={handleSave}>Save</button>
        </div>
        <div className="modal-body flex-col gap-md">
          <div className="flex-col gap-sm">
            <label className="text-label">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="flex-row gap-md">
            <div className="flex-col gap-sm flex-1">
              <label className="text-label">Age</label>
              <input className="input" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
            </div>
            <div className="flex-col gap-sm flex-1">
              <label className="text-label">Gender</label>
              <select className="input" value={gender} onChange={e => setGender(e.target.value)} style={{ padding: '12px 16px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--input-border)', borderRadius: 'var(--radius-sm)' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex-row gap-md">
            <div className="flex-col gap-sm flex-1">
              <label className="text-label">Height (cm)</label>
              <input className="input" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Height in cm" />
            </div>
            <div className="flex-col gap-sm flex-1">
              <label className="text-label">Weight ({weightUnit})</label>
              <input className="input" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder={`Weight in ${weightUnit}`} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Settings() {
  const { theme, setTheme, units, setUnits, goals, setGoals, profile, setProfile, notifications, setNotifications, currentWeight, addBodyweight } = useApp();
  const [editGoal, setEditGoal] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);

  const themeOptions = [
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="p-screen fade-in">
      <header style={{ marginTop: 20, marginBottom: 32 }}>
        <h1 className="text-h1">Settings</h1>
      </header>

      {/* Profile */}
      <section className="mb-section">
        <button className="card flex-row gap-md" onClick={() => setShowProfile(true)} style={{ width: '100%', cursor: 'pointer', padding: 20, textAlign: 'left' }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 24, fontWeight: 700, backgroundColor: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
            {profile.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-col flex-1">
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{profile.name || 'User'}</span>
            <span className="text-label">Age: {profile.age || '--'} • Height: {profile.height || '--'} cm • {currentWeight} {units.weight}</span>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </section>

      {/* Theme */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Appearance</span>
        <div className="card" style={{ padding: 6 }}>
          <div className="segmented">
            {themeOptions.map(t => (
              <button key={t.id} className={`segmented-btn ${theme === t.id ? 'active' : ''}`} onClick={() => setTheme(t.id)}>
                <t.icon size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Units */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Units</span>
        <div className="card" style={{ padding: '4px 20px' }}>
          <SettingRow icon={Scale} iconColor="#007aff" label="Weight">
            <div className="segmented" style={{ width: 140 }}>
              <button className={`segmented-btn ${units.weight === 'kg' ? 'active' : ''}`} onClick={() => setUnits({ ...units, weight: 'kg' })}>KG</button>
              <button className={`segmented-btn ${units.weight === 'lb' ? 'active' : ''}`} onClick={() => setUnits({ ...units, weight: 'lb' })}>LB</button>
            </div>
          </SettingRow>
          <SettingRow icon={Ruler} iconColor="#ff9f0a" label="Distance">
            <div className="segmented" style={{ width: 140 }}>
              <button className={`segmented-btn ${units.distance === 'km' ? 'active' : ''}`} onClick={() => setUnits({ ...units, distance: 'km' })}>KM</button>
              <button className={`segmented-btn ${units.distance === 'mi' ? 'active' : ''}`} onClick={() => setUnits({ ...units, distance: 'mi' })}>Miles</button>
            </div>
          </SettingRow>
        </div>
      </section>

      {/* Goals */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Daily Goals</span>
        <div className="card" style={{ padding: '4px 20px' }}>
          <SettingRow icon={Flame} iconColor="#ff453a" label="Calories" sub={`${goals.calories} kcal`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'calories', label: 'Daily Calorie Goal', value: goals.calories, unit: 'kcal', step: 50, max: 10000 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Target} iconColor="#0a84ff" label="Protein" sub={`${goals.protein}g`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'protein', label: 'Daily Protein Goal', value: goals.protein, unit: 'grams', step: 5, max: 300 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Target} iconColor="#ff9f0a" label="Carbs" sub={`${goals.carbs}g`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'carbs', label: 'Daily Carbs Goal', value: goals.carbs, unit: 'grams', step: 5, max: 500 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Target} iconColor="#ffd60a" label="Fats" sub={`${goals.fats}g`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'fats', label: 'Daily Fats Goal', value: goals.fats, unit: 'grams', step: 5, max: 200 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Droplets} iconColor="#007aff" label="Water" sub={`${goals.water}L`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'water', label: 'Daily Water Goal', value: goals.water, unit: 'liters', step: 0.5, max: 10 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Footprints} iconColor="#32d74b" label="Steps" sub={goals.steps.toLocaleString()}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'steps', label: 'Daily Step Goal', value: goals.steps, unit: 'steps', step: 500, max: 50000 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Notifications</span>
        <div className="card" style={{ padding: '4px 20px' }}>
          <SettingRow icon={Bell} iconColor="#ff9f0a" label="Workout Reminders">
            <Toggle value={notifications.workout} onChange={v => setNotifications({ ...notifications, workout: v })} />
          </SettingRow>
          <SettingRow label="Meal Reminders">
            <Toggle value={notifications.meals} onChange={v => setNotifications({ ...notifications, meals: v })} />
          </SettingRow>
          <SettingRow label="Water Reminders">
            <Toggle value={notifications.water} onChange={v => setNotifications({ ...notifications, water: v })} />
          </SettingRow>
          <SettingRow label="Step Reminders">
            <Toggle value={notifications.steps} onChange={v => setNotifications({ ...notifications, steps: v })} />
          </SettingRow>
        </div>
      </section>

      {/* Log Bodyweight */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Body</span>
        <div className="card" style={{ padding: '4px 20px' }}>
          <SettingRow icon={Scale} iconColor="#32d74b" label="Log Bodyweight" sub={`Current: ${currentWeight} ${units.weight}`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setShowWeightModal(true)}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
        </div>
      </section>

      <p className="text-label" style={{ textAlign: 'center', marginTop: 16, fontSize: 13, opacity: 0.5 }}>Ascend v1.0 — Built with ❤️</p>

      {/* Modals */}
      {editGoal && (
        <EditGoalModal
          label={editGoal.label}
          value={editGoal.value}
          unit={editGoal.unit}
          step={editGoal.step}
          max={editGoal.max}
          onSave={v => setGoals({ ...goals, [editGoal.key]: v })}
          onClose={() => setEditGoal(null)}
        />
      )}
      {showProfile && (
        <ProfileModal 
          profile={profile} 
          currentWeight={currentWeight}
          weightUnit={units.weight}
          onSaveProfile={setProfile} 
          onSaveWeight={addBodyweight}
          onClose={() => setShowProfile(false)} 
        />
      )}
      {showWeightModal && (
        <EditGoalModal label="Log Bodyweight" value={currentWeight} unit={units.weight} step={0.1}
          onSave={v => addBodyweight(v)} onClose={() => setShowWeightModal(false)} />
      )}
    </div>
  );
}
