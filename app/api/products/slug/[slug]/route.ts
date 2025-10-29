import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import mongoose from 'mongoose';

/**
 * GET /api/products/slug/[slug]
 * Fetches a single product by its unique slug.
 * Note: In Next.js 15+, params is now a Promise and must be awaited.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { slug } = await context.params;

    if (!slug) {
      console.error('API route /api/products/slug/[slug] called without slug parameter.');
      return NextResponse.json({ message: 'Slug parameter is missing' }, { status: 400 });
    }

    await dbConnect();

    const product = await Product.findOne({ slug: slug }).lean();

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);

  } catch (error: unknown) {
    console.error(`Error fetching product:`, error);
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ message: message }, { status: 500 });
  }
}