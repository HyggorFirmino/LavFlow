import React, { useState, useRef, useEffect } from 'react';
import { Store } from '../types';
import { ChevronDownIcon, BuildingStorefrontIcon } from './icons';

interface StoreSelectorProps {
    stores: Store[];
    selectedStoreId: string;
    onSelectStore: (storeId: string) => void;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({
    stores,
    selectedStoreId,
    onSelectStore,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedStore = stores.find(s => String(s.id) === selectedStoreId);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (storeId: string) => {
        onSelectStore(storeId);
        setIsOpen(false);
    };

    return (
        <div className="relative z-[10]" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-laundry-blue-300 dark:border-slate-600 text-laundry-blue-800 dark:text-slate-200 font-semibold py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-laundry-teal-500"
                title="Selecionar Loja"
            >
                <BuildingStorefrontIcon className="w-5 h-5 text-laundry-teal-600 dark:text-laundry-teal-400" />
                <span className="hidden md:inline truncate max-w-[150px]">
                    {selectedStore ? selectedStore.name : 'Selecione a Loja'}
                </span>
                <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-laundry-blue-200 dark:border-slate-700 min-w-[220px] z-[10] overflow-hidden">
                    <div className="py-1 max-h-60 overflow-y-auto">
                        {stores.map((store) => {
                            const isActive = String(store.id) === selectedStoreId;
                            const itemClasses = isActive
                                ? "flex items-center justify-between px-4 py-3 bg-laundry-teal-50 dark:bg-laundry-teal-500/10 text-laundry-teal-800 dark:text-laundry-teal-200 font-semibold border-l-4 border-laundry-teal-500"
                                : "flex items-center justify-between px-4 py-3 hover:bg-laundry-blue-50 dark:hover:bg-slate-700 text-laundry-blue-800 dark:text-slate-200 transition-colors border-l-4 border-transparent";

                            return (
                                <button
                                    key={store.id}
                                    type="button"
                                    onClick={() => handleSelect(String(store.id))}
                                    className={`${itemClasses} w-full text-left`}
                                >
                                    <span className="truncate">{store.name}</span>
                                    {isActive && <span className="w-2 h-2 rounded-full bg-laundry-teal-500 ml-2"></span>}
                                </button>
                            );
                        })}
                        {stores.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                Nenhuma loja encontrada
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreSelector;
