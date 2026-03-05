import React, { useState, useRef, useEffect } from 'react';
import { ViewType, User } from '../types';
import { ChevronDownIcon } from './icons';

interface DropdownItem {
    view: ViewType;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
}

interface DropdownProps {
    label: string;
    icon: React.ReactNode;
    items: DropdownItem[];
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
    currentUser: User;
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    icon,
    items,
    currentView,
    onNavigate,
    currentUser,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter items based on user role
    const filteredItems = items.filter(
        (item) => !item.adminOnly || currentUser.role === 'ADMIN'
    );

    // Check if any item in this dropdown is currently active
    const isActive = filteredItems.some((item) => item.view === currentView);

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

    const handleItemClick = (view: ViewType) => {
        onNavigate(view);
        setIsOpen(false);
    };

    const buttonClasses = isActive
        ? "flex items-center space-x-2 bg-laundry-teal-100 dark:bg-laundry-teal-500/20 border border-laundry-teal-300 dark:border-laundry-teal-500/30 text-laundry-teal-800 dark:text-laundry-teal-200 font-bold py-2 px-3 md:px-4 rounded-lg shadow-inner transition-all"
        : "flex items-center space-x-2 bg-laundry-blue-100 hover:bg-laundry-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-laundry-blue-800 dark:text-slate-200 font-semibold py-2 px-3 md:px-4 rounded-lg shadow-sm hover:shadow-md transition-all";

    return (
        <div className="relative z-[9999]" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={buttonClasses}
                title={label}
                aria-label={label}
                aria-expanded={isOpen}
            >
                <span className="w-5 h-5">{icon}</span>
                <span className="hidden md:inline">{label}</span>
                <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-laundry-blue-200 dark:border-slate-700 min-w-[200px] z-[9999] overflow-hidden">
                    {filteredItems.map((item) => {
                        const isItemActive = item.view === currentView;
                        const itemClasses = isItemActive
                            ? "flex items-center space-x-3 px-4 py-3 bg-laundry-teal-50 dark:bg-laundry-teal-500/10 text-laundry-teal-800 dark:text-laundry-teal-200 font-semibold border-l-4 border-laundry-teal-500"
                            : "flex items-center space-x-3 px-4 py-3 hover:bg-laundry-blue-50 dark:hover:bg-slate-700 text-laundry-blue-800 dark:text-slate-200 transition-colors";

                        return (
                            <button
                                key={item.view}
                                type="button"
                                onClick={() => handleItemClick(item.view)}
                                className={`${itemClasses} w-full text-left`}
                                title={item.label}
                            >
                                <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
