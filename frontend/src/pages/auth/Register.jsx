import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const schema = z.object({
  username:   z.string().min(3, 'At least 3 characters'),
  email:      z.string().email('Valid email required'),
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  password:   z.string().min(8, 'At least 8 characters'),
  password2:  z.string(),
  role:       z.enum(['client', 'participant']),
  phone:      z.string().optional(),
}).refine((d) => d.password === d.password2, { message: 'Passwords do not match', path: ['password2'] });

const ROLES = [
  { value: 'participant', label: '🎟️ Participant', desc: 'Attend events' },
  { value: 'client',      label: '🎪 Client',      desc: 'Create & manage events' },
];

export default function Register() {
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('participant');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'participant' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-accent items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6">E</div>
          <h1 className="text-4xl font-extrabold mb-4">Join Eventora</h1>
          <p className="text-xl text-white/70 max-w-sm">Create your account and start organizing or attending amazing events.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-light dark:bg-bg-dark overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-8"
        >
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-gray-500 mb-6">Join thousands of event organizers and participants</p>

          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handleRoleSelect(r.value)}
                className={`flex-1 py-3 px-4 rounded-input border-2 text-sm font-semibold transition-all ${
                  selectedRole === r.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary/50'
                }`}
              >
                <div>{r.label}</div>
                <div className="text-xs font-normal mt-0.5 opacity-70">{r.desc}</div>
              </button>
            ))}
          </div>
          <input type="hidden" {...register('role')} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">First name</label>
                <input {...register('first_name')} className="input" placeholder="Alice" />
                {errors.first_name && <p className="text-danger text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last name</label>
                <input {...register('last_name')} className="input" placeholder="Martin" />
                {errors.last_name && <p className="text-danger text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Username</label>
              <input {...register('username')} className="input" placeholder="alice_martin" />
              {errors.username && <p className="text-danger text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="alice@example.com" />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
              <input {...register('phone')} className="input" placeholder="+33 6 12 34 56 78" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm password</label>
              <input {...register('password2')} type="password" className="input" placeholder="••••••••" />
              {errors.password2 && <p className="text-danger text-xs mt-1">{errors.password2.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
