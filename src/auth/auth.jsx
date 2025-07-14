import React, { useState } from 'react';
import { ref, push, get } from 'firebase/database';
import { database } from '../../firebase';
import Swal from 'sweetalert2';
import { login } from './authHelpers';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  const [signupErrors, setSignupErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors = { email: '', password: '' };

    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!loginForm.password) {
      errors.password = 'Password is required';
    }

    setLoginErrors(errors);

    if (!errors.email && !errors.password) {
      setLoginLoading(true);
      await loginUser(loginForm.email, loginForm.password);
      setLoginLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      let foundUser = null;

      if (snapshot.exists()) {
        snapshot.forEach(childSnap => {
          const user = childSnap.val();
          if (user.email === email && user.password === password) {
            foundUser = user;
            return true; // break out of forEach
          }
        });
      }

      if (foundUser) {
        localStorage.setItem('user', JSON.stringify(foundUser));
        login(rememberMe);

        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome to your dashboard.',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate('/dashboard');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password.',
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Login Error',
        text: 'Could not log in. Please try again.',
      });
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const errors = { name: '', email: '', password: '', confirmPassword: '' };

    if (!signupForm.name) errors.name = 'Name is required';
    if (!signupForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(signupForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!signupForm.password) {
      errors.password = 'Password is required';
    } else if (signupForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!signupForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setSignupErrors(errors);

    if (!errors.name && !errors.email && !errors.password && !errors.confirmPassword) {
      setSignupLoading(true);
      try {
        const res = await push(ref(database, 'users'), {
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          createdAt: new Date().toISOString(),
        });
        if (res && res.key) {
          Swal.fire({
            icon: 'success',
            title: 'Signup Successful!',
            text: 'Your account has been created. Please log in.',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            setIsLogin(true);
            setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
          });
        } else {
          throw new Error('User not saved');
        }
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: 'Could not create account. Please try again.',
        });
      }
      setSignupLoading(false);
    }
  };

  const handlePasswordChange = (value, isSignup = false) => {
    if (isSignup) {
      setSignupForm(prev => ({ ...prev, password: value }));
    } else {
      setLoginForm(prev => ({ ...prev, password: value }));
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <style>{`
        .!rounded-button { border-radius: 8px; }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>

      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <i className={`fas fa-shield-alt text-2xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}></i>
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SecureAuth</h1>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
          <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
        </button>
      </div>

      <div className="flex items-center justify-center px-4 py-8">
        <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>

          {/* Tab Toggle */}
          <div className={`flex rounded-lg p-1 mb-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 text-sm font-medium cursor-pointer whitespace-nowrap !rounded-button ${isLogin ? 'bg-blue-600 text-white shadow-sm' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 text-sm font-medium cursor-pointer whitespace-nowrap !rounded-button ${!isLogin ? 'bg-blue-600 text-white shadow-sm' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} ${loginErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} ${loginErrors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Remember me</span>
                </label>
                <a href="#" className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Forgot password?</a>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                disabled={loginLoading}
              >
                {loginLoading && (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                )}
                {loginLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} ${signupErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Full Name"
                />
                {signupErrors.name && <p className="text-red-500 text-sm mt-1">{signupErrors.name}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} ${signupErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Email"
                />
                {signupErrors.email && <p className="text-red-500 text-sm mt-1">{signupErrors.email}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupForm.password}
                    onChange={(e) => handlePasswordChange(e.target.value, true)}
                    className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} ${signupErrors.password ? 'border-red-500' : ''}`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {signupErrors.password && <p className="text-red-500 text-sm mt-1">{signupErrors.password}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} ${signupErrors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {signupErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{signupErrors.confirmPassword}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                disabled={signupLoading}
              >
                {signupLoading && (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                )}
                {signupLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className={`font-medium cursor-pointer hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
