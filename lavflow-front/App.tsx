import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BoardData, Card, List, TagDefinition, User, LaundryProfile, ToastNotification, CardHistoryEvent, Client } from './types';
import { getOrdens, updateOrdem, mudarStatusOrdem, getStatusKanban } from './services/apiService';
import { INITIAL_LIST_ORDER, INITIAL_LIST_TITLES, TAG_COLORS, DEFAULT_TAG_COLOR, WASHER_LIST_IDS, DRYER_LIST_IDS } from './constants';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import AddCardModal from './components/AddCardModal';
import AddListModal from './components/AddListModal';
import ListSettingsModal from './components/ListSettingsModal';
import TagsPage from './components/TagsPage';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import DashboardPage from './components/DashboardPage';
import PrintLabelsPage from './components/PrintLabelsPage';
import ListView from './components/ListView';
import HistoryPage from './components/HistoryPage';
import ClientsPage from './components/ClientsPage';
import { ExclamationTriangleIcon, XMarkIcon } from './components/icons';
import CreateMultipleCardsModal from './components/CreateMultipleCardsModal';
import { useAuth } from './hooks/useAuth';

// --- Toast Notification Components ---

interface ToastMessageProps {
  notification: ToastNotification;
  onDismiss: (id: number) => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const ICONS = {
    error: <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />,
    success: <div />, // Placeholder for future use
    info: <div />, // Placeholder for future use
  };

  const BORDER_COLORS = {
    error: 'border-red-500',
    success: 'border-green-500',
    info: 'border-blue-500',
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 flex items-start w-full max-w-sm border-l-4 ${BORDER_COLORS[notification.type]} animate-toast-in`}
      role="alert"
    >
      <div className="flex-shrink-0">{ICONS[notification.type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Ação não permitida</p>
        <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">{notification.message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={() => onDismiss(notification.id)}
          className="inline-flex text-gray-400 dark:text-slate-400 hover:text-gray-500 dark:hover:text-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-laundry-teal-500"
          aria-label="Fechar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  notifications: ToastNotification[];
  removeNotification: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div aria-live="assertive" className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none z-[100] sm:p-6 sm:items-start">
      <div className="w-full max-w-sm space-y-4 pt-24">
        {notifications.map(notification => (
          <ToastMessage
            key={notification.id}
            notification={notification}
            onDismiss={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

const buildInitialBoardData = (): BoardData => {
  const now = new Date();
  const data: BoardData = {};

  INITIAL_LIST_ORDER.forEach((listId, index) => {
    data[listId] = { id: listId, title: INITIAL_LIST_TITLES[listId], cards: [], cardLimit: null, type: 'default', order: index };
  });

  data['list-4'].cardLimit = 4;

  WASHER_LIST_IDS.forEach(id => {
    data[id].type = 'lavadora';
    data[id].cardLimit = 1;
  });

  DRYER_LIST_IDS.forEach(id => {
    data[id].type = 'dryer';
    data[id].cardLimit = 1;
    data[id].totalDryingTime = 40; // 40 minutes
    data[id].reminderInterval = 15; // reminder every 15 minutes
  });


  data['list-1'].cards.push({
    id: 'card-1', listId: 'list-1', customerName: 'João Silva', customerDocument: '123.456.789-00', contact: '11 98765-4321',
    tags: [{ name: 'Assistido' }, { name: 'Urgente' }], notes: 'Lavar com água fria.', basketIdentifier: 'Cesto de Roupas Brancas',
    serviceValue: 35, paymentMethod: 'pix', services: { washing: true, drying: true },
    createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    history: []
  });
  data['list-1'].cards.push({
    id: 'card-4', listId: 'list-1', customerName: 'Ana Costa', customerDocument: '444.555.666-77', contact: '11 98765-1122',
    tags: [{ name: 'Assistido' }, { name: 'Em Aberto' }], notes: 'Não usar amaciante.', basketIdentifier: 'Cesto de Toalhas',
    serviceValue: 20, paymentMethod: 'pix', services: { washing: true, drying: false },
    createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    history: []
  });
  data['list-lavadora-1'].cards.push({
    id: 'card-2', listId: 'list-lavadora-1', customerName: 'Maria Oliveira', customerDocument: '987.654.321-11', contact: '21 91234-5678',
    tags: [{ name: 'Assistido' }, { name: 'Peças', value: '12' }], notes: '',
    serviceValue: 20, paymentMethod: 'dinheiro', services: { washing: true, drying: false },
    createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    history: [
      {
        timestamp: new Date(now.getTime() - 86400000).toISOString(),
        fromListId: 'list-1',
        toListId: 'list-lavadora-1',
        fromListTitle: 'Aguardando',
        toListTitle: 'Lavadora 1'
      }
    ]
  });
  data['list-4'].cards.push({
    id: 'card-3', listId: 'list-4', customerName: 'Carlos Pereira', customerDocument: '111.222.333-44', contact: '31 99999-8888',
    tags: [{ name: 'Assistido' }, { name: 'Pronto' }], notes: 'Notificar cliente.',
    notifiedAt: new Date(Date.now() - 86400000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' }),
    serviceValue: 35, paymentMethod: 'dinheiro', services: { washing: true, drying: true },
    createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    history: []
  });
  data['list-5'].cards.push({
    id: 'card-5', listId: 'list-5', customerName: 'Mariana Lima', customerDocument: '777.888.999-00', contact: '41 98877-6655',
    tags: [{ name: 'Assistido' }], notes: '', serviceValue: 35, paymentMethod: 'pix', services: { washing: true, drying: true },
    createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    completedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    history: []
  });
  data['list-5'].cards.push({
    id: 'card-6', listId: 'list-5', customerName: 'Pedro Martins', customerDocument: '222.333.444-55', contact: '51 97766-5544',
    tags: [{ name: 'Assistido' }], notes: '', serviceValue: 20, paymentMethod: 'dinheiro', services: { washing: true, drying: false },
    createdAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
    completedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    history: []
  });

  data['list-secadora-1'].cards.push({
    id: 'card-dryer-1', listId: 'list-secadora-1', customerName: 'Fernanda Souza', customerDocument: '666.777.888-99', contact: '81 91122-3344',
    tags: [], notes: 'Ciclo de secagem delicado.', basketIdentifier: 'Roupas de bebê',
    serviceValue: 20, paymentMethod: 'pix', services: { washing: false, drying: true },
    createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    enteredDryerAt: new Date(now.getTime() - 29 * 60000).toISOString(),
    history: []
  });

  return data;
};

type View = 'board' | 'list' | 'tags' | 'profile' | 'dashboard' | 'print-labels' | 'history' | 'clients';

const App: React.FC = () => {
  const { currentUser, loading, login, logout } = useAuth();
  const [boardData, setBoardData] = useState<BoardData>({});
  const [listOrder, setListOrder] = useState<string[]>([]);
  const [tags, setTags] = useState<TagDefinition[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [isListSettingsModalOpen, setIsListSettingsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [listToEdit, setListToEdit] = useState<List | null>(null);
  const [currentView, setCurrentView] = useState<View>('board');
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const [laundryProfile, setLaundryProfile] = useState<LaundryProfile>({
    name: 'Lavanderia Inteligente',
    address: 'Rua das Máquinas, 123 - Bairro Bolhas',
    phone: '(11) 91234-5678',
    operatingHours: 'Seg-Sáb: 8h às 17h, Dom: 8h às 16h',
    servicePrices: {
      washing: 20.00,
      drying: 20.00,
      washingAndDrying: 35.00,
      // ... existing code ...
    }
  });

  const [stores, setStores] = useState<any[]>([]); // Should use Store type
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    // Logic to filter board by store can be added here
  };

  useEffect(() => {
    document.title = 'Lavanderia Kanban Inteligente';

    if (currentUser) {
      const fetchData = async () => {
        try {
          const [statuses, ordens] = await Promise.all([getStatusKanban(), getOrdens()]);

          const newBoardData: BoardData = {};
          const newOrder: string[] = [];

          // Process Statuses (Lists)
          const sortedStatuses = statuses.sort((a, b) => a.ordem - b.ordem);
          sortedStatuses.forEach(status => {
            const listId = `list-${status.id}`;
            newOrder.push(listId);
            newBoardData[listId] = {
              id: listId,
              title: status.titulo,
              cards: [],
              cardLimit: status.limiteCartoes,
              type: status.tipo || 'default',
              order: status.ordem,
              totalDryingTime: status.tempoSecagemTotal,
              reminderInterval: status.intervaloLeitura
            };
          });

          // Process Orders (Cards)
          ordens.forEach(ordem => {
            const listId = `list-${ordem.status.id}`;
            if (newBoardData[listId]) { // Check if list exists
              const cardId = `card-${ordem.id}`;
              const newCard: Card = {
                id: cardId,
                listId: listId,
                customerName: ordem.client ? ordem.client.name : 'Cliente Não Identificado',
                customerDocument: ordem.client ? (ordem.client.cpf || ordem.client.document) : '',
                contact: ordem.client ? ordem.client.phone : '',
                notes: ordem.observacoes || '',
                tags: [], // TODO: Map tags if backend supports them or use local logic
                serviceValue: Number(ordem.valorTotal),
                // paymentMethod: ordem.metodoPagamento, // Assuming backend has this
                services: { washing: true, drying: true }, // Placeholder, needs mapping
                createdAt: ordem.createdAt,
                completedAt: ordem.completedAt,
                client: ordem.client
              };
              newBoardData[listId].cards.push(newCard);
            }
          });

          // Sort cards by creation date (newest first)
          Object.values(newBoardData).forEach(list => {
            list.cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });

          setBoardData(newBoardData);
          setListOrder(newOrder);

        } catch (error) {
          console.error("Failed to fetch initial data", error);
          // Fallback to initial data if fetch fails? Or just show error?
          // For now, let's keep the mock data as fallback or just log.
          // setBoardData(buildInitialBoardData());
        }
      };
      fetchData();
    }
  }, [currentUser]);

  // Dark mode handler
  useEffect(() => {
    if (currentUser?.theme === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser]);

  const draggedItem = useRef<{ cardId: string; sourceListId: string } | { listId: string } | null>(null);
  // Rebuild tags map based on cards using a useMemo or effect is better if tags are dynamic defined by cards
  // For now we keep the static tags logic or should we derive from loaded cards? 
  // The original code derived tags from `initialBoardData`. We should do the same.
  const tagsMap = useMemo(() => {
    const map = new Map<string, TagDefinition>();
    // Default tags
    map.set('Peças', { name: 'Peças', color: TAG_COLORS[6].classes, type: 'número' });
    map.set('Assistido', { name: 'Assistido', color: TAG_COLORS[0].classes, type: 'texto' });
    map.set('Em Aberto', { name: 'Em Aberto', color: TAG_COLORS[3].classes, type: 'texto' });

    // Add tags from current boardData cards
    Object.values(boardData).forEach(list => {
      list.cards.forEach(card => {
        card.tags.forEach(tag => {
          if (!map.has(tag.name)) {
            const colorIndex = map.size % TAG_COLORS.length;
            map.set(tag.name, { name: tag.name, color: TAG_COLORS[colorIndex].classes, type: 'texto' });
          }
        });
      });
    });
    return map;
  }, [boardData]);

  // Notification handlers
  const addNotification = (message: string, type: ToastNotification['type'] = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const success = await login(email, password);
    if (success) {
      setCurrentView(currentUser?.role === 'admin' ? 'dashboard' : 'board');
    }
    return success;
  };

  const handleUpdateProfile = (profile: LaundryProfile) => {
    setLaundryProfile(profile);
  };

  const handleUpdateUserTheme = (theme: 'claro' | 'escuro') => {
    if (!currentUser) return;

    // This should be handled by the backend
    // const updatedUser = { ...currentUser, theme };
    // setCurrentUser(updatedUser);
  };

  // Card handlers
  const handleAddCard = (newCardData: Partial<Omit<Card, 'id' | 'listId'>> & { id?: string }) => {
    const hasAssistidoTag = newCardData.tags?.some(tag => tag.name === 'Assistido');
    let calculatedValue: number | undefined = undefined;

    if (hasAssistidoTag) {
      const isWashing = newCardData.services?.washing;
      const isDrying = newCardData.services?.drying;

      if (isWashing && isDrying) {
        calculatedValue = laundryProfile.servicePrices.washingAndDrying;
      } else if (isWashing) {
        calculatedValue = laundryProfile.servicePrices.washing;
      } else if (isDrying) {
        calculatedValue = laundryProfile.servicePrices.drying;
      } else {
        calculatedValue = 0;
      }
    }

    const cardDataWithPrice = {
      ...newCardData,
      paymentMethod: hasAssistidoTag ? newCardData.paymentMethod : undefined,
      serviceValue: calculatedValue
    };

    setBoardData(prevData => {
      const newData = { ...prevData };
      if (cardDataWithPrice.id) { // Editing existing card
        for (const listId in newData) {
          const cardIndex = newData[listId].cards.findIndex(c => c.id === cardDataWithPrice.id);
          if (cardIndex > -1) {
            const originalCard = newData[listId].cards[cardIndex];
            const updatedCard = { ...originalCard, ...cardDataWithPrice };

            // Ensure paymentMethod is cleared if "Assistido" is removed
            if (!updatedCard.tags?.some(tag => tag.name === 'Assistido')) {
              delete updatedCard.paymentMethod;
            }

            newData[listId].cards[cardIndex] = updatedCard as Card;
            break;
          }
        }
      } else { // Adding new card
        const newCard: Card = {
          customerName: '',
          contact: '',
          notes: '',
          tags: [],
          ...cardDataWithPrice,
          id: `card-${Date.now()}`,
          listId: listOrder[0],
          createdAt: new Date().toISOString(),
          history: [],
        };
        newData[listOrder[0]].cards.unshift(newCard);
      }
      return newData;
    });

    // Auto-create tags only if user is admin
    if (currentUser?.role === 'admin' && newCardData.tags) {
      newCardData.tags.forEach(tag => {
        if (!tags.some(t => t.name === tag.name)) {
          const colorIndex = tags.length % TAG_COLORS.length;
          const newTagDef: TagDefinition = {
            name: tag.name,
            color: TAG_COLORS[colorIndex].classes,
            type: 'texto' // Default type
          };
          setTags(prevTags => [...prevTags, newTagDef]);
        }
      });
    }

    setIsCardModalOpen(false);
    setCardToEdit(null);
  };

  const handleOpenAddCardModal = (initialData?: Partial<Card>) => {
    // If we have initial data, we create a temporary "Card to Edit"
    // so the modal is pre-filled. It's not a real card yet, so some fields are dummies.
    const cardData = initialData
      ? { ...initialData, id: '', listId: '', createdAt: new Date().toISOString() } as Card
      : null;
    setCardToEdit(cardData);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCardModal = (card: Card) => {
    setCardToEdit(card);
    setIsCardModalOpen(true);
  };

  const handleDeleteCard = (cardId: string, listId: string) => {
    setBoardData(prevData => {
      const newData = { ...prevData };
      const cards = newData[listId].cards.filter(c => c.id !== cardId);
      newData[listId].cards = cards;
      return newData;
    });
  };

  // List handlers
  const handleOpenAddListModal = () => {
    setIsAddListModalOpen(true);
  };

  const handleAddList = (title: string, limit: number | null, type: 'default' | 'dryer' | 'lavadora', totalDryingTime?: number, reminderInterval?: number) => {
    const newListId = `list-user-${Date.now()}`;
    const newList: List = { id: newListId, title, cards: [], cardLimit: limit, type, order: listOrder.length };

    if (type === 'dryer') {
      newList.totalDryingTime = totalDryingTime;
      newList.reminderInterval = reminderInterval;
    }

    setBoardData(prevData => ({ ...prevData, [newListId]: newList }));

    setListOrder(prevOrder => {
      const readyListIndex = prevOrder.indexOf('list-4');
      const newOrder = [...prevOrder];
      // Insert new list before "Pronto para Retirada"
      newOrder.splice(readyListIndex >= 0 ? readyListIndex : newOrder.length - 1, 0, newListId);
      return newOrder;
    });

    setIsAddListModalOpen(false);
  };

  const handleOpenListSettings = (listId: string) => {
    setListToEdit(boardData[listId]);
    setIsListSettingsModalOpen(true);
  };

  const handleSaveListSettings = (listId: string, title: string, limit: number | null, type: 'default' | 'dryer' | 'lavadora', totalDryingTime?: number, reminderInterval?: number) => {
    setBoardData(prevData => {
      const newData = { ...prevData };
      const list = newData[listId];
      if (list) {
        list.title = title;
        list.cardLimit = limit;
        list.type = type;
        if (type === 'dryer') {
          list.totalDryingTime = totalDryingTime;
          list.reminderInterval = reminderInterval;
        } else {
          delete list.totalDryingTime;
          delete list.reminderInterval;
          // Clear enteredDryerAt for all cards in this list if type is changed from dryer
          if (list.type !== 'dryer') {
            list.cards.forEach(c => delete c.enteredDryerAt);
          }
        }
      }
      return newData;
    });
  };

  const handleDeleteList = (listId: string) => {
    if (boardData[listId].cards.length > 0) {
      addNotification("Não é possível excluir uma lista que contém cartões. Mova-os para outra lista primeiro.");
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a lista "${boardData[listId].title}"?`)) {
      setBoardData(prevData => {
        const newData = { ...prevData };
        delete newData[listId];
        return newData;
      });
      setListOrder(prevOrder => prevOrder.filter(id => id !== listId));
    }
  };

  // Tag handlers
  const handleSaveTag = (tagToSave: TagDefinition) => {
    setTags(prevTags => {
      const existingIndex = prevTags.findIndex(t => t.name === tagToSave.name);
      if (existingIndex > -1) {
        const newTags = [...prevTags];
        newTags[existingIndex] = tagToSave;
        return newTags;
      }
      return [...prevTags, tagToSave];
    });
  };

  const handleDeleteTag = (tagName: string) => {
    if (window.confirm(`Tem certeza de que deseja excluir a etiqueta "${tagName}"? Isso a removerá de todos os cartões.`)) {
      // Remove from tag definitions
      setTags(prevTags => prevTags.filter(t => t.name !== tagName));
      // Remove from cards
      setBoardData(prevData => {
        const newData = { ...prevData };
        Object.keys(newData).forEach(listId => {
          newData[listId].cards = newData[listId].cards.map(card => ({
            ...card,
            tags: card.tags.filter(tag => tag.name !== tagName)
          }));
        });
        return newData;
      });
    }
  };

  // Drag and Drop handlers
  const onCardDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string, sourceListId: string) => {
    draggedItem.current = { cardId, sourceListId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const onListDragStart = (e: React.DragEvent<HTMLDivElement>, listId: string) => {
    draggedItem.current = { listId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = async (e: React.DragEvent, targetListId: string, targetCardId?: string) => {
    e.preventDefault();
    if (!draggedItem.current) return;

    // Handle list drop
    if ('listId' in draggedItem.current) {
      const sourceListId = draggedItem.current.listId;
      if (sourceListId === targetListId) {
        draggedItem.current = null;
        return;
      }

      setListOrder(prevOrder => {
        const newOrder = [...prevOrder];
        const sourceIndex = newOrder.indexOf(sourceListId);
        const targetIndex = newOrder.indexOf(targetListId);

        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceListId);
        return newOrder;
      });

    }
    // Handle card drop
    else if ('cardId' in draggedItem.current) {
      const { cardId, sourceListId } = draggedItem.current;

      // Prevent dropping at the end of the same list without reordering
      if (sourceListId === targetListId && !targetCardId) {
        draggedItem.current = null;
        return;
      }

      // --- VALIDATIONS ---
      const sourceListFromState = boardData[sourceListId];
      const targetListFromState = boardData[targetListId];
      const cardToMove = sourceListFromState?.cards.find(c => c.id === cardId);

      if (!cardToMove || !targetListFromState || !sourceListFromState) {
        draggedItem.current = null;
        return;
      }

      // 1. Check list limit
      if (targetListFromState.cardLimit != null && targetListFromState.cards.length >= targetListFromState.cardLimit && sourceListId !== targetListId) {
        addNotification(`A lista "${targetListFromState.title}" já atingiu o seu limite de ${targetListFromState.cardLimit} cartões.`);
        draggedItem.current = null;
        return;
      }

      // 2. Check "lavadora" type
      if (targetListFromState.type === 'lavadora' && !cardToMove.services?.washing) {
        addNotification(`Este pedido não pode ser movido para "${targetListFromState.title}" pois o serviço de lavagem não foi selecionado.`);
        draggedItem.current = null;
        return;
      }

      // 3. Check "dryer" type
      if (targetListFromState.type === 'dryer' && !cardToMove.services?.drying) {
        addNotification(`Este pedido não pode ser movido para "${targetListFromState.title}" pois o serviço de secagem não foi selecionado.`);
        draggedItem.current = null;
        return;
      }

      // 4. Check for "Em Aberto" tag before moving to "Finalizado"
      if (targetListId === 'list-5' && cardToMove.tags.some(tag => tag.name === 'Em Aberto')) {
        addNotification("Não é possível finalizar um pedido com a etiqueta 'Em Aberto'.");
        draggedItem.current = null;
        return;
      }

      // 5. Check if moving between machines of the same type
      const isMovingBetweenSameMachineType =
        sourceListId !== targetListId &&
        ((sourceListFromState.type === 'lavadora' && targetListFromState.type === 'lavadora') ||
          (sourceListFromState.type === 'dryer' && targetListFromState.type === 'dryer'));

      if (isMovingBetweenSameMachineType) {
        addNotification("Não é possível mover um pedido entre máquinas do mesmo tipo.");
        draggedItem.current = null;
        return;
      }
      // --- END OF VALIDATIONS ---

      // Integrar com o Backend (AWAIT changes)
      if (sourceListId !== targetListId) {
        const userId = currentUser ? String(currentUser.id) : undefined;

        const extractId = (str: string) => {
          const match = str.match(/(\d+)$/);
          if (!match) {
            if (!isNaN(Number(str))) return str;
            console.warn(`[extractId] Não foi possível extrair ID de: ${str}`);
            return null;
          }
          return match[1];
        };

        const cardIdNum = extractId(cardId);
        const targetListIdNum = extractId(targetListId);
        const userIdStr = userId;

        console.log(`[onDrop] Movendo Card ID: ${cardIdNum} para Lista ID: ${targetListIdNum} pelo Usuário: ${userIdStr}`);

        if (cardIdNum && targetListIdNum) {
          try {
            await mudarStatusOrdem(cardIdNum, targetListIdNum, userIdStr);
            console.log('[onDrop] Backend updated successfully');
          } catch (err) {
            console.error('[onDrop] Failed to update backend:', err);
            addNotification('Erro ao sincronizar movimento com o servidor.', 'error');
            draggedItem.current = null;
            return; // Don't update local state if backend failed
          }
        } else {
          console.warn('[onDrop] IDs inválidos para atualização de status', { cardId, targetListId });
          addNotification("Erro interno: IDs inválidos.", "error");
          draggedItem.current = null;
          return;
        }
      }

      // Update Local State
      setBoardData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        const sourceList = newData[sourceListId];
        const targetList = newData[targetListId];

        const cardIndex = sourceList.cards.findIndex((c: Card) => c.id === cardId);
        if (cardIndex === -1) return prevData;

        const [movedCard] = sourceList.cards.splice(cardIndex, 1);

        // Add history event for card movement
        if (sourceListId !== targetListId) {
          const historyEvent: CardHistoryEvent = {
            timestamp: new Date().toISOString(),
            fromListId: sourceListId,
            toListId: targetListId,
            fromListTitle: sourceList.title,
            toListTitle: targetList.title
          };
          if (!movedCard.history) {
            movedCard.history = [];
          }
          // Use unshift to add to beginning if array exists, else create it
          if (!movedCard.history) movedCard.history = [];
          movedCard.history.unshift(historyEvent);
        }

        movedCard.listId = targetListId;

        // Handle Dryer List Logic
        if (targetList.type === 'dryer' && (sourceListId !== targetListId || !movedCard.enteredDryerAt)) {
          movedCard.enteredDryerAt = new Date().toISOString();
        } else if (targetList.type !== 'dryer' && movedCard.enteredDryerAt) {
          delete movedCard.enteredDryerAt;
        }

        // Check if card moved to 'Finalizado' list
        if (targetListId === 'list-5' && sourceListId !== 'list-5') {
          movedCard.completedAt = new Date().toISOString();
        } else if (sourceListId === 'list-5' && targetListId !== 'list-5') {
          delete movedCard.completedAt;
        }

        // Check if card moved to 'Pronto para Retirada'
        if (targetListId === 'list-4' && sourceListId !== 'list-4') {
          movedCard.notifiedAt = new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'short',
            timeStyle: 'short',
          });
        } else if (sourceListId === 'list-4' && targetListId !== 'list-4') {
          delete movedCard.notifiedAt;
        }

        if (targetCardId) {
          const targetIndex = targetList.cards.findIndex((c: Card) => c.id === targetCardId);
          targetList.cards.splice(targetIndex, 0, movedCard);
        } else {
          targetList.cards.push(movedCard);
        }

        return newData;
      });
    }

    draggedItem.current = null;
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const getActiveCards = () => {
    let activeCards: Card[] = [];
    listOrder.forEach(listId => {
      // 'list-5' is the 'Finalizado' (Completed) column
      if (listId !== 'list-5') {
        activeCards = activeCards.concat(boardData[listId].cards);
      }
    });
    return activeCards;
  };

  const getAllCardsSorted = (): Card[] => {
    const allCards = listOrder.flatMap(listId =>
      boardData[listId] ? boardData[listId].cards : []
    );
    return allCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage boardData={boardData} />;
      case 'list':
        return <ListView
          cards={getAllCardsSorted()}
          boardData={boardData}
          tagsMap={tagsMap}
          onEditCard={handleOpenEditCardModal}
          onDeleteCard={handleDeleteCard}
          currentUser={currentUser!}
        />;
      case 'history':
        return <HistoryPage cards={getAllCardsSorted()} />;
      case 'clients':
        return <ClientsPage
          onAddCard={handleAddCard}
          onOpenAddCardModal={handleOpenAddCardModal}
          stores={stores}
          tags={tags}
        />;
      case 'tags':
        return <TagsPage
          boardData={boardData}
          tags={tags}
          onSaveTag={handleSaveTag}
          onDeleteTag={handleDeleteTag}
          currentUser={currentUser!}
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={handleSelectStore}
        />;
      case 'profile':
        return <ProfilePage profile={laundryProfile} currentUser={currentUser!} onUpdateProfile={handleUpdateProfile} onUpdateUserTheme={handleUpdateUserTheme} />;
      case 'print-labels':
        return <PrintLabelsPage cards={getActiveCards()} />;
      case 'board':
      default:
        return (
          <KanbanBoard
            boardData={boardData}
            listOrder={listOrder}
            onEditCard={handleOpenEditCardModal}
            onDeleteCard={handleDeleteCard}
            onOpenListSettings={handleOpenListSettings}
            onAddList={handleOpenAddListModal}
            tagsMap={tagsMap}
            onCardDragStart={onCardDragStart}
            onListDragStart={onListDragStart}
            onDrop={onDrop}
            currentUser={currentUser!}
            stores={stores}
            selectedStoreId={selectedStoreId}
            onSelectStore={handleSelectStore}
          />
        );
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen font-sans bg-laundry-blue-50 dark:bg-slate-900">
      <Header onAddCard={() => handleOpenAddCardModal()} onNavigate={handleNavigate} onLogout={logout} currentUser={currentUser} currentView={currentView} />
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      {renderContent()}

      <AddCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleAddCard}
        cardToEdit={cardToEdit}
        allTags={tags}
        tagsMap={tagsMap}
        currentUser={currentUser!}
        stores={stores}
      />
      <AddListModal
        isOpen={isAddListModalOpen}
        onClose={() => setIsAddListModalOpen(false)}
        onSave={handleAddList}
        stores={stores}
      />
      <ListSettingsModal
        isOpen={isListSettingsModalOpen}
        onClose={() => setIsListSettingsModalOpen(false)}
        onSave={handleSaveListSettings}
        onDelete={handleDeleteList}
        list={listToEdit}
      />
    </div>
  );
};

export default App;