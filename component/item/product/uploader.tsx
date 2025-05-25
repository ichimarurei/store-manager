import { FileUpload, FileUploadUploadEvent } from 'primereact/fileupload';
import { Galleria } from 'primereact/galleria';
import { Image } from 'primereact/image';
import { Toast } from 'primereact/toast';
import { SetStateAction } from 'react';

const galleriaResponsiveOptions = [
    {
        breakpoint: '1024px',
        numVisible: 5
    },
    {
        breakpoint: '960px',
        numVisible: 4
    },
    {
        breakpoint: '768px',
        numVisible: 3
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
];

const galleriaItemTemplate = (item: string) => <Image src={item} alt="Foto profil" width="250" preview />;

const FormUploader = ({ images, setImages, toast }: { images: string[]; toast: Toast | null; setImages: (value: SetStateAction<string[]>) => void }) => {
    const doneUpload = ({ xhr }: FileUploadUploadEvent) => {
        let severity: 'info' | 'warn' = 'warn';
        let summary: string = 'Gagal';
        let detail: string = 'Logo gagal diunggah';

        try {
            const images = JSON.parse(xhr.response)?.uploaded;

            if (images) {
                severity = 'info';
                summary = 'Berhasil';
                detail = 'Foto berhasil diunggah';
                setImages(images);
            }
        } catch (_) {}

        toast?.show({ severity, summary, detail, life: 3000 });
    };

    return (
        <div className="p-fluid formgrid grid gap-field-parent" style={{ marginTop: '2em' }}>
            <div className="field col-12 md:col-4">
                <label>Gambar Produk</label>
                <div className="flex justify-content-center">
                    <Galleria
                        value={images}
                        responsiveOptions={galleriaResponsiveOptions}
                        item={galleriaItemTemplate}
                        showThumbnails={false}
                        numVisible={3}
                        transitionInterval={2000}
                        style={{ maxWidth: '800px', margin: 'auto' }}
                        circular
                        autoPlay
                        showIndicators
                    />
                </div>
            </div>
            <div className="field col-12 md:col-8">
                <FileUpload
                    mode="advanced"
                    name="files"
                    url="/api/uploads/product"
                    accept="image/*"
                    chooseLabel="Pilih Gambar/Foto"
                    emptyTemplate={<p className="m-0">Drag & drop gambar ke area ini untuk mengunggah.</p>}
                    onUpload={doneUpload}
                    maxFileSize={5242880}
                    multiple
                    auto
                />
            </div>
        </div>
    );
};

export default FormUploader;
