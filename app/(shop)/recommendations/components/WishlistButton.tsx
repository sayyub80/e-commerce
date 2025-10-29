'use client';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  productId: string;
}

export function WishlistButton({ productId }: Props) {
  const handleAddToWishlist = () => {
    console.log('Added to wishlist:', productId);
    toast.success('Added to wishlist!');
  };

  return (
    <Button variant="outline" onClick={handleAddToWishlist}>
      <Heart className="mr-2 h-4 w-4" />
      Add to Wishlist
    </Button>
  );
}