import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../src/services/api'; // Aapka axios instance jis mein withCredentials: true hai

const ProtectedAdminRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading' | 'authorized' | 'unauthorized'
  const location = useLocation();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // Backend par aik simple route banayein /admin/verify jo adminAuth middleware use kare
        await api.get('/admin/verify'); 
        setAuthStatus('authorized');
      } catch (err) {
        console.error("Auth Verification Failed");
        setAuthStatus('unauthorized');
      }
    };

    verifyAdmin();
  }, []);

  // 1. Performance: Check hone tak loader dikhayen taake page "flicker" na kare
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Security: Agar unauthorized hai toh login par bhej dain
  if (authStatus === 'unauthorized') {
    // 'replace' use karein taake user back button daba kar wapis na aa sakay
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authorized: Content dikhayen
  return children;
};

export default ProtectedAdminRoute;