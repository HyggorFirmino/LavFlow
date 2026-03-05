import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import { BoardData, Card, List, TagDefinition, User, LaundryProfile, ToastNotification, Client, Store, ViewType } from '../types';
import { TAG_COLORS } from '../constants';

import Header from '../components/Header';
import KanbanBoard from '../components/KanbanBoard';
import AddCardModal from '../components/AddCardModal';
import EditCardModal from '../components/EditCardModal';
import AddListModal from '../components/AddListModal';
import ListSettingsModal from '../components/ListSettingsModal';
import TagsPage from '../components/TagsPage';
import Login from '../components/Login';
import ProfilePage from '../components/ProfilePage';
import DashboardPage from '../components/DashboardPage';
import PrintLabelsPage from '../components/PrintLabelsPage';
import ListView from '../components/ListView';
import HistoryPage from '../components/HistoryPage';
import ClientsPage from '../components/ClientsPage';
import RecargaPage from '../components/RecargaPage';
import MovimentacoesPage from '../components/MovimentacoesPage';
import MachineOperationPage from '../components/MachineOperationPage';
import { ExclamationTriangleIcon, XMarkIcon } from '../components/icons';
import { fetchClients } from '../services/maxpanApiService';
import { getOrdens, getStatusKanban, createList, updateList, deleteList, createOrdem, updateOrdem, mudarStatusOrdem, reorderStatusOrdem } from '../services/apiService';
import { getStores, updateStore } from '../services/storeService';
import { login } from '../services/userService';
import CreateMultipleCardsModal from '../components/CreateMultipleCardsModal';

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

  const TITLES = {
    error: 'Ação não permitida',
    success: 'Sucesso',
    info: 'Informação',
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 flex items-start w-full max-w-sm border-l-4 ${BORDER_COLORS[notification.type]} animate-toast-in`}
      role="alert"
    >
      <div className="flex-shrink-0">{ICONS[notification.type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{TITLES[notification.type]}</p>
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



const Home: React.FC = () => {
  const [boardData, setBoardData] = useState<BoardData>({});
  const [listOrder, setListOrder] = useState<string[]>([]);
  const [tags, setTags] = useState<TagDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [isListSettingsModalOpen, setIsListSettingsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [listToEdit, setListToEdit] = useState<List | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(process.env.NEXT_PUBLIC_SELECTED_STORE_ID || '');

  const [users, setUsers] = useState<User[]>([
    { id: 'user-admin', name: 'Administrador', email: 'admin@lavanderia.com', password: 'admin123', role: 'ADMIN', theme: 'claro' },
    { id: 'user-employee', name: 'Funcionário Teste', email: 'func@lavanderia.com', password: 'func123', role: 'EMPLOYEE', theme: 'claro' }
  ]);
  const [laundryProfile, setLaundryProfile] = useState<LaundryProfile>({
    name: 'Lavanderia Inteligente',
    address: 'Rua das Máquinas, 123 - Bairro Bolhas',
    phone: '(11) 91234-5678',
    operatingHours: 'Seg-Sáb: 8h às 17h, Dom: 8h às 16h',
    servicePrices: {
      washing: 20.00,
      drying: 20.00,
      washingAndDrying: 35.00,
    }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  // Notification handler
  const addNotification = (message: string, type: ToastNotification['type'] = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const loadBoardData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [statuses, ordens, storesData] = await Promise.all([
        getStatusKanban(),
        getOrdens(),
        getStores(),
      ]);

      setStores(storesData);

      // Select first store if none selected
      let currentStoreId = selectedStoreId;
      if (!currentStoreId && storesData.length > 0) {
        currentStoreId = String(storesData[0].id);
        setSelectedStoreId(currentStoreId);
      }

      const newBoardData: BoardData = {};
      const newTagMap = new Map<string, TagDefinition>();

      // 1. Processar Status (Listas)
      statuses.forEach((status: any) => {
        // Filter by store if selected
        if (currentStoreId && status.store && String(status.store.id) !== currentStoreId) {
          return;
        }
        const listId = String(status.id);
        newBoardData[listId] = {
          id: listId,
          title: status.titulo,
          order: status.ordem,
          cardLimit: status.limiteCartoes,
          type: status.tipo,
          totalDryingTime: status.tempoSecagemTotal,
          reminderInterval: status.intervaloLeitura,
          cards: [],
        };
      });

      // 2. Processar Ordens (Cartões) e Tags
      ordens.forEach((ordem: any) => {
        if (!ordem.status) {
          console.warn(`Ordem ${ordem.id} não tem um status definido e será ignorada.`);
          return;
        }
        const listId = String(ordem.status.id);
        if (newBoardData[listId]) {
          const card: Card = {
            id: String(ordem.id),
            client: ordem.client,
            listId: listId,
            customerName: ordem.client?.name || ordem.customerName || 'Cliente sem nome',
            customerDocument: ordem.customerDocument,
            notes: ordem.notes,
            contact: ordem.contact,
            serviceValue: Number(ordem.serviceValue),
            paymentMethod: ordem.paymentMethod,
            tags: ordem.tags || [],
            basketIdentifier: ordem.basketIdentifier,
            notifiedAt: ordem.notifiedAt ? new Date(ordem.notifiedAt).toISOString() : undefined,
            enteredDryerAt: ordem.enteredDryerAt ? new Date(ordem.enteredDryerAt).toISOString() : undefined,
            services: ordem.services,
            createdAt: new Date(ordem.createdAt).toISOString(),
            completedAt: ordem.completedAt ? new Date(ordem.completedAt).toISOString() : undefined,
            history: (ordem.historico || []).map((h: any) => ({
              timestamp: new Date(h.timestamp).toISOString(),
              fromListId: '', // Entity doesn't store IDs
              toListId: '',
              fromListTitle: h.fromListTitle,
              toListTitle: h.toListTitle,
            })),
          };

          newBoardData[listId].cards.push(card);

          // Processar tags do cartão
          card.tags.forEach((tag: any) => {
            if (!newTagMap.has(tag.name)) {
              const colorIndex = newTagMap.size % TAG_COLORS.length;
              newTagMap.set(tag.name, { name: tag.name, color: TAG_COLORS[colorIndex].classes, type: 'texto' });
            }
          });
        }
      });

      // Ordenar listas
      const fetchedListOrder = statuses.map((s: any) => String(s.id));
      setListOrder(fetchedListOrder);

      // Ordenar todas as listas com ordem 1 pelo ID (crescente)
      Object.keys(newBoardData).forEach(listId => {
        const list = newBoardData[listId];
        // Verifica se a ordem é 1 (comparando como número para garantir)
        if (list && Number(list.order) === 1 && list.cards) {
          list.cards.sort((a, b) => {
            const idA = parseInt(a.id, 10);
            const idB = parseInt(b.id, 10);
            // Se o ID não for numérico, fall back para comparação de string ou manter ordem
            if (isNaN(idA) || isNaN(idB)) {
              return a.id.localeCompare(b.id, undefined, { numeric: true });
            }
            return idA - idB;
          });
        }
      });

      setBoardData(newBoardData);
      setTags(Array.from(newTagMap.values()));

    } catch (error) {
      console.error("Erro ao carregar dados do quadro:", error);
      addNotification("Falha ao carregar os dados do quadro. Tente recarregar a página.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]); // Reload when loadBoardData changes (which depends on selectedStoreId)

  // Initial load of stores from currentUser
  useEffect(() => {
    if (currentUser && currentUser.stores && currentUser.stores.length > 0) {
      setStores(currentUser.stores);
      if (!selectedStoreId) {
        setSelectedStoreId(String(currentUser.stores[0].id));
      }
    } else {
      setStores([]);
    }
  }, [currentUser]);

  // Load user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('lavflow_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user) {
          setCurrentUser(user);
          // Redirect based on role if needed, but usually just staying on current page is fine
          // setCurrentView(user.role === 'ADMIN' ? 'dashboard' : 'board');
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('lavflow_user');
      }
    }
  }, []);

  // Fetch clients separately
  useEffect(() => {
    const selectedStore = stores.find(s => String(s.id) === selectedStoreId);
    fetchClients(selectedStore?.maxpanId).then(setClients).catch(e => console.error("Error fetching clients", e));
  }, [selectedStoreId, stores]);



  // Dark mode handler
  useEffect(() => {
    if (currentUser?.theme === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser]);

  const draggedItem = useRef<{ cardId: string; sourceListId: string } | { listId: string } | null>(null);
  const tagsMap = useMemo(() => new Map(tags.map(tag => [tag.name, tag])), [tags]);

  // Notification handlers
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Login and Profile handlers
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await login({ email, password });
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('lavflow_user', JSON.stringify(user));
        // Redirect based on role
        setCurrentView(user.role === 'ADMIN' ? 'dashboard' : 'board');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      addNotification("Email ou senha inválidos", "error");
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lavflow_user');
  };

  const handleUpdateStore = async (storeId: string, data: Partial<Store>) => {
    try {
      const updatedStore = await updateStore(storeId, data);
      setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));

      // Update currentUser stores
      if (currentUser && currentUser.stores) {
        const newStores = currentUser.stores.map(s => s.id === updatedStore.id ? updatedStore : s);
        const updatedUser = { ...currentUser, stores: newStores };
        setCurrentUser(updatedUser);
        localStorage.setItem('lavflow_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Failed to update store", e);
      addNotification("Erro ao atualizar loja", "error");
      throw e;
    }
  };

  const handleUpdateProfile = (profile: LaundryProfile) => {
    setLaundryProfile(profile);
  };

  const handleUpdateUserTheme = (theme: 'claro' | 'escuro') => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, theme };
    setCurrentUser(updatedUser);

    setUsers(prevUsers =>
      prevUsers.map(u => (u.id === currentUser.id ? updatedUser : u))
    );
  };

  const handleSaveUser = (newUser: Omit<User, 'id'>): boolean => {
    if (users.some(u => u.email === newUser.email)) {
      addNotification('Já existe um usuário com este email.');
      return false;
    }
    const userWithId: User = { ...newUser, id: `user-${Date.now()}` };
    setUsers(prevUsers => [...prevUsers, userWithId]);
    return true;
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    }
  };


  // Card handlers
  const handleAddCard = async (newCardData: Partial<Omit<Card, 'id' | 'listId'>> & { id?: string; storeId?: number; listId?: string }) => {
    // Logic to properly add card with store context
    // If storeId is provided (from AddCardModal for new cards), find the first list of that store.

    try {
      let finalListId = '';

      if (newCardData.listId) {
        finalListId = newCardData.listId;
      } else if (newCardData.storeId) {
        // Fetch all statuses to find the correct one for the target store
        const allStatuses = await getStatusKanban();
        console.log("Searching for status in store:", newCardData.storeId);

        // Filter statuses by store taking type safety into account
        const storeStatuses = allStatuses.filter((s: any) =>
          s.store && String(s.store.id) === String(newCardData.storeId)
        );

        // Sort by order
        storeStatuses.sort((a: any, b: any) => a.ordem - b.ordem);

        if (storeStatuses.length > 0) {
          finalListId = String(storeStatuses[0].id);
          console.log("Found target list:", finalListId, "for store:", newCardData.storeId);
        } else {
          console.warn("No lists found for store:", newCardData.storeId);
          addNotification("A loja selecionada não possui listas. Verifique as configurações.", "error");
          return;
        }
      } else {
        // Fallback logic if storeId is missing
        if (listOrder.length > 0) {
          finalListId = listOrder[0];
          console.log("Defaulting to first list of current view:", finalListId);
        }
      }

      const cardToSave = {
        ...newCardData,
        listId: finalListId,
      };

      if (newCardData.id) {
        console.log("Updating card:", newCardData.id, cardToSave);
        await updateOrdem(newCardData.id, cardToSave);
        addNotification("Cartão atualizado com sucesso!", "success");
      } else {
        console.log("Creating card in list:", finalListId, newCardData);
        await createOrdem(cardToSave);
        addNotification("Cartão criado com sucesso!", "success");
      }

      setIsCardModalOpen(false);
      loadBoardData();

    } catch (e) {
      console.error("Erro ao salvar cartão:", e);
      addNotification("Erro ao salvar cartão. Verifique o console.", "error");
    }
  };

  const handleUpdateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      console.log("Updating card:", cardId, updates);
      await updateOrdem(cardId, updates);
      addNotification("Cartão atualizado com sucesso!", "success");
      setIsEditCardModalOpen(false);
      setCardToEdit(null);
      loadBoardData();
    } catch (e) {
      console.error("Erro ao atualizar cartão:", e);
      addNotification("Erro ao atualizar cartão.", "error");
    }
  };

  const handleOpenAddCardModal = (initialData?: Partial<Card>) => {
    const cardData = initialData
      ? { ...initialData, id: '', listId: '', createdAt: new Date().toISOString() } as Card
      : null;
    setCardToEdit(cardData);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCardModal = (card: Card) => {
    setCardToEdit(card);
    setIsEditCardModalOpen(true);
  };

  const handleDeleteCard = (cardId: string, listId: string) => {
    // This function will now likely need to call the API to delete a card
    console.log("Deleting card (local state):", cardId, listId);
    // A proper implementation would call deleteOrdem from apiService
    // and then reload the board data or update the state.
  };

  // List handlers
  const handleOpenAddListModal = () => {
    setIsAddListModalOpen(true);
  };

  const handleAddList = async (title: string, limit: number | null, type: 'default' | 'dryer' | 'lavadora' | 'whatsapp', storeId: number, totalDryingTime?: number, reminderInterval?: number) => {
    try {
      if (!storeId) {
        addNotification("Loja não selecionada.", "error");
        return;
      }

      await createList({
        title,
        order: undefined, // Backend manages order
        storeId: storeId,
        cardLimit: limit,
        type,
        totalDryingTime,
        reminderInterval
      });
      addNotification("Lista criada com sucesso!", "success");
      setIsAddListModalOpen(false);
      // Reload data - simplistic way, ideally we'd just fetch the new list or update state locally
      // But since we wrapped the loader in useEffect, we can just toggle a "refresh" state or call the loader if extracted.
      // For now, let's force a reload by creating a refresh trigger or extracting load function.
      // Since extracting is cleaner but changes more code, I'll allow the reload by re-triggering the fetch
      // A simple way is to define loadBoardData outside.
      // Ideally we would just call loadBoardData() but since it's wrapped in useEffect heavily, 
      // let's try to convert it to useCallback to be callable.
      // Now that loadBoardData is a useCallback, we can call it:
      loadBoardData();
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      addNotification("Erro ao criar lista.", "error");
    }
  };

  const handleOpenListSettings = (listId: string) => {
    setListToEdit(boardData[listId]);
    setIsListSettingsModalOpen(true);
  };

  const handleSaveListSettings = async (listId: string, title: string, limit: number | null, type: 'default' | 'dryer' | 'lavadora' | 'whatsapp', totalDryingTime?: number, reminderInterval?: number) => {
    try {
      await updateList(listId, {
        title,
        cardLimit: limit,
        type,
        totalDryingTime,
        reminderInterval
      });
      addNotification("Lista atualizada com sucesso!", "success");
      setIsListSettingsModalOpen(false);
      setListToEdit(null);
      loadBoardData();
    } catch (e) {
      console.error("Erro ao atualizar lista:", e);
      addNotification("Erro ao atualizar lista.", "error");
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta lista?')) {
      try {
        await deleteList(listId);
        addNotification("Lista excluída com sucesso!", "success");
        setIsListSettingsModalOpen(false);
        setListToEdit(null);
        loadBoardData();
      } catch (e) {
        console.error("Erro ao excluir lista:", e);
        // Backend likely validates if it has cards, but let's see if we get a specific error message.
        // Assuming 'e' might be an error object or response.
        addNotification("Erro ao excluir lista. Verifique se ela está vazia.", "error");
      }
    }
  };

  // Tag handlers
  const handleSaveTag = (tagToSave: TagDefinition) => {
    // This might need an API endpoint in the future
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
    // This might need an API endpoint in the future
    if (window.confirm(`Tem certeza de que deseja excluir a etiqueta "${tagName}"? Isso a removerá de todos os cartões.`)) {
      setTags(prevTags => prevTags.filter(t => t.name !== tagName));
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

  // Drag and Drop handlers (mouse - desktop)
  const onCardDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string, sourceListId: string) => {
    draggedItem.current = { cardId, sourceListId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const onListDragStart = (e: React.DragEvent<HTMLDivElement>, listId: string) => {
    draggedItem.current = { listId };
    e.dataTransfer.effectAllowed = 'move';
  };

  // Touch drag handler (mobile) — set dragged item, same ref as mouse handlers
  const onTouchCardDragStart = (cardId: string, sourceListId: string) => {
    draggedItem.current = { cardId, sourceListId };
  };

  const onDrop = async (e: React.DragEvent, targetListId: string, targetCardId?: string) => {
    e.preventDefault();

    const data = draggedItem.current;

    // --- REORDENAÇÃO DE LISTAS ---
    if (data && 'listId' in data && !('cardId' in data)) {
      const sourceListId = (data as { listId: string }).listId;
      if (sourceListId === targetListId) return;

      const previousListOrder = [...listOrder];
      // Move list in local state
      const newListOrder = [...listOrder];
      const sourceIndex = newListOrder.indexOf(sourceListId);
      const targetIndex = newListOrder.indexOf(targetListId);

      if (sourceIndex === -1 || targetIndex === -1) return;

      newListOrder.splice(sourceIndex, 1);
      newListOrder.splice(targetIndex, 0, sourceListId);

      setListOrder(newListOrder);

      const storeIdNumber = parseInt(selectedStoreId, 10);
      if (isNaN(storeIdNumber)) {
        console.error("Tentativa de reordenar sem loja selecionada válida:", selectedStoreId);
        addNotification("Erro interno: Loja não definida.", "error");
        setListOrder(previousListOrder);
        return;
      }

      try {
        const orderedIds = newListOrder.map(id => parseInt(id, 10));
        await reorderStatusOrdem(storeIdNumber, orderedIds);
        // Recarregar os dados do backend para garantir consistência
        await loadBoardData();
      } catch (error) {
        console.error("Erro ao reordenar listas:", error);
        addNotification("Falha ao reordenar listas. Desfazendo.", "error");
        setListOrder(previousListOrder);
      }
      return;
    }

    if (!data || !('cardId' in data)) return;

    // Explicit cast since we know it has cardId
    const { cardId, sourceListId } = data as { cardId: string; sourceListId: string };

    // Se soltou na mesma lista, não faz nada
    if (sourceListId === targetListId) return;

    // Snapshot para rollback em caso de erro
    const previousBoardData = { ...boardData };

    // Encontrar o cartão e a lista de destino
    const cardToMove = boardData[sourceListId]?.cards.find(c => c.id === cardId);
    const targetList = boardData[targetListId];

    if (!cardToMove || !targetList) return;

    // --- VALIDAÇÕES ---

    // 1. Limite da coluna
    if (typeof targetList.cardLimit === 'number' && targetList.cards.length >= targetList.cardLimit) {
      addNotification(`A lista "${targetList.title}" atingiu o limite de ${targetList.cardLimit} cartões.`, "error");
      return;
    }

    // 2. Tipo de serviço (Lavadora/Secadora)
    if (targetList.type === 'lavadora') {
      // Verifica se o cartão tem serviço de lavagem
      if (!cardToMove.services || !cardToMove.services.washing) {
        addNotification(`Este cartão não contém serviço de lavagem e não pode entrar na lista "${targetList.title}".`, "error");
        return;
      }
    }

    if (targetList.type === 'dryer') {
      // Verifica se o cartão tem serviço de secagem
      if (!cardToMove.services || !cardToMove.services.drying) {
        addNotification(`Este cartão não contém serviço de secagem e não pode entrar na lista "${targetList.title}".`, "error");
        return;
      }
    }


    const updatedCard = { ...cardToMove, listId: targetListId };

    // Atualização Otimista
    setBoardData(prev => {
      const newData = { ...prev };

      // Remover da origem
      if (newData[sourceListId]) {
        newData[sourceListId] = {
          ...newData[sourceListId],
          cards: newData[sourceListId].cards.filter(c => c.id !== cardId)
        };
      }

      // Adicionar ao destino
      if (newData[targetListId]) {
        newData[targetListId] = {
          ...newData[targetListId],
          cards: [...newData[targetListId].cards, updatedCard]
        };
      }

      return newData;
    });

    try {
      // Passar o ID do usuário logado (assumindo que seja numérico ou convertível)
      // Se id for "user-admin", o backend pode falhar se esperar int.
      // O mock tem "user-admin". Vamos testar. Se precisar, usamos 1 para teste se não for numérico.
      // Mas o correto é usar currentUser.id.
      // Vamos assumir que em prod o ID é numérico. Para dev, se for string não numérico,
      // a conversão via Number() vai dar NaN.
      // Ajuste: verificar se é NaN.
      let userIdToSend = Number(currentUser?.id);
      if (isNaN(userIdToSend)) {
        // Fallback para dev/mock se o ID não for numérico
        // Se o usuário for admin mockado, enviamos 1 ou null
        userIdToSend = 1; // Default to 1 for mocking purposes if string
      }

      await mudarStatusOrdem(cardId, targetListId, String(userIdToSend));
    } catch (error) {
      console.error("Erro ao mover cartão:", error);
      addNotification("Falha ao mover cartão. Desfazendo alterações.", "error");
      setBoardData(previousBoardData);
    }
  };

  // Touch drop handler (mobile) — placed after onDrop so the reference is safe
  const onTouchDrop = async (targetListId: string) => {
    const fakeEvent = { preventDefault: () => { } } as React.DragEvent;
    await onDrop(fakeEvent, targetListId);
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
  };

  const getActiveCards = () => {
    let activeCards: Card[] = [];
    listOrder.forEach(listId => {
      const list = boardData[listId];
      // Assuming list '5' is 'Finalizado' based on previous logic
      if (list && list.title !== 'Finalizado') {
        activeCards = activeCards.concat(list.cards);
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

  const [rechargeCpf, setRechargeCpf] = useState<string>('');

  const handleNavigateToRecharge = (cpf: string) => {
    setRechargeCpf(cpf);
    setCurrentView('recarga');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage
          boardData={boardData}
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
        />;
      case 'list':
        return <ListView
          cards={getAllCardsSorted()}
          boardData={boardData}
          tagsMap={tagsMap}
          onEditCard={handleOpenEditCardModal}
          onDeleteCard={handleDeleteCard}
          currentUser={currentUser!}
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
        />;
      case 'history':
        return <HistoryPage
          cards={getAllCardsSorted()}
          onRefresh={loadBoardData}
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
        />;
      case 'clients':
        return <ClientsPage
          onAddCard={handleAddCard}
          onOpenAddCardModal={handleOpenAddCardModal}
          stores={stores}
          tags={tags}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
          onNavigateToRecharge={handleNavigateToRecharge}
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
          onSelectStore={setSelectedStoreId} // Assuming handleSelectStore logic is simple or passed directly
        />;
      case 'recarga':
        return <RecargaPage stores={stores} selectedStoreId={selectedStoreId} onSelectStore={setSelectedStoreId} initialCpf={rechargeCpf} />;
      case 'movimentacoes':
        return <MovimentacoesPage stores={stores} selectedStoreId={selectedStoreId} onSelectStore={setSelectedStoreId} />;
      case 'machine-operation':
        return <MachineOperationPage stores={stores} selectedStoreId={selectedStoreId} onSelectStore={setSelectedStoreId} />;
      case 'profile':
        return <ProfilePage stores={stores} currentUser={currentUser!} onUpdateStore={handleUpdateStore} onUpdateUserTheme={handleUpdateUserTheme} />;
      case 'print-labels':
        return <PrintLabelsPage
          cards={getActiveCards()}
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
        />;
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
            onTouchDragStart={onTouchCardDragStart}
            onTouchDrop={onTouchDrop}
            currentUser={currentUser!}
            stores={stores}
            selectedStoreId={selectedStoreId}
            onSelectStore={setSelectedStoreId}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-laundry-blue-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">LavFlow</h1>
          <p className="mt-2 text-lg text-laundry-blue-700 dark:text-slate-300">Carregando quadro...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Head>
        <title>Lavanderia Kanban Inteligente</title>
      </Head>
      <div className="flex flex-col h-screen max-h-screen font-sans bg-laundry-blue-50 dark:bg-slate-900">
        <Header onAddCard={() => handleOpenAddCardModal()} onNavigate={handleNavigate} onLogout={handleLogout} currentUser={currentUser} currentView={currentView} />
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
        {cardToEdit && (
          <EditCardModal
            isOpen={isEditCardModalOpen}
            onClose={() => {
              setIsEditCardModalOpen(false);
              setCardToEdit(null);
            }}
            onSave={handleUpdateCard}
            card={cardToEdit}
            allTags={tags}
            tagsMap={tagsMap}
            currentUser={currentUser!}
          />
        )}
        <AddListModal
          isOpen={isAddListModalOpen}
          onClose={() => setIsAddListModalOpen(false)}
          onSave={handleAddList}
          stores={stores}
          currentStoreId={selectedStoreId}
        />
        <ListSettingsModal
          isOpen={isListSettingsModalOpen}
          onClose={() => setIsListSettingsModalOpen(false)}
          onSave={handleSaveListSettings}
          onDelete={handleDeleteList}
          list={listToEdit}
        />
      </div>
    </>
  );
};

export default Home;
