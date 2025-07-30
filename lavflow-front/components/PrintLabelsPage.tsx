
import React from 'react';
import { Card } from '../types';
import { UserIcon, BasketIcon, WashingMachineIcon, SunIcon, PrinterIcon, IdentificationIcon } from './icons';

interface PrintLabelsPageProps {
  cards: Card[];
}

const Label: React.FC<{ card: Card }> = ({ card }) => (
  <div className="bg-white border border-dashed border-gray-400 p-3 flex flex-col justify-between text-black break-inside-avoid" style={{ width: '3.5in', height: '2.25in' }}>
    <div>
      <div className="flex justify-between items-start border-b border-gray-300 pb-2 mb-2">
        <div className="flex items-center">
            <UserIcon className="w-6 h-6 mr-2 text-gray-700"/>
            <h3 className="font-bold text-lg">{card.customerName}</h3>
        </div>
        <div className="text-right">
            <p className="text-xs text-gray-500">ID Pedido</p>
            <p className="font-mono font-bold text-sm">{card.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>
      {card.customerDocument && (
        <div className="flex items-center text-gray-800 mt-2">
            <IdentificationIcon className="w-5 h-5 mr-2"/>
            <span className="text-base font-semibold">{card.customerDocument}</span>
        </div>
      )}
      {card.basketIdentifier && (
        <div className="flex items-center text-gray-800 mt-2">
            <BasketIcon className="w-5 h-5 mr-2"/>
            <span className="text-base font-semibold">{card.basketIdentifier}</span>
        </div>
      )}
    </div>

    <div className="flex justify-between items-end">
        <div className="flex items-center space-x-3">
            {card.services?.washing && <div title="Lavagem"><WashingMachineIcon className="w-8 h-8 text-gray-700" /></div>}
            {card.services?.drying && <div title="Secagem"><SunIcon className="w-8 h-8 text-gray-700" /></div>}
        </div>
        <div className="text-right">
             <p className="text-xs text-gray-500">Data de Entrada</p>
             <p className="font-semibold">{new Date(card.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
    </div>
  </div>
);

const PrintLabelsPage: React.FC<PrintLabelsPageProps> = ({ cards }) => {
  const handlePrint = () => {
    window.print();
  };

  const printStyles = `
    @media print {
      body, html {
        background-color: white;
      }
      body * {
        visibility: hidden;
      }
      #print-area, #print-area * {
        visibility: visible;
      }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      @page {
        size: auto;
        margin: 0.5cm;
      }
      .label-container {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  `;

  return (
    <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-slate-200 print:bg-white">
      <style>{printStyles}</style>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6 border border-laundry-blue-200 print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-laundry-blue-900">Imprimir Etiquetas</h1>
              <p className="text-laundry-blue-700 mt-1">
                Aqui estão todas as etiquetas para os pedidos ativos. Use o botão abaixo para imprimir.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="bg-laundry-teal-500 hover:bg-laundry-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <PrinterIcon className="h-6 w-6" />
              <span>Imprimir Todas as Etiquetas</span>
            </button>
          </div>
        </div>
        
        <div id="print-area" className="flex flex-wrap gap-4 justify-center">
          {cards.length > 0 ? (
            cards.map(card => <div key={card.id} className="label-container"><Label card={card} /></div>)
          ) : (
            <div className="text-center py-16 col-span-full print:hidden">
                <p className="text-xl text-gray-500">Nenhum pedido ativo para gerar etiquetas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintLabelsPage;
