import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import Cropper from "react-easy-crop";

interface ImageCropperProps {
  image: string | null;
  aspect?: number;
  cropShape?: "rect" | "round";
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
  initialZoom?: number;
  containerSize?: { width: number; height: number };
  showCropButton?: boolean;
  showZoomSlider?: boolean;
  triggerCrop?: boolean;
}

export interface ImageCropperRef {
  cropImage: () => void;
}

const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(({
  image,
  aspect = 1,
  cropShape = "rect",
  onCropComplete,
  initialZoom = 1,
  containerSize = { width: 300, height: 300 },
  showCropButton = true,
  showZoomSlider = true,
  triggerCrop = false,
}, ref) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Reset crop and zoom when aspect ratio changes
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(initialZoom);
    setCroppedAreaPixels(null);
    setIsReady(false);
    
    // Small delay to ensure the cropper is ready
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, [aspect, initialZoom]);

  const onCropCompleteCb = useCallback((_: any, croppedPixels: any) => {
    if (isReady) {
      setCroppedAreaPixels(croppedPixels);
    }
  }, [isReady]);

  const getCroppedImg = useCallback(async () => {
    if (!image || !croppedAreaPixels || !isReady) return;
    const img = new window.Image();
    img.src = image;
    await new Promise((resolve) => (img.onload = resolve));
    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    // Convert to webp blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          onCropComplete(blob, previewUrl);
        }
      },
      "image/webp",
      0.9
    );
  }, [image, croppedAreaPixels, onCropComplete, isReady]);

  useImperativeHandle(ref, () => ({
    cropImage: getCroppedImg,
  }), [getCroppedImg]);

  // Trigger crop when triggerCrop is true
  useEffect(() => {
    if (triggerCrop && croppedAreaPixels && isReady) {
      getCroppedImg();
    }
  }, [triggerCrop, croppedAreaPixels, getCroppedImg, isReady]);

  return (
    <div style={{ position: "relative", width: containerSize.width, height: containerSize.height + ((showCropButton || showZoomSlider) ? 40 : 0) }}>
      {image && isReady && (
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteCb}
          style={{
            containerStyle: {
              width: containerSize.width,
              height: containerSize.height,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
            cropAreaStyle: {
              border: '2px solid white',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
            },
          }}
        />
      )}
      {(showCropButton || showZoomSlider) && (
        <div className="flex flex-col gap-1 mt-3" style={{ position: "absolute", left: 0, right: 0, bottom: -8, zIndex: 2, background: "rgba(255,255,255,0.85)", padding: 6, borderRadius: 8, justifyContent: "center" }}>
          {showZoomSlider && (
            <div className="flex flex-col items-center gap-1">
              <label className="text-xs text-gray-600 font-medium">Zoom / Ingrandisci</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: 120 }}
                className="w-32"
              />
            </div>
          )}
          {showCropButton && (
            <button
              type="button"
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              onClick={getCroppedImg}
            >
              Crop & Preview
            </button>
          )}
        </div>
      )}
    </div>
  );
});

ImageCropper.displayName = 'ImageCropper';

export default ImageCropper;
