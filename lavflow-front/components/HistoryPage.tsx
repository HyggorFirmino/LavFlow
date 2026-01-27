import React, { useState, useMemo } from 'react';
import { Card, CardHistoryEvent } from '../types';
import { ArchiveBoxIcon, MagnifyingGlassIcon, ClockIcon, ArrowPathIcon } from './icons';

interface HistoryPageProps {
  cards: Card[];
  onRefresh: () => void;
}

interface FlattenedHistoryEvent extends CardHistoryEvent {
  cardId: string;
  customerName: string;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ cards, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    // Small timeout to show animation
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const allHistoryEvents = useMemo(() => {
    const events: FlattenedHistoryEvent[] = [];
    cards.forEach(card => {
      if (card.history) {
        card.history.forEach(event => {
          events.push({
            ...event,
            cardId: card.id,
            customerName: card.customerName,
          });
        });
      }
    });
    // Sort by timestamp, newest first
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [cards]);

  const filteredEvents = useMemo(() => {
    if (!searchTerm) {
      return allHistoryEvents;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return allHistoryEvents.filter(event =>
      event.customerName.toLowerCase().includes(lowercasedFilter) ||
      event.cardId.toLowerCase().includes(lowercasedFilter)
    );
  }, [allHistoryEvents, searchTerm]);

  return (
    <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-laundry-blue-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-laundry-blue-200 dark:border-slate-700 pb-4 gap-4">
          <div className="flex items-center">
            <ArchiveBoxIcon className="w-8 h-8 text-laundry-teal-500 mr-3" />
            <h1 className="text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">Histórico de Movimentações</h1>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="Atualizar Histórico"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Buscar por cliente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-800/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full md:w-64 py-2 pl-10 pr-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <div key={`${event.cardId}-${event.timestamp}-${index}`} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-laundry-blue-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-laundry-blue-900 dark:text-slate-100 text-lg">
                      {event.customerName} <span className="text-sm font-normal text-gray-500">- Ordem #{event.cardId}</span>
                    </p>
                    <div className="flex items-center mt-2 text-gray-700 dark:text-slate-300">
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300 mr-2">{event.fromListTitle || 'Início'}</span>
                      <span className="text-gray-400 mx-2">➔</span>
                      <span className="bg-green-100 text-green-800 text-md font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 ml-2">{event.toListTitle}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 flex-shrink-0 ml-4">
                    <ClockIcon className="w-4 h-4 mr-1.5" />
                    <span>{new Date(event.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8 border-laundry-blue-200 dark:border-slate-700">
            <ArchiveBoxIcon className="w-16 h-16 mx-auto text-laundry-blue-300 dark:text-slate-600" />
            <p className="mt-4 text-xl text-gray-500 dark:text-slate-400">Nenhum histórico encontrado.</p>
            <p className="text-base text-gray-400 dark:text-slate-500 mt-2">{searchTerm ? 'Tente ajustar sua busca.' : 'Os eventos aparecerão aqui quando os cartões forem movidos.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;