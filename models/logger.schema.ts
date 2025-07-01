import mongoose, { Document, Schema } from 'mongoose';

const Logger: Schema = new Schema({
    date: { type: Date, required: false, default: new Date() },
    log: { type: Object, required: true }
});

export interface LoggerDocument extends Document {
    log: any;
}

export default mongoose.models.Logger ?? mongoose.model<LoggerDocument>('Logger', Logger);
