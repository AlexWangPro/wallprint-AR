import { useState, useRef } from 'react';
import { AppMode, BlendMode } from '../types';
import { Camera, Image as ImageIcon, Upload, SlidersHorizontal, ImageDown } from 'lucide-react';

interface ToolbarProps {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  setWallImage: (url: string) => void;
  setPrintImage: (url: string) => void;
  scale: number;
  setScale: (s: number) => void;
  opacity: number;
  setOpacity: (o: number) => void;
  blendMode: BlendMode;
  setBlendMode: (m: BlendMode) => void;
}

export function Toolbar({
  mode, setMode, setWallImage, setPrintImage,
  scale, setScale, opacity, setOpacity,
  blendMode, setBlendMode
}: ToolbarProps) {
  const [activeTab, setActiveTab] = useState<'source' | 'adjust'>('source');
  
  const wallInputRef = useRef<HTMLInputElement>(null);
  const printInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: import('react').ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  return (
    <div className="absolute w-full bottom-0 bg-black/85 backdrop-blur-2xl text-white rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.5)] z-50">
      <div className="flex flex-col p-5 pb-8">
        
        {/* Tab Content */}
        <div className="mb-5 h-[120px] pt-1">
          {activeTab === 'source' ? (
             <div className="flex gap-4 h-full">
               {/* Mode selection & Upload */}
               <div className="flex flex-col gap-2 w-1/2">
                 <span className="text-xs text-gray-400 font-medium tracking-wide">背景环境</span>
                 <div className="flex bg-white/10 rounded-xl p-1">
                   <button 
                     onClick={() => setMode('camera')}
                     className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'camera' ? 'bg-white text-black shadow-sm' : 'text-gray-300 active:bg-white/10'}`}
                   >
                     <Camera className="w-4 h-4 mr-1.5" /> AR
                   </button>
                   <button 
                     onClick={() => setMode('photo')}
                     className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'photo' ? 'bg-white text-black shadow-sm' : 'text-gray-300 active:bg-white/10'}`}
                   >
                     <ImageIcon className="w-4 h-4 mr-1.5" /> 照片
                   </button>
                 </div>
                 {mode === 'photo' && (
                   <button 
                     onClick={() => wallInputRef.current?.click()}
                     className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 rounded-xl text-sm mt-1 active:bg-white/20 transition-colors"
                   >
                     <Upload className="w-4 h-4" /> 上传墙壁照片
                   </button>
                 )}
               </div>

               <div className="flex flex-col gap-2 w-1/2">
                 <span className="text-xs text-gray-400 font-medium tracking-wide">打印图层</span>
                 <button 
                   onClick={() => printInputRef.current?.click()}
                   className="w-full flex flex-col items-center justify-center py-3 bg-blue-600 rounded-xl shadow-lg text-sm font-medium active:bg-blue-700 transition-colors h-[86px]"
                 >
                   <ImageDown className="w-6 h-6 mb-1.5" /> 
                   <span>选择打印图片</span>
                 </button>
               </div>
             </div>
          ) : (
            <div className="flex flex-col gap-5 justify-center h-full">
              <div className="flex items-center gap-4">
                 <span className="text-xs w-14 text-gray-400 font-medium">大小</span>
                 <input type="range" min="0.1" max="3" step="0.05" value={scale} onChange={e => setScale(parseFloat(e.target.value))} className="flex-1 accent-white bg-white/20 h-1.5 rounded-lg appearance-none" />
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-xs w-14 text-gray-400 font-medium">透明度</span>
                 <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="flex-1 accent-white bg-white/20 h-1.5 rounded-lg appearance-none" />
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-xs w-14 text-gray-400 font-medium">混合模式</span>
                 <div className="flex gap-2 flex-1">
                   {(['normal', 'multiply', 'overlay'] as BlendMode[]).map(m => (
                     <button
                       key={m}
                       onClick={() => setBlendMode(m)}
                       className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-colors border ${blendMode === m ? 'border-white bg-white text-black' : 'border-white/20 text-gray-300 hover:bg-white/10'}`}
                     >
                       {m === 'normal' ? '正常' : m === 'multiply' ? '墙绘' : '叠加'}
                     </button>
                   ))}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 relative">
           <button 
              onClick={() => setActiveTab('source')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 rounded-2xl transition-all ${activeTab === 'source' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
             <ImageIcon className="w-4 h-4" /> 资源
           </button>
           <button 
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 rounded-2xl transition-all ${activeTab === 'adjust' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
             <SlidersHorizontal className="w-4 h-4" /> 调节
           </button>
        </div>

      </div>

      <input type="file" ref={wallInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, setWallImage)} />
      <input type="file" ref={printInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, setPrintImage)} />
    </div>
  );
}
