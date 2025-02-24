import { useState } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ImageUpload } from '@/components/image-upload';
import { CameraCapture } from '@/components/camera-capture';
import { ProductCard } from '@/components/product-card';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type Product } from '@shared/schema';
import { Puzzle } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  const identifyMutation = useMutation({
    mutationFn: async (image: string) => {
      setProcessing(true);
      const res = await apiRequest('POST', '/api/products/identify', { image });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product successfully identified and added to database',
      });
      setProcessing(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setProcessing(false);
    }
  });

  const handleImage = (image: string) => {
    identifyMutation.mutate(image);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI Product Identifier
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Upload or capture product images to automatically identify and catalog them
        </p>
        
        <div className="grid gap-6">
          <ImageUpload onUpload={handleImage} />
          <div className="text-center text-sm text-muted-foreground">or</div>
          <CameraCapture onCapture={handleImage} />
        </div>

        {processing && (
          <div className="mt-8">
            <Progress value={45} className="mb-2" />
            <p className="text-sm text-center text-muted-foreground">
              Processing image and identifying product...
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/plugin-demo">
              <Puzzle className="mr-2 h-4 w-4" />
              Try Plugin Demo
            </Link>
          </Button>
        </div>
      </div>

      {products && products.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Identified Products</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
