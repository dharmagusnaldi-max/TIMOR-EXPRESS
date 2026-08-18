import React, { useState } from 'react';
import { 
  FileText, 
  Calculator, 
  ShieldCheck, 
  Building
} from 'lucide-react';
import { Language, Currency } from '../types';
import { getTranslation } from '../utils/i18n';
import { calculateBorderBreakdown } from '../utils/currency';

interface BorderCustomsGuideProps {
  language: Language;
  currency: Currency;
}

export const BorderCustomsGuide: React.FC<BorderCustomsGuideProps> = ({
  language,
  currency,
}) => {
  // Calculator inputs
  const [calcPriceUSD, setCalcPriceUSD] = useState<number>(50);
  const [calcWeightKg, setCalcWeightKg] = useState<number>(3.5);
  const [calcOrigin, setCalcOrigin] = useState<string>('Kupang');
  const [calcDest, setCalcDest] = useState<string>('Dili');

  const breakdown = calculateBorderBreakdown(calcPriceUSD, calcWeightKg, calcOrigin, calcDest);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white border border-[#E5E1D8] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#F0EDE7] border border-[#E5E1D8] flex items-center justify-center text-[#2D4F3C]">
            <FileText className="w-5 h-5 text-[#D4A373]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#2D4F3C]">
              {getTranslation(language, 'guideTitle')}
            </h2>
            <p className="text-xs text-[#4A4A4A]">
              {getTranslation(language, 'guideSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Standalone Cross-Border Simulator */}
      <div className="bg-white border border-[#E5E1D8] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#D4A373]" />
            <h3 className="font-bold text-sm text-[#2D4F3C] uppercase tracking-wider">
              Interactive Border Cost & Customs Calculator
            </h3>
          </div>
          <span className="text-xs bg-[#F0EDE7] text-[#2D4F3C] border border-[#E5E1D8] font-mono px-2 py-0.5 rounded font-bold">
            Real-time Tariff Engine
          </span>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[#4A4A4A] mb-1 font-bold">Item Base Price ($ USD):</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={calcPriceUSD}
              onChange={(e) => setCalcPriceUSD(Number(e.target.value))}
              className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
            />
          </div>

          <div>
            <label className="block text-[#4A4A4A] mb-1 font-bold">Package Weight (kg):</label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={calcWeightKg}
              onChange={(e) => setCalcWeightKg(Number(e.target.value))}
              className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
            />
          </div>

          <div>
            <label className="block text-[#4A4A4A] mb-1 font-bold">Supplier Origin (ID):</label>
            <select
              value={calcOrigin}
              onChange={(e) => setCalcOrigin(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
            >
              <option value="Atambua">Atambua Border Hub (Fastest)</option>
              <option value="Kupang">Kupang NTT (Trans-Timor)</option>
              <option value="Surabaya">Surabaya / Java (Sea-Land)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#4A4A4A] mb-1 font-bold">Destination (TL):</label>
            <select
              value={calcDest}
              onChange={(e) => setCalcDest(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-xl p-2.5 text-[#2D4F3C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D4F3C]"
            >
              <option value="Dili">Dili Central Hub</option>
              <option value="Baucau">Baucau Second Hub</option>
              <option value="Maliana">Maliana / Bobonaro</option>
              <option value="Ermera">Ermera Highlands</option>
              <option value="Oecusse">Oecusse Enclave</option>
            </select>
          </div>
        </div>

        {/* Calculated Breakdown Display */}
        <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#E5E1D8] space-y-2 text-xs font-mono">
          <div className="flex justify-between text-[#4A4A4A]">
            <span>1. Base Item Price:</span>
            <span className="text-[#2D4F3C] font-bold">${breakdown.basePriceUSD.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-[#4A4A4A]">
            <span>2. Domestic Indonesian Freight ({calcOrigin} ➔ Atambua Hub):</span>
            <span className="text-[#2D4F3C] font-bold">${breakdown.domesticFreightUSD.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-[#4A4A4A]">
            <span>3. Atambua Border Hub Consolidation & Export PEB:</span>
            <span className="text-[#2D4F3C] font-bold">${breakdown.borderHubUSD.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-[#4A4A4A]">
            <span>4. Timor-Leste Customs Tax (Duty 2.5% + Sales Tax 2.5% + Admin):</span>
            <span className="text-[#B45309] font-bold">${breakdown.customsTaxUSD.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-[#4A4A4A]">
            <span>5. Last-Mile Delivery (Batugade ➔ {calcDest}):</span>
            <span className="text-[#2D4F3C] font-bold">${breakdown.lastMileUSD.toFixed(2)} USD</span>
          </div>

          <div className="pt-3 mt-2 border-t border-[#E5E1D8] flex items-center justify-between font-bold text-sm bg-white p-3 rounded-lg border border-[#E5E1D8]">
            <span className="text-[#2D4F3C]">Total Landed Price in Timor-Leste:</span>
            <span className="text-[#2D4F3C] text-base font-black">
              ${breakdown.totalUSD.toFixed(2)} USD <span className="text-xs text-[#4A4A4A] font-normal">(Rp {breakdown.totalIDR.toLocaleString('id-ID')})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Guide Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[#2D4F3C] font-bold text-sm border-b border-[#E5E1D8] pb-2">
            <ShieldCheck className="w-4 h-4 text-[#2D4F3C]" />
            <h4>Timor-Leste Customs Code (Alfándega)</h4>
          </div>
          <ul className="space-y-2 text-[#4A4A4A] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#2D4F3C] font-bold">✓</span>
              <span><strong>2.5% Import Duty:</strong> Standard statutory tariff applied to CIF (Cost, Insurance & Freight) value on non-exempt commercial imports.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2D4F3C] font-bold">✓</span>
              <span><strong>2.5% Sales Tax:</strong> Applied on (CIF + Import Duty) value under the Timor-Leste Revenue and Customs Act.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2D4F3C] font-bold">✓</span>
              <span><strong>ASYCUDA World System:</strong> Electronic manifest declaration pre-lodged before trucks cross from PLBN Mota'ain to Batugade.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[#2D4F3C] font-bold text-sm border-b border-[#E5E1D8] pb-2">
            <Building className="w-4 h-4 text-[#D4A373]" />
            <h4>Currency & Banking Settlement</h4>
          </div>
          <ul className="space-y-2 text-[#4A4A4A] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#2D4F3C] font-bold">✓</span>
              <span><strong>Official Currency in Timor-Leste:</strong> United States Dollar (USD - $) is the sole official paper legal tender in Timor-Leste.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2D4F3C] font-bold">✓</span>
              <span><strong>Supplier Payments in Indonesia:</strong> Indonesian sellers receive payment in Indonesian Rupiah (IDR - Rp) automatically converted at live bank exchange rates.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2D4F3C] font-bold">✓</span>
              <span><strong>Supported Local Wallets:</strong> BNCTL, BNU Online, Mosan (Telemor), and E-Mola wallets in TL, and BCA/Mandiri/BRI in Indonesia.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
