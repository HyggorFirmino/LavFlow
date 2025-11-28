import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import { BoardData, Card, List, TagDefinition, User, LaundryProfile, ToastNotification, Client } from '../types';
import { TAG_COLORS } from '../constants';
import Header from '../components/Header';
import KanbanBoard from '../components/KanbanBoard';
import AddCardModal from '../components/AddCardModal';
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
import { ExclamationTriangleIcon, XMarkIcon } from '../components/icons';
import { fetchClients } from '../services/maxpanApiService';
import { getOrdens, getStatusKanban } from '../services/apiService';
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

type View = 'board' | 'list' | 'tags' | 'profile' | 'dashboard' | 'print-labels' | 'history' | 'clients';

const Home: React.FC = () => {
  const [boardData, setBoardData] = useState<BoardData>({});
  const [listOrder, setListOrder] = useState<string[]>([]);
  const [tags, setTags] = useState<TagDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [isListSettingsModalOpen, setIsListSettingsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [listToEdit, setListToEdit] = useState<List | null>(null);
  const [currentView, setCurrentView] = useState<View>('board');
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  
  const [users, setUsers] = useState<User[]>([
    { id: 'user-admin', name: 'Administrador', email: 'admin@lavanderia.com', password: 'admin123', role: 'admin', theme: 'claro' },
    { id: 'user-employee', name: 'Funcionário Teste', email: 'func@lavanderia.com', password: 'func123', role: 'employee', theme: 'claro' }
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

  useEffect(() => {
    const loadBoardData = async () => {
      try {
        setIsLoading(true);
        const [statuses, ordens] = await Promise.all([
          getStatusKanban(),
          getOrdens(),
        ]);

        const newBoardData: BoardData = {};
        const newTagMap = new Map<string, TagDefinition>();

        // 1. Processar Status (Listas)
        statuses.forEach(status => {
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
        ordens.forEach(ordem => {
          if (!ordem.status) {
            console.warn(`Ordem ${ordem.id} não tem um status definido e será ignorada.`);
            return;
          }
          const listId = String(ordem.status.id);
          if (newBoardData[listId]) {
            const card: Card = {
              id: String(ordem.id),
              listId: listId,
              customerName: ordem.customerName,
              customerDocument: ordem.customerDocument,
              notes: ordem.notes,
              contact: ordem.contact,
              serviceValue: Number(ordem.serviceValue),
              paymentMethod: ordem.paymentMethod,
              tags: ordem.tags || [],
              basketIdentifier: ordem.basketIdentifier,
              notifiedAt: ordem.notifiedAt ? new Date(ordem.notifiedAt).toISOString() : undefined,
              services: ordem.services,
              createdAt: new Date(ordem.createdAt).toISOString(),
              completedAt: ordem.completedAt ? new Date(ordem.completedAt).toISOString() : undefined,
              history: (ordem.historico || []).map((h: any) => ({
                timestamp: new Date(h.timestamp).toISOString(),
                fromListId: String(h.de_status_id),
                toListId: String(h.para_status_id),
                fromListTitle: h.de_status_titulo,
                toListTitle: h.para_status_titulo,
              })),
            };
            newBoardData[listId].cards.push(card);

            // Processar tags do cartão
            card.tags.forEach(tag => {
                if (!newTagMap.has(tag.name)) {
                    const colorIndex = newTagMap.size % TAG_COLORS.length;
                    newTagMap.set(tag.name, { name: tag.name, color: TAG_COLORS[colorIndex].classes, type: 'texto' });
                }
            });
          }
        });
        
        // Ordenar listas
        const fetchedListOrder = statuses.map(s => String(s.id));
        setListOrder(fetchedListOrder);

        setBoardData(newBoardData);
        setTags(Array.from(newTagMap.values()));

      } catch (error) {
        console.error("Erro ao carregar dados do quadro:", error);
        addNotification("Falha ao carregar os dados do quadro. Tente recarregar a página.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadBoardData();

    // Fetch clients on app load
    fetchClients().then(setClients);
  }, []);

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
  const handleLogin = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      // Redirect based on role
      setCurrentView(user.role === 'admin' ? 'dashboard' : 'board');
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
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
  const handleAddCard = (newCardData: Partial<Omit<Card, 'id' | 'listId'>> & { id?: string }) => {
    // This function will now likely need to call the API to create/update a card
    // For now, it will update the local state for immediate feedback.
    console.log("Saving card (local state):", newCardData);
    // A proper implementation would call createOrdem or updateOrdem from apiService
    // and then reload the board data or update the state based on the response.
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
    setIsCardModalOpen(true);
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

  const handleAddList = (title: string, limit: number | null, type: 'default' | 'dryer' | 'lavadora', totalDryingTime?: number, reminderInterval?: number) => {
    // This function will now likely need to call the API to create a list
    console.log("Adding list (local state):", title);
    // A proper implementation would call createList from apiService
    // and then reload the board data or update the state.
  };
  
  const handleOpenListSettings = (listId: string) => {
    setListToEdit(boardData[listId]);
    setIsListSettingsModalOpen(true);
  };
  
  const handleSaveListSettings = (listId: string, title: string, limit: number | null, type: 'default' | 'dryer' | 'lavadora', totalDryingTime?: number, reminderInterval?: number) => {
     // This function will now likely need to call the API to update a list
     console.log("Saving list settings (local state):", listId);
     // A proper implementation would call updateList from apiService
     // and then reload the board data or update the state.
  };
  
  const handleDeleteList = (listId: string) => {
    // This function will now likely need to call the API to delete a list
    console.log("Deleting list (local state):", listId);
    // A proper implementation would call deleteList from apiService
    // and then reload the board data or update the state.
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

  // Drag and Drop handlers
  const onCardDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string, sourceListId: string) => {
    draggedItem.current = { cardId, sourceListId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const onListDragStart = (e: React.DragEvent<HTMLDivElement>, listId: string) => {
      draggedItem.current = { listId };
      e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (e: React.DragEvent, targetListId: string, targetCardId?: string) => {
    // This function will now need to call the API to update card/list positions
    console.log("Drop event (local state):", draggedItem.current, targetListId);
    // A proper implementation would call an API endpoint to update the card's status
    // or the list's order, and then reload or update state.
  };

  const handleNavigate = (view: View) => {
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
               />;
      case 'tags':
        return <TagsPage boardData={boardData} tags={tags} onSaveTag={handleSaveTag} onDeleteTag={handleDeleteTag} currentUser={currentUser!} />;
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
        />
        <AddListModal
          isOpen={isAddListModalOpen}
          onClose={() => setIsAddListModalOpen(false)}
          onSave={handleAddList}
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
