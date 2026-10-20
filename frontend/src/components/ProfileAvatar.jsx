import React, { useState, useRef } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import { getImageUrl } from '../utils/formatters';

const ProfileAvatar = ({ user, onUpload, loading }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Max 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      onUpload(file);
    }
  };

  const avatarUrl = preview || getImageUrl(user?.avatar, false);

  return (
    <div className="relative group w-32 h-32 mx-auto md:mx-0">
      <div className="w-full h-full rounded-full overflow-hidden border-4 border-border shadow-2xl relative bg-surface-2 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:border-accent">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user?.firstName}&background=random`; }}
          />
        ) : (
          <div className="w-full h-full bg-accent/10 flex items-center justify-center text-accent text-4xl font-black">
            {user?.firstName?.[0]?.toUpperCase()}
          </div>
        )}

        {/* Interaction Overlay */}
        <div 
          onClick={() => !loading && fileInputRef.current?.click()}
          className="absolute inset-0 bg-accent/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
        >
          {loading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <>
              <Camera className="w-8 h-8 text-white mb-1" />
              <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Update</span>
            </>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      {/* Decorative Badge */}
      <div className="absolute bottom-1 right-1 w-9 h-9 bg-accent rounded-full border-4 border-background flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:scale-110">
        <Camera className="w-4 h-4" />
      </div>
    </div>
  );
};

export default ProfileAvatar;
