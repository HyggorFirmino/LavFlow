import React, { useState, useEffect, useRef } from 'react';
import { Card, TagDefinition, List, User } from '../types';
import { PhoneIcon, PencilIcon, TrashIcon, BasketIcon, ClockIcon, WhatsAppIcon, WashingMachineIcon, SunIcon, CheckCircleIcon, IdentificationIcon, MapPinIcon, ArrowsRightLeftIcon, ListBulletIcon } from './icons';
import { generateWhatsAppMessage } from '../services/geminiService';
import { DEFAULT_TAG_COLOR } from '../constants';
import { maskCpf, maskPhone } from '../utils/formatters';
import CustomModal, { ModalType } from './CustomModal';

interface KanbanCardProps {
  card: Card;
  list: List;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string, listId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string, listId: string) => void;
  onDrop: (e: React.DragEvent, targetListId: string, targetCardId?: string) => void;
  onTouchDragStart: (cardId: string, sourceListId: string) => void;
  onTouchDrop: (targetListId: string) => void;
  tagsMap: Map<string, TagDefinition>;
  currentUser: User;
  allLists?: List[];
  onMoveCard?: (cardId: string, sourceListId: string, targetListId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, list, onEditCard, onDeleteCard, onDragStart, onDrop, onTouchDragStart, onTouchDrop, tagsMap, currentUser, allLists, onMoveCard }) => {
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  const [isBeingDraggedOver, setIsBeingDraggedOver] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [timerStatus, setTimerStatus] = useState<'normal' | 'reminder' | 'done' | 'none'>('none');
  const [isMoveDropdownOpen, setIsMoveDropdownOpen] = useState(false);
  const moveDropdownRef = useRef<HTMLDivElement>(null);

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

  const cardRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const touchStarted = useRef(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const scrollAnimFrame = useRef<number | null>(null);

  const isAdmin = currentUser.role === 'admin';

  // Close move dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moveDropdownRef.current && !moveDropdownRef.current.contains(event.target as Node)) {
        setIsMoveDropdownOpen(false);
      }
    };
    if (isMoveDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoveDropdownOpen]);

  const handleMoveToList = (targetListId: string) => {
    if (onMoveCard) {
      onMoveCard(card.id, card.listId, targetListId);
    }
    setIsMoveDropdownOpen(false);
  };

  useEffect(() => {
    // Timers should only run for cards in a 'dryer' list with a valid start time.
    if (list.type !== 'dryer' || !card.enteredDryerAt) {
      setTimerStatus('none');
      return;
    }

    // We need at least one time parameter to show a timer
    if (!list.totalDryingTime && !list.reminderInterval) {
      console.warn('[Timer] No time parameters configured for dryer list:', list.id);
      setTimerStatus('none');
      return;
    }

    // Declare the interval variable here so it is accessible within the entire useEffect scope
    let interval: ReturnType<typeof setInterval>;

    const calculateTime = () => {
      const startTime = new Date(card.enteredDryerAt!);
      const now = Date.now();
      const elapsedMs = now - startTime.getTime();

      // Check for total time expiration first, if applicable
      if (list.totalDryingTime) {
        const totalDurationMs = list.totalDryingTime * 60 * 1000;
        if (elapsedMs >= totalDurationMs) {
          setTimerStatus('done');
          setRemainingTime('00:00');
          if (interval) clearInterval(interval);
          return;
        }
      }

      let remainingMs = 0;

      // Determine which time to display
      if (list.reminderInterval && list.reminderInterval > 0) {
        // Show time remaining until next pause/interval
        const intervalMs = list.reminderInterval * 60 * 1000;
        const msIntoCycle = elapsedMs % intervalMs;
        remainingMs = intervalMs - msIntoCycle;
      } else if (list.totalDryingTime) {
        // Show total remaining time
        const totalDurationMs = list.totalDryingTime * 60 * 1000;
        remainingMs = (startTime.getTime() + totalDurationMs) - now;
      }

      // Logic for status/colors (approaching end of interval)
      if (list.reminderInterval && list.reminderInterval > 0) {
        const intervalMs = list.reminderInterval * 60 * 1000;
        const msIntoCycle = elapsedMs % intervalMs;
        const reminderWindowMs = 60 * 1000; // 1 minute warning

        if (intervalMs - msIntoCycle <= reminderWindowMs) {
          setTimerStatus('reminder');
        } else {
          setTimerStatus('normal');
        }
      } else {
        setTimerStatus('normal');
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
    return () => clearInterval(interval);
  }, [card.enteredDryerAt, list.type, list.totalDryingTime, list.reminderInterval, card.id, list.id, card.customerName, list.title]);


  const sanitizePhoneNumber = (phone: string) => {
    let sanitized = phone.replace(/\D/g, '');
    // Adiciona o código do país (55 para Brasil) se não estiver presente
    if ((sanitized.length === 10 || sanitized.length === 11) && !sanitized.startsWith('55')) {
      return `55${sanitized}`;
    }
    return sanitized;
  };

  const handleSendWhatsApp = async () => {
    const phoneNumberRaw = card.client?.phone || card.contact;

    if (!phoneNumberRaw) {
      setModalConfig({
        isOpen: true,
        title: 'Telefone Ausente',
        message: 'Este cliente não possui um telefone cadastrado para envio de WhatsApp.',
        type: 'warning'
      });
      return;
    }

    setIsWhatsAppLoading(true);
    try {
      const message = await generateWhatsAppMessage(card.customerName, card.id);
      const phoneNumber = sanitizePhoneNumber(phoneNumberRaw);

      if (!phoneNumber) {
        setModalConfig({
          isOpen: true,
          title: 'Telefone Inválido',
          message: 'O telefone fornecido é inválido para envio de WhatsApp.',
          type: 'error'
        });
        setIsWhatsAppLoading(false);
        return;
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error("Failed to generate or send WhatsApp message:", error);
      setModalConfig({
        isOpen: true,
        title: 'Erro no WhatsApp',
        message: 'Ocorreu um erro ao tentar gerar a mensagem. Por favor, tente novamente.',
        type: 'error'
      });
    } finally {
      setIsWhatsAppLoading(false);
    }
  };


  const handleDelete = () => {
    setModalConfig({
      isOpen: true,
      title: 'Excluir Pedido',
      message: `Tem certeza que deseja excluir permanentemente o pedido de "${card.customerName}"? Esta ação não pode ser desfeita.`,
      type: 'confirm',
      onConfirm: () => onDeleteCard(card.id, card.listId)
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBeingDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setIsBeingDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, card.listId, card.id);
    setIsBeingDraggedOver(false);
  };

  // ── Touch Drag Handlers ──────────────────────────────────────────────────────

  const createGhost = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const ghost = cardRef.current.cloneNode(true) as HTMLDivElement;
    ghost.style.position = 'fixed';
    ghost.style.top = `${rect.top}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.opacity = '0.75';
    ghost.style.zIndex = '9999';
    ghost.style.pointerEvents = 'none';
    ghost.style.transform = 'rotate(2deg) scale(1.03)';
    ghost.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
    ghost.style.transition = 'none';
    ghost.style.borderRadius = '12px';
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const moveGhost = (clientX: number, clientY: number) => {
    if (!ghostRef.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    ghostRef.current.style.top = `${clientY - rect.height / 2}px`;
    ghostRef.current.style.left = `${clientX - rect.width / 2}px`;
  };

  const removeGhost = () => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  };

  const getListIdAtPoint = (x: number, y: number): string | null => {
    // Temporarily hide ghost so elementFromPoint can find the list below
    if (ghostRef.current) ghostRef.current.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (ghostRef.current) ghostRef.current.style.display = '';

    if (!el) return null;
    const listEl = (el as HTMLElement).closest('[data-list-id]');
    return listEl ? listEl.getAttribute('data-list-id') : null;
  };

  const getScrollContainer = (): HTMLElement | null =>
    document.querySelector('[data-kanban-scroll]');

  const startEdgeScroll = (clientX: number) => {
    const EDGE_ZONE = 50;  // px from edge that triggers scroll
    const SPEED = 5;        // px per frame
    const container = getScrollContainer();
    if (!container) return;

    const vw = window.innerWidth;

    if (clientX > vw - EDGE_ZONE) {
      // Near right edge → scroll right
      if (scrollAnimFrame.current !== null) return; // already scrolling
      const step = () => {
        container.scrollLeft += SPEED;
        scrollAnimFrame.current = requestAnimationFrame(step);
      };
      scrollAnimFrame.current = requestAnimationFrame(step);
    } else if (clientX < EDGE_ZONE) {
      // Near left edge → scroll left
      if (scrollAnimFrame.current !== null) return; // already scrolling
      const step = () => {
        container.scrollLeft -= SPEED;
        scrollAnimFrame.current = requestAnimationFrame(step);
      };
      scrollAnimFrame.current = requestAnimationFrame(step);
    } else {
      // Finger in center zone → stop any ongoing scroll
      stopEdgeScroll();
    }
  };

  const stopEdgeScroll = () => {
    if (scrollAnimFrame.current !== null) {
      cancelAnimationFrame(scrollAnimFrame.current);
      scrollAnimFrame.current = null;
    }
  };

  const disableSnap = () => {
    const el = getScrollContainer();
    if (el) {
      el.classList.remove('snap-x', 'snap-mandatory');
      el.style.scrollSnapType = 'none';
    }
  };

  const restoreSnap = () => {
    const el = getScrollContainer();
    if (el) {
      el.classList.add('snap-x', 'snap-mandatory');
      el.style.scrollSnapType = '';
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Ignore touches on action buttons (edit, delete, whatsapp)
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    touchStarted.current = true;
    isDragging.current = false;

    // Start long-press detection (300ms)
    longPressTimeout.current = setTimeout(() => {
      if (!touchStarted.current) return;
      isDragging.current = true;
      onTouchDragStart(card.id, card.listId);
      createGhost();
      disableSnap();
      // Provide haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50);
    }, 300);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStarted.current) return;

    // Cancel long-press if the finger moved before the threshold
    if (!isDragging.current) {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
      touchStarted.current = false;
      return;
    }

    e.preventDefault(); // Prevent scroll while dragging
    const touch = e.touches[0];
    moveGhost(touch.clientX, touch.clientY);

    // Auto-scroll the board when near the screen edges
    startEdgeScroll(touch.clientX);

    // Highlight target list
    const targetListId = getListIdAtPoint(touch.clientX, touch.clientY);
    document.querySelectorAll('[data-list-id]').forEach((el) => {
      (el as HTMLElement).style.outline = '';
    });
    if (targetListId) {
      const targetEl = document.querySelector(`[data-list-id="${targetListId}"]`);
      if (targetEl) {
        (targetEl as HTMLElement).style.outline = '2px solid #60a5fa';
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    stopEdgeScroll();

    if (!isDragging.current) {
      touchStarted.current = false;
      return;
    }

    const touch = e.changedTouches[0];
    const targetListId = getListIdAtPoint(touch.clientX, touch.clientY);

    // Remove highlights
    document.querySelectorAll('[data-list-id]').forEach((el) => {
      (el as HTMLElement).style.outline = '';
    });

    removeGhost();
    restoreSnap();

    if (targetListId && targetListId !== card.listId) {
      onTouchDrop(targetListId);
    }

    touchStarted.current = false;
    isDragging.current = false;
  };

  // ── Render ───────────────────────────────────────────────────────────────────

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
          <span className="font-bold">Tempo para Pausa:</span>
        </div>
        <span className="ml-2 font-mono text-base font-bold">{remainingTime}</span>
      </div>
    );
  };

  return (
    <>
      {isBeingDraggedOver && <div className="h-1.5 bg-laundry-teal-400 rounded-lg animate-pulse" />}
      <div
        ref={cardRef}
        draggable="true"
        onDragStart={(e) => onDragStart(e, card.id, card.listId)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 mb-4 cursor-grab active:cursor-grabbing border-t-4 border-laundry-blue-400 dark:border-laundry-teal-500 select-none"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-lg text-laundry-blue-900 dark:text-slate-100 break-words">
              {card.client?.name || card.customerName}
            </h4>
            {card.numeroCesto && (
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full bg-laundry-blue-100 dark:bg-laundry-blue-900/50 text-laundry-blue-700 dark:text-laundry-blue-300 text-xs font-bold border border-laundry-blue-200 dark:border-laundry-blue-800 shrink-0"
                title={`Cesto Numérico: ${card.numeroCesto}`}
              >
                {card.numeroCesto}
              </span>
            )}
          </div>
          <div className="flex space-x-1">
            {allLists && onMoveCard && (
              <div className="relative" ref={moveDropdownRef}>
                <button
                  onClick={() => setIsMoveDropdownOpen(!isMoveDropdownOpen)}
                  className="text-gray-400 dark:text-slate-400 hover:text-laundry-teal-500 dark:hover:text-laundry-teal-300 p-1 rounded-full hover:bg-laundry-teal-100 dark:hover:bg-laundry-teal-500/20 transition-colors"
                  aria-label="Mover Pedido"
                  title="Mover para outra lista"
                >
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </button>
                {isMoveDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 py-1.5 animate-fade-in overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mover para</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {allLists
                        .filter(l => l.id !== card.listId)
                        .map(targetList => (
                          <button
                            key={targetList.id}
                            onClick={() => handleMoveToList(targetList.id)}
                            className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-laundry-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 group"
                          >
                            <div className="shrink-0 group-hover:scale-110 transition-transform">
                              {targetList.type === 'lavadora' && <WashingMachineIcon className="w-4 h-4 text-laundry-blue-500 dark:text-laundry-blue-400" />}
                              {targetList.type === 'dryer' && <SunIcon className="w-4 h-4 text-orange-400" />}
                              {targetList.type === 'whatsapp' && <WhatsAppIcon className="w-4 h-4 text-green-500" />}
                              {targetList.type === 'conclusao' && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                              {targetList.type !== 'lavadora' && targetList.type !== 'dryer' && targetList.type !== 'whatsapp' && targetList.type !== 'conclusao' && (
                                <ListBulletIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                              )}
                            </div>
                            <span className="font-medium truncate">{targetList.title}</span>
                            {targetList.cardLimit != null && (
                              <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">
                                {targetList.cards.length}/{targetList.cardLimit}
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
            <span className="text-sm font-medium break-words text-laundry-blue-800 dark:text-slate-200">
              {card.basketIdentifier}
            </span>
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

        {list.type === 'whatsapp' && (
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

      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </>
  );
};

export default KanbanCard;