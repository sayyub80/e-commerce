import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IProduct } from '@/types';


export const dynamic = 'force-dynamic';


async function getInventoryStats() {
  await dbConnect();
  const totalProducts = await Product.countDocuments();
  const lowStockCount = await Product.countDocuments({ inventory: { $lt: 10 } });
  const outOfStockCount = await Product.countDocuments({ inventory: 0 });
  
  const lowStockProducts = await Product.find({ 
    inventory: { $gt: 0, $lt: 10 } 
  }).sort({ inventory: 1 }).limit(5).lean();

  return {
    totalProducts,
    lowStockCount,
    outOfStockCount,
    lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)) as IProduct[],
  };
}

export default async function DashboardPage() {
  const { totalProducts, lowStockCount, outOfStockCount, lowStockProducts } =
    await getInventoryStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardHeader>
            <CardTitle>Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle>Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{outOfStockCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right font-bold text-yellow-600">
                    {product.inventory}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}