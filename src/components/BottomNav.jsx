import { Home, Dumbbell, Utensils, Activity, Trophy } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'calories', icon: Utensils, label: 'Diet' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'progress', icon: Trophy, label: 'Progress' },
  ];

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 16px 24px', zIndex: 50 }}>
      <nav className="glass-panel" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-around',
        padding: '12px 24px',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                padding: '8px'
              }}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500, opacity: isActive ? 1 : 0.7 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
