import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onUpload: (base64: string) => void;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          onUpload(base64);
        };
        reader.readAsDataURL(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {isDragActive
          ? 'Drop the image here'
          : 'Drag & drop an image here, or click to select'}
      </p>
      <Button variant="secondary" className="mt-4">
        Select Image
      </Button>
    </div>
  );
}
