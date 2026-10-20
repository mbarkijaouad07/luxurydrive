import { Star } from 'lucide-react';

export function StarRating({ rating, max = 5, size = 'md', interactive = false, onChange }) {
  const sizes = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-7 h-7' };
  const cls = sizes[size] || sizes.md;

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          onClick={() => interactive && onChange?.(i + 1)}
          className={`${cls} transition-all duration-300 ${i < rating ? 'text-accent fill-accent scale-110' : 'text-muted opacity-40'
            } ${interactive ? 'cursor-pointer hover:scale-125' : ''}`}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review }) {
  return (
    <div className="premium-card rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-start gap-5 mb-6">
        <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center text-xl font-black text-accent flex-shrink-0 shadow-lg border border-accent/10">
          {review.user?.firstName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
            <p className="text-primary font-black text-lg">
              {review.user?.firstName} {review.user?.lastName}
            </p>
            <span className="text-muted font-bold text-[10px] uppercase tracking-widest">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>
      {review.title && <p className="text-primary font-black text-xl mb-3 tracking-tight uppercase">{review.title}</p>}
      {review.comment && <p className="text-secondary text-base leading-relaxed font-medium">{review.comment}</p>}
    </div>
  );
}
