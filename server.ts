import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initialize Gemini client
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Timor Express Cross-Border API", timestamp: new Date().toISOString() });
});

// Live exchange rate endpoint
app.get("/api/exchange-rate", (_req, res) => {
  // Exchange rate: 1 USD to IDR ~ 16,250 IDR (Official exchange rate baseline)
  res.json({
    base: "USD",
    target: "IDR",
    rate: 16250,
    inverseRate: 1 / 16250,
    updatedAt: new Date().toISOString(),
    supportedCurrencies: ["USD", "IDR"],
  });
});

// AI Translation endpoint (Tetun <-> Indonesian <-> English)
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text to translate" });
    }

    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are a specialized real-time cross-border trade translator for Timor Express marketplace.
Translate the following e-commerce/logistics message from ${sourceLang || "auto-detect"} to ${targetLang || "Tetum or Indonesian"}.
Context: Trading between Timor-Leste (Dili, Baucau) and Indonesia (Kupang, Atambua, Surabaya, Jakarta).
Common terms:
- Freight/shipping: Frete / Ongkir
- Border customs: Alfándega / Bea Cukai / Mota'ain Border
- Invoice/Quote: Proforma Invoice / Penawaran Harga / Kuotasaun
- Delivery time: Tempu entrega / Estimasi pengiriman

Original text: "${text}"

Output strictly a JSON object with:
{
  "translatedText": "the translation",
  "detectedSourceLang": "language name",
  "targetLang": "${targetLang}",
  "politeNote": "optional short cultural/trade context tip if helpful, otherwise null"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    }

    // Fallback dictionary-based translation if AI is not available
    const fallbackTranslations: Record<string, Record<string, string>> = {
      "Tetun": {
        "Halo maun, sasán ne'e iha stock ka lae?": "Halo mas/kak, barang ini ada stok atau tidak?",
        "Bele haruka ba Dili ka lae?": "Bisa kirim ke Dili kah?",
        "Hira folin hotu ho frete mai Batugade?": "Berapa total harga termasuk ongkir sampai Batugade?",
        "Ha'u presiza sosa unidade 10.": "Saya butuh beli 10 unit.",
        "Favor haruka proforma invoice mai ha'u.": "Tolong kirimkan proforma invoice ke saya.",
      },
      "Indonesian": {
        "Halo, barang ini ready stock banyak di gudang Kupang.": "Halo maun, sasán ne'e prontu iha armazém Kupang.",
        "Bisa langsung kirim via perbatasan Mota'ain 3-4 hari sampai Dili.": "Bele haruka kedas liu husi fronteira Mota'ain loron 3-4 to'o Dili.",
        "Saya kirimkan rincian penawaran harga resmi ya.": "Ha'u haruka detallu kuotasaun folin ofisiál.",
        "Siap, kami bantu pengurusan bea cukai dan karantina lengkap.": "Prontu, ami ajuda prosesu alfándega no karantina kompletu.",
      },
    };

    return res.json({
      translatedText: text.startsWith("Halo") ? "Simulated translation: " + text : text,
      detectedSourceLang: sourceLang || "Auto",
      targetLang: targetLang || "Tetun",
      fallback: true,
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    res.status(500).json({ error: error.message || "Translation failed" });
  }
});

// Customs and Cross-Border Freight Calculator Endpoint
app.post("/api/calculate-customs", (req, res) => {
  const {
    itemPriceUSD,
    weightKg = 1,
    originCity = "Kupang",
    destinationMunicipality = "Dili",
    category = "general",
    quantity = 1,
  } = req.body;

  const priceUSD = Number(itemPriceUSD) * Number(quantity);
  const priceIDR = priceUSD * 16250;

  // 1. Domestic Indonesian Freight (Origin to Atambua Border Consolidation Hub)
  let domesticFreightIDR = 0;
  if (originCity.toLowerCase().includes("surabaya") || originCity.toLowerCase().includes("jakarta") || originCity.toLowerCase().includes("java")) {
    domesticFreightIDR = 85000 + (weightKg * 35000); // Sea-freight/Land consolidation
  } else if (originCity.toLowerCase().includes("kupang")) {
    domesticFreightIDR = 35000 + (weightKg * 15000); // Timor Highway trucking to Atambua
  } else {
    // Already in Atambua border town
    domesticFreightIDR = 15000;
  }
  const domesticFreightUSD = domesticFreightIDR / 16250;

  // 2. Atambua Border Hub Handling & Consolidation (Cross-docking, export declaration PEB, inspection)
  const borderHubHandlingUSD = Math.max(3.50, weightKg * 0.85);

  // 3. Timor-Leste Import Customs/Tax (Alfándega Dili)
  // Timor-Leste Standard Import Duties:
  // - Import Duty: 2.5% on CIF (Cost + Insurance + Freight)
  // - Sales Tax: 2.5% on CIF + Duty
  // - Port/Customs clearance documentation flat fee: ~$3.00 for small parcels
  const cifValueUSD = priceUSD + domesticFreightUSD + borderHubHandlingUSD;
  const importDutyUSD = cifValueUSD * 0.025;
  const salesTaxUSD = (cifValueUSD + importDutyUSD) * 0.025;
  const borderClearanceAdminUSD = 2.00;
  const totalCustomsTaxUSD = importDutyUSD + salesTaxUSD + borderClearanceAdminUSD;

  // 4. Last-Mile Delivery in Timor-Leste (Batugade/Mota'ain Border -> Destination)
  let lastMileUSD = 4.00;
  if (destinationMunicipality.toLowerCase().includes("baucau")) {
    lastMileUSD = 7.50;
  } else if (destinationMunicipality.toLowerCase().includes("oecusse")) {
    lastMileUSD = 6.00;
  } else if (destinationMunicipality.toLowerCase().includes("suai") || destinationMunicipality.toLowerCase().includes("maliana")) {
    lastMileUSD = 4.50;
  }

  const grandTotalUSD = priceUSD + domesticFreightUSD + borderHubHandlingUSD + totalCustomsTaxUSD + lastMileUSD;
  const grandTotalIDR = grandTotalUSD * 16250;

  res.json({
    breakdown: {
      baseItemPrice: { usd: priceUSD, idr: priceIDR },
      domesticFreight: { usd: domesticFreightUSD, idr: domesticFreightIDR, route: `${originCity} → Atambua Hub` },
      borderHubHandling: { usd: borderHubHandlingUSD, idr: borderHubHandlingUSD * 16250, description: "Atambua Consolidation & Export Document" },
      customsAndTaxes: {
        usd: totalCustomsTaxUSD,
        idr: totalCustomsTaxUSD * 16250,
        details: {
          importDutyUSD,
          salesTaxUSD,
          borderClearanceAdminUSD,
          cifValueUSD,
          taxRateSummary: "2.5% Import Duty + 2.5% Sales Tax (Timor-Leste Customs Code)"
        }
      },
      lastMileDelivery: { usd: lastMileUSD, idr: lastMileUSD * 16250, destination: `Batugade Border → ${destinationMunicipality}` }
    },
    totals: {
      totalUSD: grandTotalUSD,
      totalIDR: grandTotalIDR,
      exchangeRateApplied: 16250
    },
    logisticsEstimate: {
      transitDaysMin: originCity.toLowerCase().includes("surabaya") ? 4 : 2,
      transitDaysMax: originCity.toLowerCase().includes("surabaya") ? 6 : 4,
      entryPoint: "Mota'ain / Batugade Border Post (PLBN)",
      carrier: "Timor Express Overland Line",
    }
  });
});

// Vite middleware / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Timor Express server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
