
import React from 'react';
import { BoardData, Card, List, TagDefinition, User } from '../types';
import KanbanList from './KanbanList';

interface KanbanBoardProps {
  boardData: BoardData;
  listOrder: string[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string, listId: string) => void;
  onOpenListSettings: (listId: string) => void;
  onAddList: () => void;
  tagsMap: Map<string, TagDefinition>;

  // Drag and Drop handlers from App.tsx
  onCardDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string, listId: string) => void;
  onListDragStart: (e: React.DragEvent<HTMLDivElement>, listId: string) => void;
  onDrop: (e: React.DragEvent, targetListId: string, targetCardId?: string) => void;
  currentUser: User;
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
    currentUser
}) => {

  const renderList = (list: List) => (
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

  // New rendering logic to respect listOrder and group dynamically
  const renderBoardContent = () => {
    const componentsToRender: JSX.Element[] = [];
    let i = 0;
    while (i < listOrder.length) {
      const listId = listOrder[i];
      const list = boardData[listId];

      if (!list) {
        i++;
        continue;
      }

      const isMachine = list.type === 'lavadora' || list.type === 'dryer';

      if (isMachine) {
        const machineType = list.type;
        const group: List[] = [];
        
        // Collect all consecutive lists of the same machine type
        let j = i;
        while (j < listOrder.length) {
          const currentList = boardData[listOrder[j]];
          if (currentList && currentList.type === machineType) {
            group.push(currentList);
            j++;
          } else {
            break;
          }
        }
        
        const isWasherGroup = machineType === 'lavadora';
        componentsToRender.push(
          <div key={`group-${i}`} className={`p-4 ${isWasherGroup ? 'bg-laundry-blue-100/60 dark:bg-slate-900/60' : 'bg-orange-100/60 dark:bg-orange-900/20'} rounded-xl shadow-inner self-stretch flex flex-col`}>
            <h2 className={`text-xl font-bold ${isWasherGroup ? 'text-laundry-blue-900 dark:text-laundry-blue-200' : 'text-orange-800 dark:text-orange-300'} text-center mb-4 flex-shrink-0`}>
              {isWasherGroup ? 'Lavadoras' : 'Secadoras'}
            </h2>
            <div className="flex space-x-6 h-full">
              {group.map(l => renderList(l))}
            </div>
          </div>
        );
        i = j; // Move index past the processed group
      } else {
        componentsToRender.push(renderList(list));
        i++;
      }
    }
    return componentsToRender;
  };

  return (
    <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-hidden">
      <div className="flex space-x-6 overflow-x-auto pb-4 h-full items-start">
        {renderBoardContent()}

        {currentUser.role === 'admin' && (
            <div className="w-80 flex-shrink-0 self-start">
                <button
                    onClick={onAddList}
                    className="w-full bg-laundry-blue-100/80 hover:bg-laundry-blue-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 backdrop-blur-sm text-laundry-blue-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2"
                >
                    <span className="text-2xl font-light">+</span>
                    <span>Adicionar Lista</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;