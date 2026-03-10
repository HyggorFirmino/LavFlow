import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { CurrencyDollarIcon } from './icons';
import { searchCustomerByCpf, createRecharge } from '../services/maxpanApiService';
import { Store } from '../types';
import StoreSelector from './StoreSelector';


interface Customer {
    customer: any;
    fullName: string;
    documentId: string;
    cellphone?: string;
    rechargeBalance?: number;
}

interface RecargaPageProps {
    stores: Store[];
    selectedStoreId: string;
    onSelectStore: (storeId: string) => void;
    initialCpf?: string;
}

const RecargaPage: React.FC<RecargaPageProps> = ({ stores, selectedStoreId, onSelectStore, initialCpf }) => {
    console.log('📱 [RecargaPage] Component Mounted', { storesCount: stores.length, selectedStoreId, initialCpf });
    const [cpf, setCpf] = useState<string>(initialCpf || '');
    const [amount, setAmount] = useState<string>('');
    const [amountPay, setAmountPay] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('permuta');
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    const searchCustomer = async (searchCpf: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        setCustomer(null);

        const cpfOnlyNumbers = searchCpf.replace(/\D/g, '');

        try {
            const selectedStore = stores.find(s => String(s.id) === selectedStoreId);
            const storeMaxpanId = selectedStore?.maxpanId;

            console.log('🔍 Buscando cliente no Maxpan', { cpf: cpfOnlyNumbers, storeMaxpanId, selectedStoreId });

            const customerData = await searchCustomerByCpf(cpfOnlyNumbers, storeMaxpanId, selectedStore);
            if (customerData) {
                setCustomer(customerData);
            } else {
                setError('Cliente não encontrado.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar cliente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialCpf) {
            searchCustomer(initialCpf);
        }
    }, [initialCpf]);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        await searchCustomer(cpf);
    };

    const handleRecharge = (e: FormEvent) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const confirmRecharge = async () => {
        setShowConfirmation(false);
        setLoading(true);
        setError(null);
        setSuccess(null);

        const amountInCents = parseInt(amount, 10);
        const amountPayInCents = parseInt(amountPay, 10) || 0;

        if (isNaN(amountInCents) || amountInCents <= 0) {
            setError('Por favor, insira um valor de recarga válido.');
            setLoading(false);
            return;
        }

        try {
            const selectedStore = stores.find(s => String(s.id) === selectedStoreId);
            const storeMaxpanId = selectedStore?.maxpanId;

            if (!storeMaxpanId) {
                setError('Loja não possui maxpanId configurado.');
                setLoading(false);
                return;
            }

            console.log('💰 Criando recarga no Maxpan', { storeMaxpanId, selectedStoreId });

            await createRecharge({
                amount: amountInCents,
                amountPay: amountPayInCents,
                customer: customer?.customer,
                paymentType: paymentMethod,
                store: storeMaxpanId,
            }, selectedStore);

            setSuccess(
                `Recarga de R$ ${(amountInCents / 100).toFixed(2).replace('.', ',')} realizada com sucesso para o cliente ${customer?.fullName}.`
            );
            setAmount('');
            setAmountPay('');
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar a recarga.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCpf('');
        setAmount('');
        setAmountPay('');
        setPaymentMethod('permuta');
        setCustomer(null);
        setError(null);
        setSuccess(null);
    };

    const formatCurrency = (value: string) => {
        const onlyNums = value.replace(/\D/g, '');
        if (!onlyNums) return '0,00';
        const padded = onlyNums.padStart(3, '0');
        const reais = padded.slice(0, -2);
        const centavos = padded.slice(-2);
        return `${parseInt(reais, 10)}${reais.length ? ',' : '0,'}${centavos}`;
    };

    const formatBalance = (balance: number | undefined): string => {
        if (typeof balance !== 'number' || isNaN(balance)) return '-';
        const abs = Math.abs(balance);
        const cents = abs % 100;
        const reais = Math.floor(abs / 100);
        const formatted = `${reais.toLocaleString('pt-BR')},${cents.toString().padStart(2, '0')}`;
        return (balance < 0 ? '-R$ ' : 'R$ ') + formatted;
    };

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setAmount(rawValue);
    };

    return (
        <div className="flex-grow p-2 md:p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-laundry-blue-50 via-laundry-teal-50 to-laundry-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-8 border border-laundry-blue-200 dark:border-slate-700">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-laundry-teal-100 dark:bg-laundry-teal-500/20 rounded-full p-4 mb-4 shadow-lg">
                            <CurrencyDollarIcon className="text-laundry-teal-600 dark:text-laundry-teal-400 w-10 h-10" />
                        </div>
                        <h1 className="text-xl md:text-3xl font-bold text-laundry-blue-800 dark:text-slate-100 mb-2">
                            Recarga de Crédito
                        </h1>
                        <div className="mt-2 text-left w-full max-w-xs">
                            <StoreSelector stores={stores} selectedStoreId={selectedStoreId} onSelectStore={onSelectStore} />
                        </div>
                        <p className="text-gray-600 dark:text-slate-400 text-sm mt-2">Adicione saldo à carteira do cliente</p>
                    </div>

                    {!customer ? (
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="mb-6">
                                <label htmlFor="cpf" className="block text-sm font-medium text-laundry-blue-800 dark:text-slate-300 mb-2">
                                    CPF do Cliente
                                </label>
                                <input
                                    type="text"
                                    id="cpf"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    className="mt-1 block w-full px-4 py-3 bg-laundry-blue-50/50 dark:bg-slate-700/50 border border-laundry-blue-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 dark:focus:ring-laundry-teal-500 text-gray-900 dark:text-slate-100"
                                    placeholder="000.000.000-00"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-laundry-teal-500 to-laundry-teal-600 hover:from-laundry-teal-600 hover:to-laundry-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            >
                                {loading ? 'Buscando...' : 'Buscar Cliente'}
                            </button>
                        </form>
                    ) : (
                        <div>
                            <div className="mb-6 p-4 bg-laundry-blue-50/70 dark:bg-slate-700/50 border border-laundry-blue-200 dark:border-slate-600 rounded-lg shadow-inner">
                                <h2 className="text-lg font-semibold text-laundry-blue-800 dark:text-slate-100">{customer?.fullName}</h2>
                                <p className="text-laundry-blue-700 dark:text-slate-300">CPF: {customer.documentId}</p>
                                {customer.cellphone && (
                                    <p className="text-laundry-blue-700 dark:text-slate-300">Telefone: {customer.cellphone}</p>
                                )}
                                <p className="text-laundry-blue-700 dark:text-slate-300 font-semibold mt-2">
                                    Saldo Atual: {formatBalance(customer.rechargeBalance)}
                                </p>
                            </div>
                            <form onSubmit={handleRecharge}>
                                <div className="mb-6">
                                    <label htmlFor="amount" className="block text-sm font-medium text-laundry-blue-800 dark:text-slate-300 mb-2">
                                        Valor da Recarga (R$)
                                    </label>
                                    <input
                                        type="text"
                                        id="amount"
                                        value={formatCurrency(amount)}
                                        onChange={handleAmountChange}
                                        className="mt-1 block w-full px-4 py-3 bg-laundry-blue-50/50 dark:bg-slate-700/50 border border-laundry-blue-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 dark:focus:ring-laundry-teal-500 text-gray-900 dark:text-slate-100"
                                        placeholder="0,00"
                                        required
                                        inputMode="numeric"
                                        maxLength={12}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="amountPay" className="block text-sm font-medium text-laundry-blue-800 dark:text-slate-300 mb-2">
                                        Valor Pago (R$)
                                    </label>
                                    <input
                                        type="text"
                                        id="amountPay"
                                        value={formatCurrency(amountPay)}
                                        onChange={(e) => setAmountPay(e.target.value.replace(/\D/g, ''))}
                                        className="mt-1 block w-full px-4 py-3 bg-laundry-blue-50/50 dark:bg-slate-700/50 border border-laundry-blue-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 dark:focus:ring-laundry-teal-500 text-gray-900 dark:text-slate-100"
                                        placeholder="0,00"
                                        inputMode="numeric"
                                        maxLength={12}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-laundry-blue-800 dark:text-slate-300 mb-2">
                                        Forma de Pagamento
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mt-1 block w-full px-4 py-3 bg-laundry-blue-50/50 dark:bg-slate-700/50 border border-laundry-blue-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 dark:focus:ring-laundry-teal-500 text-gray-900 dark:text-slate-100"
                                    >
                                        <option value="permuta">Permuta</option>
                                        <option value="gift">Presente</option>
                                        <option value="pix">Pix</option>
                                        <option value="cash">Dinheiro</option>
                                        <option value="credit_card">Crédito</option>
                                        <option value="debit_card">Débito</option>
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-laundry-teal-500 to-laundry-teal-600 hover:from-laundry-teal-600 hover:to-laundry-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                                    >
                                        {loading ? 'Processando...' : 'Realizar Recarga'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="flex-1 py-3 px-4 border border-laundry-blue-300 dark:border-slate-600 rounded-xl shadow-sm text-sm font-medium text-laundry-blue-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-laundry-blue-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-all"
                                    >
                                        Buscar outro cliente
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showConfirmation && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-laundry-teal-200 dark:border-laundry-teal-500/30 max-w-lg w-full">
                                <h2 className="text-laundry-blue-800 dark:text-slate-100 text-2xl font-semibold mb-4 text-center">Confirmar Recarga</h2>
                                <p className="text-gray-700 dark:text-slate-300 text-center text-lg mb-6">
                                    Deseja confirmar a recarga de <span className="font-bold text-laundry-teal-600 dark:text-laundry-teal-400">R$ {formatCurrency(amount)}</span> para{' '}
                                    <span className="font-bold">{customer?.fullName}</span>?
                                </p>
                                <div className="flex justify-center gap-4 mt-4">
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        className="py-2 px-6 border border-laundry-blue-300 dark:border-slate-600 rounded-xl shadow-sm text-base font-medium text-laundry-blue-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-laundry-blue-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmRecharge}
                                        className="py-2 px-6 bg-gradient-to-r from-laundry-teal-500 to-laundry-teal-600 hover:from-laundry-teal-600 hover:to-laundry-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(error || success) && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-laundry-blue-800 dark:text-slate-100 mb-2">Logs</h2>
                            <div className="p-4 bg-laundry-blue-50/50 dark:bg-slate-700/50 border border-laundry-blue-200 dark:border-slate-600 rounded-lg min-h-20 max-h-32 overflow-y-auto shadow-inner">
                                {error && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>}
                                {success && <p className="text-sm text-laundry-teal-700 dark:text-laundry-teal-300 font-medium">{success}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecargaPage;
