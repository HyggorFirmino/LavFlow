import React from 'react';
import { XMarkIcon } from './icons';

export type ModalType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: 'text-green-500 dark:text-green-400',
          borderColor: 'border-green-500',
          btnColor: 'bg-green-500 hover:bg-green-600',
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          iconColor: 'text-red-500 dark:text-red-400',
          borderColor: 'border-red-500',
          btnColor: 'bg-red-500 hover:bg-red-600',
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'warning':
      case 'confirm':
        return {
          iconColor: 'text-amber-500 dark:text-amber-400',
          borderColor: 'border-amber-500',
          btnColor: 'bg-amber-500 hover:bg-amber-600',
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      default:
        return {
          iconColor: 'text-laundry-teal-500 dark:text-laundry-teal-400',
          borderColor: 'border-laundry-teal-500',
          btnColor: 'bg-laundry-teal-500 hover:bg-laundry-teal-600',
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const styles = getTypeStyles();
  const isConfirmType = type === 'confirm' || !!onConfirm;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-t-4 ${styles.borderColor} w-full max-w-sm overflow-hidden transform transition-all animate-slide-down`}>
        <div className="p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className={`mb-4 ${styles.iconColor}`}>
              {styles.icon}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-2">
          {isConfirmType ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className={`flex-1 px-4 py-2 text-sm font-semibold text-white ${styles.btnColor} rounded-xl shadow-lg transition-all active:scale-95`}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`w-full px-4 py-2 text-sm font-semibold text-white ${styles.btnColor} rounded-xl shadow-lg transition-all active:scale-95`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
