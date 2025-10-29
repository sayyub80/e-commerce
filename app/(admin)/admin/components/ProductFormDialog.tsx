'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { productSchema, ProductFormData, ProductApiPayload } from '@/lib/validators'; // Import new type
import { IProduct } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  product: IProduct | null;
  onSuccess: () => void;
}


export function ProductFormDialog({
  isOpen,
  setIsOpen,
  product,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = product !== null;

  // useForm uses ProductFormData (price/inventory are strings here)
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '', // Default as string
      category: '',
      inventory: '', // Default as string
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        form.reset({
          name: product.name,
          description: product.description,
          // Convert numbers back to string for the form inputs
          price: String(product.price),
          category: product.category,
          inventory: String(product.inventory),
          imageUrl: product.imageUrl || '',
        });
      } else {
        form.reset({
          name: '',
          description: '',
          price: '',
          category: '',
          inventory: '',
          imageUrl: '',
        });
      }
    }
  }, [product, form, isOpen]);

  // onSubmit receives validated data (price/inventory are strings)
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    // Convert price/inventory strings to numbers *after* validation
    const payload: ProductApiPayload = {
      ...data,
      price: parseFloat(data.price),
      inventory: parseInt(data.inventory, 10),
      imageUrl: data.imageUrl === '' ? undefined : data.imageUrl,
    };

    // Double check conversion results (optional safeguard)
    if (isNaN(payload.price) || isNaN(payload.inventory)) {
        toast.error("Invalid price or inventory value entered.");
        setIsSubmitting(false);
        return;
    }


    const url = isEditMode ? `/api/products/${product?._id}` : '/api/products';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Send payload with numbers
      });

      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = errorData.message || 'An unknown error occurred';
        if (errorData.errors) {
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('; ');
          errorMessage = `Validation Error: ${fieldErrors}`;
        }
        throw new Error(errorMessage);
      }
      toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error((error as Error).message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
           <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
           <DialogDescription>{isEditMode ? 'Make changes to product details.' : 'Fill in the details for the new product.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             {/* Fields remain largely the same, accepting string inputs */}
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Product Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the product..." {...field} rows={4}/></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="text" inputMode="decimal" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="inventory" render={({ field }) => (<FormItem><FormLabel>Inventory</FormLabel><FormControl><Input type="text" inputMode="numeric" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Electronics" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>)} />
            <DialogFooter className="pt-4">
               <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
               <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Product'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}