"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
  updateQuantity,
  removeItem,
} from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectTotalItems);
  const totalPrice = useSelector(selectTotalPrice);

  const handleQuantityChange = (
    productId: string,
    currentQuantity: number,
    change: number,
    inventory: number
  ) => {
    const newQuantity = currentQuantity + change;
    // Clamp between 1 and inventory before dispatching
    const clampedQuantity = Math.max(1, Math.min(newQuantity, inventory));
    if (clampedQuantity !== currentQuantity) {
      dispatch(updateQuantity({ productId, quantity: clampedQuantity }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    productId: string,
    inventory: number
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const clampedQuantity = Math.max(1, Math.min(value, inventory));
      dispatch(updateQuantity({ productId, quantity: clampedQuantity }));
    } else if (e.target.value === "") {
      // If input is cleared, default to 1
      dispatch(updateQuantity({ productId, quantity: 1 }));
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    dispatch(removeItem(productId));
    toast.error(`${productName} removed from cart.`);
  };

  const handleCheckout = () => {
    // In a real app, redirect to a checkout page/process
    toast.info("Proceeding to checkout (not implemented)");
    console.log("Proceeding to checkout with items:", cartItems);
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              Looks like you have not added anything yet.
            </p>
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <Card
                key={item._id}
                className="flex flex-col overflow-hidden sm:flex-row"
              >
                {/* Image */}
                <div className="relative aspect-square h-32 w-full flex-shrink-0 bg-muted sm:h-auto sm:w-32">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details and Actions */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.category}
                    </p>
                    <p className="mt-1 font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center rounded-md border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            item.quantity,
                            -1,
                            item.inventory
                          )
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.inventory}
                        value={item.quantity}
                        onChange={(e) =>
                          handleInputChange(e, item._id, item.inventory)
                        }
                        className="h-8 w-12 rounded-none border-x border-y-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            item.quantity,
                            1,
                            item.inventory
                          )
                        }
                        disabled={item.quantity >= item.inventory}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(item._id, item.name)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.quantity >= item.inventory && item.inventory > 0 && (
                    <p className="mt-2 text-xs text-yellow-600">
                      Max quantity ({item.inventory}) reached.
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              {" "}
              {/* Make summary sticky */}
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                {/* Add Shipping/Tax estimates here if needed */}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
