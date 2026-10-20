import { useState } from 'react';
import { createPortal } from 'react-dom';
import { StarRating } from './StarRating';
import { XCircle, Send } from 'lucide-react';
import { getImageUrl } from '../utils/formatters';

export default function ReviewModal({ pendingReview, onSubmit, onSkip }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setIsSubmitting(true);
    await onSubmit({
      carId: pendingReview.car.id,
      bookingId: pendingReview.id,
      rating,
      title,
      comment
    });
    setIsSubmitting(false);
  };

  if (!pendingReview) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative bg-surface border border-border rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        
        <button onClick={onSkip} className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-2 transition-all">
          <XCircle className="w-6 h-6 text-muted hover:text-rose-500" />
        </button>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-2">Rate Your Experience</h3>
          <p className="text-secondary text-sm font-medium">
            How was your rental of the <span className="font-black text-primary uppercase">{pendingReview.car.title}</span>?
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <img 
            src={getImageUrl(pendingReview.car.images)} 
            alt={pendingReview.car.title}
            className="w-32 h-20 object-cover rounded-xl shadow-md border border-border"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Your Rating</span>
            <StarRating rating={rating} max={5} size="lg" interactive={true} onChange={setRating} />
          </div>
          
          <div>
            <input 
              type="text" 
              placeholder="Give your review a title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="input-premium w-full !py-3"
              required
            />
          </div>
          
          <div>
            <textarea 
              placeholder="Tell us more about your experience..." 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              className="input-premium w-full min-h-[100px]"
            ></textarea>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onSkip}
              className="flex-1 px-6 py-3 rounded-2xl border border-border font-black uppercase text-[10px] tracking-widest hover:bg-surface-2 transition-all"
            >
              Skip for Now
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !rating}
              className="flex-1 btn-premium flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'} <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}
