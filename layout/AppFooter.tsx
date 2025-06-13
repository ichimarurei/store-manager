import { useStateStore } from '@/state/store';

const AppFooter = () => {
    const { version } = useStateStore();

    return (
        <div className="layout-footer">
            <img src="/images/logo.png" alt="Logo" height="20" className="mr-2" /> powered by{' '}
            <span className="font-medium ml-2">
                {version.name} {version.tag}
            </span>
        </div>
    );
};

export default AppFooter;
