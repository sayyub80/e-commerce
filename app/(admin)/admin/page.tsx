'use client';

import { useEffect, useState } from 'react';
import { IProduct } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormDialog } from './components/ProductFormDialog';

export default function AdminPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const onFormSuccess = () => {
    fetchProducts(); // Refresh the table
    setIsDialogOpen(false); // Close the dialog
    setSelectedProduct(null); // Clear selection
  };

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Button onClick={handleNewProduct}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <Card>
        <CardContent className="px-3 ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.inventory}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        product={selectedProduct}
        onSuccess={onFormSuccess}
      />
    </div>
  );
}