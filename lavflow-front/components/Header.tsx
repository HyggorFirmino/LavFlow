import React, { useState } from 'react';
import { TagIcon, WashingMachineIcon, LogoutIcon, UserCircleIcon, ChartBarIcon, ViewGridIcon, PrinterIcon, ListBulletIcon, ArchiveBoxIcon, UserGroupIcon, CurrencyDollarIcon, ArrowPathIcon, ChevronDownIcon, BuildingOfficeIcon } from './icons';
import { User, ViewType } from '../types';
import Dropdown from './Dropdown';

interface HeaderProps {
  onAddCard: () => void;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  currentUser: User;
  currentView: ViewType;
}

// Hamburger icon component
const HamburgerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

// X icon for closing
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onAddCard, onNavigate, onLogout, currentUser, currentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navButtonClasses = "flex items-center space-x-2 bg-laundry-blue-100 hover:bg-laundry-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-laundry-blue-800 dark:text-slate-200 font-semibold py-2 px-3 md:px-4 rounded-lg shadow-sm hover:shadow-md transition-all";
  const activeNavButtonClasses = "flex items-center space-x-2 bg-laundry-teal-100 dark:bg-laundry-teal-500/20 border border-laundry-teal-300 dark:border-laundry-teal-500/30 text-laundry-teal-800 dark:text-laundry-teal-200 font-bold py-2 px-3 md:px-4 rounded-lg shadow-inner transition-all";

  // Mobile navigation item helper
  const mobileNavItem = (view: ViewType, label: string, icon: React.ReactNode) => {
    const isActive = currentView === view;
    return (
      <button
        key={view}
        onClick={() => { onNavigate(view); setMobileMenuOpen(false); }}
        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${isActive
          ? 'bg-laundry-teal-100 dark:bg-laundry-teal-500/20 text-laundry-teal-800 dark:text-laundry-teal-200 font-bold border border-laundry-teal-300 dark:border-laundry-teal-500/30'
          : 'text-laundry-blue-800 dark:text-slate-200 hover:bg-laundry-blue-50 dark:hover:bg-slate-700'
          }`}
      >
        <span className="w-5 h-5 flex-shrink-0">{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md p-3 md:p-4 flex justify-between items-center w-full flex-shrink-0 border-b border-laundry-blue-200 dark:border-slate-700 print:hidden sticky top-0 z-50">
        {/* Left: Logo */}
        <div className="flex items-center group">
          <WashingMachineIcon className="w-7 h-7 md:w-8 md:h-8 text-laundry-blue-600 dark:text-laundry-blue-400 group-hover:text-laundry-blue-700 dark:group-hover:text-laundry-blue-300 transition-all duration-300 group-hover:rotate-6" />
          <h1 className="ml-2 md:ml-3 text-lg md:text-2xl font-bold text-laundry-blue-800 dark:text-slate-100 group-hover:text-laundry-blue-900 dark:group-hover:text-white transition-colors">
            LAVFLOW
          </h1>
        </div>

        {/* Center/Right on mobile: Add button + hamburger */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddCard}
            className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm md:text-base"
          >
            + Adicionar Pedido
          </button>

          {/* Hamburger button - only on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-laundry-blue-100 dark:bg-slate-700 text-laundry-blue-800 dark:text-slate-200 hover:bg-laundry-blue-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Menu"
          >
            <HamburgerIcon className="w-6 h-6" />
          </button>

          {/* Desktop nav - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 md:space-x-3">
            <div className="h-8 border-l border-laundry-blue-200 dark:border-slate-700 mx-1"></div>

            <Dropdown
              label="Operações"
              icon={<CurrencyDollarIcon className="w-5 h-5" />}
              items={[
                { view: 'recarga', label: 'Recarga', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
                { view: 'movimentacoes', label: 'Movimentações', icon: <ArrowPathIcon className="w-5 h-5" /> },
                { view: 'machine-operation', label: 'Operação', icon: <WashingMachineIcon className="w-5 h-5" /> },
              ]}
              currentView={currentView}
              onNavigate={onNavigate}
              currentUser={currentUser}
            />

            <Dropdown
              label="Visualizações"
              icon={<ViewGridIcon className="w-5 h-5" />}
              items={[
                { view: 'board', label: 'Quadro', icon: <ViewGridIcon className="w-5 h-5" /> },
                { view: 'list', label: 'Lista', icon: <ListBulletIcon className="w-5 h-5" /> },
              ]}
              currentView={currentView}
              onNavigate={onNavigate}
              currentUser={currentUser}
            />

            <Dropdown
              label="Gestão"
              icon={<UserGroupIcon className="w-5 h-5" />}
              items={[
                { view: 'clients', label: 'Clientes', icon: <UserGroupIcon className="w-5 h-5" /> },
                { view: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" />, adminOnly: true },
                { view: 'history', label: 'Histórico', icon: <ArchiveBoxIcon className="w-5 h-5" />, adminOnly: true },
                { view: 'tags', label: 'Etiquetas', icon: <TagIcon className="w-5 h-5" />, adminOnly: true },
                { view: 'admin', label: 'Administração', icon: <BuildingOfficeIcon className="w-5 h-5" />, adminOnly: true },
              ]}
              currentView={currentView}
              onNavigate={onNavigate}
              currentUser={currentUser}
            />

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
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[9999] flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="relative bg-white dark:bg-slate-900 w-full max-h-[85vh] overflow-y-auto shadow-2xl border-b-2 border-laundry-teal-400 animate-slide-down">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-laundry-blue-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-laundry-blue-900 dark:text-slate-100">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-laundry-blue-100 dark:hover:bg-slate-700 transition-colors text-laundry-blue-800 dark:text-slate-200"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Groups */}
            <div className="p-4 space-y-4">
              {/* Operações */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 dark:text-slate-500 mb-2 px-2 tracking-wider">Operações</p>
                <div className="space-y-1">
                  {mobileNavItem('recarga', 'Recarga', <CurrencyDollarIcon className="w-5 h-5" />)}
                  {mobileNavItem('movimentacoes', 'Movimentações', <ArrowPathIcon className="w-5 h-5" />)}
                  {mobileNavItem('machine-operation', 'Operação', <WashingMachineIcon className="w-5 h-5" />)}
                </div>
              </div>

              {/* Visualizações */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 dark:text-slate-500 mb-2 px-2 tracking-wider">Visualizações</p>
                <div className="space-y-1">
                  {mobileNavItem('board', 'Quadro', <ViewGridIcon className="w-5 h-5" />)}
                  {mobileNavItem('list', 'Lista', <ListBulletIcon className="w-5 h-5" />)}
                </div>
              </div>

              {/* Gestão */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 dark:text-slate-500 mb-2 px-2 tracking-wider">Gestão</p>
                <div className="space-y-1">
                  {mobileNavItem('clients', 'Clientes', <UserGroupIcon className="w-5 h-5" />)}
                  {(currentUser.role === 'ADMIN' || currentUser.role === 'admin') && (
                    <>
                      {mobileNavItem('dashboard', 'Dashboard', <ChartBarIcon className="w-5 h-5" />)}
                      {mobileNavItem('history', 'Histórico', <ArchiveBoxIcon className="w-5 h-5" />)}
                      {mobileNavItem('tags', 'Etiquetas', <TagIcon className="w-5 h-5" />)}
                      {mobileNavItem('admin', 'Administração', <BuildingOfficeIcon className="w-5 h-5" />)}
                    </>
                  )}
                </div>
              </div>

              {/* Outros */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 dark:text-slate-500 mb-2 px-2 tracking-wider">Outros</p>
                <div className="space-y-1">
                  {mobileNavItem('print-labels', 'Imprimir Etiquetas', <PrinterIcon className="w-5 h-5" />)}
                  {mobileNavItem('profile', 'Perfil', <UserCircleIcon className="w-5 h-5" />)}
                </div>
              </div>

              {/* Logout */}
              <div className="pt-3 border-t border-laundry-blue-100 dark:border-slate-700">
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 font-semibold transition-colors"
                >
                  <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;