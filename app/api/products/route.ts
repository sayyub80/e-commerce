import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product, { IProductSchema } from '@/lib/models/Product';
import auth from '@/lib/auth';
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb'; 

function slugify(str: string) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function makeUniqueSlug(name: string): Promise<string> {
    const base = slugify(name || 'product');
    let slug = base;
    let counter = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const existing = await Product.findOne({ slug }).lean();
        if (!existing) {
            break;
        }
        counter++;
        slug = `${base}-${counter}`;
    }
    return slug;
}

export async function GET(request: NextRequest) { 
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limitParam = searchParams.get('limit');
    const excludeId = searchParams.get('exclude');

    const query: mongoose.FilterQuery<IProductSchema> = {}; 

    if (category) {
      query.category = category; // Add category filter if provided
    }

    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) }; // Add exclusion filter
    }

    let limit = 0; // Default: no limit
    if (limitParam) {
        const parsedLimit = parseInt(limitParam, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            limit = parsedLimit; // Set limit if valid number
        }
    }

    const productsQuery = Product.find(query).sort({ createdAt: -1 });

    if (limit > 0) {
        productsQuery.limit(limit); // Apply limit if specified
    }

    const products = await productsQuery.lean();

    return NextResponse.json(products);
  } catch (error: unknown) {
    console.error('GET /api/products error:', error);
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();

    if (!body.name || body.price === undefined || body.price === null || !body.description || !body.category || body.inventory === undefined || body.inventory === null) {
      return NextResponse.json({ message: 'Missing required fields: name, price, description, category, inventory' }, { status: 400 });
    }

    const price = Number(body.price);
    const inventory = Number(body.inventory);

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ message: 'Price must be a non-negative number', field: 'price' }, { status: 400 });
    }
    if (isNaN(inventory) || inventory < 0 || !Number.isInteger(inventory)) {
        return NextResponse.json({ message: 'Inventory must be a non-negative whole number', field: 'inventory' }, { status: 400 });
    }

    const slug = await makeUniqueSlug(body.name);

    const productData: Partial<IProductSchema> = {
      name: body.name.trim(),
      slug: slug,
      description: body.description.trim(),
      price: price,
      category: body.category.trim(),
      inventory: inventory,
      imageUrl: typeof body.imageUrl === 'string' && body.imageUrl.trim() ? body.imageUrl.trim() : undefined,
    };

    const newProduct = new Product(productData);
    await newProduct.validate();
    const savedProduct = await newProduct.save();

    return NextResponse.json(savedProduct, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors: Record<string, string> = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      console.warn('Product validation failed:', errors);
      return NextResponse.json({ message: 'Validation Error', errors }, { status: 400 });
    }

  
    if (error instanceof MongoServerError && error.code === 11000) {
       
       const field = Object.keys(error.keyPattern)[0];
       console.warn(`Duplicate key error for field: ${field}`);
       return NextResponse.json({
         message: `A product with this ${field} may already exist.`
       }, { status: 400 });
    }
    

    console.error('POST /api/products unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown server error during product creation';
    return NextResponse.json({ message }, { status: 500 });
  }
}