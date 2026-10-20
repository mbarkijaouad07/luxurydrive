import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-9xl font-black gradient-text mb-4">404</div>
      <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
        <Car className="w-4 h-4" /> Back to Home
      </button>
    </div>
  );
}
