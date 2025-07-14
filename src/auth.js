// src/auth.js

export const isLoggedIn = () => {
  return (
    localStorage.getItem('loggedIn') === 'true' ||
    sessionStorage.getItem('loggedIn') === 'true'
  );
};

export const login = (remember) => {
  if (remember) {
    localStorage.setItem('loggedIn', 'true');
  } else {
    sessionStorage.setItem('loggedIn', 'true');
  }
};

export const logout = () => {
  localStorage.removeItem('loggedIn');
  sessionStorage.removeItem('loggedIn');
};
