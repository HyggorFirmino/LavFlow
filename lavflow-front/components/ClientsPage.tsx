import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Client, Card } from '../types';
import { UserGroupIcon, MagnifyingGlassIcon } from './icons';
import CreateMultipleCardsModal from './CreateMultipleCardsModal';

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
  clients: Client[];
  onAddCard: (card: Partial<Omit<Card, 'id' | 'listId'>>) => void;
  onOpenAddCardModal: (initialData?: Partial<Card>) => void;
}

interface ActionsMenuProps {
  client: Client;
  onOpenCreateSingle: (client: Client) => void;
  onOpenCreateMultiple: (client: Client) => void;
  showSensitiveData: (client: Client) => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ client, onOpenCreateSingle, onOpenCreateMultiple, showSensitiveData }) => {
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
            <button
              onClick={() => showSensitiveData(client)}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-laundry-blue-100 dark:hover:bg-slate-700"
              role="menuitem"
            >
              Mostrar dados sensíveis
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
                customerName: selectedClient.name,
                customerDocument: selectedClient.document,
                contact: selectedClient.phone,
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
             <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-laundry-blue-200 dark:divide-slate-700 text-xs md:text-sm">
                  <thead className="bg-laundry-blue-100/70 dark:bg-slate-800/70">
                    <tr>
                      <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Nome</th>
                      <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Documento</th>
                      <th scope="col" className="px-2 py-2 md:px-6 md:py-3 text-left font-bold text-laundry-blue-800 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Telefone</th>
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
                        {/* Dados sensíveis ocultos */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-slate-600 italic">Oculto</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-slate-600 italic">Oculto</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-200 font-mono">
                          {formatCurrency(client.saldo)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <ActionsMenu
                              client={client}
                              onOpenCreateSingle={handleOpenCreateSingle}
                              onOpenCreateMultiple={handleOpenCreateMultiple}
                              showSensitiveData={() => setSelectedClient(client)}
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
       />
       {selectedClient && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-sm w-full">
      <h2 className="text-lg font-bold mb-4 text-laundry-blue-900 dark:text-slate-100">Dados do Cliente</h2>
      <div className="mb-2"><span className="font-semibold">Nome:</span> {selectedClient.name}</div>
      <div className="mb-2"><span className="font-semibold">Documento:</span> {selectedClient.document}</div>
      <div className="mb-2"><span className="font-semibold">Telefone:</span> {selectedClient.phone}</div>
      <button
        className="mt-4 px-4 py-2 rounded-lg bg-laundry-teal-500 text-white font-bold"
        onClick={() => setSelectedClient(null)}
      >
        Fechar
      </button>
    </div>
  </div>
)}

    </>
  );
};

export default ClientsPage;