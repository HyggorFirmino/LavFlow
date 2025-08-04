import React, { useState, useEffect } from 'react';
import { Client } from '../types';

interface CreateMultipleCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  client: Client | null;
}

const CreateMultipleCardsModal: React.FC<CreateMultipleCardsModalProps> = ({ isOpen, onClose, onConfirm, client }) => {
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (isOpen) {
      setQuantity('1'); // Reset on open
    }
  }, [isOpen]);

  if (!isOpen || !client) {
    return null;
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      alert('Por favor, insira um número inteiro válido e positivo.');
      return;
    }
    onConfirm(numQuantity);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm m-4 border-t-4 border-laundry-teal-400">
        <form onSubmit={handleConfirm}>
          <h2 className="text-2xl font-bold text-laundry-blue-900 mb-2">Criar Múltiplos Pedidos</h2>
          <p className="text-gray-600 mb-6">
            Para o cliente: <span className="font-semibold text-laundry-blue-800">{client.name}</span>
          </p>

          <div className="mb-6">
            <label htmlFor="quantity" className="block text-laundry-blue-800 text-sm font-bold mb-2">
              Quantidade de Cestos/Pedidos
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="shadow-inner bg-laundry-blue-50/50 appearance-none border border-laundry-blue-200 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
              required
              autoFocus
            />
             <p className="text-xs text-gray-500 mt-2">Os pedidos serão identificados sequencialmente (ex: 1/3, 2/3, 3/3).</p>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-laundry-blue-100 hover:bg-laundry-blue-200 text-laundry-blue-800 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Criar Pedidos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMultipleCardsModal;