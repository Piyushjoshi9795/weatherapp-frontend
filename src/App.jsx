import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Weather from './pages/Weather';

// Protected route — redirects to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { accessToken } = useAuth();
  return accessToken ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      {/* Provides authentication context to the entire application */}

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/register" element={<Register />} />

          <Route
            path="/weather"
            element={
              <PrivateRoute>
                <Weather />
              </PrivateRoute>
            }
          />
          
          {/* 
            This means the Weather page is protected and can only be accessed
            if the user is authenticated.
          */}

          <Route
            path="*"
            element={<Navigate to="/login" />}
          />

          {/* Catch-all route */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}