import { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../index.css';

export default function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data?.session) {
          onLogin(data.session);
        } else {
          setError("Check your email for the confirmation link!");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data?.session) {
          onLogin(data.session);
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="auth-card" style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '28px', color: 'var(--text-primary)' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        {error && <div style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--system-red)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '16px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '16px' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--accent-primary)', color: 'white', fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
