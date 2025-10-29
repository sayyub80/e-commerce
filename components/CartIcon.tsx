"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import { selectTotalItems } from "@/store/cartSlice";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function CartIcon() {
  const totalItemsFromStore = useSelector(selectTotalItems); // <-- Get count from Redux store

  // Use state to prevent hydration mismatch
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Sync state only on client
    setCartItemCount(totalItemsFromStore);
  }, [totalItemsFromStore]);

  return (
    <Link
      href="/cart"
      className="relative rounded-md p-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ShoppingCart className="h-6 w-6 text-foreground/80 group-hover:text-foreground" />
      {cartItemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold"
        >
          {cartItemCount > 9 ? "9+" : cartItemCount} {/* Cap count display */}
        </Badge>
      )}
      <span className="sr-only">View Cart ({cartItemCount} items)</span>
    </Link>
  );
}
