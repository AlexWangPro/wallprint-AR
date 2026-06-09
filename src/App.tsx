import { useState } from 'react';
import { CameraView } from './components/CameraView';
import { PhotoView } from './components/PhotoView';
import { PrintOverlay } from './components/PrintOverlay';
import { Toolbar } from './components/Toolbar';
import { AppMode, BlendMode } from './types';

export default function App() {
  const [mode, setMode] = useState<AppMode>('camera');
  const [wallImage, setWallImage] = useState<string | null>(null);
  const [printImage, setPrintImage] = useState<string | null>(null);
  
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.85);
  const [blendMode, setBlendMode] = useState<BlendMode>('multiply');

  return (
    <div className="relative w-full h-dvh bg-black overflow-hidden select-none">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        {mode === 'camera' ? (
          <CameraView />
        ) : (
          <PhotoView imageUrl={wallImage} />
        )}
      </div>

      {/* Overlay layer */}
      <div className="absolute inset-0 z-10 bottom-[240px]">
        <PrintOverlay 
          imageUrl={printImage}
          scale={scale}
          opacity={opacity}
          blendMode={blendMode}
        />
      </div>

      {/* Toolbar layer */}
      <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <Toolbar 
            mode={mode} setMode={setMode}
            setWallImage={setWallImage} setPrintImage={setPrintImage}
            scale={scale} setScale={setScale}
            opacity={opacity} setOpacity={setOpacity}
            blendMode={blendMode} setBlendMode={setBlendMode}
          />
        </div>
      </div>
    </div>
  );
}
