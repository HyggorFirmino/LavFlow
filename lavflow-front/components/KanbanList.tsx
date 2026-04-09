
import React, { useState } from 'react';
import { List, Card, TagDefinition, User } from '../types';
import KanbanCard from './KanbanCard';
import { CheckCircleIcon, EllipsisHorizontalIcon, SunIcon, WashingMachineIcon, WhatsAppIcon } from './icons';

interface KanbanListProps {
  list: List;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string, listId: string) => void;
  onOpenSettings: (listId: string) => void;
  // Drag and drop handlers (mouse)
  onCardDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string, listId: string) => void;
  onListDragStart: (e: React.DragEvent<HTMLDivElement>, listId: string) => void;
  onDrop: (e: React.DragEvent, targetListId: string, targetCardId?: string) => void;
  // Touch drag handlers (mobile)
  onTouchDragStart: (cardId: string, sourceListId: string) => void;
  onTouchDrop: (targetListId: string) => void;
  tagsMap: Map<string, TagDefinition>;
  currentUser: User;
  allLists?: List[];
  onMoveCard?: (cardId: string, sourceListId: string, targetListId: string) => void;
  onUpdateCard?: (cardId: string, updates: Partial<Card>) => Promise<void>;
}

const KanbanList: React.FC<KanbanListProps> = ({
  list,
  onEditCard,
  onDeleteCard,
  onOpenSettings,
  onCardDragStart,
  onListDragStart,
  onDrop,
  onTouchDragStart,
  onTouchDrop,
  tagsMap,
  currentUser,
  allLists,
  onMoveCard,
  onUpdateCard,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const isOverLimit = list.cardLimit != null && list.cards.length > list.cardLimit;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only set false if we are actually leaving the list container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDropOnList = (e: React.DragEvent<HTMLDivElement>) => {
    onDrop(e, list.id); // Drop on the list itself, no target card
    setIsDragOver(false);
  };

  return (
    <div className="w-[80vw] md:w-80 flex-shrink-0 flex flex-col snap-start">
      <div
        data-list-id={list.id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropOnList}
        className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-sm max-h-full flex flex-col transition-all duration-200 ${isDragOver ? 'scale-105 bg-laundry-blue-300 dark:bg-slate-600 ring-2 ring-laundry-blue-400 dark:ring-slate-500 z-10' : ''} ${isOverLimit ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
      >
        <div
          className="p-3 flex-shrink-0 flex justify-between items-center cursor-grab active:cursor-grabbing border-b border-laundry-blue-100 dark:border-slate-700"
          draggable="true"
          onDragStart={(e) => onListDragStart(e, list.id)}
        >
          <div className="flex items-center gap-2">
            {list.type === 'lavadora' && <span title="Lista do tipo Lavadora"><WashingMachineIcon className="w-5 h-5 text-laundry-blue-500 dark:text-laundry-blue-400" /></span>}
            {list.type === 'dryer' && <span title="Lista do tipo Secadora"><SunIcon className="w-5 h-5 text-orange-400 dark:text-orange-400" /></span>}
            {list.type === 'whatsapp' && <span title="Lista de Mensagens WhatsApp"><WhatsAppIcon className="w-5 h-5 text-green-500 dark:text-green-400" /></span>}
            {list.type === 'conclusao' && <span title="Lista de Conclusão"><CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400" /></span>}
            <h3 className="text-lg font-bold text-laundry-blue-900 dark:text-slate-100 px-1">
              {list.title}
              <span className={`text-base font-semibold ml-2 py-0.5 px-2 rounded-full ${isOverLimit ? 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-500/30' : 'text-laundry-blue-700 bg-laundry-blue-100 dark:text-slate-200 dark:bg-slate-700'}`}>
                {list.cards.length}{list.cardLimit != null ? `/${list.cardLimit}` : ''}
              </span>
            </h3>
          </div>
          <button onClick={() => onOpenSettings(list.id)} className="text-gray-500 dark:text-slate-400 hover:text-laundry-blue-600 dark:hover:text-laundry-blue-300 p-1 rounded-full hover:bg-laundry-blue-200/70 dark:hover:bg-slate-700/70 transition-colors">
            <EllipsisHorizontalIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto px-3 pt-3 pb-3 flex-grow min-h-[50px]">
          {list.cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              list={list}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              onDragStart={onCardDragStart}
              onDrop={onDrop}
              onTouchDragStart={onTouchDragStart}
              onTouchDrop={onTouchDrop}
              tagsMap={tagsMap}
              currentUser={currentUser}
              allLists={allLists}
              onMoveCard={onMoveCard}
              onUpdateCard={onUpdateCard}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanList;