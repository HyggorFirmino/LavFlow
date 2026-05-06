
import React, { useState, useEffect } from 'react';
import { List } from '../types';
import CustomModal, { ModalType } from './CustomModal';

interface ListSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listId: string, title: string, limit: number | null, type: 'default' | 'dryer' | 'lavadora' | 'whatsapp' | 'conclusao', totalDryingTime?: number, reminderInterval?: number, alertaSonoro?: string) => void;
  onDelete: (listId: string) => void;
  list: List | null;
}

const ListSettingsModal: React.FC<ListSettingsModalProps> = ({ isOpen, onClose, onSave, onDelete, list }) => {
  const [title, setTitle] = useState('');
  const [limit, setLimit] = useState<string>('');
  const [type, setType] = useState<'default' | 'dryer' | 'lavadora' | 'whatsapp' | 'conclusao'>('default');
  const [totalDryingTime, setTotalDryingTime] = useState('');
  const [reminderInterval, setReminderInterval] = useState('');
  const [alertaSonoro, setAlertaSonoro] = useState<string>('');
  const [alertaSonoroName, setAlertaSonoroName] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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


  useEffect(() => {
    if (list) {
      setTitle(list.title);
      setLimit(list.cardLimit?.toString() || '');
      setType(list.type || 'default');
      setTotalDryingTime(list.totalDryingTime?.toString() || '');
      setReminderInterval(list.reminderInterval?.toString() || '');
      setAlertaSonoro(list.alertaSonoro || '');
      setAlertaSonoroName(list.alertaSonoro ? 'Áudio configurado' : '');
    }
  }, [list]);

  if (!isOpen || !list) {
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Campo Obrigatório',
        message: 'O título da lista não pode ser vazio.',
        type: 'warning'
      });
      return;
    }
    const newLimit = limit === '' ? null : parseInt(limit, 10);
    const newTotalTime = totalDryingTime === '' ? undefined : parseInt(totalDryingTime, 10);
    const newReminderInterval = reminderInterval === '' ? undefined : parseInt(reminderInterval, 10);

    if (limit !== '' && (isNaN(newLimit as number) || (newLimit as number) < 0)) {
      setModalConfig({
        isOpen: true,
        title: 'Valor Inválido',
        message: 'O limite de cartões deve ser um número positivo.',
        type: 'warning'
      });
      return;
    }

    if (type === 'dryer' && (newTotalTime === undefined || newTotalTime <= 0)) {
      setModalConfig({
        isOpen: true,
        title: 'Campo Obrigatório',
        message: 'O tempo total de secagem é obrigatório e deve ser positivo para listas do tipo Secadora.',
        type: 'warning'
      });
      return;
    }
    if (type === 'dryer' && newReminderInterval !== undefined && newReminderInterval <= 0) {
      setModalConfig({
        isOpen: true,
        title: 'Valor Inválido',
        message: 'O intervalo de lembrete deve ser um número positivo.',
        type: 'warning'
      });
      return;
    }
    if (type === 'dryer' && newReminderInterval !== undefined && newTotalTime !== undefined && newReminderInterval >= newTotalTime) {
      setModalConfig({
        isOpen: true,
        title: 'Valor Inválido',
        message: 'O intervalo de lembrete deve ser menor que o tempo total.',
        type: 'warning'
      });
      return;
    }

    onSave(list.id, title, newLimit, type, newTotalTime, newReminderInterval, alertaSonoro);
    onClose();
  };

  const handleDelete = () => {
    setModalConfig({
      isOpen: true,
      title: 'Excluir Lista',
      message: `Tem certeza que deseja excluir a lista "${list.title}"? Todos os cartões dentro dela também poderão ser afetados.`,
      type: 'confirm',
      onConfirm: () => {
        onDelete(list.id);
        onClose();
      }
    });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
        setModalConfig({
          isOpen: true,
          title: 'Arquivo muito grande',
          message: 'Por favor, selecione um arquivo de áudio de no máximo 5MB.',
          type: 'warning'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAlertaSonoro(reader.result as string);
        setAlertaSonoroName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const playAudio = () => {
    if (alertaSonoro) {
      const audio = new Audio(alertaSonoro);
      audio.play().catch(e => console.error("Error playing audio", e));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md m-4 border-t-4 border-laundry-teal-400">
        <form onSubmit={handleSave}>
          <h2 className="text-2xl font-bold text-laundry-blue-900 dark:text-slate-100 mb-6">Configurações da Lista</h2>

          <div className="mb-4">
            <label htmlFor="listTitle" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Título da Lista</label>
            <input
              id="listTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="cardLimit" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Limite de Cartões (opcional)</label>
            <input
              id="cardLimit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="1"
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
              placeholder="Ex: 5"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="listType" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Tipo de Lista</label>
            <select
              id="listType"
              value={type}
              onChange={(e) => setType(e.target.value as 'default' | 'dryer' | 'lavadora' | 'whatsapp' | 'conclusao')}
              className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400 h-[42px]"
            >
              <option value="default">Padrão</option>
              <option value="lavadora">Lavadora</option>
              <option value="dryer">Secadora</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="conclusao">Conclusão</option>
            </select>
          </div>

          {type === 'dryer' && (
            <div className="p-4 bg-laundry-blue-50 dark:bg-slate-700/50 rounded-lg border border-laundry-blue-200 dark:border-slate-600 mb-6">
              <h3 className="font-semibold text-laundry-blue-900 dark:text-slate-100 mb-3">Configurações da Secadora</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="totalDryingTime" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Tempo Total (min)</label>
                  <input
                    id="totalDryingTime"
                    type="number"
                    value={totalDryingTime}
                    onChange={(e) => setTotalDryingTime(e.target.value)}
                    min="1"
                    className="shadow-inner bg-white dark:bg-slate-700 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                    placeholder="Ex: 45"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reminderInterval" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Lembrar a cada (min)</label>
                  <input
                    id="reminderInterval"
                    type="number"
                    value={reminderInterval}
                    onChange={(e) => setReminderInterval(e.target.value)}
                    min="1"
                    className="shadow-inner bg-white dark:bg-slate-700 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-2 px-3 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                    placeholder="Ex: 15"
                  />
                </div>
              </div>
              <div className="mt-4 border-t border-laundry-blue-200 dark:border-slate-600 pt-4">
                <label className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Áudio de Alerta</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAudioUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 py-1.5 px-3 rounded hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors text-sm"
                  >
                    Escolher Arquivo
                  </button>
                  <span className="text-sm text-gray-500 dark:text-slate-400 truncate flex-1">
                    {alertaSonoroName || 'Nenhum áudio selecionado'}
                  </span>
                  {alertaSonoro && (
                    <button
                      type="button"
                      onClick={playAudio}
                      className="text-laundry-teal-500 hover:text-laundry-teal-600 dark:text-laundry-teal-400 p-1"
                      title="Testar áudio"
                    >
                      ▶️ Play
                    </button>
                  )}
                  {alertaSonoro && (
                    <button
                      type="button"
                      onClick={() => { setAlertaSonoro(''); setAlertaSonoroName(''); }}
                      className="text-red-500 hover:text-red-600 p-1"
                      title="Remover áudio"
                    >
                      ✖
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Recomendado: Arquivo curto (mp3, wav) até 5MB.</p>
              </div>
            </div>
          )}


          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-500/20 dark:hover:bg-red-500/30 dark:text-red-300 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
              Excluir Lista
            </button>
            <div className="space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-laundry-blue-100 hover:bg-laundry-blue-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-laundry-blue-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
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

export default ListSettingsModal;