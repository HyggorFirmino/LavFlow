import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Client, Store, TagDefinition } from '../types';
import { DEFAULT_TAG_COLOR } from '../constants';
import CustomModal, { ModalType } from './CustomModal';

interface CardTag {
  name: string;
  value?: string;
}

interface CreateMultipleCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, storeId: number, services: { washing: boolean; drying: boolean }, tags: CardTag[], notes: string, cestoNumbers: string[]) => void;
  client: Client | null;
  stores: Store[];
  tags: TagDefinition[];
  currentStoreId?: string;
}

const CreateMultipleCardsModal: React.FC<CreateMultipleCardsModalProps> = ({ isOpen, onClose, onConfirm, client, stores, tags: allTags, currentStoreId }) => {
  const [quantity, setQuantity] = useState('1');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  // New Fields
  const [services, setServices] = useState({ washing: false, drying: false });
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<CardTag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [cestoNumbers, setCestoNumbers] = useState<string[]>(['']);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const num = parseInt(quantity, 10);
    if (!isNaN(num) && num > 0) {
      setCestoNumbers(prev => {
        if (prev.length === num) return prev;
        const newArr = [...prev];
        if (num > prev.length) {
          for (let i = prev.length; i < num; i++) newArr.push('');
        } else {
          newArr.splice(num);
        }
        return newArr;
      });
    }
  }, [quantity]);

  useEffect(() => {
    if (isOpen) {
      setQuantity('1'); // Reset on open
      setServices({ washing: false, drying: false });
      setNotes('');
      setSelectedTags([]);
      setTagInput('');
      setCestoNumbers(['']);

      // Default to currentStoreId or first store if available and nothing selected
      if (stores.length > 0 && !selectedStoreId) {
        setSelectedStoreId(currentStoreId || String(stores[0].id));
      } else if (stores.length > 0 && currentStoreId) {
        // Se mudou a loja no topo, atualizamos aqui também
        setSelectedStoreId(currentStoreId);
      }
    }
  }, [isOpen, stores, currentStoreId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tagsMap = useMemo(() => new Map(allTags.map(tag => [tag.name, tag])), [allTags]);

  const filteredTags = useMemo(() => {
    const currentTagNames = new Set(selectedTags.map(t => t.name));
    if (!tagInput) return allTags.filter(t => !currentTagNames.has(t.name));
    return allTags.filter(t =>
      !currentTagNames.has(t.name) &&
      t.name.toLowerCase().includes(tagInput.toLowerCase())
    );
  }, [tagInput, allTags, selectedTags]);


  if (!isOpen || !client) {
    return null;
  }

  const handleSelectTag = (tagName: string) => {
    if (!selectedTags.some(t => t.name === tagName)) {
      const tagDef = tagsMap.get(tagName);
      const newTag: CardTag = { name: tagName };
      if (tagDef?.type === 'número') {
        newTag.value = ''; // Initialize with empty value
      }
      setSelectedTags([...selectedTags, newTag]);
    }
    setTagInput('');
    setIsDropdownVisible(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.name !== tagToRemove));
  };

  const handleTagValueChange = (tagName: string, value: string) => {
    setSelectedTags(currentTags =>
      currentTags.map(tag =>
        tag.name === tagName ? { ...tag, value } : tag
      )
    );
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const numQuantity = parseInt(quantity, 10);
    const storeId = parseInt(selectedStoreId, 10);

    if (isNaN(numQuantity) || numQuantity <= 0) {
      setModalConfig({
        isOpen: true,
        title: 'Valor Inválido',
        message: 'Por favor, insira um número inteiro válido e positivo.',
        type: 'warning'
      });
      return;
    }

    if (isNaN(storeId)) {
      setModalConfig({
        isOpen: true,
        title: 'Campo Obrigatório',
        message: 'Por favor, selecione uma loja.',
        type: 'warning'
      });
      return;
    }

    if (!services.washing && !services.drying) {
      setModalConfig({
        isOpen: true,
        title: 'Serviço Obrigatório',
        message: 'Por favor, selecione pelo menos um serviço (Lavagem ou Secagem).',
        type: 'warning'
      });
      return;
    }

    onConfirm(numQuantity, storeId, services, selectedTags, notes, cestoNumbers);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm m-4 border-t-4 border-laundry-teal-400 flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100 mb-1">Criar Múltiplos Pedidos</h2>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            Para: <span className="font-semibold text-laundry-blue-800 dark:text-slate-200">{client.name}</span>
          </p>
        </div>

        <div className="overflow-y-auto p-6 pt-2 flex-grow">
          <form id="create-multiple-form" onSubmit={handleConfirm}>
            <div className="mb-4">
              <label htmlFor="multiCardStore" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Loja</label>
              <select
                id="multiCardStore"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-[42px]"
                required
              >
                {stores.map(store => (
                  <option key={store.id} value={String(store.id)}>{store.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="quantity" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">
                Quantidade de Cestos/Pedidos
              </label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Os pedidos serão identificados sequencialmente (ex: 1/3, 2/3, 3/3).</p>
            </div>

            <div className="mb-4">
              <label className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">
                Números dos Cestos (Opcional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {cestoNumbers.map((cesto, index) => (
                  <div key={index} className="flex flex-col">
                    <label className="text-xs text-gray-600 dark:text-slate-400 mb-1">Cesto {index + 1}</label>
                    <select
                      value={cesto}
                      onChange={(e) => {
                        const newCestos = [...cestoNumbers];
                        newCestos[index] = e.target.value;
                        setCestoNumbers(newCestos);
                      }}
                      className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                    >
                      <option value="">Selecione...</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={String(num)}>{num}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Serviços a Executar <span className="text-red-500">*</span></label>
              <div className="flex gap-6 items-center mt-2 p-2 rounded-lg bg-laundry-blue-50/50 dark:bg-slate-700/50 border border-laundry-blue-100 dark:border-slate-600">
                <label className="flex items-center space-x-2 text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.washing}
                    onChange={(e) => setServices(s => ({ ...s, washing: e.target.checked }))}
                    className="h-5 w-5 text-laundry-teal-500 rounded-md border-gray-300 dark:border-slate-500 focus:ring-laundry-teal-400"
                  />
                  <span>Lavagem</span>
                </label>
                <label className="flex items-center space-x-2 text-gray-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.drying}
                    onChange={(e) => setServices(s => ({ ...s, drying: e.target.checked }))}
                    className="h-5 w-5 text-laundry-teal-500 rounded-md border-gray-300 dark:border-slate-500 focus:ring-laundry-teal-400"
                  />
                  <span>Secagem</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="tags-input-multi" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Etiquetas</label>
              <div className="relative" ref={dropdownRef}>
                <div className="flex flex-wrap gap-2 p-2 border border-laundry-blue-200 dark:border-slate-600 rounded-lg mb-2 min-h-[42px] bg-laundry-blue-50/50 dark:bg-slate-700/50 items-center">
                  {selectedTags.map(tag => {
                    const tagDef = tagsMap.get(tag.name);
                    const tagColor = tagDef?.color || DEFAULT_TAG_COLOR;
                    return (
                      <div key={tag.name} className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${tagColor}`}>
                        <span>{tag.name}</span>
                        {tagDef?.type === 'número' && (
                          <input
                            type="number"
                            value={tag.value || ''}
                            onChange={(e) => handleTagValueChange(tag.name, e.target.value)}
                            className="w-12 text-center bg-transparent border-b border-current/50 focus:outline-none p-0 focus:border-current"
                            placeholder="Nº"
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                        <button type="button" onClick={() => handleRemoveTag(tag.name)} className="text-current opacity-70 hover:opacity-100 font-bold text-lg leading-none ml-1">&times;</button>
                      </div>
                    );
                  })}
                  <input
                    id="tags-input-multi"
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setIsDropdownVisible(true);
                    }}
                    onFocus={() => setIsDropdownVisible(true)}
                    className="flex-grow appearance-none bg-transparent focus:outline-none text-sm p-1 dark:text-slate-200"
                    placeholder={selectedTags.length > 0 ? '' : 'Selecionar etiquetas...'}
                  />
                </div>
                {isDropdownVisible && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredTags.map(tag => (
                      <li
                        key={tag.name}
                        onClick={() => handleSelectTag(tag.name)}
                        className="px-4 py-2 cursor-pointer hover:bg-laundry-blue-100 dark:hover:bg-slate-700 flex items-center"
                      >
                        <span className={`w-3 h-3 rounded-full mr-3 border ${tag.color.split(' ')[0]} ${tag.color.split(' ')[2]}`}></span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{tag.name}</span>
                      </li>
                    ))}
                    {filteredTags.length === 0 && (
                      <li className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">Nenhuma etiqueta encontrada.</li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="notes-multi" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Observações</label>
              <textarea
                id="notes-multi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-24"
                placeholder="Ex: Usar sabão hipoalergênico..."
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 bg-laundry-blue-50/70 dark:bg-slate-800/70 rounded-b-xl border-t border-laundry-blue-100 dark:border-slate-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-laundry-blue-100 hover:bg-laundry-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-laundry-blue-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-multiple-form"
            className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Criar Pedidos
          </button>
        </div>
      </div>

      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default CreateMultipleCardsModal;