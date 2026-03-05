import React, { useState, useMemo } from 'react';
import { BoardData, Card, TagDefinition, User } from '../types';
import { PencilIcon, TrashIcon, ListBulletIcon } from './icons';
import { DEFAULT_TAG_COLOR } from '../constants';
import { maskCpf, maskPhone } from '../utils/formatters';
import { Store } from '../types';
import StoreSelector from './StoreSelector';

interface ListViewProps {
  cards: Card[];
  boardData: BoardData;
  tagsMap: Map<string, TagDefinition>;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string, listId: string) => void;
  currentUser: User;
  stores: Store[];
  selectedStoreId: string;
  onSelectStore: (storeId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'list-1': 'bg-slate-200 text-slate-800 border-slate-300',      // Aguardando
  'list-2': 'bg-blue-200 text-blue-800 border-blue-300',          // Em Lavagem
  'list-3': 'bg-orange-200 text-orange-800 border-orange-300',   // Em Secagem
  'list-4': 'bg-teal-200 text-teal-800 border-teal-300',          // Pronto para Retirada
  'list-5': 'bg-green-200 text-green-800 border-green-300',        // Finalizado
};

const ListView: React.FC<ListViewProps> = ({ cards, boardData, tagsMap, onEditCard, onDeleteCard, currentUser, stores, selectedStoreId, onSelectStore }) => {
  const [listTypeFilter, setListTypeFilter] = useState<'all' | 'default' | 'dryer' | 'lavadora'>('all');
  const [listIdFilter, setListIdFilter] = useState<string>('all');

  const isAdmin = currentUser.role === 'admin';

  const handleDelete = (card: Card) => {
    if (window.confirm(`Tem certeza que deseja excluir o pedido de ${card.customerName}?`)) {
      onDeleteCard(card.id, card.listId);
    }
  };

  const allLists = useMemo(() => Object.values(boardData), [boardData]);

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const list = boardData[card.listId];
      if (!list) return false;

      const typeMatch = listTypeFilter === 'all' || (list.type || 'default') === listTypeFilter;
      const idMatch = listIdFilter === 'all' || list.id === listIdFilter;

      return typeMatch && idMatch;
    });
  }, [cards, boardData, listTypeFilter, listIdFilter]);

  const handleClearFilters = () => {
    setListTypeFilter('all');
    setListIdFilter('all');
  };


  return (
    <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <ListBulletIcon className="w-6 h-6 md:w-8 md:h-8 text-laundry-teal-500 mr-2 md:mr-3" />
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">Visão em Lista</h1>
              <div className="mt-2 text-left">
                <StoreSelector stores={stores} selectedStoreId={selectedStoreId} onSelectStore={onSelectStore} />
              </div>
              <p className="text-laundry-blue-700 dark:text-slate-300 mt-1">Exibindo {filteredCards.length} de {cards.length} pedidos</p>
            </div>
          </div>
        </div>

        <div className="mb-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-laundry-blue-200 dark:border-slate-700 flex items-center gap-4 flex-wrap">
          <span className="font-bold text-laundry-blue-800 dark:text-slate-200">Filtrar por:</span>

          <div>
            <label htmlFor="listTypeFilter" className="sr-only">Tipo de Lista</label>
            <select
              id="listTypeFilter"
              value={listTypeFilter}
              onChange={e => setListTypeFilter(e.target.value as any)}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 border border-laundry-blue-200 dark:border-slate-600 rounded-lg py-2 px-3 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
            >
              <option value="all">Todos os Tipos</option>
              <option value="default">Padrão</option>
              <option value="lavadora">Lavadora</option>
              <option value="dryer">Secadora</option>
            </select>
          </div>

          <div>
            <label htmlFor="listIdFilter" className="sr-only">Lista Específica</label>
            <select
              id="listIdFilter"
              value={listIdFilter}
              onChange={e => setListIdFilter(e.target.value)}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 border border-laundry-blue-200 dark:border-slate-600 rounded-lg py-2 px-3 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
            >
              <option value="all">Todas as Listas</option>
              {allLists.map(list => (
                <option key={list.id} value={list.id}>{list.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            className="bg-laundry-blue-100 hover:bg-laundry-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-laundry-blue-800 dark:text-slate-200 font-semibold py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            Limpar Filtros
          </button>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-laundry-blue-200 dark:divide-slate-700">
              <thead className="bg-laundry-blue-100/70 dark:bg-slate-800/70">
                <tr>
                  <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell">Documento</th>
                  <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell">Contato</th>
                  <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell">Etiquetas</th>
                  {isAdmin && <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell">Valor</th>}
                  <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell">Entrada</th>
                  <th scope="col" className="relative px-2 py-2 md:px-6 md:py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-laundry-blue-100 dark:divide-slate-700">
                {filteredCards.length > 0 ? filteredCards.map((card, index) => (
                  <tr key={card.id} className={`transition-colors hover:bg-laundry-blue-100/60 dark:hover:bg-slate-700/60`}>
                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-laundry-blue-900 dark:text-slate-100">{card.customerName}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">ID: {card.id.substring(0, 8).toUpperCase()}</div>
                    </td>
                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 hidden sm:table-cell">{card.customerDocument ? maskCpf(card.customerDocument) : '—'}</td>
                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 hidden sm:table-cell">{card.contact ? maskPhone(card.contact) : '—'}</td>
                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs md:text-sm font-semibold rounded-full border ${STATUS_COLORS[card.listId] || 'bg-gray-200 text-gray-800 border-gray-300'}`}>
                        {boardData[card.listId]?.title || 'Desconhecido'}
                      </span>
                    </td>
                    <td className="px-2 py-3 md:px-6 md:py-4 max-w-xs hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {card.tags.length > 0 ? card.tags.map(tag => {
                          const tagColor = tagsMap.get(tag.name)?.color || DEFAULT_TAG_COLOR;
                          return (
                            <span key={tag.name} className={`text-xs font-semibold py-0.5 px-2 rounded-full inline-flex items-center border ${tagColor}`}>
                              {tag.name}{tag.value && `(${tag.value})`}
                            </span>
                          );
                        }) : <span className="text-gray-500 dark:text-slate-400">—</span>}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-slate-200 hidden md:table-cell">
                        {card.serviceValue != null ? card.serviceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                      </td>
                    )}
                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 hidden sm:table-cell">{new Date(card.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => onEditCard(card)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-laundry-blue-600 dark:hover:text-laundry-blue-300 hover:bg-laundry-blue-200/70 dark:hover:bg-slate-600/70 rounded-full transition-colors" aria-label={`Editar pedido de ${card.customerName}`}>
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(card)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors" aria-label={`Excluir pedido de ${card.customerName}`}>
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="text-center py-16">
                      <p className="text-xl text-gray-500 dark:text-slate-400">Nenhum pedido encontrado com os filtros atuais.</p>
                      <p className="text-base text-gray-400 dark:text-slate-500 mt-2">Tente ajustar ou limpar os filtros para ver mais resultados.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListView;