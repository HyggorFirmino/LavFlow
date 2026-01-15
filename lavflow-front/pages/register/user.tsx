import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createUser } from '../../services/userService';
import { getStores } from '../../services/storeService';
import { Store, User } from '../../types';

const UserRegister: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        storeIds: [] as number[]
    });
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const fetchedStores = await getStores();
                setStores(fetchedStores);
            } catch (error) {
                console.error("Erro ao buscar lojas", error);
            }
        };
        fetchStores();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleValidStoreIds = (selectedOptions: HTMLCollectionOf<HTMLOptionElement>) => {
        const values = Array.from(selectedOptions, option => Number(option.value));
        setFormData(prev => ({ ...prev, storeIds: values }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Cast to exact type needed by backend if strict, but Partial<User> in service should handle it.
            // Note: storeIds logic might need adjustment if backend expects a specific format 
            // but CreateUserDto says number[].
            await createUser({
                ...formData,
                role: formData.role as 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
                // storeIds is already number[]
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
                        <div>
                            <label htmlFor="storeIds" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Lojas (Múltipla Escolha)</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Segure Ctrl (Windows) ou Cmd (Mac) para selecionar múltiplas.</p>
                            <select
                                id="storeIds"
                                name="storeIds"
                                multiple
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow h-32"
                                value={formData.storeIds.map(String)}
                                onChange={(e) => handleValidStoreIds(e.target.selectedOptions)}
                            >
                                {stores.map(store => (
                                    <option key={store.id} value={store.id} className="p-2">
                                        {store.name}
                                    </option>
                                ))}
                            </select>
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
