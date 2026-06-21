import React, { useState } from 'react';
import { Image, Video } from 'lucide-react';

interface ImagePreviewProps {
  url: string | null | undefined;
  aspectRatio: 'poster' | 'backdrop';
  label: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ url, aspectRatio, label }) => {
  const [errorLocal, setErrorLocal] = useState(false);

  const containerStyle = aspectRatio === 'poster' 
    ? 'aspect-[2/3] w-32 max-w-[130px]' 
    : 'aspect-video w-full';

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <div className={`relative bg-[#1c1c1c] border border-white/5 rounded-lg overflow-hidden flex items-center justify-center ${containerStyle}`}>
        {url && !errorLocal ? (
          <img 
            src={url} 
            alt={label} 
            referrerPolicy="no-referrer"
            onError={() => setErrorLocal(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-600 p-2 text-center gap-1">
            <Image className="h-6 w-6 stroke-[1.5]" />
            <span className="text-[10px] break-all">Sin vista previa</span>
          </div>
        )}
      </div>
    </div>
  );
};
