import React, { useState, useEffect } from 'react';
import { User, Store } from '../types';
import { BuildingOfficeIcon, SunIcon, MoonIcon, ChevronDownIcon } from './icons';
import CustomModal, { ModalType } from './CustomModal';

interface ProfilePageProps {
  stores: Store[];
  currentUser: User;
  onUpdateStore: (storeId: string, data: Partial<Store>) => Promise<void>;
  onUpdateUserTheme: (theme: 'claro' | 'escuro') => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ stores, currentUser, onUpdateStore, onUpdateUserTheme }) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Store>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'admin' || currentUser.role === 'MANAGER';

  // Initialize selected store
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(String(stores[0].id));
    }
  }, [stores, selectedStoreId]);

  // Update form data when selected store changes or stores update
  useEffect(() => {
    if (selectedStoreId) {
      const store = stores.find(s => String(s.id) === selectedStoreId);
      if (store) {
        setFormData({
          ...store,
          washingPrice: store.washingPrice || 0,
          dryingPrice: store.dryingPrice || 0,
          comboPrice: store.comboPrice || 0,
          maxpanId: store.maxpanId,
        });
      }
    }
  }, [selectedStoreId, stores]);

  const handleStoreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStoreId(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle numeric fields
    if (['washingPrice', 'dryingPrice', 'comboPrice'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) return;

    try {
      setIsSaving(true);
      await onUpdateStore(selectedStoreId, formData);
      setModalConfig({
        isOpen: true,
        title: 'Sucesso',
        message: 'Informações da loja salvas com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error("Error saving store:", error);
      setModalConfig({
        isOpen: true,
        title: 'Erro ao Salvar',
        message: 'Ocorreu um erro ao tentar salvar as informações da loja.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Appearance Settings Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-full mr-3 ${currentUser.theme === 'claro' ? 'bg-yellow-400/20' : 'bg-indigo-400/20'}`}>
                {currentUser.theme === 'claro' ?
                  <SunIcon className="w-6 h-6 text-yellow-500" /> :
                  <MoonIcon className="w-6 h-6 text-indigo-400" />
                }
              </div>
              <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100">Aparência</h2>
            </div>
            <p className="text-laundry-blue-800 dark:text-slate-300 mb-4">Escolha como a aplicação deve aparecer para você.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => onUpdateUserTheme('claro')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${currentUser.theme === 'claro'
                  ? 'bg-laundry-blue-100 dark:bg-laundry-blue-500/20 border-laundry-blue-500 dark:border-laundry-blue-400'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:border-laundry-blue-400 dark:hover:border-laundry-blue-500'
                  }`}
              >
                <SunIcon className="w-6 h-6 text-yellow-500" />
                <span className="font-semibold text-laundry-blue-900 dark:text-slate-100">Claro</span>
              </button>
              <button
                onClick={() => onUpdateUserTheme('escuro')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${currentUser.theme === 'escuro'
                  ? 'bg-slate-700 border-laundry-teal-400'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:border-laundry-teal-500'
                  }`}
              >
                <MoonIcon className="w-6 h-6 text-indigo-400" />
                <span className="font-semibold text-laundry-blue-900 dark:text-slate-100">Escuro</span>
              </button>
            </div>
          </div>
        </div>

        {/* Store Profile Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-laundry-blue-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-8 h-8 text-laundry-teal-500 mr-3" />
                  <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100">Perfil da Loja</h2>
                </div>
                {stores.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedStoreId}
                      onChange={handleStoreSelect}
                      className="appearance-none bg-white dark:bg-slate-800 border border-laundry-blue-200 dark:border-slate-600 rounded-lg py-2 pl-4 pr-10 text-laundry-blue-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 cursor-pointer"
                    >
                      {stores.map(store => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {stores.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-slate-400">Nenhuma loja disponível para edição.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Nome da Loja</label>
                      <input id="name" name="name" type="text" value={formData.name || ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Telefone</label>
                      <input id="phone" name="phone" type="text" value={formData.phone || ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Endereço</label>
                    <input id="address" name="address" type="text" value={formData.address || ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="operatingHours" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Horário de Funcionamento</label>
                      <input id="operatingHours" name="operatingHours" type="text" value={formData.operatingHours || ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                    </div>
                    <div>
                      <label htmlFor="cnpj" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">CNPJ</label>
                      <input id="cnpj" name="cnpj" type="text" value={formData.cnpj || ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="border-t border-laundry-blue-200 dark:border-slate-700 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-laundry-blue-900 dark:text-slate-100 mb-4">Preços dos Serviços</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="washingPrice" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Lavagem (R$)</label>
                        <input id="washingPrice" name="washingPrice" type="number" step="0.01" min="0" value={formData.washingPrice !== undefined ? formData.washingPrice : 0} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                      </div>
                      <div>
                        <label htmlFor="dryingPrice" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Secagem (R$)</label>
                        <input id="dryingPrice" name="dryingPrice" type="number" step="0.01" min="0" value={formData.dryingPrice !== undefined ? formData.dryingPrice : 0} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                      </div>
                      <div>
                        <label htmlFor="comboPrice" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Combo (Lav+Sec) (R$)</label>
                        <input id="comboPrice" name="comboPrice" type="number" step="0.01" min="0" value={formData.comboPrice !== undefined ? formData.comboPrice : 0} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="border-t border-laundry-blue-200 dark:border-slate-700 pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-laundry-blue-900 dark:text-slate-100 mb-4">Integrações</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="maxpanId" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">ID Maxpan</label>
                          <input id="maxpanId" name="maxpanId" type="text" value={formData.maxpanId !== undefined ? formData.maxpanId : ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed" />
                          <p className="text-xs text-slate-500 mt-1">ID utilizado para integração com API Maxpan.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="refreshTokenMaxpan" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Refresh Token Maxpan</label>
                            <input id="refreshTokenMaxpan" name="refreshTokenMaxpan" type="text" value={formData.refreshTokenMaxpan || ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50" />
                          </div>
                          <div>
                            <label htmlFor="refreshTokenMaxpanExpiration" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Validade Refresh Token</label>
                            <input id="refreshTokenMaxpanExpiration" name="refreshTokenMaxpanExpiration" type="datetime-local" value={formData.refreshTokenMaxpanExpiration ? String(formData.refreshTokenMaxpanExpiration).substring(0, 16) : ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="BearerTokenMaxpan" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Bearer Token Maxpan</label>
                            <input id="BearerTokenMaxpan" name="BearerTokenMaxpan" type="text" value={formData.BearerTokenMaxpan || ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50" />
                          </div>
                          <div>
                            <label htmlFor="BearerTokenMaxpanExpiration" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Validade Bearer Token</label>
                            <input id="BearerTokenMaxpanExpiration" name="BearerTokenMaxpanExpiration" type="datetime-local" value={formData.BearerTokenMaxpanExpiration ? String(formData.BearerTokenMaxpanExpiration).substring(0, 16) : ''} onChange={handleChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {isAdmin && stores.length > 0 && (
              <div className="px-6 py-4 bg-laundry-blue-50/50 dark:bg-slate-900/50 rounded-b-xl text-right">
                <button type="submit" disabled={isSaving} className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait">
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default ProfilePage;