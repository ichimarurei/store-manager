import '@/styles/_primereact.scss';
import { Button } from 'primereact/button';
import { OrderList } from 'primereact/orderlist';

const getUnitName = (item: any, unit: string) => (item?._id === unit ? item?.name : null);

const pickUnit = (item: any, unit: string) => {
    let unitName = getUnitName(item.unit, unit);

    if (!unitName) {
        unitName = getUnitName(item?.bundle?.node?.unit, unit);
    }

    return unitName;
};

const CartForm = ({ selected, setSelected }: { selected: any[]; setSelected: (value: any[]) => void }) => {
    return (
        <div className="card">
            <h5>Keranjang Barang Masuk</h5>
            <p>Barang yang akan dimasukkan ke dalam faktur</p>
            <OrderList
                filter
                dataKey="key"
                value={selected}
                onChange={(e) => setSelected(e.value)}
                filterBy="label"
                itemTemplate={(product: any) => (
                    <div className="flex flex-wrap p-2 align-items-center gap-3">
                        <div className="flex-1 flex flex-column gap-2">
                            <span className="font-bold">{product.item.name}</span>
                            <div className="flex align-items-center gap-2">
                                <span className="font-bold text-900">{product?.qty || 0}</span>
                                <span>{pickUnit(product.item, product.unit)}</span>
                            </div>
                        </div>
                        <Button rounded outlined icon="pi pi-times" aria-label="Remove" severity="warning" onClick={() => setSelected(selected.filter(({ key }) => key !== product.key))} />
                    </div>
                )}
            />
        </div>
    );
};

export default CartForm;
