'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IProduct } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux'; 
import { addItem } from '@/store/cartSlice'; 
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; 

interface Props {
  product: IProduct;
}

export function ProductCard({ product }: Props) {
  const dispatch = useDispatch(); 

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItem({ product })); 
    toast.success(`${product.name} added to cart!`);
  };

  const isOutOfStock = product.inventory <= 0;

  return (
    <Card className={cn(
      "group relative flex h-full transform flex-col overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md", // Enhanced base styles
      isOutOfStock && "opacity-60" 
    )}>
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted"> 
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Image Coming Soon
          </div>
        )}
         {isOutOfStock && (
           <Badge variant="destructive" className="absolute left-2 top-2 z-10">Sold Out</Badge>
         )}
      </div>

      <CardHeader className="p-4"> 
        <CardTitle className="line-clamp-1 text-base font-medium">{product.name}</CardTitle>
        <CardDescription className="pt-1">
          <Badge variant="outline" className="text-xs font-normal">{product.category}</Badge> 
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between p-4 pt-2"> 
        <p className="text-lg font-semibold text-foreground">${product.price.toFixed(2)}</p>
        <Button
          variant="outline"
          size="icon"
          className="relative z-10 h-9 w-9 shrink-0"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}