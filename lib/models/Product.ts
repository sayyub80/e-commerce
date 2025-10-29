
import mongoose, { Schema, Document } from 'mongoose';

export interface IProductSchema extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  imageUrl?: string;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    inventory: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-generate slug from name
ProductSchema.pre<IProductSchema>('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      // remove non-word chars
      .replace(/[^\w\s-]/g, '')
      // swap spaces/underscores for dashes
      .replace(/[\s_-]+/g, '-')
      // remove leading/trailing dashes
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Avoid model re-compilation
export default mongoose.models.Product ||
  mongoose.model<IProductSchema>('Product', ProductSchema);