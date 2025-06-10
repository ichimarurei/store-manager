import handshakeDB from '@/lib/mongo';
import { createDefaultResponse, createErrorResponse } from '@/lib/server.action';
import productSchema, { ProductDocument } from '@/models/product.schema';
import receiptSchema, { ReceiptDocument } from '@/models/receipt.schema';
import salesSchema, { SalesDocument } from '@/models/sales.schema';
import { NextRequest } from 'next/server';

const isBundleUnitMatching = (item: ProductDocument, unit: string): boolean => (item?.bundle?.node ? String(item.bundle.node?.unit) === unit : false);

const calculateQty = (item: ProductDocument, unit: string, qty: number) => {
    if (isBundleUnitMatching(item, unit)) {
        return qty * (item.bundle?.contain?.amount || 1);
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
                }

                inventories[String(product)] += calculateQty(item, String(unit), qty);
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
                inventories[String(product)] -= calculateQty(item, String(salesQty.unit), salesQty.qty);

                if (bonusQty) {
                    inventories[String(product)] -= calculateQty(item, String(bonusQty?.unit), bonusQty?.qty || 0);
                }
            }
        })
    );

    return inventories;
};

export async function GET(_: NextRequest) {
    let response: Response = createDefaultResponse();

    try {
        await handshakeDB();
        const items = await productSchema.find().sort({ name: 'asc' }).select('-__v').lean<ProductDocument[]>();
        const receipts = await receiptSchema.find().sort({ date: 'asc' }).select('-__v').lean<ReceiptDocument[]>();
        const sales = await salesSchema.find().sort({ date: 'asc' }).select('-__v').lean<SalesDocument[]>();
        const inbound = processReceipt(items, receipts, {});
        const inventories = processSales(items, sales, inbound);

        for (const key in inventories) {
            await productSchema.findOneAndUpdate({ _id: key }, { inventory: inventories?.[key] || 0 }, { new: true, lean: true }).lean<ProductDocument>();
        }

        response = Response.json({ inventories }, { status: 200 });
    } catch (error) {
        response = createErrorResponse(error);
    }

    return response;
}
