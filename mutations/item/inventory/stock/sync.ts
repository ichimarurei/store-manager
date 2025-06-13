import handshakeDB from '@/lib/mongo';
import productSchema, { ProductDocument } from '@/models/product.schema';
import receiptSchema, { ReceiptDocument } from '@/models/receipt.schema';
import salesSchema, { SalesDocument } from '@/models/sales.schema';
import { console } from 'node:inspector/promises';

const isBundleUnitMatching = (item: ProductDocument, unit: string): boolean => (item?.bundle?.node ? String(item.bundle.node?.unit) === unit : false);

const calculateQty = (item: ProductDocument, unit: string, qty: number) => {
    if (isBundleUnitMatching(item, unit)) {
        return qty * (item.bundle?.contain?.amount ?? 1);
    }

    return qty;
};

const processReceipt = (items: ProductDocument[], receipts: ReceiptDocument[], inventories: any) => {
    receipts.forEach(({ products }) =>
        products.forEach(({ product, qty, unit }) => {
            const item = items.find(({ _id }) => String(_id) === String(product));

            if (item) {
                if (!inventories[String(product)]) {
                    inventories[String(product)] = calculateQty(item, String(unit), qty);
                } else {
                    inventories[String(product)] += calculateQty(item, String(unit), qty);
                }
            }
        })
    );

    return inventories;
};

const processSales = (items: ProductDocument[], sales: SalesDocument[], inventories: any) => {
    sales.forEach(({ products }) =>
        products.forEach(({ product, salesQty, bonusQty }) => {
            const item = items.find(({ _id }) => String(_id) === String(product));

            if (item) {
                if (bonusQty) {
                    inventories[String(product)] -= calculateQty(item, String(bonusQty?.unit), bonusQty?.qty ?? 0);
                } else {
                    inventories[String(product)] -= calculateQty(item, String(salesQty.unit), salesQty.qty);
                }
            }
        })
    );

    return inventories;
};

export const syncStock = async () => {
    let inventories: any | null = null;

    try {
        await handshakeDB();
        const items = await productSchema.find().sort({ name: 'asc' }).select('-__v').lean<ProductDocument[]>();
        const receipts = await receiptSchema.find().sort({ date: 'asc' }).select('-__v').lean<ReceiptDocument[]>();
        const sales = await salesSchema.find().sort({ date: 'asc' }).select('-__v').lean<SalesDocument[]>();
        const inbound = processReceipt(items, receipts, {});
        inventories = processSales(items, sales, inbound);

        for (const key in inventories) {
            await productSchema.findOneAndUpdate({ _id: key }, { inventory: inventories?.[key] ?? 0 }, { new: true, lean: true }).lean<ProductDocument>();
        }
    } catch (_) {
        console.error(_);
    }

    return inventories;
};

export const syncStockByIds = async (_ids: string[]) => {
    let inventories: any | null = null;

    try {
        await handshakeDB();
        const items = await productSchema
            .find({ _id: { $in: _ids } })
            .sort({ name: 'asc' })
            .select('-__v')
            .lean<ProductDocument[]>();
        const receipts = await receiptSchema.find().sort({ date: 'asc' }).select('-__v').lean<ReceiptDocument[]>();
        const sales = await salesSchema.find().sort({ date: 'asc' }).select('-__v').lean<SalesDocument[]>();
        const inbound = processReceipt(items, receipts, {});
        inventories = processSales(items, sales, inbound);

        for (const key in inventories) {
            await productSchema.findOneAndUpdate({ _id: key }, { inventory: inventories?.[key] ?? 0 }, { new: true, lean: true }).lean<ProductDocument>();
        }
    } catch (_) {
        console.error(_);
    }

    return inventories;
};
