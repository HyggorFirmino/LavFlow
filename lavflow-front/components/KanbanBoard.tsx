import React from 'react';
import { BoardData, Card, List, TagDefinition, User, Store } from '../types';
import KanbanList from './KanbanList';

interface KanbanBoardProps {
  boardData: BoardData;
  listOrder: string[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string, listId: string) => void;
  onOpenListSettings: (listId: string) => void;
  onAddList: () => void;
  tagsMap: Map<string, TagDefinition>;
  onCardDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string, sourceListId: string) => void;
  onListDragStart: (e: React.DragEvent<HTMLDivElement>, listId: string) => void;
  onDrop: (e: React.DragEvent, targetListId: string, targetCardId?: string) => void;
  currentUser: User;
  stores: Store[];
  selectedStoreId: string;
  onSelectStore: (id: string) => void;
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
  currentUser,
  stores,
  selectedStoreId,
  onSelectStore,
}) => {
  return (
    <main className="flex-grow overflow-x-auto overflow-y-hidden p-4">
      <div className="mb-4 flex items-center space-x-4">
        <label htmlFor="store-selector" className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Loja Atual:
        </label>
        <select
          id="store-selector"
          value={selectedStoreId}
          onChange={(e) => onSelectStore(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-laundry-teal-500 focus:border-laundry-teal-500 block p-2.5"
        >
          <option value="">Selecione uma loja...</option>
          {stores.map((store) => (
            <option key={store.id} value={String(store.id)}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4 h-full">
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
              tagsMap={tagsMap}
              currentUser={currentUser}
            />
          );
        })}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'admin') && (
          <div className="w-80 flex-shrink-0">
            <button
              onClick={onAddList}
              className="w-full h-12 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center text-laundry-blue-600 dark:text-laundry-blue-300 font-bold text-lg transition-all border-2 border-dashed border-laundry-blue-200 dark:border-slate-700 hover:border-laundry-blue-400"
            >
              + Adicionar outra lista
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default KanbanBoard;