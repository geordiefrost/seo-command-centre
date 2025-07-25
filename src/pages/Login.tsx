import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Button, Input, Card } from '../components/common';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setAuthenticated } = useAppStore();
  
  const [formData, setFormData] = useState({
    email: 'admin@bangdigital.com.au',
    password: 'password123',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Fallback to mock authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: 'user-1',
          email: formData.email,
          name: formData.email.includes('admin') ? 'Admin User' : 'SEO Specialist',
          role: formData.email.includes('admin') ? UserRole.ADMIN : UserRole.EXECUTIVE,
          avatar: undefined,
          preferences: {
            theme: 'light' as const,
            notifications: {
              email: true,
              slack: true,
              browser: true,
            },
          },
        };
        
        setUser(mockUser);
        setAuthenticated(true);
        navigate('/');
        return;
      }
      
      // Real Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        // If user doesn't exist, try to sign them up
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          if (signUpData.user) {
            // Create user profile
            const { error: profileError } = await supabase
              .from('users')
              .insert([
                {
                  id: signUpData.user.id,
                  email: signUpData.user.email!,
                  name: formData.email.includes('admin') ? 'Admin User' : 'SEO Specialist',
                  role: formData.email.includes('admin') ? 'admin' : 'executive',
                }
              ]);
            
            if (profileError) {
              console.error('Error creating user profile:', profileError);
            }
          }
        } else {
          throw error;
        }
      }
      
      // Authentication successful - App.tsx will handle the auth state change
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">BSC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to Bang SEO Command Centre</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            icon={Mail}
            required
          />
          
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              icon={Lock}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            icon={LogIn}
          >
            Sign In
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <strong>Demo:</strong><br />
            {import.meta.env.VITE_SUPABASE_URL ? (
              <>
                Create account or sign in with any email/password<br />
                Email: admin@bangdigital.com.au for admin role
              </>
            ) : (
              <>
                Email: admin@bangdigital.com.au<br />
                Password: password123
              </>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 Bang Digital. All rights reserved.</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;