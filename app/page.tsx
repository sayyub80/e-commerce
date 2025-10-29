import dbConnect from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/types";
import { ProductSearch } from "@/components/ProductSearch";

async function getProducts(): Promise<IProduct[]> {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="  space-y-8 md:space-y-12">
      {" "}
      <div className="text-center">
       
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
          {" "}
          Explore Our Collection
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          {" "}
          {/* Adjusted margin and max-width */}
          Discover the latest trends and top-quality products.
        </p>
      </div>
      <div>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-center sm:text-left">
          New Arrivals
        </h2>
        {/* Pass products to the client component */}
        <ProductSearch products={products} />
      </div>
    </div>
  );
}
