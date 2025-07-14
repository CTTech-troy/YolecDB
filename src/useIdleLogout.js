// src/hooks/useIdleLogout.js

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const useIdleLogout = (idleLimit = 5 * 60 * 1000) => { // default 5 min
  const [lastActive, setLastActive] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const handleActivity = () => setLastActive(Date.now());

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActive > idleLimit) {
        localStorage.removeItem('user');
        Swal.fire({
          icon: 'info',
          title: 'Session expired',
          text: 'You have been logged out due to inactivity.',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate('/', { replace: true });
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [lastActive, idleLimit, navigate]);
};

export default useIdleLogout;
