import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      {product.imageUrl && (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={`data:image/jpeg;base64,${product.imageUrl}`}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          {product.brand && (
            <Badge variant="secondary">{product.brand}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {product.description}
        </p>
        {product.category && (
          <Badge variant="outline">{product.category}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
