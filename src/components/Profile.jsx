import React, { useEffect } from 'react';
import EditProfile from './EditProfile';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // avoid rendering anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 px-4 py-10 text-white">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-black/70 rounded-2xl shadow-2xl border border-gray-700/40 p-6 backdrop-blur-md overflow-hidden relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-blue-500/30">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

        {/* Actual component */}
        <EditProfile user={user} />
      </div>
    </div>
  );
};

export default Profile;
