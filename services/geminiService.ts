/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisAdjustments, EstimateExplanations, FoodAnalysis, FoodGroupExplanations, FoodGroupPortions } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === "ENTER_YOUR_API_KEY_HERE") {
  throw new Error("API Key is not set. Please add VITE_GEMINI_API_KEY to your .env.local file.");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });

  const base64Data = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

const foodAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    photoTimestamp: {
      type: Type.STRING,
      description: "Opcional. La fecha y hora en que se tomó la foto, extraída de los metadatos EXIF, en formato ISO 8601.",
    },
    foodName: {
      type: Type.STRING,
      description: "El nombre del plato de comida identificado (usando el nombre costarricense si aplica).",
    },
    portionSize: {
      type: Type.STRING,
      description: "Una estimación del tamaño de la porción, ej., '1 taza', 'aprox. 200g'.",
    },
    ingredients: {
      type: Type.ARRAY,
      description: "Una lista de los ingredientes principales encontrados en el plato.",
      items: {
        type: Type.STRING,
      },
    },
    estimatedCalories: {
      type: Type.NUMBER,
      description: "Un recuento total estimado de calorías para la porción identificada."
    },
    foodGroups: {
      type: Type.OBJECT,
      description: "Un desglose del número de porciones por grupo alimenticio.",
      properties: {
        harinas: { type: Type.NUMBER, description: "Número de porciones de harinas/carbohidratos." },
        vegetales: { type: Type.NUMBER, description: "Número de porciones de vegetales." },
        proteinas: { type: Type.NUMBER, description: "Número de porciones de proteínas." },
        frutas: { type: Type.NUMBER, description: "Número de porciones de frutas." },
        leches: { type: Type.NUMBER, description: "Número de porciones de lácteos." },
        grasas: { type: Type.NUMBER, description: "Número de porciones de grasas." },
      },
      required: ["harinas", "vegetales", "proteinas", "frutas", "leches", "grasas"],
    },
    estimateExplanations: {
      type: Type.OBJECT,
      description: "Explicaciones breves para cada estimación nutricional.",
      properties: {
        portionSize: { type: Type.STRING, description: "Explicación de cómo se estimó el tamaño de porción." },
        estimatedCalories: { type: Type.STRING, description: "Explicación de cómo se estimaron las calorías totales." },
        foodGroups: {
          type: Type.OBJECT,
          description: "Explicaciones por cada grupo alimenticio.",
          properties: {
            harinas: { type: Type.STRING, description: "Justificación de la porción de harinas." },
            vegetales: { type: Type.STRING, description: "Justificación de la porción de vegetales." },
            proteinas: { type: Type.STRING, description: "Justificación de la porción de proteínas." },
            frutas: { type: Type.STRING, description: "Justificación de la porción de frutas." },
            leches: { type: Type.STRING, description: "Justificación de la porción de leches." },
            grasas: { type: Type.STRING, description: "Justificación de la porción de grasas." },
          },
          required: ["harinas", "vegetales", "proteinas", "frutas", "leches", "grasas"],
        },
      },
      required: ["portionSize", "estimatedCalories", "foodGroups"],
    },
  },
  required: ["foodName", "portionSize", "ingredients", "estimatedCalories", "foodGroups", "estimateExplanations"],
};

const parsePortion = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 10) / 10;
};

const normalizeFoodGroups = (groups: unknown): FoodGroupPortions => {
  const value = typeof groups === 'object' && groups !== null ? groups as Record<string, unknown> : {};
  return {
    harinas: parsePortion(value.harinas),
    vegetales: parsePortion(value.vegetales),
    proteinas: parsePortion(value.proteinas),
    frutas: parsePortion(value.frutas),
    leches: parsePortion(value.leches),
    grasas: parsePortion(value.grasas),
  };
};

const normalizeExplanationText = (value: unknown, fallback: string): string => {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : fallback;
};

const normalizeFoodGroupExplanations = (value: unknown): FoodGroupExplanations => {
  const raw = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  return {
    harinas: normalizeExplanationText(raw.harinas, "Estimación basada en la imagen."),
    vegetales: normalizeExplanationText(raw.vegetales, "Estimación basada en la imagen."),
    proteinas: normalizeExplanationText(raw.proteinas, "Estimación basada en la imagen."),
    frutas: normalizeExplanationText(raw.frutas, "Estimación basada en la imagen."),
    leches: normalizeExplanationText(raw.leches, "Estimación basada en la imagen."),
    grasas: normalizeExplanationText(raw.grasas, "Estimación basada en la imagen."),
  };
};

const normalizeEstimateExplanations = (value: unknown): EstimateExplanations => {
  const raw = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  return {
    portionSize: normalizeExplanationText(raw.portionSize, "Estimación basada en dimensiones visibles del plato."),
    estimatedCalories: normalizeExplanationText(raw.estimatedCalories, "Estimación basada en porción e ingredientes identificados."),
    foodGroups: normalizeFoodGroupExplanations(raw.foodGroups),
  };
};

const parseFoodAnalysisResponse = (jsonText: string): FoodAnalysis => {
  if (!jsonText) {
    throw new Error("Análisis fallido: La IA no pudo identificar ninguna comida en la imagen. Por favor, intenta con una foto más clara o un ángulo diferente.");
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch (parseError) {
    console.error("Failed to parse JSON response from Gemini:", jsonText);
    throw new Error("Análisis fallido: La IA devolvió una respuesta en un formato inesperado. Por favor, inténtalo de nuevo.");
  }

  if (
    !parsedJson.foodName ||
    !parsedJson.portionSize ||
    !Array.isArray(parsedJson.ingredients) ||
    typeof parsedJson.estimatedCalories !== 'number' ||
    !parsedJson.foodGroups ||
    !parsedJson.estimateExplanations
  ) {
    console.error("Gemini response was missing required fields:", parsedJson);
    throw new Error("Análisis fallido: La respuesta de la IA estaba incompleta. Por favor, inténtalo de nuevo.");
  }

  const normalizedIngredients = parsedJson.ingredients
    .map((ingredient: unknown) => String(ingredient).trim())
    .filter((ingredient: string) => ingredient.length > 0);

  if (normalizedIngredients.length === 0) {
    throw new Error("Análisis fallido: La respuesta de la IA estaba incompleta. Por favor, inténtalo de nuevo.");
  }

  return {
    photoTimestamp: typeof parsedJson.photoTimestamp === 'string' ? parsedJson.photoTimestamp : undefined,
    foodName: String(parsedJson.foodName).trim(),
    portionSize: String(parsedJson.portionSize).trim(),
    ingredients: normalizedIngredients,
    estimatedCalories: Math.round(Number(parsedJson.estimatedCalories)),
    foodGroups: normalizeFoodGroups(parsedJson.foodGroups),
    estimateExplanations: normalizeEstimateExplanations(parsedJson.estimateExplanations),
  };
};

const generateFoodAnalysis = async (imageFile: File, prompt: string): Promise<FoodAnalysis> => {
  const imagePart = await fileToGenerativePart(imageFile);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        imagePart,
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: foodAnalysisSchema,
    }
  });

  return parseFoodAnalysisResponse(response.text.trim());
};

export const analyzeFoodImage = async (imageFile: File, mealDescription?: string): Promise<FoodAnalysis> => {
  try {
    const cleanedDescription = mealDescription?.trim();
    const descriptionContext = cleanedDescription
      ? `Contexto adicional proporcionado por el usuario sobre el plato: "${cleanedDescription}". Usa esta descripcion para mejorar la precision del analisis nutricional, pero prioriza la evidencia visual de la imagen si hay conflicto.`
      : "No hay descripcion adicional del usuario para este plato.";
    const prompt = `Importante: el usuario es de Costa Rica. Teniendo esto en cuenta, realiza una evaluacion nutricional de la comida en la imagen. Primero, identifica el plato (si es un plato tipico costarricense como un casado, gallo pinto, etc., usa su nombre local). Luego, estima el tamano de la porcion, proporciona un recuento de calorias estimadas y, lo mas importante, desglosa el plato en porciones por grupo alimenticio: harinas, vegetales, proteinas, frutas, leches y grasas. Finalmente, lista los ingredientes principales. Incluye explicaciones claras y breves para cada estimacion: tamano de porcion, calorias y cada grupo alimenticio, para que el usuario pueda refinar facilmente el analisis. Adicionalmente, si la imagen contiene metadatos EXIF, extrae la fecha y hora en que se tomo la foto ('DateTimeOriginal') y devuelvela en formato ISO 8601. Si no hay datos EXIF de fecha disponibles, omite por completo el campo del timestamp en la respuesta. ${descriptionContext}`;

    return await generateFoodAnalysis(imageFile, prompt);

  } catch (error: any) {
    console.error("Error during food analysis:", error);
    // If we threw one of our custom messages, just re-throw it.
    if (error.message.startsWith('Análisis fallido:')) {
      throw error;
    }

    if (error.message.includes('429')) {
      throw new Error("¡Estás analizando demasiado rápido! Por favor, espera un momento antes de volver a intentarlo.");
    }
    if (error.message.includes('400')) { // Bad Request, often from malformed input
      throw new Error("Análisis fallido: La imagen enviada podría ser inválida o no compatible. Por favor, intenta con una imagen diferente.");
    }
    if (error.message.match(/50\d/)) { // Catches 500, 503, etc. for server errors
      throw new Error("El servicio de análisis no está disponible temporalmente. Por favor, inténtalo de nuevo más tarde.");
    }

    // Default error for other cases
    throw new Error("Ocurrió un error desconocido al analizar la imagen. Por favor, revisa tu conexión e inténtalo de nuevo.");
  }
};

export const reestimateFoodAnalysis = async (
  imageFile: File,
  currentAnalysis: FoodAnalysis,
  adjustments: AnalysisAdjustments,
  mealDescription?: string
): Promise<FoodAnalysis> => {
  try {
    const cleanedDescription = mealDescription?.trim();
    const descriptionContext = cleanedDescription
      ? `Descripcion del usuario sobre el plato: "${cleanedDescription}".`
      : "No hay descripcion adicional del usuario.";

    const prompt = `Recalcula el analisis nutricional del plato usando la imagen y los ajustes del usuario.

Analisis original:
${JSON.stringify(currentAnalysis)}

Ajustes solicitados por el usuario:
${JSON.stringify(adjustments)}

Reglas:
1) Respeta los cambios del usuario en ingredientes y tamano de porcion como fuente prioritaria para el recalculo.
2) Usa la imagen para validar coherencia y corregir inconsistencias evidentes.
3) Reestima calorias y porciones por grupo alimenticio con base en los cambios.
4) Incluye explicaciones claras y breves para cada estimacion (porcion, calorias y cada grupo).
5) Devuelve JSON valido con la misma estructura requerida.
6) No incluyas texto fuera del JSON.

${descriptionContext}`;

    return await generateFoodAnalysis(imageFile, prompt);
  } catch (error: any) {
    console.error("Error during food re-estimation:", error);
    if (error.message.startsWith('Análisis fallido:')) {
      throw error;
    }

    if (error.message.includes('429')) {
      throw new Error("¡Estás reestimando demasiado rápido! Espera un momento antes de intentarlo de nuevo.");
    }
    if (error.message.includes('400')) {
      throw new Error("Reestimación fallida: no se pudieron procesar los cambios. Revisa los datos e inténtalo otra vez.");
    }
    if (error.message.match(/50\d/)) {
      throw new Error("El servicio de análisis no está disponible temporalmente. Por favor, inténtalo de nuevo más tarde.");
    }

    throw new Error("Ocurrió un error al reestimar la comida. Por favor, revisa tu conexión e inténtalo de nuevo.");
  }
};
