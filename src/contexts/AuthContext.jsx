import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

async function safeJson(res, fallbackMsg = 'Server error') {
  const text = await res.text();
  if (!text) throw new Error('No response from server — is the backend running?');
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(fallbackMsg);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); else localStorage.removeItem('token'); })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await safeJson(res, 'Login failed');
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password, role = 'passenger') {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await safeJson(res, 'Registration failed');
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
