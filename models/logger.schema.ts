import mongoose, { Document, Schema, Types } from 'mongoose';

const Logger: Schema = new Schema({
    key: { type: Types.ObjectId, unique: true, required: true },
    log: { type: Object, required: true },
    date: { type: Date, required: false, default: new Date() }
});

export interface LoggerDocument extends Document {
    key: string;
    log: any;
}

export default mongoose.models.Logger ?? mongoose.model<LoggerDocument>('Logger', Logger);
