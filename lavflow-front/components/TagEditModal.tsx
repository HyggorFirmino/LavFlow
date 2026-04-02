import React, { useState, useEffect } from 'react';
import { TagDefinition, TagType } from '../types';
import ColorPalette from './ColorPalette';
import { DEFAULT_TAG_COLOR, TAG_COLORS } from '../constants';

interface TagEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tag: TagDefinition) => void;
  tagToEdit: Partial<TagDefinition> | null;
  existingTagNames: string[];
}

const TagEditModal: React.FC<TagEditModalProps> = ({ isOpen, onClose, onSave, tagToEdit, existingTagNames }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TagType>('texto');
  const [color, setColor] = useState(DEFAULT_TAG_COLOR);
  const [baseValue, setBaseValue] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');

  const isEditing = !!tagToEdit?.name;

  useEffect(() => {
    if (isOpen) {
      if (tagToEdit) {
        setName(tagToEdit.name || '');
        setType(tagToEdit.type || 'texto');
        setColor(tagToEdit.color || TAG_COLORS[0].classes);
        setBaseValue(tagToEdit.baseValue);
      } else {
        setName('');
        setType('texto');
        setColor(TAG_COLORS[0].classes);
        setBaseValue(undefined);
      }
      setError('');
    }
  }, [isOpen, tagToEdit]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('O nome da etiqueta não pode ser vazio.');
      return;
    }
    if (!isEditing && existingTagNames.includes(trimmedName)) {
      setError('Essa etiqueta já existe.');
      return;
    }
    if (type === 'valor' && (baseValue === undefined || baseValue <= 0)) {
      setError('Por favor, informe um valor base válido para a etiqueta.');
      return;
    }
    onSave({ name: trimmedName, type, color, baseValue: type === 'valor' ? baseValue : undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md m-4 border-t-4 border-laundry-teal-400">
        <form onSubmit={handleSave}>
          <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100 mb-6">{isEditing ? 'Editar Etiqueta' : 'Adicionar Nova Etiqueta'}</h2>

          <div className="mb-4">
            <label htmlFor="tagName" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Nome da Etiqueta</label>
            <input
              id="tagName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
              required
              disabled={isEditing}
            />
          </div>

          <div className="mb-4">
            <label className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Tipo de Etiqueta</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TagType)}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
            >
              <option value="texto">Texto</option>
              <option value="número">Número</option>
              <option value="valor">Valor</option>
            </select>
          </div>

          {type === 'valor' && (
            <div className="mb-4">
              <label htmlFor="baseValue" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Valor Base (R$)</label>
              <input
                id="baseValue"
                type="number"
                step="0.01"
                min="0"
                value={baseValue || ''}
                onChange={(e) => setBaseValue(parseFloat(e.target.value))}
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                placeholder="Ex: 15.00"
                required
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Cor</label>
            <ColorPalette selectedColor={color} onSelectColor={setColor} />
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-laundry-blue-100 hover:bg-laundry-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-laundry-blue-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors">Cancelar</button>
            <button type="submit" className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagEditModal;