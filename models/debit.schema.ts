import mongoose, { Document, Schema, Types } from 'mongoose';
import { Author, IAuthor } from './author';
import customerSchema from './customer.schema';
import supplierSchema from './supplier.schema';

export enum DebitStatus {
    paid = 'paid',
    unpaid = 'unpaid',
    instalment = 'instalment'
}

const Debt: Schema = new Schema(
    {
        supplier: { type: Types.ObjectId, required: false, ref: supplierSchema.modelName, default: null },
        reference: { type: String, required: false, default: '' } // source document | reference of the document
    },
    { _id: false }
);

const Loan: Schema = new Schema(
    {
        customer: { type: Types.ObjectId, required: false, ref: customerSchema.modelName, default: null },
        reference: { type: String, required: false, default: '' } // source document | reference of the document
    },
    { _id: false }
);

const Instalment: Schema = new Schema(
    {
        money: { type: Number, required: true },
        remain: { type: Number, required: false, default: 0 },
        date: { type: Date, required: true }
    },
    { _id: false }
);

const Debit: Schema = new Schema({
    money: { type: Number, required: true },
    status: { type: String, enum: DebitStatus, required: false, default: DebitStatus.unpaid },
    debt: { type: Debt, required: false, default: null, _id: false },
    loan: { type: Loan, required: false, default: null, _id: false },
    instalment: { type: Instalment, required: false, default: null, _id: false },
    author: { type: Author, required: true, _id: false }
});

interface IDebt {
    supplier: Types.ObjectId;
    reference: string;
}

interface ILoan {
    customer: Types.ObjectId;
    reference: string;
}

interface IInstalment {
    money: number;
    remain?: number;
    date: Date;
}

export interface DebitDocument extends Document {
    money: number;
    status?: DebitStatus;
    debt?: IDebt;
    loan?: ILoan;
    instalment?: IInstalment;
    author: IAuthor;
}

export default mongoose.models.Debit ?? mongoose.model<DebitDocument>('Debit', Debit);
