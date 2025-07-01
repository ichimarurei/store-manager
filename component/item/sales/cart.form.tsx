import { formatRp, pickUnitDetail } from '@/lib/client.action';
import '@/styles/_primereact.scss';
import { OrderList } from 'primereact/orderlist';
import { useEffect, useState } from 'react';
import ItemEditor from './item.edit.overlay';

const PriceList = ({ cost, discount = 0 }: { cost: number; discount?: number }) => (
    <>
        <div className="flex align-items-center gap-2">
            <span className={`font-bold text-900${discount > 0 ? ' line-through' : ''}`}>{formatRp(cost || 0)}</span>
        </div>
        {discount > 0 && (
            <div className="flex align-items-center gap-2">
                <span className="font-bold text-900">{formatRp(cost || 0, discount)}</span>
                <span>( {discount} % )</span>
            </div>
        )}
    </>
);

const CartForm = ({ selected, setSelected }: { selected: any[]; setSelected: (value: any[]) => void }) => {
    const [pay, setPay] = useState(0);

    const renderItem = (product: any) => (
        <div className="flex flex-column flex-wrap gap-2 mb-5">
            <span className="font-bold">{product?.item?.name ?? ''}</span>
            <div className="flex align-items-center gap-2">
                <span className="font-bold text-900">{product?.sales?.qty ?? 0}</span>
                <span>{pickUnitDetail(product?.item, product?.sales?.unit)?.name ?? ''}</span>
                {product?.bonus?.qty > 0 && (
                    <span className="text-sm">
                        ( +{product?.bonus?.qty ?? 0} {pickUnitDetail(product?.item, product?.bonus?.unit)?.name ?? ''} )
                    </span>
                )}
            </div>
            <PriceList cost={product?.cost ?? 0} discount={product?.discount ?? 0} />
            <ItemEditor product={product} selected={selected} setSelected={setSelected} />
        </div>
    );

    useEffect(() => {
        let price = 0;

        selected.forEach(({ cost, discount }) => {
            price += discount > 0 ? cost - (discount / 100) * cost : cost;
        });

        setPay(price);
    }, [selected]);

    return (
        <div className="card">
            <h5>Keranjang Barang Keluar</h5>
            <p>
                {selected.length > 0 && <mark>{selected.length}</mark>} {selected.length > 0 ? 'barang' : 'Barang'} yang akan dikeluarkan/dijual
            </p>
            <hr />
            <p className="text-4xl font-bold text-right mt-5">{formatRp(pay)}</p>
            <OrderList filter dataKey="key" value={selected} onChange={(e) => setSelected(e.value)} filterBy="label" itemTemplate={renderItem} />
        </div>
    );
};

export default CartForm;
