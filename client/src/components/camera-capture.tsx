import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (image: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc.split(',')[1]);
        setIsCameraActive(false);
      }
    }
  }, [onCapture]);

  if (!isCameraActive) {
    return (
      <Button onClick={() => setIsCameraActive(true)} className="w-full">
        <Camera className="mr-2 h-4 w-4" />
        Start Camera
      </Button>
    );
  }

  return (
    <div className="relative">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full rounded-lg"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Button onClick={capture} variant="default">
          <Camera className="mr-2 h-4 w-4" />
          Capture
        </Button>
        <Button onClick={() => setIsCameraActive(false)} variant="secondary">
          <RefreshCw className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
