import React, { useState, useEffect } from 'react';
import { User, Store } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon, UsersIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from './icons';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { getStores, createStore, updateStore, deleteStore } from '../services/storeService';

interface AdminPageProps {
  currentUser: User;
  onRefreshGlobal?: () => void; // Para recarregar lojas na aplicação principal se alteradas
}

type TabType = 'users' | 'stores';

const AdminPage: React.FC<AdminPageProps> = ({ currentUser, onRefreshGlobal }) => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedUsers, fetchedStores] = await Promise.all([
        getUsers(),
        getStores()
      ]);
      setUsers(fetchedUsers);
      setStores(fetchedStores);
    } catch (err: any) {
      console.error("Erro ao carregar dados admin:", err);
      setError("Não foi possível carregar os dados. Verifique a conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers: Usuários ---

  const handleOpenUserModal = (user?: User) => {
    setUserToEdit(user || null);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;
    const storeIds = formData.getAll('storeIds').map(id => Number(id));

    try {
      if (userToEdit) {
        const updateData: any = { name, email, role, storeIds };
        if (password) updateData.password = password; // Envia apenas se preencheu
        await updateUser(userToEdit.id, updateData);
      } else {
        if (!password) {
          alert("Senha é obrigatória para novos usuários.");
          return;
        }
        await createUser({ name, email, role: role as User['role'], password, storeIds });
      }
      setIsUserModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao salvar usuário.");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      try {
        await deleteUser(user.id);
        loadData();
      } catch (err: any) {
        console.error(err);
        alert(err?.response?.data?.message || "Erro ao excluir usuário.");
      }
    }
  };

  // --- Handlers: Lojas ---

  const handleOpenStoreModal = (store?: Store) => {
    setStoreToEdit(store || null);
    setIsStoreModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const cnpj = formData.get('cnpj') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const washingPrice = Number(formData.get('washingPrice'));
    const dryingPrice = Number(formData.get('dryingPrice'));
    const comboPrice = Number(formData.get('comboPrice'));
    const maxpanId = formData.get('maxpanId') as string;

    const storeData = { name, cnpj, phone, address, washingPrice, dryingPrice, comboPrice, maxpanId };

    try {
      if (storeToEdit) {
        await updateStore(String(storeToEdit.id), storeData);
      } else {
        await createStore(storeData);
      }
      setIsStoreModalOpen(false);
      loadData();
      if (onRefreshGlobal) {
        onRefreshGlobal();
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Erro ao salvar loja.");
    }
  };

  const handleDeleteStore = async (store: Store) => {
    if (window.confirm(`Tem certeza que deseja excluir a loja ${store.name}?`)) {
      try {
        await deleteStore(String(store.id));
        loadData();
        if (onRefreshGlobal) {
          onRefreshGlobal();
        }
      } catch (err: any) {
        console.error(err);
        alert(err?.response?.data?.message || "Erro ao excluir loja.");
      }
    }
  };


  return (
    <div className="flex-1 overflow-auto bg-laundry-blue-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
            <BuildingOfficeIcon className="w-8 h-8 mr-3 text-laundry-teal-500" />
            Painel de Administração
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-laundry-teal-100 text-laundry-teal-700 dark:bg-laundry-teal-500/20 dark:text-laundry-teal-300 shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            <span>Gestão de Usuários</span>
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'stores'
                ? 'bg-laundry-teal-100 text-laundry-teal-700 dark:bg-laundry-teal-500/20 dark:text-laundry-teal-300 shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <BuildingOfficeIcon className="w-5 h-5" />
            <span>Gestão de Lojas</span>
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex items-center justify-center h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-laundry-teal-500"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-2xl">
            {error}
          </div>
        )}

        {/* Usuários Tab Content */}
        {!isLoading && !error && activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Usuários Ativos</h2>
              <button
                onClick={() => handleOpenUserModal()}
                className="flex items-center px-4 py-2 bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white rounded-lg font-medium shadow-sm transition-colors text-sm"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Novo Usuário
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-750/50 text-gray-500 dark:text-slate-400 text-sm">
                    <th className="px-6 py-3 font-semibold">Nome</th>
                    <th className="px-6 py-3 font-semibold">E-mail</th>
                    <th className="px-6 py-3 font-semibold">Perfil</th>
                    <th className="px-6 py-3 font-semibold">Lojas Acesso</th>
                    <th className="px-6 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-200">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                          ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-400 text-sm">
                        {user.stores?.map(s => s.name).join(', ') || 'Nenhuma'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleOpenUserModal(user)} className="p-2 text-gray-400 hover:text-laundry-teal-600 dark:hover:text-laundry-teal-400 bg-gray-50 hover:bg-laundry-teal-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors" title="Editar">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(user)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-500/20 rounded-lg transition-colors" title="Excluir">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum usuário cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lojas Tab Content */}
        {!isLoading && !error && activeTab === 'stores' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Lojas Cadastradas</h2>
              <button
                onClick={() => handleOpenStoreModal()}
                className="flex items-center px-4 py-2 bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white rounded-lg font-medium shadow-sm transition-colors text-sm"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Nova Loja
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-750/50 text-gray-500 dark:text-slate-400 text-sm">
                    <th className="px-6 py-3 font-semibold">Nome</th>
                    <th className="px-6 py-3 font-semibold">CNPJ</th>
                    <th className="px-6 py-3 font-semibold">Contato</th>
                    <th className="px-6 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {stores.map(store => (
                    <tr key={store.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-200">{store.name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{store.cnpj || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{store.phone || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleOpenStoreModal(store)} className="p-2 text-gray-400 hover:text-laundry-teal-600 dark:hover:text-laundry-teal-400 bg-gray-50 hover:bg-laundry-teal-50 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors" title="Editar">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteStore(store)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-500/20 rounded-lg transition-colors" title="Excluir">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {stores.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhuma loja cadastrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- Modais --- */}

      {/* Modal Usuário */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                {userToEdit ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input type="text" name="name" defaultValue={userToEdit?.name} required className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">E-mail</label>
                <input type="email" name="email" defaultValue={userToEdit?.email} required className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Perfil</label>
                <select name="role" defaultValue={userToEdit?.role || 'EMPLOYEE'} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100">
                  <option value="ADMIN">Administrador</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="EMPLOYEE">Funcionário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Senha {userToEdit && <span className="font-normal text-xs text-gray-500">(deixe em branco para não alterar)</span>}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    minLength={6} 
                    className="w-full px-4 py-2 pr-12 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100" 
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 dark:text-slate-400 hover:text-laundry-teal-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Checklist Lojas */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Lojas com Acesso</label>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl">
                  {stores.map(store => {
                    const isChecked = userToEdit?.stores?.some(s => s.id === store.id);
                    return (
                      <label key={store.id} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="storeIds" 
                          value={store.id} 
                          defaultChecked={isChecked}
                          className="w-4 h-4 text-laundry-teal-500 bg-white border-gray-300 rounded focus:ring-laundry-teal-500 focus:ring-2 cursor-pointer" 
                        />
                        <span className="text-sm text-gray-700 dark:text-slate-300">{store.name}</span>
                      </label>
                    );
                  })}
                  {stores.length === 0 && (
                     <span className="text-sm text-gray-500">Nenhuma loja cadastrada para vincular.</span>
                  )}
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors border border-gray-200 dark:border-slate-600">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal Loja */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                {storeToEdit ? 'Editar Loja' : 'Nova Loja'}
              </h3>
              <button onClick={() => setIsStoreModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveStore} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome da Loja</label>
                  <input type="text" name="name" defaultValue={storeToEdit?.name} required className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">CNPJ</label>
                  <input type="text" name="cnpj" defaultValue={storeToEdit?.cnpj} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Contato (Telefone)</label>
                  <input type="text" name="phone" defaultValue={storeToEdit?.phone} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Endereço</label>
                  <input type="text" name="address" defaultValue={storeToEdit?.address} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">ID MaxPan (Integração)</label>
                  <input type="text" name="maxpanId" defaultValue={storeToEdit?.maxpanId} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-laundry-teal-500 focus:border-laundry-teal-500 outline-none transition-all dark:text-slate-100" />
                </div>

                {/* Preços */}
                <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-700 mt-2">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Tabela Base de Preços</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Lavagem (R$)</label>
                        <input type="number" step="0.01" name="washingPrice" defaultValue={storeToEdit?.washingPrice || 0} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-laundry-teal-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Secagem (R$)</label>
                        <input type="number" step="0.01" name="dryingPrice" defaultValue={storeToEdit?.dryingPrice || 0} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-laundry-teal-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Combo (R$)</label>
                        <input type="number" step="0.01" name="comboPrice" defaultValue={storeToEdit?.comboPrice || 0} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-laundry-teal-500" />
                      </div>
                    </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsStoreModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors border border-gray-200 dark:border-slate-600">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  Salvar Loja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
