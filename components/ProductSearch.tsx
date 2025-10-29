
'use client';

import { useState } from 'react';
import { IProduct } from '@/types';
import { Input } from '@/components/ui/input';
import { ProductCard } from './ProductCard'; 

interface Props {
  products: IProduct[];
}

export function ProductSearch({ products }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-xl"> 
         <Input
           type="search" 
           placeholder="Search products..."
           className="w-full"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           aria-label="Search products"
         />
      </div>


      {filteredProducts.length === 0 ? (
        <div className="pt-10 text-center text-muted-foreground">
          <p className="text-lg">No products found matching &quot;{searchTerm}&quot;.</p>
          <p className="text-sm">Try searching for something else.</p>
        </div>
      ) : (
         
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}