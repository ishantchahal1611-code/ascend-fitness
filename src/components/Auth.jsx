import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Flame } from 'lucide-react';
import '../index.css';

export default function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email first, then tap Forgot password.');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (resetError) throw resetError;
      setInfo('Password reset link sent. Check your email.');
    } catch (err) {
      setError(err.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add your keys to a .env file and restart.');
      setLoading(false);
      return;
    }
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
          setError("Signup successful! You can now log in using your credentials.");
          setIsSignUp(false);
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "An error occurred during Google sign in");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      padding: '24px', 
      background: 'radial-gradient(circle at 50% 0%, #1c1917 0%, var(--bg-amoled) 70%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Halos */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(50, 215, 75, 0.08) 0%, rgba(0,0,0,0) 70%)',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(10, 132, 255, 0.05) 0%, rgba(0,0,0,0) 70%)',
        bottom: '-10%',
        right: '-10%',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="auth-card fade-in" style={{ 
        background: 'rgba(18, 18, 18, 0.55)', 
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        padding: '36px 30px', 
        borderRadius: 'var(--radius-lg, 24px)', 
        width: '100%', 
        maxWidth: '400px', 
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand Logo Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-green) 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(50, 215, 75, 0.3)',
            marginBottom: '16px'
          }}>
            <Flame size={32} color="#ffffff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            letterSpacing: '-1px',
            textAlign: 'center',
            marginBottom: '6px'
          }}>
            {isSignUp ? 'Create Account' : 'Welcome to Ascend'}
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            {isSignUp ? 'Join the premium fitness tracker' : 'Sign in to sync your fitness journey'}
          </p>
        </div>

        {info && (
          <div style={{
            background: 'rgba(50, 215, 75, 0.08)',
            border: '1px solid rgba(50, 215, 75, 0.15)',
            color: 'var(--accent-green)',
            padding: '14px',
            borderRadius: '14px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {info}
          </div>
        )}

        {error && (
          <div style={{ 
            background: 'rgba(255, 69, 58, 0.08)', 
            border: '1px solid rgba(255, 69, 58, 0.15)',
            color: 'var(--accent-red, #ff453a)', 
            padding: '14px', 
            borderRadius: '14px', 
            marginBottom: '20px', 
            fontSize: '14px', 
            textAlign: 'center',
            fontWeight: 500,
            animation: 'fadeIn 0.3s ease'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: 'var(--text-secondary)',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              paddingLeft: '4px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: '14px', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                background: 'rgba(255, 255, 255, 0.03)', 
                color: 'var(--text-primary)', 
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.25s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-green)';
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '4px' }}>
              <label style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
              }}>
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: '14px', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                background: 'rgba(255, 255, 255, 0.03)', 
                color: 'var(--text-primary)', 
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.25s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-green)';
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, var(--accent-green) 0%, #059669 100%)', 
              color: '#ffffff', 
              fontWeight: 700, 
              fontSize: '16px', 
              border: 'none', 
              cursor: 'pointer', 
              marginTop: '10px', 
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 8px 24px rgba(50, 215, 75, 0.25)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? 'Securing Portal...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 20px 0', color: 'var(--text-tertiary)' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />
          <span style={{ padding: '0 12px', fontSize: '13px', opacity: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />
        </div>

        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          disabled={loading} 
          style={{ 
            width: '100%', 
            padding: '14px', 
            borderRadius: '14px', 
            background: 'rgba(255, 255, 255, 0.02)', 
            color: 'var(--text-primary)', 
            fontWeight: 600, 
            fontSize: '15px', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-green)', 
              fontSize: '14px', 
              fontWeight: 600, 
              cursor: 'pointer',
              opacity: 0.9,
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
