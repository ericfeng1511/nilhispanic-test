import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface PhotoCropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (file: File, previewDataUrl: string) => void;
  title?: string;
  initialImageUrl?: string | null; // optional existing photo to show in background
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const PhotoCropperModal: React.FC<PhotoCropperModalProps> = ({ open, onOpenChange, onSave, title = 'Update Profile Photo', initialImageUrl: _initialImageUrl = null }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLocalImage, setIsLocalImage] = useState<boolean>(false);

  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const CROP_SIZE = 320; // px, viewport square
  const OUTPUT_SIZE = 512; // px, canvas output square

  useEffect(() => {
    if (!open) {
      // reset state when closing
      setTimeout(() => {
        setError(null);
        setImageFile(null);
        setImageUrl(null);
        setImgNatural(null);
        setScale(1);
        setOffset({ x: 0, y: 0 });
        setIsLocalImage(false);
      }, 150);
    }
  }, [open]);

  const validateFile = (file: File) => {
    if (!ACCEPTED_TYPES.some(t => file.type.startsWith(t.split('/')[0]))) {
      return 'Please select an image file (JPEG, PNG, WEBP, or GIF).';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Please select an image smaller than 5MB.';
    }
    return null;
  };

  const handleFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
    };
    reader.readAsDataURL(file);
    setIsLocalImage(true);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onSelectClick = () => fileInputRef.current?.click();

  // When image loads, set initial scale and position to FIT (contain) inside the square
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgEl = e.currentTarget;
    const naturalW = imgEl.naturalWidth;
    const naturalH = imgEl.naturalHeight;
    if (!naturalW || !naturalH) return;

    setImgNatural({ w: naturalW, h: naturalH });

    // Compute scale so image FITS entirely (like background-size: contain)
    const scaleToContain = Math.min(CROP_SIZE / naturalW, CROP_SIZE / naturalH);
    setScale(scaleToContain);

    const displayedW = naturalW * scaleToContain;
    const displayedH = naturalH * scaleToContain;
    const centerX = (CROP_SIZE - displayedW) / 2;
    const centerY = (CROP_SIZE - displayedH) / 2;
    setOffset({ x: centerX, y: centerY });
  };

  const clampOffset = useCallback((x: number, y: number, s: number) => {
    if (!imgNatural) return { x, y };
    const displayedW = imgNatural.w * s;
    const displayedH = imgNatural.h * s;
    const centerX = (CROP_SIZE - displayedW) / 2;
    const centerY = (CROP_SIZE - displayedH) / 2;
    const minX = displayedW <= CROP_SIZE ? centerX : CROP_SIZE - displayedW;
    const maxX = displayedW <= CROP_SIZE ? centerX : 0;
    const minY = displayedH <= CROP_SIZE ? centerY : CROP_SIZE - displayedH;
    const maxY = displayedH <= CROP_SIZE ? centerY : 0;
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }, [imgNatural]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!imageUrl) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart.current) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    const clamped = clampOffset(newX, newY, scale);
    setOffset(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStart.current = null;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
  };

  const handleScaleChange = (vals: number[]) => {
    const newScale = vals[0];
    if (!imgNatural) {
      setScale(newScale);
      return;
    }
    // Keep the image centered relative to current offset when zooming
    const centerX = offset.x + CROP_SIZE / 2;
    const centerY = offset.y + CROP_SIZE / 2;

    const prevDisplayedW = imgNatural.w * scale;
    const prevDisplayedH = imgNatural.h * scale;
    const newDisplayedW = imgNatural.w * newScale;
    const newDisplayedH = imgNatural.h * newScale;

    // Adjust offset so the center stays roughly the same point in image space
    const relCenterX = (centerX - offset.x) / prevDisplayedW;
    const relCenterY = (centerY - offset.y) / prevDisplayedH;

    let newOffsetX = centerX - relCenterX * newDisplayedW;
    let newOffsetY = centerY - relCenterY * newDisplayedH;

    const clamped = clampOffset(newOffsetX, newOffsetY, newScale);
    setScale(newScale);
    setOffset(clamped);
  };

  const handleSave = async () => {
    if (!isLocalImage) {
      setError('To crop your current photo, please re-upload it due to browser security (CORS).');
      return;
    }
    if (!imageUrl || !imgNatural) return;
    const img = imgRef.current;
    if (!img) return;

    // Draw to canvas using the same transform as preview
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleFactor = OUTPUT_SIZE / CROP_SIZE;

    const drawX = offset.x * scaleFactor;
    const drawY = offset.y * scaleFactor;
    const drawW = imgNatural.w * scale * scaleFactor;
    const drawH = imgNatural.h * scale * scaleFactor;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return;

    const fileName = `profile-photo-${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    const previewDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onSave(file, previewDataUrl);
  };

  const showDropzone = !imageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
          )}

          {showDropzone ? (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-nil-orange transition-colors cursor-pointer"
              onClick={onSelectClick}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-gray-600">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm">Drag & drop an image here, or click to browse</p>
                <p className="text-xs text-gray-400">JPEG, PNG, WEBP, GIF. Max 5MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-4 h-4 mr-2" /> Choose different photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>

              {/* Crop viewport */}
              <div
                ref={containerRef}
                className="relative w-[320px] h-[320px] mx-auto rounded-lg overflow-hidden bg-gray-100 border"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* Fallback: show full-cover image until natural size is known */}
                {imageUrl && !imgNatural && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    onLoad={onImageLoad}
                    draggable={false}
                  />
                )}
                {/* Transformed image once we know natural dimensions */}
                {imageUrl && imgNatural && (
                  (() => {
                    const displayedW = imgNatural.w * scale;
                    const displayedH = imgNatural.h * scale;
                    return (
                      <img
                        ref={imgRef}
                        src={imageUrl}
                        crossOrigin={imageUrl.startsWith('data:') ? undefined : 'anonymous'}
                        onLoad={onImageLoad}
                        draggable={false}
                        alt="Crop"
                        className="select-none pointer-events-none block"
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: `${imgNatural.w}px`,
                          height: `${imgNatural.h}px`,
                          maxWidth: 'none',
                          maxHeight: 'none',
                          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                          transformOrigin: 'top left',
                          willChange: 'transform',
                        }}
                      />
                    );
                  })()
                )}
                {/* Circular overlay to preview rounded avatar crop */}
                <div className="pointer-events-none absolute inset-0">
                  {/* Dim outside the circle by masking a dark layer */}
                  <div
                    className="absolute inset-0"
                    style={{
                      // Transparent center, dimmed outside
                      background: `radial-gradient(circle at center, rgba(0,0,0,0) ${CROP_SIZE / 2}px, rgba(0,0,0,0.35) ${CROP_SIZE / 2 + 1}px)`,
                    }}
                  />
                  {/* Circular ring boundary */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="rounded-full"
                      style={{
                        width: `${CROP_SIZE - 2}px`,
                        height: `${CROP_SIZE - 2}px`,
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.75) inset',
                      }}
                    />
                  </div>
                  {/* Rule-of-thirds grid inside the circle */}
                  <div
                    className="absolute inset-0"
                    style={{
                      WebkitMaskImage: `radial-gradient(circle at center, white ${CROP_SIZE / 2}px, black ${CROP_SIZE / 2 + 1}px)`,
                      maskImage: `radial-gradient(circle at center, white ${CROP_SIZE / 2}px, black ${CROP_SIZE / 2 + 1}px)`,
                    }}
                  >
                    {/* Vertical lines */}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33.333%', width: '1px', background: 'rgba(255,255,255,0.6)' }} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '66.666%', width: '1px', background: 'rgba(255,255,255,0.6)' }} />
                    {/* Horizontal lines */}
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '33.333%', height: '1px', background: 'rgba(255,255,255,0.6)' }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '66.666%', height: '1px', background: 'rgba(255,255,255,0.6)' }} />
                  </div>
                </div>
              </div>

              <div className="px-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Zoom</label>
                <Slider
                  value={[scale]}
                  min={imgNatural ? Math.min(CROP_SIZE / imgNatural.w, CROP_SIZE / imgNatural.h) : 1}
                  max={(imgNatural ? Math.min(CROP_SIZE / imgNatural.w, CROP_SIZE / imgNatural.h) : 1) * 3}
                  step={0.01}
                  onValueChange={handleScaleChange}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button className="bg-nil-orange hover:bg-nil-navy disabled:opacity-50" disabled={!isLocalImage} onClick={handleSave}>Save</Button>
              </div>
              {!isLocalImage && (
                <p className="text-xs text-gray-500 text-right">To crop your current photo, please upload a new file.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCropperModal;
