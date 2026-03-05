import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAccessToken, refreshToken } from '../services/maxpanApiService';
import { Store } from '../types';
import { WashingMachineIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from './icons';
import StoreSelector from './StoreSelector';

// --- UI Components ---

const Button = ({ children, onClick, className, disabled }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 transform active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'
            } ${className}`}
    >
        {children}
    </button>
);

const Switch = ({ machineId, initialIsActive, onToggle }: any) => {
    // Use state only for optimistic UI if needed, but here we rely on props mostly or immediate feedback
    const [isActive, setIsActive] = useState(initialIsActive);

    // Sync internal state with prop if it changes externally
    useEffect(() => {
        setIsActive(initialIsActive);
    }, [initialIsActive]);

    const handleToggle = () => {
        const newState = !isActive;
        setIsActive(newState);
        onToggle(machineId, newState);
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-laundry-teal-500 focus:ring-offset-2 ${isActive ? 'bg-laundry-teal-600' : 'bg-gray-200 dark:bg-slate-700'
                }`}
            role="switch"
            aria-checked={isActive}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
};

// --- Modals ---

const CustomerSearchModal = ({ isOpen, onClose, customers, onSelectCustomer, loading }: any) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredCustomers = customers.filter((customer: any) =>
        customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all flex flex-col max-h-[90vh]">
                <div className="p-6 bg-laundry-blue-600 rounded-t-2xl">
                    <h2 className="text-xl font-semibold text-white">Selecionar Cliente</h2>
                    <p className="text-sm text-laundry-blue-100 mt-1">Selecione o cliente que utilizará a máquina.</p>
                </div>
                <div className="p-6 flex-grow overflow-hidden flex flex-col">
                    <div className="relative mb-4">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-laundry-blue-500 focus:border-laundry-blue-500 outline-none text-gray-800 dark:text-gray-100 transition"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="overflow-y-auto pr-2 flex-grow custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center items-center h-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-laundry-blue-500" />
                                <p className="ml-2 text-gray-600 dark:text-gray-400">Carregando clientes...</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {filteredCustomers.slice(0, 50).map((customer: any) => ( // Limit rendering
                                    <li
                                        key={customer.id || customer.customer}
                                        onClick={() => onSelectCustomer(customer)}
                                        className="p-3 rounded-lg hover:bg-laundry-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-laundry-blue-200 dark:hover:border-slate-600"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{customer.fullName || customer.name}</span>
                                    </li>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum cliente encontrado.</p>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-b-2xl flex justify-end">
                    <Button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white">
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Machine Card ---

const MachineCard = ({ machine, onRelease, onSendPulse, onToggle, getStatusBadge }: any) => {
    const status = machine?.state;
    const isAvailable = status === 'available';
    const isBusy = status === 'busy' || status === 'in_use';
    const isDryer = machine.type === 'dryer';

    const theme = {
        bg: isDryer ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20' : 'bg-gradient-to-br from-laundry-blue-50 to-laundry-blue-100 dark:from-laundry-blue-900/20 dark:to-laundry-blue-800/20',
        border: isDryer ? 'border-orange-200 dark:border-orange-700/50' : 'border-laundry-blue-200 dark:border-laundry-blue-700/50',
        text: isDryer ? 'text-orange-900 dark:text-orange-100' : 'text-laundry-blue-900 dark:text-laundry-blue-100',
        name: isDryer ? 'Secadora' : 'Lavadora',
        button: isDryer ? 'bg-orange-500 hover:bg-orange-600' : 'bg-laundry-blue-500 hover:bg-laundry-blue-600',
    };

    return (
        <div className={`relative p-5 rounded-xl border ${theme.border} ${theme.bg} shadow-sm transition-all hover:shadow-md`}>
            <div className="absolute top-2 right-2">
                {machine?.isActive === false ?
                    <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">Inativa</span> :
                    getStatusBadge(status)
                }
            </div>

            <h3 className={`font-bold text-lg mb-1 ${theme.text}`}>{theme.name} #{machine.machineCode}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-mono">{machine.id}</p>

            <div className="flex items-center justify-between w-full mb-4 bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ativar/Desativar</span>
                <Switch
                    machineId={machine.id}
                    initialIsActive={machine.isActive !== false} // Default to true if undefined
                    onToggle={onToggle}
                />
            </div>

            <div className="flex space-x-2 w-full">
                <Button
                    onClick={() => onRelease(machine.id)}
                    className="w-full bg-slate-500 hover:bg-slate-600 text-white shadow-md text-sm"
                    disabled={!isBusy || machine?.isActive === false}
                >
                    Liberar
                </Button>
                <Button
                    onClick={() => onSendPulse(machine)}
                    className={`w-full ${theme.button} text-white shadow-md text-sm`}
                    disabled={!isAvailable || machine?.isActive === false}
                >
                    Enviar Pulso
                </Button>
            </div>
        </div>
    );
};

// --- Page Component ---

interface MachineOperationPageProps {
    stores: Store[];
    selectedStoreId: string;
    onSelectStore: (storeId: string) => void;
}

const MachineOperationPage: React.FC<MachineOperationPageProps> = ({ stores, selectedStoreId, onSelectStore }) => {
    const { currentUser } = useAuth();
    const [machineStatuses, setMachineStatuses] = useState<Record<string, any[]>>({ lavadora: [], secadora: [] });
    const [customers, setCustomers] = useState<any[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedMachine, setSelectedMachine] = useState<any | null>(null);
    const [operationLogs, setOperationLogs] = useState<any[]>([]);

    // Local notification state since we can't easily hook into App's toasts without refactoring App.tsx props
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const authenticatedFetch = useMemo(() => {
        return async (url: string, options: RequestInit = {}) => {
            const token = getAccessToken();
            if (!token) return null;

            const makeRequest = (token: string) => fetch(url, {
                ...options,
                headers: { ...options.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            let response = await makeRequest(token);
            if (response.status === 401) {
                try {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        const newToken = getAccessToken();
                        if (!newToken) throw new Error('Sessão expirada.');
                        response = await makeRequest(newToken);
                    }
                } catch (error) {
                    console.error("Falha ao renovar token", error);
                    return null;
                }
            }
            return response;
        };
    }, []);

    const fetchStatuses = async () => {
        const selectedStore = stores.find(s => String(s.id) === selectedStoreId);
        // Use Maxpan ID if available, otherwise selectedStoreId
        const targetStoreId = selectedStore?.maxpanId || selectedStoreId || process.env.NEXT_PUBLIC_STORE_ID;

        if (!targetStoreId) return;

        const apiUrl = process.env.NEXT_PUBLIC_MAXPAN_API_URL || process.env.NEXT_PUBLIC_MAXPAN_URL;
        const url = `${apiUrl}stores/${targetStoreId}`;

        try {
            const response = await authenticatedFetch(url, { method: 'GET' });
            if (response && response.ok) {
                const data = await response.json();
                const newStatuses: Record<string, any[]> = { lavadora: [], secadora: [] };
                if (data.machines && Array.isArray(data.machines)) {
                    data.machines.forEach((machine: any) => {
                        const machineType = machine.type === 'washer' ? 'lavadora' : 'secadora';
                        newStatuses[machineType].push(machine);
                    });
                }
                setMachineStatuses(newStatuses);
            }
        } catch (err) {
            console.error("Error fetching machine statuses", err);
        }
    };

    const fetchLogs = async () => {
        const selectedStore = stores.find(s => String(s.id) === selectedStoreId);
        // User requested to use maxpanId as storeId for logs
        const storeIdToFilter = selectedStore?.maxpanId || selectedStoreId;

        if (!storeIdToFilter) return;

        // Use current app API URL (LavFlow API), not Maxpan API
        // Assuming LavFlow API is on the same host or configured via proxy/env
        // If running separately, we might need an env var for LavFlow API URL
        // For specific project structure: apiService.ts likely has the base URL logic
        // But since I'm in a component, I'll use a direct fetch relative to public or configured base
        // Let's assume /api or direct localhost for now based on context or use authenticatedFetch if it points to LavFlow API?
        // Wait, authenticatedFetch in this file points to MAXPAN_API_URL.
        // I need to point to the local LavFlow API (NestJS).
        // Let's create a specific fetch for LavFlow API.

        const lavflowApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' || process.env.NEXT_PUBLIC_API_URL2;

        try {
            const response = await fetch(`${lavflowApiUrl}/logs?storeId=${storeIdToFilter}`);
            if (response.ok) {
                const data = await response.json();
                setOperationLogs(data);
            } else {
                console.warn("Failed to fetch logs from backend");
            }
        } catch (error) {
            console.warn("Failed to fetch logs", error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            if (currentUser && selectedStoreId) {
                await fetchStatuses();
                await fetchCustomers();
                await fetchLogs();
            }
        };
        fetchInitialData();
        const interval = setInterval(fetchStatuses, 15000);
        return () => clearInterval(interval);
    }, [currentUser, selectedStoreId, authenticatedFetch]);

    const fetchCustomers = async () => {
        const selectedStore = stores.find(s => String(s.id) === selectedStoreId);
        const targetStoreId = selectedStore?.maxpanId || selectedStoreId || process.env.NEXT_PUBLIC_STORE_ID;
        if (!targetStoreId) return;

        setLoadingCustomers(true);
        const apiUrl = process.env.NEXT_PUBLIC_MAXPAN_API_URL || process.env.NEXT_PUBLIC_MAXPAN_URL;
        const url = `${apiUrl}users/customer-stores?mask=false&showName=true&limit=3000&store=${targetStoreId}`;

        try {
            const response = await authenticatedFetch(url, { method: 'GET' });
            if (response && response.ok) {
                const data = await response.json();
                setCustomers(Array.isArray(data) ? data : data?.data || data?.results || []);
            } else {
                console.error("Falha ao buscar clientes");
            }
        } catch (e) {
            console.error("Erro fetch customers", e);
        }
        setLoadingCustomers(false);
    };

    const makeApiCall = async (url: string, operationName: string, options: RequestInit = {}) => {
        // const toastId = toast.loading(`${operationName}...`); // Replaced
        showNotification(`${operationName}...`, 'info');

        try {
            const response = await authenticatedFetch(url, options);
            if (response && response.ok) {
                showNotification('Operação realizada com sucesso!', 'success');
                fetchStatuses();
            } else {
                showNotification('Falha na operação.', 'error');
            }
        } catch (e) {
            showNotification('Erro de conexão.', 'error');
        }
    };

    const handleSendPulse = (machine: any) => {
        setSelectedMachine(machine);
        setIsModalOpen(true);
    };

    const handleLogAndSendPulse = async (customer: any) => {
        if (!selectedMachine) return;
        const machineId = selectedMachine.id;
        const apiUrl = process.env.NEXT_PUBLIC_MAXPAN_API_URL || process.env.NEXT_PUBLIC_MAXPAN_URL;
        const url = `${apiUrl}machines/send-start-pulse?machineId=${machineId}`;

        makeApiCall(url, `Enviando pulso para ${selectedMachine.type === 'washer' ? 'Lavadora' : 'Secadora'} #${selectedMachine.machineCode}`, { method: 'GET' });

        const newLog = {
            customerName: customer.fullName || customer.name,
            machineName: `${selectedMachine.type === 'washer' ? 'Lavadora' : 'Secadora'} #${selectedMachine.machineCode}`,
            machineType: selectedMachine.type,
            storeId: selectedStoreId,
            // timestamp is created by backend
        };

        const lavflowApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' || process.env.NEXT_PUBLIC_API_URL2;

        try {
            await fetch(`${lavflowApiUrl}/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newLog),
            });
            // Refresh logs
            fetchLogs();
        } catch (e) {
            console.error("Failed to save log", e);
        }

        setIsModalOpen(false);
        setSelectedMachine(null);
    };

    const handleRelease = (machineId: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_MAXPAN_API_URL || process.env.NEXT_PUBLIC_MAXPAN_URL;
        const url = `${apiUrl}machines/reset-operation-time?machineId=${machineId}`;
        makeApiCall(url, `Liberando máquina`, { method: 'GET' });
    };

    const handleToggleMachine = (machineId: string, isActive: boolean) => {
        const apiUrl = process.env.NEXT_PUBLIC_MAXPAN_API_URL || process.env.NEXT_PUBLIC_MAXPAN_URL;
        const url = `${apiUrl}machines/${machineId}`;
        makeApiCall(url, `Alterando status da máquina`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }) // Assuming API supports patch isActive
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            in_use: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            busy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            unavailable: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            offline: "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300",
        };
        const style = styles[status] || "bg-gray-100 text-gray-800";
        const text = { available: "Disponível", in_use: "Em Uso", busy: "Ocupado", unavailable: "Indisponível", offline: "Offline" }[status] || "Desconhecido";
        return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm ${style}`}>{text}</span>;
    };

    const currentStoreName = stores.find(s => String(s.id) === selectedStoreId)?.name || "Loja";

    return (
        <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-laundry-blue-50 dark:bg-slate-900 min-h-screen relative">

            {/* Simple Notification Toast */}
            {notification && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg text-white font-medium animate-bounce-in ${notification.type === 'error' ? 'bg-red-500' : notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                    {notification.message}
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-laundry-teal-100 dark:bg-laundry-teal-500/20 rounded-full p-4 mb-2 shadow ring-4 ring-white dark:ring-slate-800">
                        <WashingMachineIcon className="text-laundry-teal-600 dark:text-laundry-teal-400 w-10 h-10" />
                    </div>
                    <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-laundry-blue-800 dark:text-slate-100 mb-1 text-center">
                        Operação - <span className="text-laundry-teal-600 dark:text-laundry-teal-400">{currentStoreName}</span>
                    </h1>
                    <div className="mt-2">
                        <StoreSelector stores={stores} selectedStoreId={selectedStoreId} onSelectStore={onSelectStore} />
                    </div>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Controle e status das máquinas em tempo real</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 md:p-6 space-y-3 md:space-y-4 border-t-4 border-laundry-blue-500">
                        <h2 className="text-xl font-bold text-center text-laundry-blue-700 dark:text-laundry-blue-400 border-b-2 border-laundry-blue-100 dark:border-laundry-blue-900/50 pb-2">Máquinas de Lavar</h2>
                        <div className="grid gap-4">
                            {machineStatuses.lavadora.length === 0 && <p className="text-center text-gray-400 py-4">Nenhuma máquina encontrada.</p>}
                            {machineStatuses.lavadora.map((machine) => (
                                <MachineCard key={machine.id} machine={machine} onRelease={handleRelease} onSendPulse={handleSendPulse} onToggle={handleToggleMachine} getStatusBadge={getStatusBadge} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 md:p-6 space-y-3 md:space-y-4 border-t-4 border-orange-400">
                        <h2 className="text-xl font-bold text-center text-orange-700 dark:text-orange-400 border-b-2 border-orange-100 dark:border-orange-900/50 pb-2">Máquinas de Secar</h2>
                        <div className="grid gap-4">
                            {machineStatuses.secadora.length === 0 && <p className="text-center text-gray-400 py-4">Nenhuma máquina encontrada.</p>}
                            {machineStatuses.secadora.map((machine) => (
                                <MachineCard key={machine.id} machine={machine} onRelease={handleRelease} onSendPulse={handleSendPulse} onToggle={handleToggleMachine} getStatusBadge={getStatusBadge} />
                            ))}
                        </div>
                    </div>
                </div>

                <CustomerSearchModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    customers={customers}
                    loading={loadingCustomers}
                    onSelectCustomer={handleLogAndSendPulse}
                />

                <section className="w-full mt-12 mb-20">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span className="bg-laundry-blue-100 dark:bg-laundry-blue-900/50 p-2 rounded-lg text-laundry-blue-600 dark:text-laundry-blue-400 text-sm">Log</span> Registros de Operação
                    </h2>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm md:text-base">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="p-2 md:p-4 font-semibold text-gray-600 dark:text-slate-300">Cliente</th>
                                        <th className="p-2 md:p-4 font-semibold text-gray-600 dark:text-slate-300">Máquina</th>
                                        <th className="p-2 md:p-4 font-semibold text-gray-600 dark:text-slate-300 hidden sm:table-cell">Data/Hora</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {operationLogs.length > 0 ? (
                                        operationLogs.map((log, index) => {
                                            const isDryer = log.machineType === 'dryer';
                                            return (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="p-2 md:p-4 text-gray-800 dark:text-slate-200 font-medium">{log.customerName}</td>
                                                    <td className="p-2 md:p-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDryer ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' : 'bg-laundry-blue-100 text-laundry-blue-800 dark:bg-laundry-blue-900/30 dark:text-laundry-blue-200'
                                                            }`}>
                                                            {log.machineName}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 md:p-4 text-gray-600 dark:text-slate-400 text-sm hidden sm:table-cell">{new Date(log.timestamp).toLocaleString()}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-slate-500">Nenhum registro de operação ainda.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MachineOperationPage;
