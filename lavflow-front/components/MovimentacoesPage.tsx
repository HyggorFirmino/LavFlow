import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { maxpanFetch } from "../services/maxpanApiService";
import { WashingMachineIcon, ExclamationTriangleIcon } from "./icons"; // Using existing icon
import { Store } from "../types";
import StoreSelector from "./StoreSelector";

interface Machine {
    id: string;
    machineCode: string;
    type: "washer" | "dryer";
    state: "busy" | "available" | "finished" | "offline";
    lastOperationDt: string | null;
    customerName?: string;
}

const initialMachines: Machine[] = [
    { id: "d1", machineCode: "01", type: "dryer", state: "offline", lastOperationDt: null },
    { id: "d2", machineCode: "02", type: "dryer", state: "offline", lastOperationDt: null },
    { id: "d3", machineCode: "03", type: "dryer", state: "offline", lastOperationDt: null },
    { id: "d4", machineCode: "04", type: "dryer", state: "offline", lastOperationDt: null },
    { id: "w1", machineCode: "01", type: "washer", state: "offline", lastOperationDt: null },
    { id: "w2", machineCode: "02", type: "washer", state: "offline", lastOperationDt: null },
    { id: "w3", machineCode: "03", type: "washer", state: "offline", lastOperationDt: null },
    { id: "w4", machineCode: "04", type: "washer", state: "offline", lastOperationDt: null },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'available':
            return <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">Disponível</span>;
        case 'in_use':
        case 'busy':
            return <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">Em Uso</span>;
        case 'finished':
            return <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">Finalizado</span>;
        case 'offline':
        default:
            return <span className="absolute top-2 right-2 bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">Offline</span>;
    }
};

const MachineComponent = ({ machine }: { machine: Machine }) => {

    const formatBrazillianDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "medium",
            timeZone: "America/Sao_Paulo",
        }).format(date);
    };

    const isDryer = machine.type === 'dryer';

    // Custom styles for LavFlow aesthetics
    const dryerStyles = "bg-orange-50 border-orange-200";
    const washerStyles = "bg-laundry-blue-50 border-laundry-blue-200";

    const dryerTextStyles = "text-orange-800";
    const washerTextStyles = "text-laundry-blue-800";

    return (
        <div className={`relative p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-44 flex flex-col justify-between ${isDryer ? dryerStyles : washerStyles}`}>
            {getStatusBadge(machine.state)}
            <div className="mt-2">
                <h3 className={`text-lg font-bold ${isDryer ? dryerTextStyles : washerTextStyles}`}>{isDryer ? 'Secadora' : 'Lavadora'} #{machine.machineCode}</h3>
                <div className="text-xs text-gray-500 mt-1 flex flex-col">
                    <span className="font-semibold opacity-70">Última Operação:</span>
                    <span>{formatBrazillianDate(machine.lastOperationDt)}</span>
                </div>
            </div>
            <div className={`w-full p-3 rounded-xl mt-2 ${isDryer ? 'bg-orange-100' : 'bg-laundry-blue-100'}`}>
                <p className={`text-center font-bold text-base truncate ${isDryer ? 'text-orange-900' : 'text-laundry-blue-900'}`}>{machine.customerName || "-"}</p>
            </div>
        </div>
    );
};

interface MovimentacoesPageProps {
    stores: Store[];
    selectedStoreId: string;
    onSelectStore: (storeId: string) => void;
}

const MovimentacoesPage: React.FC<MovimentacoesPageProps> = ({ stores, selectedStoreId, onSelectStore }) => {
    const { currentUser } = useAuth();
    const [machines, setMachines] = useState<Machine[]>(initialMachines);
    const [storeName, setStoreName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchMachineData = async () => {
            // Use props or env vars, prioritizing the most specific
            // Find the selected store object to get maxpanId
            const selectedStore = stores.find(s => String(s.id) === selectedStoreId);
            const targetStoreId = selectedStore?.maxpanId || selectedStoreId || process.env.NEXT_PUBLIC_STORE_ID || process.env.NEXT_PUBLIC_SELECTED_STORE_ID;

            if (!targetStoreId) {
                console.warn("Store ID (Maxpan ID) missing");
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const endpoint = `orders?page=1&limit=1000&mask=true&showName=true&storeId=${targetStoreId}&period=today`;
                const response = await maxpanFetch(endpoint, {}, selectedStore);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    const allMachinesWithCustomer = data.results.flatMap((result: any) => {
                        const customerName = result.customer?.fullName || 'Anônimo';
                        return result.machines.map((machine: any) => ({ ...machine, customerName }));
                    });

                    const latestMachinesMap = new Map<string, Machine>();
                    allMachinesWithCustomer.forEach((machine: Machine) => {
                        const key = `${machine.type}-${machine.machineCode}`;
                        const existingMachine = latestMachinesMap.get(key);

                        if (!existingMachine || (machine.lastOperationDt && (!existingMachine.lastOperationDt || new Date(machine.lastOperationDt) > new Date(existingMachine.lastOperationDt)))) {
                            latestMachinesMap.set(key, machine);
                        }
                    });

                    const fetchedMachines = Array.from(latestMachinesMap.values());

                    setMachines(prevMachines => prevMachines.map(machine => {
                        const fetchedMachine = fetchedMachines.find(fm => fm.type === machine.type && parseInt(fm.machineCode, 10) === parseInt(machine.machineCode, 10));
                        if (fetchedMachine) {
                            return { ...fetchedMachine, id: machine.id };
                        }
                        return { ...machine, state: 'available' };
                    }));

                    // Try to get store name from API data, traverse up fallback chain
                    setStoreName(data.results[0]?.store.nickName || stores.find(s => String(s.id) === selectedStoreId)?.name || "Loja");
                } else {
                    // Fallback store name
                    const currentStore = stores.find(s => String(s.id) === selectedStoreId);
                    setStoreName(currentStore?.name || "Loja Selecionada");
                    setMachines(prev => prev.map(m => ({ ...m, state: 'available' })));
                }

            } catch (e: any) {
                setError(e.message || "Erro ao carregar movimentações");
                console.error("Error fetching movements:", e);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchMachineData();
        }
    }, [currentUser, selectedStoreId, stores]);

    const dryers = machines.filter((m) => m.type === "dryer");
    const washers = machines.filter((m) => m.type === "washer");

    return (
        <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-laundry-blue-50 via-laundry-teal-50 to-laundry-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">

            <div className="max-w-7xl mx-auto">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center shadow-md rounded-r">
                        <ExclamationTriangleIcon className="w-6 h-6 mr-3" />
                        <div>
                            <p className="font-bold">Erro</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center mb-6 md:mb-10 text-center">
                    <div className="bg-laundry-teal-100 dark:bg-laundry-teal-500/20 rounded-full p-3 md:p-5 mb-3 md:mb-4 shadow-lg ring-4 ring-white dark:ring-slate-800">
                        <WashingMachineIcon className="text-laundry-teal-600 dark:text-laundry-teal-400 w-8 h-8 md:w-12 md:h-12" />
                    </div>
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-laundry-blue-800 dark:text-slate-100 mb-1 md:mb-2 drop-shadow-sm">
                        Movimentações <span className="text-laundry-teal-600 dark:text-laundry-teal-400">- {storeName}</span>
                    </h1>
                    <div className="mt-2 text-left">
                        <StoreSelector stores={stores} selectedStoreId={selectedStoreId} onSelectStore={onSelectStore} />
                    </div>
                    <p className="text-gray-600 dark:text-slate-400 text-sm md:text-lg max-w-2xl">Acompanhe o status das máquinas em tempo real.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Dryers Section */}
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 border-t-4 border-orange-400">
                        <h2 className="text-lg md:text-2xl font-bold text-center text-orange-700 dark:text-orange-400 mb-4 md:mb-8 flex items-center justify-center gap-2">
                            <span>Máquinas de Secar</span>
                        </h2>
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {dryers.map((machine) => (
                                    <MachineComponent key={machine.id} machine={machine} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Washers Section */}
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 border-t-4 border-laundry-blue-500">
                        <h2 className="text-lg md:text-2xl font-bold text-center text-laundry-blue-700 dark:text-laundry-blue-400 mb-4 md:mb-8 flex items-center justify-center gap-2">
                            <span>Máquinas de Lavar</span>
                        </h2>
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-laundry-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {washers.map((machine) => (
                                    <MachineComponent key={machine.id} machine={machine} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovimentacoesPage;
