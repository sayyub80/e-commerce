import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { IProduct } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WishlistButton } from './components/WishlistButton'; // Client Component

// A Server Component fetching data
async function getRecommendedProducts(): Promise<IProduct[]> {
  await dbConnect();
  // Fetch 4 random products (simple recommendation logic)
  const products = await Product.aggregate([{ $sample: { size: 4 } }]);
  return JSON.parse(JSON.stringify(products));
}

export default async function RecommendationsPage() {
  const products = await getRecommendedProducts();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recommended For You</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product._id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>${product.price.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {product.description}
              </p>
            </CardContent>
            <div className="p-4 pt-0">
              {/* This is the hybrid part:
                The product data is from the Server Component,
                but the button is an interactive Client Component.
              */}
              <WishlistButton productId={product._id} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}