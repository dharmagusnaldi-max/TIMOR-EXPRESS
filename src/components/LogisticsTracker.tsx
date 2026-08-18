import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Play
} from 'lucide-react';
import { ShipmentOrder, Language, Currency } from '../types';
import { getTranslation } from '../utils/i18n';

interface LogisticsTrackerProps {
  orders: ShipmentOrder[];
  selectedOrderId?: string;
  language: Language;
  currency: Currency;
  onAdvanceStage?: (orderId: string) => void;
  onResetOrderStage?: (orderId: string) => void;
}

export const LogisticsTracker: React.FC<LogisticsTrackerProps> = ({
  orders,
  selectedOrderId,
  language,
  currency,
  onAdvanceStage,
}) => {
  const [activeOrderId, setActiveOrderId] = useState<string>(
    selectedOrderId || orders[0]?.id || ''
  );
  const [showCustomsModal, setShowCustomsModal] = useState(false);

  const currentOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  if (!currentOrder) {
    return (
      <div className="bg-white border border-[#E5E1D8] rounded-2xl p-8 text-center text-[#4A4A4A] shadow-xs">
        <Truck className="w-12 h-12 text-[#D4A373] mx-auto mb-3" />
        <p className="font-semibold">No active cross-border shipments found.</p>
      </div>
    );
  }

  const stages = currentOrder.stages;
  const currentIdx = currentOrder.currentStageIndex;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Shipments Selector Switcher if multiple orders exist */}
      {orders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {orders.map((ord) => (
            <button
              key={ord.id}
              onClick={() => setActiveOrderId(ord.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                activeOrderId === ord.id
                  ? 'bg-[#2D4F3C] text-white border-[#2D4F3C] shadow-xs'
                  : 'bg-white text-[#4A4A4A] border-[#E5E1D8] hover:border-[#D4A373]'
              }`}
            >
              <span>{ord.orderNumber}</span>
              <span className="ml-1.5 opacity-80 font-mono">(${ord.totalUSD.toFixed(2)})</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Tracker Card */}
      <div className="bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-md">
        {/* Top Header with Tracking & ASYCUDA Code */}
        <div className="bg-[#FDFCF9] border-b border-[#E5E1D8] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-[#F0EDE7] text-[#2D4F3C] border border-[#E5E1D8] px-2.5 py-0.5 rounded-full font-mono font-bold">
                {currentOrder.orderNumber}
              </span>
              <span className="text-xs text-[#2D4F3C] flex items-center gap-1 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-[#2D4F3C] animate-ping"></span>
                Corridor En Route
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#2D4F3C]">
              {getTranslation(language, 'trackerTitle')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Customs Declaration Doc button */}
            <button
              id="btn-view-customs-doc"
              onClick={() => setShowCustomsModal(true)}
              className="flex items-center gap-1.5 bg-[#F0EDE7] hover:bg-[#E5E1D8] text-[#2D4F3C] text-xs font-bold px-3 py-2 rounded-xl border border-[#E5E1D8] transition"
            >
              <FileText className="w-4 h-4 text-[#D4A373]" />
              <span>{getTranslation(language, 'viewCustomsDoc')}</span>
            </button>

            {/* Simulation action button */}
            {onAdvanceStage && (
              <button
                id="btn-advance-pipeline-stage"
                onClick={() => onAdvanceStage(currentOrder.id)}
                className="flex items-center gap-1 bg-[#2D4F3C] hover:bg-[#1E3628] text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
                title="Advance to next logistics step"
              >
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{getTranslation(language, 'stepForward')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Corridor Geo-Route Graphic Banner */}
        <div className="bg-[#F9F7F2] border-b border-[#E5E1D8] p-4">
          <div className="flex items-center justify-between text-xs text-[#4A4A4A] mb-2 font-mono font-medium">
            <span className="text-[#2D4F3C] font-bold">Corridor: Java / Kupang (ID)</span>
            <span className="text-[#D4A373]">➔</span>
            <span className="text-[#2D4F3C] font-bold">PLBN Mota'ain Border</span>
            <span className="text-[#D4A373]">➔</span>
            <span className="text-[#2D4F3C] font-bold">Dili Central Hub (TL)</span>
          </div>

          {/* Graphical Corridor Progress Bar with Nodes */}
          <div className="relative flex items-center justify-between px-2 pt-2 pb-1">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-[#E5E1D8] rounded-full z-0"></div>
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 bg-[#2D4F3C] rounded-full z-0 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (currentIdx / 4) * 94))}%` }}
            ></div>

            {stages.map((stg, index) => {
              const isCompleted = index <= currentIdx;
              const isCurrent = index === currentIdx;
              return (
                <div key={stg.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#2D4F3C] text-white ring-4 ring-[#2D4F3C]/20 scale-110 shadow-xs'
                        : isCompleted
                        ? 'bg-[#2D4F3C] text-white'
                        : 'bg-white text-[#4A4A4A] border border-[#E5E1D8]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`text-[10px] mt-1.5 text-center hidden md:block max-w-[80px] font-semibold leading-tight ${
                    isCurrent ? 'text-[#2D4F3C] font-bold' : isCompleted ? 'text-[#4A4A4A]' : 'text-[#4A4A4A]/60'
                  }`}>
                    {stg.title[language]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Detailed Pipeline */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isDone = index < currentIdx;
              const isCurrent = index === currentIdx;

              return (
                <div
                  key={stage.id}
                  id={`stage-item-${index}`}
                  className={`flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-[#F0EDE7] border-[#2D4F3C] shadow-xs'
                      : isDone
                      ? 'bg-[#F9F7F2] border-[#E5E1D8]'
                      : 'bg-white/50 border-[#E5E1D8] opacity-60'
                  }`}
                >
                  {/* Step Status Icon */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? 'bg-[#2D4F3C] text-white font-bold shadow-xs'
                          : isDone
                          ? 'bg-white text-[#2D4F3C] border border-[#2D4F3C]'
                          : 'bg-[#F0EDE7] text-[#4A4A4A]'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2D4F3C]" />
                      ) : isCurrent ? (
                        <Truck className="w-4 h-4 animate-bounce" />
                      ) : (
                        <span className="text-xs font-mono font-bold">{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Stage Text & Verification Badges */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className={`text-sm font-black ${isCurrent ? 'text-[#2D4F3C]' : 'text-[#2D4F3C]'}`}>
                        {stage.title[language]}
                      </h4>
                      {stage.timestamp && (
                        <span className="text-[11px] text-[#4A4A4A] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#D4A373]" />
                          {stage.timestamp}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#4A4A4A] font-semibold">
                      {stage.subtitle[language]}
                    </p>

                    <div className="text-[11px] text-[#4A4A4A] flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
                      <span className="truncate">{stage.location}</span>
                    </div>

                    {/* Checkpoint Details Note */}
                    <div className="mt-2 bg-white p-2.5 rounded-lg border border-[#E5E1D8] text-xs text-[#4A4A4A] leading-relaxed">
                      {stage.checkpointDetails[language]}
                      {stage.officerOrFacility && (
                        <div className="text-[10px] text-[#2D4F3C] font-mono font-bold mt-1 pt-1 border-t border-[#E5E1D8]">
                          Verified: {stage.officerOrFacility}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Recipient Summary Footer Card */}
          <div className="bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <div className="text-[#4A4A4A] mb-0.5 font-bold">Final Destination (Timor-Leste):</div>
              <div className="text-[#2D4F3C] font-black">{currentOrder.destination.fullName}</div>
              <div className="text-[#4A4A4A]">{currentOrder.destination.addressLine}, {currentOrder.destination.municipality}</div>
            </div>

            <div className="text-right">
              <div className="text-[#4A4A4A] mb-0.5 font-bold">Total Landed Amount (Paid):</div>
              <div className="text-base font-black text-[#2D4F3C] font-mono">
                ${currentOrder.totalUSD.toFixed(2)} USD
              </div>
              <div className="text-[10px] text-[#4A4A4A] font-mono">
                Paid via {currentOrder.paymentMethod}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Customs Declaration Document Modal */}
      {showCustomsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E3628]/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FDFCF9] border border-[#E5E1D8] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-[#2D4F3C]">
            <div className="bg-white border-b border-[#E5E1D8] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4A373]" />
                <h3 className="font-bold text-sm text-[#2D4F3C]">
                  Timor-Leste Customs Certificate (Guia de Transporte)
                </h3>
              </div>
              <button
                onClick={() => setShowCustomsModal(false)}
                className="text-[#4A4A4A] hover:text-[#2D4F3C] p-1 rounded-lg bg-[#F0EDE7]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs font-mono">
              {/* Document Header */}
              <div className="text-center border-b border-[#E5E1D8] pb-3">
                <div className="font-bold text-[#2D4F3C] uppercase tracking-widest text-sm">
                  República Democrática de Timor-Leste
                </div>
                <div className="text-[11px] text-[#4A4A4A]">
                  Autoridade Tributária e Aduaneira (Alfándega) - Batugade Border Post
                </div>
                <div className="text-[10px] text-[#2D4F3C] font-bold mt-1">
                  ASYCUDA WORLD DECLARATION: {currentOrder.customsDeclarationCode}
                </div>
              </div>

              {/* Document Fields */}
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#E5E1D8]">
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Order Ref:</span>
                  <span className="text-[#2D4F3C] font-bold">{currentOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Origin Port / Hub:</span>
                  <span className="text-[#2D4F3C]">Surabaya/Kupang Consolidation (ID)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Border Crossing:</span>
                  <span className="text-[#2D4F3C]">PLBN Mota'ain / Batugade</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Consignee (Dili):</span>
                  <span className="text-[#2D4F3C] font-bold">{currentOrder.destination.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Import Duty (2.5%):</span>
                  <span className="text-[#B45309] font-bold">${(currentOrder.breakdown.customsTaxUSD * 0.45).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Sales Tax (2.5%):</span>
                  <span className="text-[#B45309] font-bold">${(currentOrder.breakdown.customsTaxUSD * 0.45).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">Border Admin & Inspection:</span>
                  <span className="text-[#2D4F3C] font-bold">${(currentOrder.breakdown.customsTaxUSD * 0.10).toFixed(2)} USD</span>
                </div>
                <div className="pt-2 border-t border-[#E5E1D8] flex justify-between font-bold text-[#2D4F3C]">
                  <span>Status:</span>
                  <span className="text-[#2D4F3C]">CLEARED & DUTIES PAID (PAGO)</span>
                </div>
              </div>

              <div className="text-[10px] text-[#4A4A4A] text-center">
                This electronic transit consignment note serves as official proof of cross-border customs tax compliance under the Timor-Leste Customs Code.
              </div>

              <button
                onClick={() => setShowCustomsModal(false)}
                className="w-full bg-[#2D4F3C] hover:bg-[#1E3628] text-white font-bold py-2.5 rounded-xl transition shadow-xs"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
