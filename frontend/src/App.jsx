import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReviewModal from './components/ReviewModal';
import api from './services/api';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

import HomePage      from './pages/HomePage';
import CarsPage      from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage       from './pages/AdminPage';
import ReclamationPage from './pages/ReclamationPage';
import NotFoundPage  from './pages/NotFoundPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user } = useAuth();
  const [pendingReview, setPendingReview] = useState(null);

  useEffect(() => {
    if (user) {
      api.get('/reviews/pending')
        .then(r => {
          if (r.data.data) {
            setPendingReview(r.data.data);
          }
        })
        .catch(err => console.error('Failed to fetch pending review', err));
    } else {
      setPendingReview(null);
    }
  }, [user]);

  const handleReviewSubmit = async (data) => {
    try {
      await api.post('/reviews', data);
      toast.success('Thank you for your review!');
      setPendingReview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-white">
      <Navbar />
      <main className="flex-1 pt-[var(--navbar-height)]">
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/cars"       element={<CarsPage />} />
          <Route path="/cars/:id"   element={<CarDetailPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />
          <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/reclamation" element={<ProtectedRoute><ReclamationPage /></ProtectedRoute>} />
          <Route path="/admin/*"    element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*"           element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      {pendingReview && (
        <ReviewModal 
          pendingReview={pendingReview} 
          onSubmit={handleReviewSubmit} 
          onSkip={() => setPendingReview(null)} 
        />
      )}
    </div>
  );
}
