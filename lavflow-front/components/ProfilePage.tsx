
import React, { useState, useEffect } from 'react';
import { User, LaundryProfile } from '../types';
import { BuildingOfficeIcon, UsersIcon, TrashIcon, UserIcon, KeyIcon, AtSymbolIcon, SunIcon, MoonIcon } from './icons';

interface ProfilePageProps {
  profile: LaundryProfile;
  users: User[];
  currentUser: User;
  onUpdateProfile: (profile: LaundryProfile) => void;
  onSaveUser: (user: Omit<User, 'id'>) => boolean;
  onDeleteUser: (userId: string) => void;
  onUpdateUserTheme: (theme: 'claro' | 'escuro') => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, users, currentUser, onUpdateProfile, onSaveUser, onDeleteUser, onUpdateUserTheme }) => {
  const [profileData, setProfileData] = useState(profile);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'employee'>('employee');
  
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    setProfileData(profile);
  }, [profile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'washingPrice' || name === 'dryingPrice' || name === 'washingAndDryingPrice') {
        const priceKey = name === 'washingPrice' ? 'washing' : name === 'dryingPrice' ? 'drying' : 'washingAndDrying';
        setProfileData(prev => ({
            ...prev,
            servicePrices: {
                ...prev.servicePrices,
                [priceKey]: parseFloat(value) || 0,
            },
        }));
    } else {
        setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileData);
    alert('Informações da lavanderia salvas com sucesso!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      alert('Por favor, preencha todos os campos para criar um novo usuário.');
      return;
    }
    const success = onSaveUser({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      theme: 'claro',
    });
    if (success) {
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('employee');
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
                        <SunIcon className="w-6 h-6 text-yellow-500"/> : 
                        <MoonIcon className="w-6 h-6 text-indigo-400"/>
                    }
                </div>
                <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100">Aparência</h2>
            </div>
            <p className="text-laundry-blue-800 dark:text-slate-300 mb-4">Escolha como a aplicação deve aparecer para você.</p>
            <div className="flex space-x-4">
                <button
                    onClick={() => onUpdateUserTheme('claro')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                        currentUser.theme === 'claro' 
                        ? 'bg-laundry-blue-100 dark:bg-laundry-blue-500/20 border-laundry-blue-500 dark:border-laundry-blue-400' 
                        : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:border-laundry-blue-400 dark:hover:border-laundry-blue-500'
                    }`}
                >
                    <SunIcon className="w-6 h-6 text-yellow-500" />
                    <span className="font-semibold text-laundry-blue-900 dark:text-slate-100">Claro</span>
                </button>
                <button
                    onClick={() => onUpdateUserTheme('escuro')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                        currentUser.theme === 'escuro' 
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

        {/* Laundry Profile Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700">
          <form onSubmit={handleProfileSave}>
            <div className="p-6 border-b border-laundry-blue-200 dark:border-slate-700">
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-8 h-8 text-laundry-teal-500 mr-3" />
                <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100">Perfil da Lavanderia</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Nome da Lavanderia</label>
                  <input id="name" name="name" type="text" value={profileData.name} onChange={handleProfileChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"/>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Telefone</label>
                  <input id="phone" name="phone" type="text" value={profileData.phone} onChange={handleProfileChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"/>
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Endereço</label>
                <input id="address" name="address" type="text" value={profileData.address} onChange={handleProfileChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"/>
              </div>
              <div>
                <label htmlFor="operatingHours" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Horário de Funcionamento</label>
                <input id="operatingHours" name="operatingHours" type="text" value={profileData.operatingHours} onChange={handleProfileChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <div>
                    <label htmlFor="washingPrice" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Preço Lavagem (R$)</label>
                    <input id="washingPrice" name="washingPrice" type="number" step="0.01" min="0" value={profileData.servicePrices?.washing || 0} onChange={handleProfileChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"/>
                 </div>
                 <div>
                    <label htmlFor="dryingPrice" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Preço Secagem (R$)</label>
                    <input id="dryingPrice" name="dryingPrice" type="number" step="0.01" min="0" value={profileData.servicePrices?.drying || 0} onChange={handleProfileChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"/>
                 </div>
              </div>
              <div className="pt-2">
                <label htmlFor="washingAndDryingPrice" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Preço Lavagem + Secagem (Combo c/ Desconto)</label>
                <input id="washingAndDryingPrice" name="washingAndDryingPrice" type="number" step="0.01" min="0" value={profileData.servicePrices?.washingAndDrying || 0} onChange={handleProfileChange} disabled={!isAdmin} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 disabled:bg-gray-200/50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"/>
              </div>
            </div>
            {isAdmin && (
              <div className="px-6 py-4 bg-laundry-blue-50/50 dark:bg-slate-900/50 rounded-b-xl text-right">
                <button type="submit" className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Salvar Alterações
                </button>
              </div>
            )}
          </form>
        </div>

        {/* User Management Card */}
        {isAdmin && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700">
            <div className="p-6 border-b border-laundry-blue-200 dark:border-slate-700">
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-laundry-teal-500 mr-3" />
                <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100">Gerenciamento de Usuários</h2>
              </div>
            </div>
            
            {/* Add User Form */}
            <form onSubmit={handleAddUser} className="p-6 space-y-4 border-b border-laundry-blue-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-laundry-blue-800 dark:text-slate-200">Adicionar Novo Usuário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" placeholder="Nome Completo" value={newUserName} onChange={e => setNewUserName(e.target.value)} required className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"/>
                <input type="email" placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"/>
                <input type="password" placeholder="Senha" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"/>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as 'admin' | 'employee')} className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-[42px]">
                  <option value="employee">Funcionário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full md:w-auto bg-laundry-blue-600 hover:bg-laundry-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Criar Usuário
              </button>
            </form>
            
            {/* Users List */}
            <div className="p-6">
               <ul className="space-y-3">
                {users.map(user => (
                  <li key={user.id} className="flex items-center justify-between p-3 bg-laundry-blue-50/70 dark:bg-slate-800/70 rounded-lg">
                    <div className="flex items-center">
                      <UserIcon className="w-6 h-6 mr-3 text-laundry-blue-500 dark:text-laundry-blue-400"/>
                      <div>
                        <p className="font-semibold text-laundry-blue-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${user.role === 'admin' ? 'text-violet-700 bg-violet-100 dark:bg-violet-500/20 dark:text-violet-300' : 'text-green-700 bg-green-100 dark:bg-green-500/20 dark:text-green-300'}`}>{user.role}</span>
                      <button 
                        onClick={() => onDeleteUser(user.id)} 
                        disabled={user.id === currentUser.id}
                        className="p-2 text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        aria-label={`Excluir usuário ${user.name}`}
                        title={user.id === currentUser.id ? "Não é possível se auto-excluir" : "Excluir usuário"}
                      >
                        <TrashIcon className="w-5 h-5"/>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
