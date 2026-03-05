import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createUser } from '../../services/userService';
import { getStoreByCnpj } from '../../services/storeService';
import { Store } from '../../types';

const UserRegister: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        storeIds: [] as number[]
    });

    // CNPJ search states
    const [cnpjInput, setCnpjInput] = useState('');
    const [foundStore, setFoundStore] = useState<Store | null | undefined>(undefined);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedStores, setSelectedStores] = useState<Store[]>([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCnpjSearch = async () => {
        const cnpj = cnpjInput.trim();
        if (!cnpj) {
            setSearchError('Digite um CNPJ para pesquisar.');
            return;
        }
        setSearchLoading(true);
        setFoundStore(undefined);
        setSearchError(null);

        try {
            const store = await getStoreByCnpj(cnpj);
            if (!store) {
                setFoundStore(null);
                setSearchError('Nenhuma loja encontrada com esse CNPJ.');
            } else {
                setFoundStore(store);
                setSearchError(null);
            }
        } catch {
            setFoundStore(null);
            setSearchError('Erro ao buscar loja. Verifique o CNPJ e tente novamente.');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAddStore = () => {
        if (!foundStore) return;
        const alreadyAdded = selectedStores.some(s => s.id === foundStore.id);
        if (alreadyAdded) {
            setSearchError('Esta loja já foi adicionada.');
            return;
        }
        const updated = [...selectedStores, foundStore];
        setSelectedStores(updated);
        setFormData(prev => ({ ...prev, storeIds: updated.map(s => s.id) }));
        setCnpjInput('');
        setFoundStore(undefined);
        setSearchError(null);
    };

    const handleRemoveStore = (storeId: number) => {
        const updated = selectedStores.filter(s => s.id !== storeId);
        setSelectedStores(updated);
        setFormData(prev => ({ ...prev, storeIds: updated.map(s => s.id) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await createUser({
                ...formData,
                role: formData.role as 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
            });
            setMessage({ text: 'Usuário cadastrado com sucesso!', type: 'success' });
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Erro ao cadastrar usuário.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
            <Head>
                <title>Cadastro de Usuário - LavFlow</title>
            </Head>
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-t-4 border-laundry-teal-400 m-4">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 text-laundry-blue-600 dark:text-laundry-blue-400 bg-laundry-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.952a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.846A4.5 4.5 0 0 1 18 9.346a4.5 4.5 0 0 1-4.5 4.5A4.5 4.5 0 0 1 9 9.346a4.5 4.5 0 0 1 4.5-4.5Zm4.5 1.5-1.5 1.5" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">
                        Novo Usuário
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                        Crie uma conta para um funcionário ou administrador.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label htmlFor="name" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Nome Completo</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow"
                                placeholder="Nome e Sobrenome"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow"
                                placeholder="email@exemplo.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <label htmlFor="password" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Cargo */}
                        <div>
                            <label htmlFor="role" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Cargo</label>
                            <div className="relative">
                                <select
                                    id="role"
                                    name="role"
                                    className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="EMPLOYEE">Funcionário</option>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="MANAGER">Gerente</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Busca por CNPJ */}
                        <div>
                            <label className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">
                                Lojas Vinculadas
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                Digite o CNPJ exato da loja para buscá-la e adicioná-la.
                            </p>

                            {/* Input de CNPJ + Botão Buscar */}
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={cnpjInput}
                                    onChange={e => { setCnpjInput(e.target.value); setFoundStore(undefined); setSearchError(null); }}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCnpjSearch())}
                                    placeholder="00.000.000/0000-00"
                                    className="flex-1 shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={handleCnpjSearch}
                                    disabled={searchLoading}
                                    className="px-4 py-3 bg-laundry-blue-600 hover:bg-laundry-blue-700 disabled:bg-laundry-blue-300 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                                >
                                    {searchLoading ? (
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : 'Buscar'}
                                </button>
                            </div>

                            {/* Resultado da busca */}
                            {searchError && (
                                <p className="text-xs text-red-500 dark:text-red-400 mb-3">{searchError}</p>
                            )}

                            {foundStore && (
                                <div className="flex items-center justify-between p-3 mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-lg">
                                    <div>
                                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">{foundStore.name}</p>
                                        <p className="text-xs text-green-600 dark:text-green-400 font-mono">{foundStore.cnpj}</p>
                                        {foundStore.address && <p className="text-xs text-green-600 dark:text-green-400">{foundStore.address}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddStore}
                                        className="ml-3 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Adicionar
                                    </button>
                                </div>
                            )}

                            {/* Lista de lojas adicionadas */}
                            {selectedStores.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Lojas selecionadas ({selectedStores.length})
                                    </p>
                                    {selectedStores.map(store => (
                                        <div key={store.id} className="flex items-center justify-between p-2.5 bg-laundry-blue-50 dark:bg-slate-700 border border-laundry-blue-200 dark:border-slate-600 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-laundry-blue-800 dark:text-slate-200">{store.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{store.cnpj}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStore(store.id)}
                                                className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                title="Remover loja"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div className={`text-center text-sm font-medium p-3 rounded-lg border ${message.type === 'success' ? 'text-green-600 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-500/20 dark:border-green-500/30' : 'text-red-600 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-500/20 dark:border-red-500/30'}`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-laundry-teal-500 hover:bg-laundry-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-laundry-teal-500 disabled:bg-laundry-teal-300 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-laundry-teal-600 hover:text-laundry-teal-800 dark:text-laundry-teal-400 dark:hover:text-laundry-teal-300 font-medium transition-colors"
                    >
                        Voltar para Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserRegister;
