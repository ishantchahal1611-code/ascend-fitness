import { Home, Dumbbell, Utensils, Activity, TrendingUp, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'workout', icon: Dumbbell, label: 'Train' },
    { id: 'calories', icon: Utensils, label: 'Diet' },
    { id: 'activity', icon: Activity, label: 'Move' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 12px 20px', zIndex: 50 }}>
      <nav className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '10px 8px',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                padding: '6px 4px',
                minWidth: 0,
                flex: 1
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '9px', fontWeight: isActive ? 600 : 500, opacity: isActive ? 1 : 0.7, whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
