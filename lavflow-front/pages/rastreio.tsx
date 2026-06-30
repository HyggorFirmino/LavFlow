import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { API_URL } from '../services/api';
import { 
  WashingMachineIcon, 
  SunIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  BasketIcon,
  ArrowPathIcon
} from '../components/icons';

interface StatusInfo {
  id: number;
  titulo: string;
  tipo: string;
  ordem: number;
}

interface TimelineItem {
  id: number;
  titulo: string;
  tipo: string;
  ordem: number;
}

interface HistoryItem {
  timestamp: string;
  fromListTitle: string;
  toListTitle: string;
}

interface OrderTrackingData {
  id: number;
  customerName: string;
  createdAt: string;
  completedAt?: string;
  enteredDryerAt?: string;
  basketIdentifier?: string;
  numeroCesto?: number;
  services: { washing: boolean; drying: boolean };
  tags: { name: string; value?: string }[];
  status: StatusInfo;
  timeline: TimelineItem[];
  history: HistoryItem[];
}

export default function Rastreio() {
  const router = useRouter();
  const { id } = router.query;

  const [orderIdInput, setOrderIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OrderTrackingData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Efeito para buscar os dados quando o ID da query estiver disponível
  useEffect(() => {
    if (!id) {
      setData(null);
      setError(null);
      return;
    }

    const fetchTrackingData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/pedidos/rastreio/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Pedido não encontrado. Verifique o número informado.');
          }
          throw new Error('Erro ao buscar informações de rastreio.');
        }
        const trackingData: OrderTrackingData = await res.json();
        setData(trackingData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Ocorreu um erro inesperado.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [id, refreshTrigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    router.push({
      pathname: '/rastreio',
      query: { id: orderIdInput.trim() },
    });
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Head>
        <title>LavFlow - Acompanhar Pedido</title>
        <meta name="description" content="Acompanhe o status do seu pedido de lavanderia em tempo real." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-4 px-6 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <WashingMachineIcon className="w-7 h-7 text-laundry-teal-500 animate-spin-slow" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-laundry-teal-500 to-laundry-blue-600 bg-clip-text text-transparent">
            LavFlow
          </span>
        </div>
        {id && (
          <button 
            onClick={triggerRefresh}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-laundry-teal-500 dark:text-slate-400 dark:hover:text-laundry-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Atualizar Status"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {/* Caso não tenha ID na URL, exibe tela de busca */}
        {!id && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-6 animate-fade-in mt-8">
            <div className="w-16 h-16 bg-laundry-teal-100 dark:bg-laundry-teal-950/40 rounded-full flex items-center justify-center mx-auto text-laundry-teal-500">
              <WashingMachineIcon className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Rastrear Pedido</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Digite o código numérico presente no ticket impresso da sua lavanderia para acompanhar em tempo real.
              </p>
            </div>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="Ex: 12345"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="w-full text-center text-xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3.5 focus:border-laundry-teal-500 focus:outline-none focus:ring-1 focus:ring-laundry-teal-500 transition-colors text-slate-900 dark:text-white"
                required
              />
              <button
                type="submit"
                className="w-full bg-laundry-teal-500 hover:bg-laundry-teal-600 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-laundry-teal-500/20"
              >
                Buscar Pedido
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && id && !data && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-laundry-teal-500/30 border-t-laundry-teal-500 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Buscando informações do seu pedido...</p>
          </div>
        )}

        {/* Error State */}
        {error && id && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center space-y-4 mt-8 animate-fade-in">
            <div className="text-red-500 font-bold text-lg">Oops!</div>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setOrderIdInput('');
                router.push('/rastreio');
              }}
              className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Tracking Data */}
        {data && id && !loading && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Card Informações Básicas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-laundry-teal-500/5 rounded-bl-full flex items-center justify-center text-laundry-teal-500/10 pointer-events-none">
                <BasketIcon className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-laundry-teal-600 dark:text-laundry-teal-400 bg-laundry-teal-50 dark:bg-laundry-teal-950/30 px-2.5 py-1 rounded-md">
                    Pedido Rastreável
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Entrada: {new Date(data.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-slate-400 text-sm font-medium">Pedido</span>
                  <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
                    #{String(data.id).toUpperCase()}
                  </span>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block font-medium">CLIENTE</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{data.customerName}</span>
                  </div>
                  {data.basketIdentifier && (
                    <div className="text-right">
                      <span className="text-slate-400 text-xs block font-medium">IDENTIFICADOR DO CESTO</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center justify-end">
                        {data.numeroCesto && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold mr-1.5 border border-slate-200 dark:border-slate-700">
                            {data.numeroCesto}
                          </span>
                        )}
                        {data.basketIdentifier}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card de Serviços do Pedido */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Serviços Contratados</h3>
              <div className="flex space-x-4">
                {data.services.washing && (
                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <WashingMachineIcon className="w-5 h-5 text-laundry-blue-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lavagem</span>
                  </div>
                )}
                {data.services.drying && (
                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <SunIcon className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Secagem</span>
                  </div>
                )}
              </div>
              
              {data.tags.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {data.tags.map(tag => (
                      <span key={tag.name} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium border border-slate-200/50 dark:border-slate-700/50">
                        {tag.name} {tag.value && <strong className="ml-1">({tag.value})</strong>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Linha do tempo de progresso dinâmico */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progresso do Pedido</h3>
              
              <div className="relative pl-8 space-y-8">
                {/* Linha de fundo da timeline */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800 pointer-events-none"></div>

                {data.timeline.map((item, index) => {
                  // Lógica matemática para determinar o estado de cada etapa no fluxo
                  const isCurrent = item.id === data.status.id;
                  const isCompleted = item.ordem < data.status.ordem;
                  const isPending = item.ordem > data.status.ordem;

                  let bubbleClass = 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400';
                  let titleClass = 'text-slate-400 dark:text-slate-500 font-medium';
                  let lineHighlight = null;

                  if (isCompleted) {
                    bubbleClass = 'bg-laundry-teal-500 border-laundry-teal-500 text-white';
                    titleClass = 'text-slate-700 dark:text-slate-300 font-bold';
                  } else if (isCurrent) {
                    bubbleClass = 'bg-white dark:bg-slate-900 border-laundry-teal-500 text-laundry-teal-500 ring-4 ring-laundry-teal-500/20';
                    titleClass = 'text-laundry-teal-600 dark:text-laundry-teal-400 font-black text-base scale-102';
                  }

                  return (
                    <div key={item.id} className="relative flex items-center transition-all duration-300">
                      {/* Círculo indicador */}
                      <div className={`absolute -left-[33px] w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 transition-all ${bubbleClass}`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      
                      {/* Conteúdo do item */}
                      <div className="flex-grow">
                        <span className={`block transition-all ${titleClass}`}>
                          {item.titulo}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-bold text-laundry-teal-500/80 uppercase tracking-widest block animate-pulse">
                            Fase Atual
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Histórico Recente */}
            {data.history && data.history.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Histórico de Atualizações</h3>
                <div className="space-y-4 max-h-40 overflow-y-auto pr-1">
                  {data.history.map((h, i) => (
                    <div key={i} className="flex items-start text-xs border-b border-slate-50 dark:border-slate-800/40 pb-2 last:border-0 last:pb-0">
                      <ClockIcon className="w-4 h-4 mr-2.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-slate-500 dark:text-slate-400">
                          {new Date(h.timestamp.endsWith('Z') ? h.timestamp : `${h.timestamp}Z`).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          Etapa alterada de <strong className="font-semibold">{h.fromListTitle || 'Inicial'}</strong> para <strong className="font-semibold text-slate-800 dark:text-slate-200">{h.toListTitle}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rodapé do Rastreio */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  router.push('/rastreio');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
              >
                Rastrear outro pedido
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Footer Geral */}
      <footer className="py-8 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/50 dark:border-slate-900/50 mt-12 bg-white/50 dark:bg-slate-950/50">
        <p>© {new Date().getFullYear()} LavFlow. Rastreamento inteligente de lavanderia.</p>
        <p className="mt-1">Desenvolvido com excelência e privacidade.</p>
      </footer>

      {/* Estilos e animações sob demanda */}
      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
