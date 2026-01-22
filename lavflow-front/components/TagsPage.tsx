import React, { useState, useMemo } from 'react';
import { BoardData, TagDefinition, Card, User, Store } from '../types';
import { TagIcon, PencilIcon, TrashIcon } from './icons';
import TagEditModal from './TagEditModal';

interface TagsPageProps {
  boardData: BoardData;
  tags: TagDefinition[];
  onSaveTag: (tag: TagDefinition) => void;
  onDeleteTag: (tagName: string) => void;
  currentUser: User;
  stores: Store[];
  selectedStoreId: string;
  onSelectStore: (id: string) => void;
}

const TagsPage: React.FC<TagsPageProps> = ({ boardData, tags, onSaveTag, onDeleteTag, currentUser, stores, selectedStoreId, onSelectStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Partial<TagDefinition> | null>(null);
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'admin';

  const tagUsage = useMemo(() => {
    const usageMap = new Map<string, number>();
    Object.values(boardData).forEach(list => {
      // Filter list cards if store logic exists in list (though boardData is already filtered by index.tsx)
      // Wait, boardData IS already filtered in index.tsx based on selectedStoreId.
      // So if I change store here, I need to update index.tsx selectedStoreId.
      // If index.tsx re-renders boardData based on store, then usageMap will automatically update!
      list.cards.forEach(card => {
        card.tags.forEach(tag => {
          usageMap.set(tag.name, (usageMap.get(tag.name) || 0) + 1);
        });
      });
    });
    return usageMap;
  }, [boardData]);

  const handleOpenAddModal = () => {
    setTagToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tag: TagDefinition) => {
    setTagToEdit(tag);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTagToEdit(null);
  };

  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-laundry-blue-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6 border-b border-laundry-blue-200 dark:border-slate-700 pb-4">
          <div className="flex items-center">
            <TagIcon className="w-8 h-8 text-laundry-teal-500 mr-3" />
            <h1 className="text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">Gerenciador de Etiquetas</h1>
          </div>

          <div className="flex-1 mx-8">
            <select
              value={selectedStoreId}
              onChange={(e) => onSelectStore(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-laundry-teal-500 focus:border-laundry-teal-500 block w-full p-2.5 max-w-xs ml-auto"
            >
              <option value="">Selecione uma loja...</option>
              {stores.map((store) => (
                <option key={store.id} value={String(store.id)}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Adicionar Etiqueta</span>
            </button>
          )}
        </div>

        {sortedTags.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-laundry-blue-200 dark:border-slate-700">
            <div className="grid grid-cols-5 gap-4 font-bold text-laundry-blue-800 dark:text-slate-200 px-6 py-3 bg-laundry-blue-100/70 dark:bg-slate-900/70">
              <div className="col-span-2">Nome da Etiqueta</div>
              <div className="text-center">Tipo</div>
              <div className="text-center">Em Uso</div>
              <div className="text-right">Ações</div>
            </div>
            <ul>
              {sortedTags.map((tag, index) => (
                <li key={tag.name} className={`grid grid-cols-5 gap-4 items-center px-6 py-3 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-laundry-blue-50/50 dark:bg-slate-800/50'} hover:bg-laundry-blue-100/60 dark:hover:bg-slate-700/60`}>
                  <div className="col-span-2 flex items-center">
                    <span className={`w-4 h-4 rounded-full mr-3 border-2 ${tag.color}`}></span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">{tag.name}</span>
                  </div>
                  <div className="text-sm capitalize text-gray-700 dark:text-slate-300 text-center">{tag.type}</div>
                  <div className="text-sm text-gray-700 dark:text-slate-300 font-mono text-center bg-gray-200 dark:bg-slate-700 rounded-full px-2 py-0.5 w-12 mx-auto">{tagUsage.get(tag.name) || 0}</div>
                  <div className="flex justify-end items-center space-x-2">
                    {isAdmin && (
                      <>
                        <button onClick={() => handleOpenEditModal(tag)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-laundry-blue-600 dark:hover:text-laundry-blue-300 hover:bg-laundry-blue-200/70 dark:hover:bg-slate-600/70 rounded-full transition-colors" aria-label={`Editar etiqueta ${tag.name}`}>
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDeleteTag(tag.name)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors" aria-label={`Excluir etiqueta ${tag.name}`}>
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8 border-laundry-blue-200 dark:border-slate-700">
            <TagIcon className="w-16 h-16 mx-auto text-laundry-blue-300 dark:text-slate-600" />
            <p className="mt-4 text-xl text-gray-500 dark:text-slate-400">Nenhuma etiqueta encontrada.</p>
            <p className="text-base text-gray-400 dark:text-slate-500 mt-2">Clique em "Adicionar Etiqueta" para criar sua primeira etiqueta.</p>
          </div>
        )}
      </div>
      {isAdmin && (
        <TagEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={onSaveTag}
          tagToEdit={tagToEdit}
          existingTagNames={tags.map(t => t.name)}
        />
      )}
    </div>
  );
};

export default TagsPage;