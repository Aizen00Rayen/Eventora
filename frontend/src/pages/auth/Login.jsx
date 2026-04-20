import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const schema = z.object({
  username: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

const ROLE_PATHS = { admin: '/admin', client: '/client', organizer: '/organizer', participant: '/my-tickets' };

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.username, data.password);
      toast.success(`Welcome back, ${user.first_name || user.username}!`);
      navigate(ROLE_PATHS[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-purple-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6">E</div>
          <h1 className="text-4xl font-extrabold mb-4">Welcome back</h1>
          <p className="text-xl text-white/70 max-w-sm">Sign in to manage your events and connect with your audience.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-light dark:bg-bg-dark">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">E</div>
            <span className="font-bold text-xl">Eventora</span>
          </div>

          <h2 className="text-3xl font-bold mb-2">Sign In</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to access your dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email address</label>
              <input {...register('username')} type="email" className="input" placeholder="you@example.com" autoComplete="email" />
              {errors.username && <p className="text-danger text-sm mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-danger text-sm mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-primary/5 rounded-card text-sm">
            <p className="font-semibold text-primary mb-2">Demo accounts</p>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <p>Admin: <code>admin@eventora.com</code> / <code>admin123</code></p>
              <p>Client: <code>client@eventora.com</code> / <code>client123</code></p>
              <p>Organizer: <code>organizer@eventora.com</code> / <code>organizer123</code></p>
              <p>Participant: <code>participant@eventora.com</code> / <code>participant123</code></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
