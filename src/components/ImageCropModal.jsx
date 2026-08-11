import React, { useState, useRef, useEffect } from 'react';
import { Crop, RotateCw, ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

export default function ImageCropModal({ imageUrl, onSave, onClose }) {
  const [aspectRatio, setAspectRatio] = useState('free'); // 'free', '16:9', '4:3', '1:1', '3:2'
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [imageUrl]);

  // Render Live Crop Canvas Preview
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Determine Canvas Dimensions based on Aspect Ratio
    let targetWidth = 600;
    let targetHeight = 400;

    if (aspectRatio === '16:9') {
      targetWidth = 640;
      targetHeight = 360;
    } else if (aspectRatio === '4:3') {
      targetWidth = 600;
      targetHeight = 450;
    } else if (aspectRatio === '1:1') {
      targetWidth = 500;
      targetHeight = 500;
    } else if (aspectRatio === '3:2') {
      targetWidth = 600;
      targetHeight = 400;
    } else {
      // Free / Original ratio
      targetWidth = 600;
      targetHeight = Math.round(600 * (img.height / img.width));
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.save();

    // Apply Transformation (Center, Rotate, Scale, Translate)
    const centerX = targetWidth / 2;
    const centerY = targetHeight / 2;

    ctx.translate(centerX + offsetX, centerY + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw Image Centered
    ctx.drawImage(
      img,
      -img.width / 2,
      -img.height / 2,
      img.width,
      img.height
    );

    ctx.restore();
  }, [imageLoaded, aspectRatio, zoom, rotation, offsetX, offsetY]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyCrop = () => {
    if (!canvasRef.current) return;
    try {
      const croppedDataUrl = canvasRef.current.toDataURL('image/png', 0.95);
      onSave(croppedDataUrl);
    } catch (err) {
      console.error('Failed to export cropped image:', err);
      if (canvasRef.current) {
        onSave(canvasRef.current.toDataURL());
      }
    }
  };

  const handleResetCrop = () => {
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setAspectRatio('free');
  };

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Crop className="w-4 h-4 text-blue-600" />
            <span>Crop & Adjust Image</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-600">Aspect Ratio:</span>
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { id: 'free', label: 'Free' },
              { id: '16:9', label: '16:9 Widescreen' },
              { id: '4:3', label: '4:3 Standard' },
              { id: '1:1', label: '1:1 Square' },
              { id: '3:2', label: '3:2 Photo' }
            ].map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setAspectRatio(ratio.id)}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  aspectRatio === ratio.id
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Crop Interactive Work Area */}
        <div 
          className="flex-1 min-h-[300px] bg-slate-900/90 rounded-xl overflow-hidden relative flex items-center justify-center p-4 cursor-grab active:cursor-grabbing select-none shadow-inner"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {!imageLoaded ? (
            <div className="text-white text-xs font-semibold animate-pulse">Loading image preview...</div>
          ) : (
            <div className="relative border-2 border-dashed border-blue-400/80 rounded-lg shadow-2xl overflow-hidden bg-black/40">
              <canvas ref={canvasRef} className="max-h-[360px] max-w-full block object-contain" />
              <div className="absolute top-2 left-2 bg-slate-900/75 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 pointer-events-none">
                <Move className="w-3 h-3 text-blue-400" />
                <span>Drag to Pan / Move</span>
              </div>
            </div>
          )}
        </div>

        {/* Sliders & Tools Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          
          {/* Zoom Slider */}
          <div className="flex items-center gap-2">
            <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
            <input 
              type="range" 
              min="0.5" 
              max="3.0" 
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
            <span className="w-10 text-right font-mono text-slate-700 font-semibold">{(zoom * 100).toFixed(0)}%</span>
          </div>

          {/* Rotate & Reset */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleRotate}
              className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Rotate 90°</span>
            </button>
            <button
              onClick={handleResetCrop}
              className="text-slate-500 hover:text-slate-800 px-2 py-1 cursor-pointer font-medium"
            >
              Reset
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2 font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyCrop}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Crop</span>
          </button>
        </div>

      </div>
    </div>
  );
}
