import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product, { IProductSchema } from '@/lib/models/Product';
import auth from '@/lib/auth';
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';

interface MongooseUpdateObject {
  $set?: Partial<IProductSchema>;
  $unset?: Record<string, 1>;
}

/**
 * GET /api/products/[id]
 * Fetches a single product by its MongoDB ObjectId.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  let idForErrorLog = '[unknown]';

  try {
    const { id } = await context.params;
    idForErrorLog = id ?? '[missing]';

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid or missing product ID format' }, { status: 400 });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);

  } catch (error: unknown) {
    if (error instanceof Error && !(error instanceof MongoServerError) && !(error instanceof mongoose.Error)) {
      console.error("Error resolving params in GET:", error);
      return NextResponse.json({ message: 'Error resolving request parameters' }, { status: 400 });
    }
    console.error(`GET /api/products/${idForErrorLog} error:`, error);
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/**
 * PUT /api/products/[id]
 * Updates a product by its MongoDB ObjectId (admin only).
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  let idForErrorLog = '[unknown]';

  try {
    const { id } = await context.params;
    idForErrorLog = id ?? '[missing]';

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid or missing product ID format' }, { status: 400 });
    }

    const body = await request.json();
    const updatePayload: Partial<IProductSchema> = {};
    const unsetFields: Record<string, 1> = {};

    const stringFields: (keyof Pick<IProductSchema, 'name' | 'description' | 'category'>)[] = ['name', 'description', 'category'];
    for (const key of stringFields) {
      if (typeof body[key] === 'string') {
        updatePayload[key] = body[key].trim();
      }
    }

    if (body.price !== undefined && body.price !== null) {
      const price = Number(body.price);
      if (!isNaN(price) && price >= 0) {
        updatePayload.price = price;
      } else {
        return NextResponse.json({ message: 'Price must be a non-negative number', field: 'price' }, { status: 400 });
      }
    }

    if (body.inventory !== undefined && body.inventory !== null) {
      const inventory = Number(body.inventory);
      if (!isNaN(inventory) && inventory >= 0 && Number.isInteger(inventory)) {
        updatePayload.inventory = inventory;
      } else {
        return NextResponse.json({ message: 'Inventory must be a non-negative whole number', field: 'inventory' }, { status: 400 });
      }
    }

    if (body.imageUrl === null || body.imageUrl === '') {
      unsetFields.imageUrl = 1;
      delete updatePayload.imageUrl;
    } else if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
      updatePayload.imageUrl = body.imageUrl.trim();
    }

    const finalUpdate: MongooseUpdateObject = {};
    if (Object.keys(updatePayload).length > 0) {
      finalUpdate.$set = updatePayload;
    }
    if (Object.keys(unsetFields).length > 0) {
      finalUpdate.$unset = unsetFields;
    }

    if (Object.keys(finalUpdate).length === 0) {
      const existingProduct = await Product.findById(id).lean();
      if (!existingProduct) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(existingProduct);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      finalUpdate,
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(updatedProduct);

  } catch (error: unknown) {
    if (error instanceof Error && !(error instanceof MongoServerError) && !(error instanceof mongoose.Error)) {
      console.error("Error resolving params in PUT:", error);
      return NextResponse.json({ message: 'Error resolving request parameters' }, { status: 400 });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const errors: Record<string, string> = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      console.warn(`Product update validation failed for ID ${idForErrorLog}:`, errors);
      return NextResponse.json({ message: 'Validation Error', errors }, { status: 400 });
    }

    if (error instanceof MongoServerError && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.warn(`Duplicate key error during update for field: ${field}`);
      return NextResponse.json({
        message: `Update failed: A product with this ${field} may already exist.`
      }, { status: 400 });
    }

    console.error(`PUT /api/products/${idForErrorLog} unexpected error:`, error);
    const message = error instanceof Error ? error.message : 'Unknown server error during product update';
    return NextResponse.json({ message }, { status: 500 });
  }
}