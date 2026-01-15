import React, { useState } from 'react';
import Head from 'next/head';
import { createStore } from '../../services/storeService';
import { useRouter } from 'next/router';
import { ToastNotification } from '../../types';
import { ExclamationTriangleIcon, XMarkIcon } from '../../components/icons';

// Reuse Toast components locally or extract them to a common component later
// For now, I'll implement a simple one for this page or minimal version since I can't easily import the internal ones from App.tsx/Home.
// Actually, I should probably check if I can import them. They were defined in App.tsx/index.tsx locally.
// I will create a simple version here.

const StoreRegister: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        cnpj: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await createStore(formData);
            setMessage({ text: 'Loja cadastrada com sucesso!', type: 'success' });
            // Optional: redirect after success
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Erro ao cadastrar loja.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
            <Head>
                <title>Cadastro de Loja - LavFlow</title>
            </Head>
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-t-4 border-laundry-teal-400 m-4">
                <div className="text-center">
                    {/* Use BuildingOfficeIcon here, verify import availability or use existing icon */}
                    <div className="mx-auto h-16 w-16 text-laundry-blue-600 dark:text-laundry-blue-400 bg-laundry-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">
                        Nova Loja
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                        Preencha os dados para cadastrar uma nova unidade.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Nome da Loja</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow"
                                placeholder="Ex: Lavanderia Centro"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Descrição</label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={3}
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow resize-none"
                                placeholder="Breve descrição da loja"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Endereço</label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                required
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow"
                                placeholder="Rua, Número, Bairro"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Telefone</label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                required
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="cnpj" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">CNPJ</label>
                            <input
                                id="cnpj"
                                name="cnpj"
                                type="text"
                                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 transition-shadow"
                                placeholder="00.000.000/0000-00"
                                value={formData.cnpj}
                                onChange={handleChange}
                            />
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
                            {loading ? 'Cadastrando...' : 'Cadastrar Loja'}
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

export default StoreRegister;
