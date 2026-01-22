import React, { useState, useEffect } from 'react';
import { Card, TagDefinition, List, User } from '../types';
import { PhoneIcon, PencilIcon, TrashIcon, BasketIcon, ClockIcon, WhatsAppIcon, WashingMachineIcon, SunIcon, CheckCircleIcon, IdentificationIcon, MapPinIcon } from './icons';
import { generateWhatsAppMessage } from '../services/geminiService';
import { DEFAULT_TAG_COLOR } from '../constants';
import { maskCpf, maskPhone } from '../utils/formatters';

interface KanbanCardProps {
  card: Card;
  list: List;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string, listId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string, listId: string) => void;
  onDrop: (e: React.DragEvent, targetListId: string, targetCardId?: string) => void;
  tagsMap: Map<string, TagDefinition>;
  currentUser: User;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, list, onEditCard, onDeleteCard, onDragStart, onDrop, tagsMap, currentUser }) => {
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  const [isBeingDraggedOver, setIsBeingDraggedOver] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [timerStatus, setTimerStatus] = useState<'normal' | 'reminder' | 'done' | 'none'>('none');

  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    // Timers should only run for cards in a 'dryer' list with a valid start time and duration.
    if (list.type !== 'dryer' || !card.enteredDryerAt || !list.totalDryingTime) {
      setTimerStatus('none');
      return;
    }

    // Declare the interval variable here so it is accessible within the entire useEffect scope,
    // including the calculateTime function and the cleanup function.
    let interval: ReturnType<typeof setInterval>;

    const calculateTime = () => {
      const startTime = new Date(card.enteredDryerAt!);
      const totalDurationMs = list.totalDryingTime! * 60 * 1000;
      const endTime = startTime.getTime() + totalDurationMs;
      const now = Date.now();
      const remainingMs = endTime - now;

      if (remainingMs <= 0) {
        setTimerStatus('done');
        setRemainingTime('00:00');
        // If the interval has been set, clear it to stop the timer.
        // This check prevents a ReferenceError on the first run if the timer is already expired.
        if (interval) {
          clearInterval(interval);
        }
        return;
      }

      // New logic for interval reminder
      if (list.reminderInterval && list.reminderInterval > 0) {
        const elapsedMs = now - startTime.getTime();
        const elapsedMinutes = elapsedMs / (60 * 1000);
        const intervalMinutes = list.reminderInterval;

        // Check if we are in the last minute of any interval cycle
        const timeIntoCurrentInterval = elapsedMinutes % intervalMinutes;
        const reminderWindowMinutes = 1; // Pulse for 1 minute before the interval mark

        if (timeIntoCurrentInterval >= (intervalMinutes - reminderWindowMinutes)) {
          setTimerStatus('reminder');
        } else {
          setTimerStatus('normal');
        }
      } else {
        setTimerStatus('normal'); // No interval, just normal countdown
      }

      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setRemainingTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    // Run once immediately to set the initial state
    calculateTime();

    // Assign the interval ID to the variable declared above.
    interval = setInterval(calculateTime, 1000);

    // The cleanup function is called when the component unmounts or dependencies change.
    // This ensures no memory leaks from lingering intervals.
    return () => clearInterval(interval);
  }, [card.enteredDryerAt, list.type, list.totalDryingTime, list.reminderInterval]);


  const sanitizePhoneNumber = (phone: string) => {
    let sanitized = phone.replace(/\D/g, '');
    // Adiciona o código do país (55 para Brasil) se não estiver presente
    if ((sanitized.length === 10 || sanitized.length === 11) && !sanitized.startsWith('55')) {
      return `55${sanitized}`;
    }
    return sanitized;
  };

  const handleSendWhatsApp = async () => {
    if (!card.contact) {
      alert('Este cliente não possui um número de contato.');
      return;
    }

    setIsWhatsAppLoading(true);
    try {
      const message = await generateWhatsAppMessage(card.customerName, card.id);
      const phoneNumber = sanitizePhoneNumber(card.contact);

      if (!phoneNumber) {
        alert('O número de contato fornecido é inválido.');
        setIsWhatsAppLoading(false);
        return;
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error("Failed to generate or send WhatsApp message:", error);
      alert("Ocorreu um erro ao tentar gerar a mensagem. Por favor, tente novamente.");
    } finally {
      setIsWhatsAppLoading(false);
    }
  };


  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o pedido de ${card.customerName}?`)) {
      onDeleteCard(card.id, card.listId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBeingDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsBeingDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, card.listId, card.id);
    setIsBeingDraggedOver(false);
  };

  const renderTimer = () => {
    if (timerStatus === 'none') return null;

    if (timerStatus === 'done') {
      return (
        <div className="flex items-center text-green-700 dark:text-green-300 mt-3 bg-green-100 dark:bg-green-500/20 p-2 rounded-lg border border-green-200 dark:border-green-500/30 animate-pulse">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          <span className="font-bold">Secagem Finalizada!</span>
        </div>
      );
    }

    const timerColorClasses = timerStatus === 'reminder'
      ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30 animate-pulse'
      : 'bg-laundry-blue-100 text-laundry-blue-800 border-laundry-blue-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600';

    return (
      <div className={`flex items-center mt-3 p-2 rounded-lg border ${timerColorClasses} transition-colors`}>
        <ClockIcon className="w-5 h-5 mr-2" />
        <div className="text-sm flex-grow">
          <span className="font-bold">Tempo Restante:</span>
        </div>
        <span className="ml-2 font-mono text-base font-bold">{remainingTime}</span>
      </div>
    );
  };

  return (
    <>
      {isBeingDraggedOver && <div className="h-1.5 bg-laundry-teal-400 rounded-lg animate-pulse" />}
      <div
        draggable="true"
        onDragStart={(e) => onDragStart(e, card.id, card.listId)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 mb-4 cursor-grab active:cursor-grabbing border-t-4 border-laundry-blue-400 dark:border-laundry-teal-500"
      >
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-lg text-laundry-blue-900 dark:text-slate-100 break-words">
            {card.client?.name || card.customerName}
          </h4>
          <div className="flex space-x-1">
            <button onClick={() => onEditCard(card)} className="text-gray-400 dark:text-slate-400 hover:text-laundry-blue-500 dark:hover:text-laundry-blue-300 p-1 rounded-full hover:bg-laundry-blue-100 dark:hover:bg-slate-700 transition-colors" aria-label="Editar Pedido">
              <PencilIcon className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" aria-label="Excluir Pedido">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {(card.client?.document || card.client?.cpf || card.customerDocument) && (
          <div className="flex items-center text-gray-700 dark:text-slate-300 mt-2">
            <IdentificationIcon className="w-4 h-4 mr-2 text-laundry-blue-500 dark:text-laundry-blue-400 flex-shrink-0" />
            <span className="text-sm font-medium break-words text-laundry-blue-800 dark:text-slate-200">
              {maskCpf(card.client?.document || card.client?.cpf || card.customerDocument || '')}
            </span>
          </div>
        )}

        {card.client?.address && (
          <div className="flex items-center text-gray-700 dark:text-slate-300 mt-2">
            <MapPinIcon className="w-4 h-4 mr-2 text-laundry-blue-500 dark:text-laundry-blue-400 flex-shrink-0" />
            <span className="text-sm font-medium break-words text-laundry-blue-800 dark:text-slate-200">
              {card.client.address}
            </span>
          </div>
        )}

        {card.basketIdentifier && (
          <div className="flex items-center text-gray-700 dark:text-slate-300 mt-2">
            <BasketIcon className="w-4 h-4 mr-2 text-laundry-blue-500 dark:text-laundry-blue-400 flex-shrink-0" />
            <span className="text-sm font-medium break-words text-laundry-blue-800 dark:text-slate-200">{card.basketIdentifier}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-gray-700 mt-3 text-sm flex-wrap gap-y-2">
          <div className="flex items-center space-x-3">
            {card.services?.washing && (
              <div className="flex items-center" title="Lavagem">
                <WashingMachineIcon className="w-5 h-5 text-laundry-blue-500 dark:text-laundry-blue-400" />
              </div>
            )}
            {card.services?.drying && (
              <div className="flex items-center" title="Secagem">
                <SunIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center space-x-2">
              {card.paymentMethod && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${card.paymentMethod === 'pix' ? 'text-cyan-700 bg-cyan-100 border border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800' : ''}
                    ${card.paymentMethod === 'dinheiro' ? 'text-green-700 bg-green-100 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' : ''}
                  `}>
                  {card.paymentMethod.charAt(0).toUpperCase() + card.paymentMethod.slice(1)}
                </span>
              )}
              {card.serviceValue != null && (
                <span className="font-bold text-laundry-blue-800 dark:text-slate-200">
                  {card.serviceValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              )}
            </div>
          )}
        </div>

        {renderTimer()}

        {card.completedAt && card.listId === 'list-5' && (
          <div className="flex items-center text-green-700 dark:text-green-300 mt-3 bg-green-100 dark:bg-green-500/20 p-2 rounded-lg border border-green-200 dark:border-green-500/30">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            <div className="text-sm">
              <span className="font-bold">Finalizado:</span>
              <span className="ml-1 font-medium">{new Date(card.completedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 my-3">
          {card.tags.map(tag => {
            const tagColor = tagsMap.get(tag.name)?.color || DEFAULT_TAG_COLOR;
            return (
              <span key={tag.name} className={`text-xs font-semibold py-1 px-2.5 rounded-full inline-flex items-center border ${tagColor}`}>
                {tag.name}
                {tag.value && <strong className="ml-1.5">({tag.value})</strong>}
              </span>
            );
          })}
        </div>

        {(card.client?.phone || card.contact) && (
          <div className="flex items-center text-gray-600 dark:text-slate-400 mt-2">
            <PhoneIcon className="w-4 h-4 mr-2 text-laundry-blue-500 dark:text-laundry-blue-400" />
            <span className="text-sm">{maskPhone(card.client?.phone || card.contact)}</span>
          </div>
        )}

        {card.notifiedAt && (
          <div className="flex items-center text-gray-600 dark:text-slate-300 mt-2" title={`Notificado em ${card.notifiedAt}`}>
            <ClockIcon className="w-4 h-4 mr-2 text-laundry-blue-500 dark:text-laundry-blue-400" />
            <span className="text-sm font-medium text-laundry-blue-800 dark:text-slate-200">{card.notifiedAt}</span>
          </div>
        )}

        {card.notes && (
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 bg-laundry-blue-50/70 dark:bg-slate-700/70 p-3 rounded-lg border border-laundry-blue-100 dark:border-slate-600 break-words">
            {card.notes}
          </p>
        )}

        {card.listId === 'list-4' && (
          <div className="mt-4 pt-3 border-t border-laundry-blue-100 dark:border-slate-700">
            <button
              onClick={handleSendWhatsApp}
              disabled={isWhatsAppLoading}
              className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>{isWhatsAppLoading ? 'Preparando...' : 'Enviar WhatsApp'}</span>
            </button>
          </div>
        )}

        <div className="flex justify-end items-center mt-4 pt-2 border-t border-gray-100 dark:border-slate-700">
          <span className="text-xs text-gray-400 dark:text-slate-500">ID: {card.id.substring(0, 8)}</span>
        </div>
      </div>
    </>
  );
};

export default KanbanCard;