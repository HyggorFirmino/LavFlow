import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Client, Card, Store, TagDefinition } from '../types';
import { UserGroupIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon, ArrowPathIcon } from './icons';
import CreateMultipleCardsModal from './CreateMultipleCardsModal';
import { fetchClients } from '../services/maxpanApiService';
import { createClient, fetchLocalClients, updateClient } from '../services/clientService';
import { maskCpf, maskPhone, maskVisibleCpf, maskVisiblePhone, formatDate } from '../utils/formatters';

// Formata o saldo para reais, considerando as duas últimas casas como centavos
function formatCurrency(value: number | undefined): string {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  const abs = Math.abs(value);
  const cents = abs % 100;
  const reais = Math.floor(abs / 100);
  const formatted = `${reais.toLocaleString('pt-BR')}\u002C${cents.toString().padStart(2, '0')}`;
  return (value < 0 ? '-R$ ' : 'R$ ') + formatted;
}

interface ClientsPageProps {
  onAddCard: (card: Partial<Omit<Card, 'id' | 'listId'>> & { storeId?: number; listId?: string }) => void;
  onOpenAddCardModal: (initialData?: Partial<Card>) => void;
  stores: Store[];
  tags: TagDefinition[];
}

interface ActionsMenuProps {
  client: Client;
  onOpenCreateSingle: (client: Client) => void;
  onOpenCreateMultiple: (client: Client) => void;
  onToggleSensitiveData: (clientId: string) => void;
  onEdit: (client: Client) => void;
  isSensitiveDataVisible: boolean;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ client, onOpenCreateSingle, onOpenCreateMultiple, onToggleSensitiveData, onEdit, isSensitiveDataVisible }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSingleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenCreateSingle(client);
    setIsOpen(false);
  };

  const handleMultipleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenCreateMultiple(client);
    setIsOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onEdit(client);
    setIsOpen(false);
  }


  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full rounded-md border border-laundry-blue-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-laundry-blue-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-laundry-blue-100 dark:focus:ring-offset-slate-800 focus:ring-laundry-teal-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          Ações
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button onClick={handleSingleClick} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-laundry-blue-100 dark:hover:bg-slate-700" role="menuitem">
              Criar Pedido Único
            </button>
            <button onClick={handleMultipleClick} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-laundry-blue-100 dark:hover:bg-slate-700" role="menuitem">
              Criar Múltiplos Pedidos
            </button>
            <button onClick={handleEditClick} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-laundry-blue-100 dark:hover:bg-slate-700" role="menuitem">
              Editar Cliente
            </button>
            <button
              onClick={() => onToggleSensitiveData(client.id)}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-laundry-blue-100 dark:hover:bg-slate-700"
              role="menuitem"
            >
              {isSensitiveDataVisible ? 'Ocultar dados' : 'Mostrar dados'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const ClientsPage: React.FC<ClientsPageProps> = ({ onAddCard, onOpenAddCardModal, stores, tags }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMultiCardModalOpen, setIsMultiCardModalOpen] = useState(false);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [visibleSensitiveData, setVisibleSensitiveData] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form States
  const [newClientName, setNewClientName] = useState('');
  const [newClientCpf, setNewClientCpf] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientBirthDate, setNewClientBirthDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAndSetClients = async () => {
    const fetchedClients = await fetchClients();
    const localClients = await fetchLocalClients();

    const clientMap = new Map<string, Client>();

    // Helper to generate a unique key: prefer CPF (digits only), fallback to ID with prefix
    const getClientKey = (client: Client, prefix: string) => {
      const doc = client.document ? client.document.replace(/\D/g, '') : '';
      return doc || `${prefix}-${client.id}`;
    };

    // Add fetched clients first (to establish order and ensure latest data)
    fetchedClients.forEach(client => {
      const key = getClientKey(client, 'maxpan');
      if (key) clientMap.set(key, client);
    });

    // Add local clients (only if not already present)
    localClients.forEach(client => {
      const key = getClientKey(client, 'local');
      if (!clientMap.has(key)) {
        clientMap.set(key, client);
      }
    });

    setClients(Array.from(clientMap.values()));
  };

  useEffect(() => {
    fetchAndSetClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) {
      return clients;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(lowercasedFilter) ||
      client.document.toLowerCase().includes(lowercasedFilter) ||
      client.phone.toLowerCase().includes(lowercasedFilter)
    );
  }, [clients, searchTerm]);

  const handleOpenCreateSingle = (client: Client) => {
    onOpenAddCardModal({
      customerName: client.name,
      customerDocument: client.document,
      contact: client.phone,
      client: client, // Pass the full client object to link it
    });
  };

  const handleOpenCreateMultiple = (client: Client) => {
    setSelectedClient(client);
    setIsMultiCardModalOpen(true);
  };

  const handleConfirmMultiple = (quantity: number, storeId: number, services: { washing: boolean; drying: boolean }, tags: any[], notes: string) => {
    if (!selectedClient) return;
    for (let i = 0; i < quantity; i++) {
      // Calculate the part (e.g., "1/3")
      const part = `${i + 1}/${quantity}`;

      onAddCard({
        customerName: selectedClient.name,
        customerDocument: selectedClient.document,
        contact: selectedClient.phone,
        basketIdentifier: quantity > 1 ? `Cesto ${part}` : `Cesto`, // Improved identifier
        services: services,
        tags: tags,
        notes: notes,
        client: selectedClient,
        storeId: storeId,
      });
    }
    setIsMultiCardModalOpen(false);
    setSelectedClient(null);
  };

  // ... (Rest of component functions remain roughly same, skipping for brevity of replacement chunk if possible but replace_file_content needs contiguity)
  // Since I need a single contiguous block, I have to include everything between the start and end.
  // I will include the rest of the file content up until `return (` to make sure.

  const toggleSensitiveData = (clientId: string) => {
    setVisibleSensitiveData(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleOpenEditModal = (client: Client) => {
    setIsEditing(true);
    setCurrentClientId(client.id);
    setNewClientName(client.name);
    setNewClientCpf(client.document);
    setNewClientPhone(client.phone);
    setNewClientAddress(client.address || '');
    // Ensure date matches YYYY-MM-DD for input type="date"
    setNewClientBirthDate(client.birthDate ? client.birthDate.split('T')[0] : '');
    setIsCreateClientModalOpen(true);
  };

  const handleSyncClients = async () => {
    setIsSyncing(true);
    try {
      const localClients = await fetchLocalClients();
      const externalClients = await fetchClients(); // From maxpanApiService

      // Use Set for O(1) lookup of documents
      const localDocuments = new Set(localClients.map(c => c.document.replace(/\D/g, '')));

      const newClientsToCreate = externalClients.filter(extClient => {
        const extDoc = extClient.document.replace(/\D/g, '');
        return extDoc && !localDocuments.has(extDoc);
      });

      if (newClientsToCreate.length === 0) {
        alert('Todos os clientes externos já estão sincronizados.');
      } else {
        let createdCount = 0;
        // Process in chunks or individually? Individually for now to handle errors gracefully
        for (const client of newClientsToCreate) {
          const created = await createClient({
            name: client.name,
            cpf: client.document,
            phone: client.phone,
            address: client.address
          });
          if (created) createdCount++;
        }
        alert(`${createdCount} novos clientes importados com sucesso!`);

        // Refresh list
        // Refresh list
        await fetchAndSetClients();
      }

    } catch (error) {
      console.error('Falha na sincronização:', error);
      alert('Erro ao sincronizar clientes. Verifique o console.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const clientData = {
      name: newClientName,
      cpf: newClientCpf,
      address: newClientAddress,
      phone: newClientPhone,
      birthDate: newClientBirthDate
    };

    let resultClient: Client | null = null;

    if (isEditing && currentClientId) {
      resultClient = await updateClient(currentClientId, clientData);
    } else {
      resultClient = await createClient(clientData);
    }

    if (resultClient) {
      if (isEditing) {
        setClients(prev => prev.map(c => c.id === resultClient!.id ? resultClient! : c));
      } else {
        setClients(prev => [resultClient!, ...prev]);
      }
      setIsCreateClientModalOpen(false);
      resetForm();
    } else {
      alert(`Erro ao ${isEditing ? 'atualizar' : 'criar'} cliente. Verifique se o backend está rodando.`);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setNewClientName('');
    setNewClientCpf('');
    setNewClientAddress('');
    setNewClientPhone('');
    setNewClientBirthDate('');
    setIsEditing(false);
    setCurrentClientId(null);
  };

  return (
    <>
      <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6 pb-4">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-laundry-teal-500 mr-3" />
              <h1 className="text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">Clientes Cadastrados</h1>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-72 py-2 pl-10 pr-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-500" />
              </div>
            </div>
            <button
              onClick={handleSyncClients}
              disabled={isSyncing}
              className={`flex items-center justify-center px-4 py-2 border border-laundry-blue-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-laundry-blue-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-laundry-blue-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-laundry-teal-500 disabled:opacity-50 mr-2`}
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button
              onClick={() => { resetForm(); setIsCreateClientModalOpen(true); }}
              className="ml-4 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-laundry-teal-600 hover:bg-laundry-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-laundry-teal-500"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Novo Cliente
            </button>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-laundry-blue-200 dark:divide-slate-700 text-xs md:text-sm">
                <thead className="bg-laundry-blue-100/70 dark:bg-slate-800/70">
                  <tr>
                    <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Nome</th>
                    <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Documento</th>
                    <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Nascimento</th>
                    <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Telefone</th>
                    <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Endereço</th>
                    <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Saldo</th>
                    <th scope="col" className="relative px-2 py-2 md:px-6 md:py-3 text-right font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-laundry-blue-100 dark:divide-slate-700">
                  {filteredClients.length > 0 ? filteredClients.map(client => (
                    <tr key={client.id} className="transition-colors hover:bg-laundry-blue-100/60 dark:hover:bg-slate-700/60">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-laundry-blue-900 dark:text-slate-100">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200">
                        {visibleSensitiveData.includes(client.id) ? maskVisibleCpf(client.document) : maskCpf(client.document)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200 hidden sm:table-cell">
                        {formatDate(client.birthDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200">
                        {visibleSensitiveData.includes(client.id) ? maskVisiblePhone(client.phone) : maskPhone(client.phone)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200 hidden md:table-cell">
                        {client.address || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200 font-mono">
                        {formatCurrency(client.saldo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ActionsMenu
                          client={client}
                          onOpenCreateSingle={handleOpenCreateSingle}
                          onOpenCreateMultiple={handleOpenCreateMultiple}
                          onToggleSensitiveData={toggleSensitiveData}
                          onEdit={handleOpenEditModal}
                          isSensitiveDataVisible={visibleSensitiveData.includes(client.id)}
                        />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <p className="text-xl text-gray-500 dark:text-slate-400">Nenhum cliente encontrado.</p>
                        <p className="text-base text-gray-400 dark:text-slate-500 mt-2">{searchTerm ? 'Tente ajustar sua busca.' : 'Os clientes cadastrados aparecerão aqui.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <CreateMultipleCardsModal
        isOpen={isMultiCardModalOpen}
        onClose={() => setIsMultiCardModalOpen(false)}
        onConfirm={handleConfirmMultiple}
        client={selectedClient}
        stores={stores}
        tags={tags}
      />

      {/* Create Client Modal */}
      {isCreateClientModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsCreateClientModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-slate-100" id="modal-title">
                      {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleCreateClient} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome Completo</label>
                          <input
                            type="text"
                            id="name"
                            required
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-laundry-teal-500 focus:ring-laundry-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm px-3 py-2 border"
                          />
                        </div>
                        <div>
                          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-slate-300">CPF</label>
                          <input
                            type="text"
                            id="cpf"
                            required
                            value={newClientCpf}
                            onChange={(e) => setNewClientCpf(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-laundry-teal-500 focus:ring-laundry-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm px-3 py-2 border"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Telefone</label>
                          <input
                            type="text"
                            id="phone"
                            value={newClientPhone}
                            onChange={(e) => setNewClientPhone(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-laundry-teal-500 focus:ring-laundry-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm px-3 py-2 border"
                          />
                        </div>
                        <div>
                          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Data de Nascimento</label>
                          <input
                            type="date"
                            id="birthDate"
                            value={newClientBirthDate}
                            onChange={(e) => setNewClientBirthDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-laundry-teal-500 focus:ring-laundry-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm px-3 py-2 border"
                          />
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Endereço</label>
                          <textarea
                            id="address"
                            rows={3}
                            value={newClientAddress}
                            onChange={(e) => setNewClientAddress(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-laundry-teal-500 focus:ring-laundry-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm px-3 py-2 border"
                          />
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-laundry-teal-600 text-base font-medium text-white hover:bg-laundry-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-laundry-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                          >
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreateClientModalOpen(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-laundry-teal-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientsPage;