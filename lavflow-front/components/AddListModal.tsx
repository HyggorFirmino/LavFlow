import React, { useState, useEffect } from 'react';
import { Store } from '../types';

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, limit: number | null, type: 'default' | 'dryer' | 'lavadora', storeId: number, totalDryingTime?: number, reminderInterval?: number) => void;
  stores: Store[];
  currentStoreId?: string;
}

const AddListModal: React.FC<AddListModalProps> = ({ isOpen, onClose, onSave, stores, currentStoreId }) => {
  const [title, setTitle] = useState('');
  const [limit, setLimit] = useState<string>('');
  const [type, setType] = useState<'default' | 'dryer' | 'lavadora'>('default');
  const [totalDryingTime, setTotalDryingTime] = useState('');
  const [reminderInterval, setReminderInterval] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  useEffect(() => {
    // Reset state when modal is closed/reopened
    if (isOpen) {
      setTitle('');
      setLimit('');
      setType('default');
      setTotalDryingTime('');
      setReminderInterval('');
      setSelectedStoreId(currentStoreId || '');
    }
  }, [isOpen, currentStoreId]);

  if (!isOpen) {
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("O título da lista não pode ser vazio.");
      return;
    }
    const newLimit = limit === '' ? null : parseInt(limit, 10);
    const newTotalTime = totalDryingTime === '' ? undefined : parseInt(totalDryingTime, 10);
    const newReminderInterval = reminderInterval === '' ? undefined : parseInt(reminderInterval, 10);

    if (!selectedStoreId) {
      alert("Selecione uma loja para a lista.");
      return;
    }

    if (limit !== '' && (isNaN(newLimit as number) || (newLimit as number) < 0)) {
      alert("O limite de cartões deve ser um número positivo.");
      return;
    }

    if (type === 'dryer' && (newTotalTime === undefined || newTotalTime <= 0)) {
      alert("O tempo total de secagem é obrigatório e deve ser positivo para listas do tipo Secadora.");
      return;
    }
    if (type === 'dryer' && newReminderInterval !== undefined && newReminderInterval <= 0) {
      alert("O intervalo de lembrete deve ser um número positivo.");
      return;
    }
    if (type === 'dryer' && newReminderInterval !== undefined && newTotalTime !== undefined && newReminderInterval >= newTotalTime) {
      alert("O intervalo de lembrete deve ser menor que o tempo total.");
      return;
    }

    onSave(title, newLimit, type, Number(selectedStoreId), newTotalTime, newReminderInterval);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md m-4 border-t-4 border-laundry-teal-400">
        <form onSubmit={handleSave}>
          <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100 mb-6">Adicionar Nova Lista</h2>

          <div className="mb-4">
            <label htmlFor="newStore" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Loja</label>
            <select
              id="newStore"
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-[42px]"
              required
            >
              <option value="">Selecione uma loja...</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="newListTitle" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Título da Lista</label>
            <input
              id="newListTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
              placeholder="Ex: Em Espera, Verificação..."
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newCardLimit" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Limite de Cartões (opcional)</label>
            <input
              id="newCardLimit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="1"
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
              placeholder="Ex: 5"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newListType" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Tipo de Lista</label>
            <select
              id="newListType"
              value={type}
              onChange={(e) => setType(e.target.value as 'default' | 'dryer' | 'lavadora')}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-[42px]"
            >
              <option value="default">Padrão</option>
              <option value="lavadora">Lavadora</option>
              <option value="dryer">Secadora</option>
            </select>
          </div>

          {type === 'dryer' && (
            <div className="p-4 bg-laundry-blue-50 dark:bg-slate-700/50 rounded-lg border border-laundry-blue-200 dark:border-slate-600 mb-6">
              <h3 className="font-semibold text-laundry-blue-900 dark:text-slate-100 mb-3">Configurações da Secadora</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newTotalDryingTime" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Tempo Total (min)</label>
                  <input
                    id="newTotalDryingTime"
                    type="number"
                    value={totalDryingTime}
                    onChange={(e) => setTotalDryingTime(e.target.value)}
                    min="1"
                    className="shadow-inner bg-white dark:bg-slate-700 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                    placeholder="Ex: 45"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newReminderInterval" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Lembrar a cada (min)</label>
                  <input
                    id="newReminderInterval"
                    type="number"
                    value={reminderInterval}
                    onChange={(e) => setReminderInterval(e.target.value)}
                    min="1"
                    className="shadow-inner bg-white dark:bg-slate-700 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                    placeholder="Ex: 15"
                  />
                </div>
              </div>
            </div>
          )}


          <div className="flex items-center justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-laundry-blue-100 hover:bg-laundry-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-laundry-blue-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Salvar Lista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListModal;
