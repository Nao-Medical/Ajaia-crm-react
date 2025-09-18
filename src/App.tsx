// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/loginPage';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import DataComparisonPage from './pages/DataComparisonPage';

function App(): React.ReactElement { // Explicit return type


  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // This is the key: listen for auth state changes from Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Will be the user object on login, or null on logout
      setIsLoading(false);  // We're done checking, so stop loading
    });

    // Cleanup the listener when the App component unmounts
    return () => unsubscribe();
  }, []);
  if (isLoading) {
    return <div>Loading Application...</div>; // Or a fancy spinner component
  }
  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/dashboard"
        element={user ? <DataComparisonPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;