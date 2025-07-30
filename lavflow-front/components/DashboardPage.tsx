
import React, { useMemo } from 'react';
import { BoardData } from '../types';
import { ChartBarIcon, CurrencyDollarIcon, CheckCircleIcon, ArrowTrendingUpIcon, UsersIcon, ExclamationTriangleIcon } from './icons';

interface DashboardPageProps {
  boardData: BoardData;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; detail?: string }> = ({ icon, title, value, detail }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700 p-6 flex items-center space-x-4">
    <div className="bg-laundry-teal-100 dark:bg-laundry-teal-500/20 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-laundry-blue-800 dark:text-slate-200 font-semibold">{title}</p>
      <p className="text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">{value}</p>
      {detail && <p className="text-sm text-gray-500 dark:text-slate-400">{detail}</p>}
    </div>
  </div>
);


const CustomBarChart: React.FC<{ data: { label: string; value: number }[]; chartTopValue: number }> = ({ data, chartTopValue }) => {
  const yAxisSteps = 4; // We will have 5 lines (0, 25%, 50%, 75%, 100%)
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => 
    (chartTopValue / yAxisSteps) * i
  );

  return (
    <div className="flex" style={{ height: '250px' }}>
      {/* Y-Axis Labels */}
      <div className="flex flex-col-reverse justify-between h-full text-right pr-4 text-xs text-laundry-blue-700 dark:text-slate-300 font-medium">
        {yAxisLabels.map(label => (
          <div key={label}>{Math.round(label).toLocaleString('pt-BR')}</div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1">
        <div className="relative flex flex-col h-full">
            <div className="flex-grow relative">
                 {/* Grid Lines */}
                <div className="absolute top-0 left-0 w-full h-full">
                {yAxisLabels.map(label => (
                    <div
                    key={`grid-${label}`}
                    className="absolute w-full border-t border-dashed border-laundry-blue-200 dark:border-slate-700"
                    style={{ bottom: `${(label / chartTopValue) * 100}%` }}
                    />
                ))}
                </div>
                {/* Bars */}
                <div className="absolute bottom-0 left-0 w-full h-full flex justify-between items-end space-x-2">
                    {data.map(item => (
                        <div key={item.label} className="relative flex-1 h-full flex flex-col items-center justify-end group">
                            <div className="z-10 text-xs font-bold text-laundry-blue-900 dark:text-slate-100 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity mb-1 transform -translate-y-2">
                            {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            <div
                                className="w-full bg-laundry-teal-400 hover:bg-laundry-teal-500 rounded-t-md transition-all duration-300 ease-out"
                                style={{ height: `${(item.value / chartTopValue) * 100}%` }}
                                title={`${item.label}: ${item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* X-Axis Labels */}
            <div className="flex justify-between border-t-2 border-laundry-blue-300 dark:border-slate-600 pt-2 mt-2">
                {data.map(item => (
                    <div key={item.label} className="flex-1 text-center text-xs font-bold text-laundry-blue-700 dark:text-slate-300">{item.label}</div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};


const PaymentMethodChart: React.FC<{ data: { pix: { count: number; totalValue: number }; dinheiro: { count: number; totalValue: number } } }> = ({ data }) => {
    const totalCount = data.pix.count + data.dinheiro.count;
    if (totalCount === 0) {
        return <div className="p-6 text-center text-gray-500 dark:text-slate-400">Nenhum pagamento registrado.</div>;
    }

    const pixPercentage = (data.pix.count / totalCount) * 100;
    const dinheiroPercentage = (data.dinheiro.count / totalCount) * 100;

    return (
        <div className="p-6 space-y-4">
            <div className="w-full flex h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700" title="Distribuição por quantidade de transações">
                <div style={{ width: `${pixPercentage}%`}} className="bg-cyan-400 transition-all duration-500" title={`Pix: ${pixPercentage.toFixed(1)}%`}></div>
                <div style={{ width: `${dinheiroPercentage}%` }} className="bg-green-400 transition-all duration-500" title={`Dinheiro: ${dinheiroPercentage.toFixed(1)}%`}></div>
            </div>
            <div className="flex justify-around">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                        <span className="font-semibold text-laundry-blue-800 dark:text-slate-200">Pix</span>
                    </div>
                    <span className="font-bold text-lg text-laundry-blue-900 dark:text-slate-100">{data.pix.count}</span>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{data.pix.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                 <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="font-semibold text-laundry-blue-800 dark:text-slate-200">Dinheiro</span>
                    </div>
                    <span className="font-bold text-lg text-laundry-blue-900 dark:text-slate-100">{data.dinheiro.count}</span>
                     <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{data.dinheiro.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
            </div>
        </div>
    );
}

const DashboardPage: React.FC<DashboardPageProps> = ({ boardData }) => {
  const stats = useMemo(() => {
    const completedCards = boardData['list-5']?.cards.filter(c => c.completedAt) || [];
    const totalRevenue = completedCards.reduce((sum, card) => sum + (card.serviceValue || 0), 0);
    const totalCompletedOrders = completedCards.length;
    
    let pendingOrders = 0;
    let pendingAssistedOrders = 0;
    let incomingValue = 0;
    Object.values(boardData).forEach(list => {
      if (list.id !== 'list-5') {
        pendingOrders += list.cards.length;
        list.cards.forEach(card => {
            if (card.tags.some(tag => tag.name === 'Assistido')) {
                pendingAssistedOrders++;
                incomingValue += card.serviceValue || 0;
            }
        });
      }
    });

    const weeklyRevenueData = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
      return { label, value: 0 };
    }).reverse();

    completedCards.forEach(card => {
        const completedDate = new Date(card.completedAt!);
        const today = new Date();
        
        const startOfCompletedDate = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const diffTime = startOfToday.getTime() - startOfCompletedDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays < 7) {
            weeklyRevenueData[6-diffDays].value += (card.serviceValue || 0);
        }
    });
    
    const getNiceMaxValue = (val: number) => {
      if (val <= 10) return Math.max(Math.ceil(val / 5) * 5, 10);
      const powerOf10 = 10 ** Math.floor(Math.log10(val));
      return Math.ceil(val / (powerOf10 / 2)) * (powerOf10 / 2);
    };

    const weeklyRevenueTopValue = getNiceMaxValue(weeklyRevenueData.reduce((max, item) => Math.max(max, item.value), 0));


    const paymentMethods = completedCards.reduce((acc, card) => {
        if(card.paymentMethod === 'pix') {
            acc.pix.count++;
            acc.pix.totalValue += card.serviceValue || 0;
        }
        if(card.paymentMethod === 'dinheiro') {
            acc.dinheiro.count++;
            acc.dinheiro.totalValue += card.serviceValue || 0;
        }
        return acc;
    }, { pix: { count: 0, totalValue: 0 }, dinheiro: { count: 0, totalValue: 0 } });

    return { totalRevenue, totalCompletedOrders, pendingOrders, weeklyRevenueData, paymentMethods, weeklyRevenueTopValue, pendingAssistedOrders, incomingValue };
  }, [boardData]);

  return (
    <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">Dashboard de Análise</h1>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          <StatCard
            icon={<CurrencyDollarIcon className="w-8 h-8 text-laundry-teal-600" />}
            title="Receita Total (Finalizados)"
            value={stats.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          />
          <StatCard
            icon={<CheckCircleIcon className="w-8 h-8 text-laundry-teal-600" />}
            title="Pedidos Finalizados"
            value={stats.totalCompletedOrders.toString()}
          />
           <StatCard
            icon={<ArrowTrendingUpIcon className="w-8 h-8 text-laundry-teal-600" />}
            title="Pedidos Pendentes"
            value={stats.pendingOrders.toString()}
          />
           <StatCard
            icon={<UsersIcon className="w-8 h-8 text-laundry-teal-600" />}
            title="Pendentes (Assistido)"
            value={stats.pendingAssistedOrders.toString()}
            detail="Pedidos com atendimento em aberto"
          />
          <StatCard
            icon={<ExclamationTriangleIcon className="w-8 h-8 text-laundry-teal-600" />}
            title="Valor a Entrar (Assistido)"
            value={stats.incomingValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            detail="Soma dos pedidos assistidos pendentes"
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700">
                <div className="p-6 border-b border-laundry-blue-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-laundry-blue-900 dark:text-slate-100">Receita Semanal</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Receita de pedidos finalizados nos últimos 7 dias.</p>
                </div>
                <div className="p-4 bg-laundry-blue-50/50 dark:bg-slate-800/50 rounded-lg m-4">
                  <CustomBarChart data={stats.weeklyRevenueData} chartTopValue={stats.weeklyRevenueTopValue} />
                </div>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-laundry-blue-200 dark:border-slate-700">
                <div className="p-6 border-b border-laundry-blue-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-laundry-blue-900 dark:text-slate-100">Métodos de Pagamento</h2>
                     <p className="text-sm text-gray-500 dark:text-slate-400">Distribuição por pedidos finalizados.</p>
                </div>
                <PaymentMethodChart data={stats.paymentMethods} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;