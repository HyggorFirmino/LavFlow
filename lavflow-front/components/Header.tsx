import React from 'react';
import { TagIcon, WashingMachineIcon, LogoutIcon, UserCircleIcon, ChartBarIcon, ViewGridIcon, PrinterIcon, ListBulletIcon, ArchiveBoxIcon, UserGroupIcon } from './icons';
import { User } from '../types';

type ViewType = 'board' | 'list' | 'tags' | 'profile' | 'dashboard' | 'print-labels' | 'history' | 'clients';

interface HeaderProps {
  onAddCard: () => void;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  currentUser: User;
  currentView: ViewType;
}

const Header: React.FC<HeaderProps> = ({ onAddCard, onNavigate, onLogout, currentUser, currentView }) => {
  const navButtonClasses = "flex items-center space-x-2 bg-laundry-blue-100 hover:bg-laundry-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-laundry-blue-800 dark:text-slate-200 font-semibold py-2 px-3 md:px-4 rounded-lg shadow-sm hover:shadow-md transition-all";
  const activeNavButtonClasses = "flex items-center space-x-2 bg-laundry-teal-100 dark:bg-laundry-teal-500/20 border border-laundry-teal-300 dark:border-laundry-teal-500/30 text-laundry-teal-800 dark:text-laundry-teal-200 font-bold py-2 px-3 md:px-4 rounded-lg shadow-inner transition-all";

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md p-4 flex justify-between items-center w-full flex-shrink-0 border-b border-laundry-blue-200 dark:border-slate-700 print:hidden">
      <div className="flex items-center group">
        <WashingMachineIcon className="w-8 h-8 text-laundry-blue-600 dark:text-laundry-blue-400 group-hover:text-laundry-blue-700 dark:group-hover:text-laundry-blue-300 transition-all duration-300 group-hover:rotate-6" />
        <h1 className="ml-3 text-2xl font-bold text-laundry-blue-800 dark:text-slate-100 group-hover:text-laundry-blue-900 dark:group-hover:text-white transition-colors">
          Lavanderia Inteligente
        </h1>
      </div>
      <div className="flex items-center space-x-2 md:space-x-3">
        <button
          onClick={onAddCard}
          className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          + Adicionar Pedido
        </button>

        <div className="h-8 border-l border-laundry-blue-200 dark:border-slate-700 mx-1"></div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => onNavigate('dashboard')}
            className={currentView === 'dashboard' ? activeNavButtonClasses : navButtonClasses}
            title="Dashboard"
            aria-label="Ver Dashboard"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('board')}
          className={currentView === 'board' ? activeNavButtonClasses : navButtonClasses}
          title="Quadro"
          aria-label="Ver Quadro Kanban"
        >
          <ViewGridIcon className="w-5 h-5" />
          <span className="hidden md:inline">Quadro</span>
        </button>

        <button
          onClick={() => onNavigate('list')}
          className={currentView === 'list' ? activeNavButtonClasses : navButtonClasses}
          title="Lista"
          aria-label="Ver em modo Lista"
        >
          <ListBulletIcon className="w-5 h-5" />
          <span className="hidden md:inline">Lista</span>
        </button>

        <button
          onClick={() => onNavigate('clients')}
          className={currentView === 'clients' ? activeNavButtonClasses : navButtonClasses}
          title="Clientes"
          aria-label="Ver Clientes"
        >
          <UserGroupIcon className="w-5 h-5" />
          <span className="hidden md:inline">Clientes</span>
        </button>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => onNavigate('history')}
            className={currentView === 'history' ? activeNavButtonClasses : navButtonClasses}
            title="Histórico"
            aria-label="Ver histórico de movimentações"
          >
            <ArchiveBoxIcon className="w-5 h-5" />
            <span className="hidden md:inline">Histórico</span>
          </button>
        )}

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => onNavigate('tags')}
            className={currentView === 'tags' ? activeNavButtonClasses : navButtonClasses}
          >
            <TagIcon className="w-5 h-5" />
            <span className="hidden md:inline">Etiquetas</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('print-labels')}
          className={currentView === 'print-labels' ? activeNavButtonClasses : navButtonClasses}
          title="Imprimir Etiquetas"
          aria-label="Imprimir Etiquetas dos Pedidos"
        >
          <PrinterIcon className="w-5 h-5" />
          <span className="hidden md:inline">Imprimir</span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={currentView === 'profile' ? activeNavButtonClasses : navButtonClasses}
          title="Perfil"
          aria-label="Ver Perfil"
        >
          <UserCircleIcon className="w-5 h-5" />
          <span className="hidden md:inline">Perfil</span>
        </button>

        <div className="h-8 border-l border-laundry-blue-200 dark:border-slate-700 mx-1"></div>

        <button
          onClick={onLogout}
          className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-3 md:px-4 rounded-lg shadow-sm hover:shadow-md transition-all dark:bg-red-500/20 dark:hover:bg-red-500/30 dark:text-red-300"
          title="Sair"
          aria-label="Sair"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="hidden md:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};

export default Header;