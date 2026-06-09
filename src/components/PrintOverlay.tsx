import { motion } from 'motion/react';
import { BlendMode } from '../types';
import { ImageIcon } from 'lucide-react';

interface PrintOverlayProps {
  imageUrl: string | null;
  scale: number;
  opacity: number;
  blendMode: BlendMode;
}

export function PrintOverlay({ imageUrl, scale, opacity, blendMode }: PrintOverlayProps) {
  if (!imageUrl) {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="bg-black/50 text-white/80 px-6 py-4 rounded-3xl backdrop-blur-md flex flex-col items-center">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-sm font-medium">请从底部选择打印图片</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <motion.img
        src={imageUrl}
        drag
        dragMomentum={false}
        className="pointer-events-auto drop-shadow-2xl touch-none max-w-[80vw] max-h-[80vh] object-contain"
        style={{
          scale: scale,
          opacity: opacity,
          mixBlendMode: blendMode as any
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity, scale }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.5 }}
      />
    </div>
  );
}
