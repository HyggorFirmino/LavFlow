import React, { useRef, useState, useEffect, useMemo } from 'react';
import { BoardData, Card, List, TagDefinition, User, Store } from '../types';
import KanbanList from './KanbanList';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, TagIcon, CurrencyDollarIcon, WashingMachineIcon, XMarkIcon } from './icons';

interface KanbanBoardProps {
  boardData: BoardData;
  listOrder: string[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string, listId: string) => void;
  onOpenListSettings: (listId: string) => void;
  onAddList: () => void;
  tagsMap: Map<string, TagDefinition>;
  // Mouse drag handlers
  onCardDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string, sourceListId: string) => void;
  onListDragStart: (e: React.DragEvent<HTMLDivElement>, listId: string) => void;
  onDrop: (e: React.DragEvent, targetListId: string, targetCardId?: string) => void;
  // Touch drag handlers (mobile)
  onTouchDragStart: (cardId: string, sourceListId: string) => void;
  onTouchDrop: (targetListId: string) => void;
  currentUser: User;
  stores: Store[];
  selectedStoreId: string;
  onSelectStore: (id: string) => void;
  onMoveCard: (cardId: string, sourceListId: string, targetListId: string) => void;
  onUpdateCard?: (cardId: string, updates: Partial<Card>) => Promise<void>;
  filters: {
    search: string;
    paymentMethod: string;
    tag: string;
    service: string;
  };
  onSetFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    paymentMethod: string;
    tag: string;
    service: string;
  }>>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  boardData,
  listOrder,
  onEditCard,
  onDeleteCard,
  onOpenListSettings,
  onAddList,
  tagsMap,
  onCardDragStart,
  onListDragStart,
  onDrop,
  onTouchDragStart,
  onTouchDrop,
  currentUser,
  stores,
  selectedStoreId,
  onSelectStore,
  onMoveCard,
  onUpdateCard,
  filters = { search: '', paymentMethod: 'all', tag: 'all', service: 'all' },
  onSetFilters = () => {},
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Compute the ordered list of all List objects for the move dropdown
  const allLists = useMemo(() => {
    return listOrder
      .map(id => boardData[id])
      .filter(Boolean);
  }, [listOrder, boardData]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 10);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      // Também verificar após mudanças nos dados do board
      const observer = new MutationObserver(checkScroll);
      observer.observe(container, { childList: true, subtree: true });

      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        observer.disconnect();
      };
    }
  }, [listOrder, boardData]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Largura aproximada de uma coluna + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <main className="flex-grow overflow-y-hidden p-2 md:p-4 flex flex-col">
      <div className="mb-3 md:mb-4 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 px-1">
        <label htmlFor="store-selector" className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Loja Atual:
        </label>
        <select
          id="store-selector"
          value={selectedStoreId}
          onChange={(e) => onSelectStore(e.target.value)}
          className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-laundry-teal-500 focus:border-laundry-teal-500 block p-2.5"
        >
          {stores.map((store) => (
            <option key={store.id} value={String(store.id)}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-4 px-1 flex flex-wrap items-center gap-3">
        {/* Busca por Texto */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, cesto ou documento..."
            value={filters.search}
            onChange={(e) => onSetFilters(prev => ({ ...prev, search: e.target.value }))}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-laundry-teal-500 sm:text-sm transition-all"
          />
        </div>

        {/* Filtro de Pagamento */}
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <select
            value={filters.paymentMethod}
            onChange={(e) => onSetFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-laundry-teal-500 focus:border-laundry-teal-500 block p-2"
          >
            <option value="all">Todos Pagamentos</option>
            <option value="pix">Pix</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="none">Nenhum (Pendente)</option>
          </select>
        </div>

        {/* Filtro de Etiquetas */}
        <div className="flex items-center space-x-2">
          <TagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <select
            value={filters.tag}
            onChange={(e) => onSetFilters(prev => ({ ...prev, tag: e.target.value }))}
            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-laundry-teal-500 focus:border-laundry-teal-500 block p-2"
          >
            <option value="all">Todas Etiquetas</option>
            {Array.from(tagsMap.keys()).map(tagName => (
              <option key={tagName} value={tagName}>{tagName}</option>
            ))}
          </select>
        </div>

        {/* Filtro de Serviço */}
        <div className="flex items-center space-x-2">
          <WashingMachineIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <select
            value={filters.service}
            onChange={(e) => onSetFilters(prev => ({ ...prev, service: e.target.value }))}
            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-laundry-teal-500 focus:border-laundry-teal-500 block p-2"
          >
            <option value="all">Todos Serviços</option>
            <option value="washing">Apenas Lavagem</option>
            <option value="drying">Apenas Secagem</option>
            <option value="both">Lavagem e Secagem</option>
          </select>
        </div>

        {/* Botão de Limpar */}
        {(filters.search || filters.paymentMethod !== 'all' || filters.tag !== 'all' || filters.service !== 'all') && (
          <button
            onClick={() => onSetFilters({ search: '', paymentMethod: 'all', tag: 'all', service: 'all' })}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="relative group flex-1 overflow-hidden">
        {/* Botão de Scroll Esquerda */}
        <button
          onClick={() => handleScroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg border border-gray-200 dark:border-slate-700 text-laundry-blue-600 dark:text-laundry-blue-400 transition-all duration-300 hover:scale-110 active:scale-95 ${
            showLeftScroll ? 'opacity-100 visible' : 'opacity-0 invisible'
          } hidden md:flex items-center justify-center`}
          aria-label="Rolar para esquerda"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>

        {/* Botão de Scroll Direita */}
        <button
          onClick={() => handleScroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg border border-gray-200 dark:border-slate-700 text-laundry-blue-600 dark:text-laundry-blue-400 transition-all duration-300 hover:scale-110 active:scale-95 ${
            showRightScroll ? 'opacity-100 visible' : 'opacity-0 invisible'
          } hidden md:flex items-center justify-center`}
          aria-label="Rolar para direita"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>

        <div
          ref={scrollContainerRef}
          data-kanban-scroll
          className="flex space-x-3 md:space-x-4 h-full snap-x snap-mandatory md:snap-none overflow-x-auto pb-6 px-1"
        >
          {listOrder.map(listId => {
            const list = boardData[listId];
            if (!list) return null;
            return (
              <KanbanList
                key={list.id}
                list={list}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
                onOpenSettings={onOpenListSettings}
                onCardDragStart={onCardDragStart}
                onListDragStart={onListDragStart}
                onDrop={onDrop}
                onTouchDragStart={onTouchDragStart}
                onTouchDrop={onTouchDrop}
                tagsMap={tagsMap}
                currentUser={currentUser}
                allLists={allLists}
                onMoveCard={onMoveCard}
                onUpdateCard={onUpdateCard}
              />
            );
          })}
          {(currentUser.role === 'ADMIN' || currentUser.role === 'admin') && (
            <div className="w-[80vw] md:w-80 flex-shrink-0 snap-start">
              <button
                onClick={onAddList}
                className="w-full h-12 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center text-laundry-blue-600 dark:text-laundry-blue-300 font-bold text-lg transition-all border-2 border-dashed border-laundry-blue-200 dark:border-slate-700 hover:border-laundry-blue-400"
              >
                + Adicionar outra lista
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default KanbanBoard;