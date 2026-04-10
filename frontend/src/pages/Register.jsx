import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Cloud, Lock, Mail, Sparkles, User } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr,0.95fr]">
        <div className="hidden lg:block">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <span className="pill-chip mt-8 inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100/80">
            <Sparkles className="h-4 w-4" />
            Build your smart workspace
          </span>

          <h1 className="mt-6 max-w-xl text-5xl leading-tight font-semibold text-white">
            Start organizing your files with less effort.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Create an account to upload once, search faster, and let AI help keep your library readable.
          </p>

          <div className="mt-10 space-y-4 max-w-xl">
            <div className="surface-panel-soft p-5">
              <p className="text-sm font-medium text-white">Smart tagging from day one</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Images and documents become easier to find with categories and extracted text.
              </p>
            </div>
            <div className="surface-panel-soft p-5">
              <p className="text-sm font-medium text-white">A cleaner dashboard</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Preview files, filter by category, and keep uploads under control from one screen.
              </p>
            </div>
          </div>
        </div>

        <div className="surface-panel mx-auto w-full max-w-lg p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
              <Cloud className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">CloudDrive</p>
              <h2 className="mt-1 text-3xl font-semibold text-white">Create account</h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Set up your workspace to store, search, and manage files with a calmer interface.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </label>
              <div className="surface-panel-soft relative rounded-2xl">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-transparent py-3 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/30"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-200">
                Username
              </label>
              <div className="surface-panel-soft relative rounded-2xl">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl bg-transparent py-3 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/30"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="surface-panel-soft relative rounded-2xl">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-transparent py-3 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/30"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-200">
                Confirm password
              </label>
              <div className="surface-panel-soft relative rounded-2xl">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl bg-transparent py-3 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/30"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_35px_rgba(56,189,248,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-cyan-100 transition hover:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
