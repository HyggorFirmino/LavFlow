import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, TagDefinition, User, Store } from '../types';
import { DEFAULT_TAG_COLOR } from '../constants';
import { ClockIcon } from './icons';
import { maskVisibleCpf, maskVisiblePhone } from '../utils/formatters';

interface CardTag {
  name: string;
  value?: string;
}

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Partial<Omit<Card, 'id' | 'listId'>> & { id?: string; storeId?: number }) => void;
  cardToEdit: Card | null;
  allTags: TagDefinition[];
  tagsMap: Map<string, TagDefinition>;
  currentUser: User;
  stores: Store[];
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSave, cardToEdit, allTags, tagsMap, currentUser, stores }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [contact, setContact] = useState('');
  const [basketIdentifier, setBasketIdentifier] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<CardTag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | undefined>(undefined);
  const [services, setServices] = useState({ washing: false, drying: false });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser.role === 'admin';
  const isCreatingFromTemplate = cardToEdit && !cardToEdit.listId;
  const isEditing = !!cardToEdit && !isCreatingFromTemplate;


  const hasAssistidoTag = useMemo(() => selectedTags.some(t => t.name === 'Assistido'), [selectedTags]);

  useEffect(() => {
    if (cardToEdit) {
      setCustomerName(cardToEdit.customerName);
      setCustomerDocument(cardToEdit.customerDocument ? maskVisibleCpf(cardToEdit.customerDocument) : '');
      setContact(cardToEdit.contact ? maskVisiblePhone(cardToEdit.contact) : '');
      setBasketIdentifier(cardToEdit.basketIdentifier || '');
      setNotes(cardToEdit.notes);
      setSelectedTags(cardToEdit.tags || []);
      setPaymentMethod(cardToEdit.paymentMethod);
      setServices(cardToEdit.services || { washing: false, drying: false });
      // If editing, we can't easily change store yet without fetching list details to know which store it belongs to.
      // But for creation from template or new, we need store.
      // If editing, let's assume store is fixed or handled elsewhere? 
      // Actually, createFromTemplate (isCreatingFromTemplate) implies new card.
      if (isCreatingFromTemplate && stores.length > 0) {
        setSelectedStoreId(String(stores[0].id));
      }
      // Set client ID if available
      setClientId(cardToEdit.client?.id);

      // Prioritize client data if linked
      if (cardToEdit.client) {
        setCustomerName(cardToEdit.client.name);
        setCustomerDocument(maskVisibleCpf(cardToEdit.client.cpf || cardToEdit.client.document || cardToEdit.customerDocument || ''));
        setContact(maskVisiblePhone(cardToEdit.client.phone || cardToEdit.contact || ''));
      }
    } else {
      setCustomerName('');
      setCustomerDocument('');
      setContact('');
      setBasketIdentifier('');
      setNotes('');
      setSelectedTags([]);
      setSelectedTags([]);
      setPaymentMethod(undefined);
      setClientId(undefined);
      setServices({ washing: false, drying: false });
      if (stores.length > 0) setSelectedStoreId(String(stores[0].id));
    }
    setTagInput('');
  }, [cardToEdit, isOpen]);

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

  // Reset payment method if 'Assistido' tag is removed
  useEffect(() => {
    if (!hasAssistidoTag) {
      setPaymentMethod(undefined);
    }
  }, [hasAssistidoTag]);


  const filteredTags = useMemo(() => {
    const currentTagNames = new Set(selectedTags.map(t => t.name));
    if (!tagInput) return allTags.filter(t => !currentTagNames.has(t.name));
    return allTags.filter(t =>
      !currentTagNames.has(t.name) &&
      t.name.toLowerCase().includes(tagInput.toLowerCase())
    );
  }, [tagInput, allTags, selectedTags]);

  if (!isOpen) {
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

  const handleAddNewTag = () => {
    if (!isAdmin) return;
    const formattedTag = tagInput.trim();
    if (formattedTag && !selectedTags.some(t => t.name === formattedTag)) {
      setSelectedTags([...selectedTags, { name: formattedTag }]);
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


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      alert("O nome do cliente é obrigatório.");
      return;
    }
    onSave({
      id: (cardToEdit?.id && cardToEdit.id !== '') ? cardToEdit.id : undefined,
      customerName,
      customerDocument: customerDocument.replace(/\D/g, ''),
      contact: contact.replace(/\D/g, ''),
      basketIdentifier,
      notes,
      tags: selectedTags,
      paymentMethod: paymentMethod,
      services: services,
      createdAt: cardToEdit?.createdAt || '',
      storeId: selectedStoreId ? Number(selectedStoreId) : undefined,
      client: clientId ? { id: clientId } : undefined, // Pass client structure with ID
    } as any); // Cast to any or update type if needed
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-laundry-teal-400 flex flex-col max-h-[95vh]">
        <form onSubmit={handleSave} className="flex flex-col flex-grow min-h-0">

          {/* Modal Header */}
          <div className="p-6 flex-shrink-0 border-b border-laundry-blue-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100">{cardToEdit && !isCreatingFromTemplate ? 'Editar Pedido' : 'Adicionar Novo Pedido'}</h2>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 flex-grow">
            {!cardToEdit && (
              <div className="mb-4">
                <label htmlFor="cardStore" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Loja</label>
                <select
                  id="cardStore"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-[42px]"
                  required
                >
                  <option value="" disabled>Selecione uma loja...</option>
                  {stores.map(store => (
                    <option key={store.id} value={String(store.id)}>{store.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="customerName" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Nome do Cliente</label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                  disabled={isEditing}
                />
              </div>
              <div>
                <label htmlFor="customerDocument" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Documento</label>
                <input
                  id="customerDocument"
                  type="text"
                  value={customerDocument}
                  onChange={(e) => setCustomerDocument(maskVisibleCpf(e.target.value))}
                  className={`shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isEditing}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="contact" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Contato (Telefone/Email)</label>
              <input
                id="contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(maskVisiblePhone(e.target.value))}
                className={`shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={isEditing}
              />
            </div>

            <div className="mb-4">
              <label className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Serviços a Executar</label>
              <div className="flex gap-6 items-center mt-2 p-2 rounded-lg bg-laundry-blue-50/50 dark:bg-slate-700/50">
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
              <label htmlFor="basketIdentifier" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Identificador do Cesto (Opcional)</label>
              <input
                id="basketIdentifier"
                type="text"
                value={basketIdentifier}
                onChange={(e) => setBasketIdentifier(e.target.value)}
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                placeholder="Ex: Cesto 1, Roupas de cama..."
              />
            </div>

            {cardToEdit && cardToEdit.history && cardToEdit.history.length > 0 && (
              <div className="mb-4">
                <label className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Histórico de Movimentações</label>
                <div className="max-h-32 overflow-y-auto bg-laundry-blue-50/50 dark:bg-slate-700/50 p-3 rounded-lg border border-laundry-blue-200 dark:border-slate-600 space-y-3 shadow-inner">
                  {cardToEdit.history.map((event, index) => (
                    <div key={index} className="text-xs text-gray-800 dark:text-slate-300 flex items-start">
                      <ClockIcon className="w-4 h-4 mr-2 mt-0.5 text-laundry-blue-500 dark:text-laundry-blue-400 flex-shrink-0" />
                      <div className="leading-snug">
                        <span className="font-semibold block">{new Date(event.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span>
                          Movido de <strong className="font-bold text-laundry-blue-900 dark:text-slate-100">{event.fromListTitle}</strong> para <strong className="font-bold text-laundry-blue-900 dark:text-slate-100">{event.toListTitle}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="tags-input" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Etiquetas</label>
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
                    id="tags-input"
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setIsDropdownVisible(true);
                    }}
                    onFocus={() => setIsDropdownVisible(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewTag();
                      }
                    }}
                    className="flex-grow appearance-none bg-transparent focus:outline-none text-sm p-1 dark:text-slate-200"
                    placeholder={selectedTags.length > 0 ? '' : 'Selecionar ou criar etiquetas...'}
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
                    {isAdmin && tagInput && !allTags.some(t => t.name.toLowerCase() === tagInput.toLowerCase().trim()) && (
                      <li
                        onClick={handleAddNewTag}
                        className="px-4 py-2 cursor-pointer hover:bg-laundry-blue-100 dark:hover:bg-slate-700 flex items-center"
                      >
                        <span className="mr-3 text-laundry-teal-500 font-bold">+</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200">Criar nova etiqueta: "{tagInput}"</span>
                      </li>
                    )}
                    {filteredTags.length === 0 && !tagInput && (
                      <li className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">Todas as etiquetas foram selecionadas.</li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {hasAssistidoTag && (
              <div className="mb-4">
                <label htmlFor="paymentMethod" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Forma de Pagamento</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod || ''}
                  onChange={(e) => setPaymentMethod(e.target.value as 'dinheiro' | 'pix' || undefined)}
                  className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-[42px]"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">Pix</option>
                </select>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="notes" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Observações</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-24"
                placeholder="Ex: Usar sabão hipoalergênico, cuidado com peça vermelha..."
              />
            </div>
          </div>

          {/* Modal Footer */}
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
              className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;
