import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { CameraView } from './components/CameraView';
import { Image as ImageIcon, Lock, Unlock, X } from 'lucide-react';

export default function App() {
  const [printImage, setPrintImage] = useState<string | null>(null);
  
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const [isAnchored, setIsAnchored] = useState(false);
  const [orientationOffset, setOrientationOffset] = useState({ x: 0, y: 0 });
  const initialOrientation = useRef<{ alpha: number, beta: number, gamma: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Touch handling refs
  const lastPanRef = useRef<{ x: number; y: number } | null>(null);
  const lastPinchRef = useRef<number | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPrintImage(url);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsAnchored(false);
      initialOrientation.current = null;
      setOrientationOffset({ x: 0, y: 0 });
    }
  };

  const handleClearImage = () => {
    setPrintImage(null);
    setIsAnchored(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !isAnchored) {
      lastPanRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastPinchRef.current = dist;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !isAnchored && lastPanRef.current) {
      const dx = e.touches[0].clientX - lastPanRef.current.x;
      const dy = e.touches[0].clientY - lastPanRef.current.y;
      setPosition(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPanRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && lastPinchRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - lastPinchRef.current;
      setScale(s => Math.max(0.1, Math.min(s + delta * 0.005, 5)));
      lastPinchRef.current = dist;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      lastPanRef.current = null;
      lastPinchRef.current = null;
    } else if (e.touches.length === 1) {
      // If one finger remains after pinch, treat it as a new pan start
      lastPanRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPinchRef.current = null;
    }
  };

  const handleAnchorToggle = async () => {
    if (isAnchored) {
      setIsAnchored(false);
      initialOrientation.current = null;
      setOrientationOffset({ x: 0, y: 0 });
      return;
    }

    if (typeof (window as any).DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const permission = await (window as any).DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setIsAnchored(true);
        } else {
          alert('需要传感器权限来固定图片');
        }
      } catch (e) {
        setIsAnchored(true);
      }
    } else {
      setIsAnchored(true);
    }
  };

  useEffect(() => {
    if (!isAnchored) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!e.alpha || !e.beta) return; // Might be null on some devices

      if (!initialOrientation.current) {
        initialOrientation.current = { alpha: e.alpha, beta: e.beta, gamma: e.gamma || 0 };
        return;
      }

      let dAlpha = e.alpha - initialOrientation.current.alpha;
      let dBeta = e.beta - initialOrientation.current.beta;
      let dGamma = (e.gamma || 0) - initialOrientation.current.gamma;

      // Wrap around 360
      if (dAlpha > 180) dAlpha -= 360;
      if (dAlpha < -180) dAlpha += 360;

      // Basic linear mapping for 3DOF. 
      // This varies heavily by FOV and device, but works well enough as a simple simulation.
      const pxPerDegreeX = window.innerWidth / 60;
      const pxPerDegreeY = window.innerHeight / 60;

      const isLandscape = window.innerWidth > window.innerHeight;

      let transX = 0;
      let transY = 0;

      if (isLandscape) {
        // Landscape holding
        transX = dAlpha * pxPerDegreeX;
        transY = -dBeta * pxPerDegreeY;
      } else {
        // Portrait holding
        // In portrait, rotating left/right is alpha. 
        // Tilting up/down is beta.
        transX = dAlpha * pxPerDegreeX;
        transY = -dBeta * pxPerDegreeY;
      }

      setOrientationOffset({ x: -transX, y: transY });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isAnchored]);

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden select-none touch-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {/* Background layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <CameraView />
      </div>

      {/* Image layer */}
      {printImage && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <img
            src={printImage}
            draggable={false}
            className="w-auto h-auto max-w-[80vw] max-h-[80vh] object-contain drop-shadow-2xl"
            style={{
              transform: `translate3d(${position.x + orientationOffset.x}px, ${position.y + orientationOffset.y}px, 0) scale(${scale})`,
              opacity: opacity,
            }}
          />
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
        
        {/* Top bar */}
        <div className="w-full p-6 flex justify-end">
          {printImage && (
            <button 
              onClick={handleClearImage}
              className="pointer-events-auto bg-black/40 backdrop-blur-md rounded-full p-3 text-white border border-white/20 active:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right side slider for opacity */}
        {printImage && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
             <span className="text-white/80 text-xs font-medium tracking-wider drop-shadow-md">透明度</span>
             <div className="h-48 flex items-center justify-center pointer-events-auto">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.01"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  className="w-2 h-48 appearance-none bg-white/20 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer shadow-lg drop-shadow-xl"
                  style={{
                     writingMode: 'vertical-lr',
                     direction: 'rtl'
                  }}
                />
             </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="w-full p-8 pb-12 flex justify-center items-center gap-6 pointer-events-auto">
          {!printImage ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/30 text-white px-8 py-4 rounded-full font-medium text-lg shadow-2xl active:bg-white/20 transition-all hover:scale-105"
            >
              <ImageIcon className="w-6 h-6" /> 选择图片
            </button>
          ) : (
            <button
              onClick={handleAnchorToggle}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-medium text-lg shadow-2xl transition-all hover:scale-105 ${
                isAnchored 
                  ? 'bg-blue-600/90 text-white border border-blue-500/50' 
                  : 'bg-white/90 text-black border border-white'
              }`}
            >
              {isAnchored ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              {isAnchored ? '解除固定' : '放置在墙面'}
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

      </div>
    </div>
  );
}
