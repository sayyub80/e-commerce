"use client";

import { useEffect, useState } from "react";
import { IProduct } from "@/types";
import { Badge } from "@/components/ui/badge";
import { notFound, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Minus,
  Plus,
  ShoppingCart,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const dispatch = useDispatch();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProductAndRelated() {
      if (!slug) return;
      setLoading(true);
      setLoadingRelated(true); // Start loading related products
      setProduct(null); // Reset product state
      setRelatedProducts([]); // Reset related products state

      let fetchedProduct: IProduct | null = null;

      try {
        // Fetch main product data
        const res = await fetch(`/api/products/slug/${slug}`);
        if (!res.ok) {
          if (res.status === 404) return notFound();
          throw new Error("Failed to fetch product");
        }
        fetchedProduct = await res.json();
        setProduct(fetchedProduct);
        setQuantity(1); // Reset quantity when product loads

        // --- Fetch Related Products ---
        if (fetchedProduct) {
          try {
            // Fetch products in the same category, excluding the current one
            const relatedRes = await fetch(
              `/api/products?category=${fetchedProduct.category}&limit=4&exclude=${fetchedProduct._id}`
            );
            if (relatedRes.ok) {
              const relatedData: IProduct[] = await relatedRes.json();
              setRelatedProducts(relatedData);
            } else {
              console.error("Failed to fetch related products");
            }
          } catch (relatedError) {
            console.error("Error fetching related products:", relatedError);
          } finally {
            setLoadingRelated(false); // Finish loading related products
          }
        } else {
          setLoadingRelated(false); // Also finish if main product fetch failed
        }
        // --- End Fetch Related Products ---
      } catch (error) {
        console.error(error);
        toast.error("Could not load product details.");
      } finally {
        setLoading(false); // Finish loading main product
        if (!fetchedProduct) setLoadingRelated(false); // Ensure related loading stops if main fails
      }
    }
    fetchProductAndRelated();
  }, [slug]); // Rerun when slug changes

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    setQuantity((prev) =>
      Math.max(1, Math.min(prev + change, product.inventory))
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setQuantity(Math.max(1, Math.min(value, product.inventory)));
    } else if (e.target.value === "") {
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    dispatch(addItem({ product, quantity }));
    toast.success(`${quantity} x ${product.name} added to cart!`);
    setTimeout(() => setAddingToCart(false), 500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(addItem({ product, quantity }));
    toast.info("Redirecting to checkout...");
    console.log("Redirecting to checkout (implement navigation)");
  };

  // Main product loading state
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Main product not found state
  if (!product) {
    return (
      <div className="text-center text-muted-foreground">
        Product not found.
      </div>
    );
  }

  const isOutOfStock = product.inventory <= 0;
  const currentStock = product.inventory;

  return (
    // Wrap everything in a div to add space below for related products
    <div className="space-y-12 md:space-y-16">
      {/* Product Details Section */}
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Image */}
          <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted shadow-sm">
            {product.imageUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="mb-2 h-16 w-16" />
                <span>Image Coming Soon</span>
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                {product.name}
              </h1>
            </div>
            <p className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
            <div>
              <p
                className={cn(
                  "text-sm font-medium",
                  isOutOfStock
                    ? "text-destructive"
                    : currentStock < 10
                    ? "text-yellow-600"
                    : "text-green-600"
                )}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : currentStock < 10
                  ? `Low Stock (${currentStock} left)`
                  : "In Stock"}
              </p>
              {!isOutOfStock && (
                <p className="text-xs text-muted-foreground">
                  Max quantity: {currentStock}
                </p>
              )}
            </div>
            <Separator />
            {!isOutOfStock && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-r-none"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={product.inventory}
                    value={quantity}
                    onChange={handleInputChange}
                    className="h-9 w-14 rounded-none border-x border-y-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Quantity"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-l-none"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.inventory}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="flex-1"
              >
                {addingToCart ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                {addingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1"
              >
                Buy Now
              </Button>
            </div>
            <Separator />
            <div>
              <h2 className="mb-2 text-xl font-semibold">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {(loadingRelated || relatedProducts.length > 0) && ( // Render section if loading or has items
        <div className="mx-auto max-w-6xl">
          <Separator className="my-8 md:my-12" />
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Related Products
          </h2>
          {loadingRelated ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {/* Skeleton Loader */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border bg-card p-4"
                >
                  <div className="aspect-[4/3] w-full rounded bg-muted"></div>
                  <div className="mt-4 h-4 w-3/4 rounded bg-muted"></div>
                  <div className="mt-2 h-3 w-1/4 rounded bg-muted"></div>
                  <div className="mt-4 flex justify-between">
                    <div className="h-6 w-1/3 rounded bg-muted"></div>
                    <div className="h-9 w-9 rounded bg-muted"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          ) : null}{" "}
          {/* No message needed if empty, section just won't render fully */}
        </div>
      )}
    </div>
  );
}
