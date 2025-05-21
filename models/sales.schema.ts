import mongoose, { Document, Schema, Types } from 'mongoose';
import { Author, IAuthor } from './author';

const ItemQty: Schema = new Schema(
    {
        unit: { type: Types.ObjectId, required: true, ref: 'Unit' },
        qty: { type: Number, required: true }
    },
    { _id: false }
);

const ItemReference: Schema = new Schema(
    {
        discount: { type: Number, required: false, default: 0 }, // from supplier
        unitQty: { type: ItemQty, required: true, _id: false },
        cost: { type: Number, required: true },
        sum: { type: Number, required: true },
        profit: { type: Number, required: true }
    },
    { _id: false }
);

const Item: Schema = new Schema(
    {
        product: { type: Types.ObjectId, required: true, ref: 'Product' },
        salesQty: { type: ItemQty, required: true, _id: false },
        bonusQty: { type: ItemQty, required: false, default: null, _id: false },
        price: { type: Number, required: true },
        discount: { type: Number, required: false, default: 0 },
        reference: { type: ItemReference, required: true, _id: false }
    },
    { _id: false }
);

const Sales: Schema = new Schema({
    reference: { type: String, required: false, default: '' }, // source document | reference of the document
    customer: { type: Types.ObjectId, required: false, ref: 'Customer', default: null },
    products: { type: [Item], required: true, default: [], _id: false },
    subPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    paid: { type: Number, required: true },
    change: { type: Number, required: false, default: 0 },
    tax: { type: Number, required: false, default: 0 },
    scheduled: { type: Date, required: false, default: null },
    author: { type: Author, required: true, _id: false }
});

interface IItemQty {
    unit: Types.ObjectId;
    qty: number;
}

interface IItemReference {
    discount?: number;
    unitQty: IItemQty;
    cost: number;
    sum: number;
    profit: number;
}

interface IItem {
    product: Types.ObjectId;
    salesQty: IItemQty;
    bonusQty?: IItemQty;
    price: number;
    discount?: number;
    reference: IItemReference;
}

export interface SalesDocument extends Document {
    reference?: string;
    customer?: Types.ObjectId;
    products: IItem[];
    subPrice: number;
    finalPrice: number;
    paid: number;
    change?: number;
    tax?: number;
    scheduled?: Date;
    author: IAuthor;
}

export default mongoose.models.Sales || mongoose.model<SalesDocument>('Sales', Sales);
