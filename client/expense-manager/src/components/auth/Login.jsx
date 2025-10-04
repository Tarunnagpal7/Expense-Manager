import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onAuthChange }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
    
    try {
      // Handle login logic here
      // const response = await User.login(formData);
      
      // Simulate successful login
      const authToken = 'demo-token';
      onAuthChange(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">E</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ExpenseTracker</h1>
          <h2 className="text-xl font-semibold text-gray-700">Sign in to your account</h2>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
            <div className="mt-2 flex justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button className="text-sm text-gray-600 hover:text-gray-500 font-semibold">
                Forgot password?
              </button>
            </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg shadow-emerald-500/20 text-sm h-10 font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Login
              </button>
            </div>
          </form>

          <div className="mt-6">
            

            <div className="mt-6 text-center">
              <Link
                to="/signup"
                className="font-medium text-gray-600 hover:text-gray-500"
              >
                Don't have an account? Sign up
              </Link>
            </div>
            
            <div className="mt-2 text-center">
              <button className="text-sm text-gray-600 hover:text-gray-500 font-semibold">
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;