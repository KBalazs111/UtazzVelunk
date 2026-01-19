import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import { z } from 'zod';
import { AIItineraryRequest, AIItinerary } from '../types';


const ItinerarySchema = z.object({
    title: z.string(),
    summary: z.string(),
    days: z.array(z.object({
        day: z.number(),
        title: z.string(),
        description: z.string(),
        morning: z.object({
            activity: z.string(),
            description: z.string(),
            duration: z.string(),
            location: z.string(),
            tips: z.string().optional(),
        }),
        afternoon: z.object({
            activity: z.string(),
            description: z.string(),
            duration: z.string(),
            location: z.string(),
            cost: z.string().optional(),
        }),
        evening: z.object({
            activity: z.string(),
            description: z.string(),
            duration: z.string(),
            location: z.string(),
        }),
        accommodation: z.object({
            name: z.string(),
            type: z.string(),
            priceRange: z.string(),
        }),
        meals: z.array(z.object({
            type: z.enum(['breakfast', 'lunch', 'dinner']),
            recommendation: z.string(),
            cuisine: z.string(),
            priceRange: z.string(),
        })),
    })),
    estimatedBudget: z.object({
        min: z.number(),
        max: z.number(),
        currency: z.string(),
    }),
    tips: z.array(z.string()),
    bestTimeToVisit: z.string(),
});


const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Hiányzik a VITE_GEMINI_API_KEY a .env fájlból!");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig: GenerationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};


export const aiService = {
    async generateItinerary(request: AIItineraryRequest): Promise<AIItinerary> {
        console.log("AI kérés indítása (Gemini Pro)...", request.destination);

        try {

            const model = genAI.getGenerativeModel({
                model: 'gemini-flash-latest',
                generationConfig: generationConfig
            });

            const prompt = buildPrompt(request);

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log("AI Nyers válasz megérkezett.");

            let parsedRaw;
            try {
                parsedRaw = JSON.parse(text);
            } catch (e) {
                console.error("JSON Parse hiba részletei:", e);
                console.error("Hibás szöveg:", text);
                throw new Error("Az AI nem érvényes JSON-t küldött.");
            }

            const validatedData = ItinerarySchema.parse(parsedRaw);

            return {
                id: crypto.randomUUID(),
                userId: '',
                request,
                ...validatedData,
                createdAt: new Date(),
                updatedAt: new Date(),
                isSaved: false,
            };

        } catch (error) {
            console.error('AI Hiba:', error);

            if (error instanceof z.ZodError) {
                console.error("Validációs hiba részletek:", error.issues);
                throw new Error('Az AI válaszának szerkezete nem megfelelő.');
            }

            throw new Error('Nem sikerült az útiterv generálása. Ellenőrizd az internetkapcsolatot.');
        }
    },
};

function buildPrompt(request: AIItineraryRequest): string {
    const params = {
        budget: {
            budget: 'alacsony (hostel, street food)',
            moderate: 'közepes (3-4* hotel, éttermek)',
            premium: 'prémium (4-5* hotel, minőségi programok)',
            luxury: 'luxus (5* hotel, privát sofőr, exkluzív)',
        },
        style: {
            relaxed: 'nyugodt, pihentető',
            balanced: 'egyensúly a programok és pihenés közt',
            adventurous: 'pörgős, kalandos, aktív',
            luxury: 'kényeztető, exkluzív',
        },
        group: {
            solo: 'egyedül utazó',
            couple: 'pár',
            family: 'család gyerekekkel',
            friends: 'baráti társaság',
            business: 'üzleti út',
        }
    };

    const budgetText = params.budget[request.budget as keyof typeof params.budget] || request.budget;
    const styleText = params.style[request.travelStyle as keyof typeof params.style] || request.travelStyle;
    const groupText = params.group[request.groupType as keyof typeof params.group] || request.groupType;

    return `
Te egy profi utazásszervező AI vagy.
Készíts egy ${request.duration} napos útitervet ide: ${request.destination} (${request.country}).

PARAMÉTEREK:
- Stílus: ${styleText}
- Társaság: ${groupText}
- Költségkeret: ${budgetText}
- Érdeklődés: ${request.interests.join(', ')}
${request.specialRequirements ? `- Extra kérés: ${request.specialRequirements}` : ''}

ELVÁRÁSOK:
1. PÉNZNEM: A költségeket mindig a helyi pénznemben és HUF-ban is becsüld meg.
2. NYELV: Magyar.
3. PROGRAMOK: Legyenek logikusak (földrajzi közelség).
4. VALID JSON: A válaszodnak tökéletesen illeszkednie kell a lenti JSON sémához.

JSON SÉMA:
{
  "title": "Kreatív cím",
  "summary": "Rövid leírás",
  "days": [
    {
      "day": 1,
      "title": "Nap címe",
      "description": "Leírás",
      "morning": { "activity": "...", "description": "...", "duration": "...", "location": "...", "tips": "..." },
      "afternoon": { "activity": "...", "description": "...", "duration": "...", "location": "...", "cost": "..." },
      "evening": { "activity": "...", "description": "...", "duration": "...", "location": "..." },
      "accommodation": { "name": "...", "type": "...", "priceRange": "..." },
      "meals": [ 
        { "type": "breakfast", "recommendation": "...", "cuisine": "...", "priceRange": "..." },
        { "type": "lunch", "recommendation": "...", "cuisine": "...", "priceRange": "..." },
        { "type": "dinner", "recommendation": "...", "cuisine": "...", "priceRange": "..." }
      ]
    }
  ],
  "estimatedBudget": { "min": 0, "max": 0, "currency": "HUF" },
  "tips": ["Tipp 1", "Tipp 2"],
  "bestTimeToVisit": "..."
}
`;
}