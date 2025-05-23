import mongoose, { Document, Schema, Types } from 'mongoose';
import { Author, IAuthor } from './author';
import { Bundling, IBundling } from './bundling';

const Product: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: Types.ObjectId, ref: 'Category', required: true },
    unit: { type: Types.ObjectId, ref: 'Unit', required: true },
    cost: { type: Number, required: true },
    discount: { type: Number, required: false, default: 0 },
    bundle: { type: Bundling, required: false, default: null, _id: false },
    images: { type: [String], required: false, default: '' },
    author: { type: Author, required: true, _id: false }
});

export interface ProductDocument extends Document {
    name: string;
    category: Types.ObjectId;
    unit: Types.ObjectId;
    cost: number;
    discount?: number;
    bundle?: IBundling;
    images?: string[];
    author: IAuthor;
}

export default mongoose.models.Product || mongoose.model<ProductDocument>('Product', Product);
