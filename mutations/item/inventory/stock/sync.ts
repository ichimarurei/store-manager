import handshakeDB from '@/lib/mongo';
import loggerSchema from '@/models/logger.schema';
import productSchema, { ProductDocument } from '@/models/product.schema';
import receiptSchema, { ReceiptDocument } from '@/models/receipt.schema';
import salesSchema, { SalesDocument } from '@/models/sales.schema';
import { isEmpty } from 'lodash';
import { console } from 'node:inspector/promises';

const isBundleUnitMatching = (item: ProductDocument, unit: string): boolean => (item?.bundle?.node ? String(item.bundle.node?.unit) === unit : false);

const calculateQty = (item: ProductDocument, unit: string, qty: number) => {
    if (isBundleUnitMatching(item, unit)) {
        return qty * (item.bundle?.contain?.amount ?? 1);
    }

    return qty;
};

const countDiscount = (cost: number, discount?: number) => (!discount ? cost : cost - (cost * discount) / 100);

const processReceipt = (items: ProductDocument[], receipts: ReceiptDocument[]) => {
    const prices: any = {};
    const inventories: any = {};

    receipts.forEach(({ products }) =>
        products.forEach(({ product, qty, unit, cost, discount }) => {
            const item = items.find(({ _id }) => String(_id) === String(product));

            if (item) {
                const qtyConverted = calculateQty(item, String(unit), qty);
                const unitPrice = !cost ? 0 : Math.ceil(countDiscount(cost, discount) / qtyConverted);

                if (!inventories[String(product)]) {
                    inventories[String(product)] = qtyConverted;
                } else {
                    inventories[String(product)] += qtyConverted;
                }

                if (!prices[String(product)]) {
                    prices[String(product)] = [unitPrice];
                } else {
                    prices[String(product)].push(unitPrice);
                }
            }
        })
    );

    return { inventories, prices };
};

const processSales = (items: ProductDocument[], sales: SalesDocument[], inventories: any) => {
    sales.forEach(({ products }) =>
        products.forEach(({ product, salesQty, bonusQty }) => {
            const item = items.find(({ _id }) => String(_id) === String(product));

            if (item) {
                inventories[String(product)] -= calculateQty(item, String(salesQty.unit), salesQty.qty);

                if (bonusQty) {
                    inventories[String(product)] -= calculateQty(item, String(bonusQty?.unit), bonusQty?.qty ?? 0);
                }
            }
        })
    );

    return inventories;
};

const processUpdating = async (items: ProductDocument[], receipts: ReceiptDocument[], sales: SalesDocument[]) => {
    const inbound = processReceipt(items, receipts);
    const prices = inbound.prices;
    const inventories = processSales(items, sales, inbound.inventories);

    for (const key in inventories) {
        const existing = items.find(({ _id }) => String(_id) === String(key));
        const cost = [];

        if ((existing?.initialCost ?? 0) > 0) {
            cost.push(0);
            cost.push(existing?.initialCost ?? 0);
        } else if (prices[key]) {
            (prices[key] as number[]).sort((a, b) => a - b);

            if (prices[key].length > 1) {
                cost.push(prices[key][0]);
                cost.push(prices[key][prices[key].length - 1]);
            } else {
                cost.push(0);
                cost.push(prices[key][0]);
            }
        }

        if (isEmpty(cost)) {
            cost.push(0);
            cost.push(0);
        }

        await loggerSchema.findOneAndUpdate({ key }, { log: { inventory: inventories?.[key] ?? 0, cost }, key }, { new: true, lean: true, upsert: true });
        await productSchema.findOneAndUpdate({ _id: key }, { inventory: inventories?.[key] ?? 0, cost }, { new: true, lean: true }).lean<ProductDocument>();
    }
};

export const syncStock = async () => {
    let synced = false;

    try {
        await handshakeDB();
        const items = await productSchema.find().sort({ name: 'asc' }).select('-__v').lean<ProductDocument[]>();
        const receipts = await receiptSchema.find().sort({ date: 'asc' }).select('-__v').lean<ReceiptDocument[]>();
        const sales = await salesSchema.find().sort({ date: 'asc' }).select('-__v').lean<SalesDocument[]>();
        await processUpdating(items, receipts, sales);
        synced = true;
    } catch (_) {
        console.error(_);
    }

    return { synced };
};

export const syncStockByIds = async (_ids: string[]) => {
    let synced = false;

    try {
        await handshakeDB();
        const items = await productSchema
            .find({ _id: { $in: _ids } })
            .sort({ name: 'asc' })
            .select('-__v')
            .lean<ProductDocument[]>();
        const receipts = await receiptSchema
            .find({ 'products.product': { $in: _ids } })
            .sort({ date: 'asc' })
            .select('-__v')
            .lean<ReceiptDocument[]>();
        const sales = await salesSchema
            .find({ 'products.product': { $in: _ids } })
            .sort({ date: 'asc' })
            .select('-__v')
            .lean<SalesDocument[]>();
        await processUpdating(items, receipts, sales);
        synced = true;
    } catch (_) {
        console.error(_);
    }

    return { synced };
};
