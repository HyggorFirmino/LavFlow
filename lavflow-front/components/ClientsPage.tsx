
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Client } from '../types';
import CreateMultipleCardsModal from './CreateMultipleCardsModal';
import { MagnifyingGlassIcon, UserGroupIcon } from './icons';


interface ClientsPageProps {
  clients: Client[];
  onAddCard: (card: Partial<Omit<Card, 'id' | 'listId'>>) => void;
  onOpenAddCardModal: (initialData?: Partial<Card>) => void;
}

interface ActionsMenuProps {
  client: Client;
  onOpenCreateSingle: (client: Client) => void;
  onOpenCreateMultiple: (client: Client) => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ client, onOpenCreateSingle, onOpenCreateMultiple }) => {
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
          </div>
        </div>
      )}
    </div>
  );
};


const ClientsPage: React.FC<ClientsPageProps> = ({ clients, onAddCard, onOpenAddCardModal }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isMultiCardModalOpen, setIsMultiCardModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const filteredClients = useMemo(() => {
        if (!searchTerm.trim()) {
            return clients;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return clients.filter(client =>
            client.fullName.toLowerCase().includes(lowercasedFilter) ||
            client.documentId.toLowerCase().includes(lowercasedFilter) ||
            client.cellphone.toLowerCase().includes(lowercasedFilter)
        );
    }, [clients, searchTerm]);
    
    const handleOpenCreateSingle = (client: Client) => {
        onOpenAddCardModal({
            customerName: client.fullName,
            customerDocument: client.documentId,
            contact: client.cellphone,
        });
    };

    const handleOpenCreateMultiple = (client: Client) => {
        setSelectedClient(client);
        setIsMultiCardModalOpen(true);
    };

    const handleConfirmMultiple = (quantity: number) => {
        if (!selectedClient) return;
        for (let i = 0; i < quantity; i++) {
            onAddCard({
                customerName: selectedClient.fullName,
                customerDocument: selectedClient.documentId,
                contact: selectedClient.cellphone,
                basketIdentifier: `Cesto ${i + 1}/${quantity}`,
                services: { washing: true, drying: false }, // Sensible default
            });
        }
        setIsMultiCardModalOpen(false);
        setSelectedClient(null);
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
          </div>
          
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-laundry-blue-200 dark:divide-slate-700">
                  <thead className="bg-laundry-blue-100/70 dark:bg-slate-800/70">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider">Nome</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider">Documento</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider">Telefone</th>
                      <th scope="col" className="relative px-6 py-3 text-right text-xs font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-laundry-blue-100 dark:divide-slate-700">
                    {filteredClients.length > 0 ? filteredClients.map(client => (
                      <tr key={client.customer} className="transition-colors hover:bg-laundry-blue-100/60 dark:hover:bg-slate-700/60">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-laundry-blue-900 dark:text-slate-100">{client.fullName}</div>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{client.documentId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{client.cellphone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <ActionsMenu client={client} onOpenCreateSingle={handleOpenCreateSingle} onOpenCreateMultiple={handleOpenCreateMultiple} />
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-16">
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
       />
    </>
  );
};

export default ClientsPage;
