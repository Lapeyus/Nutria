import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

export const analyzeFoodImage = async (imageFile: File): Promise<FoodAnalysis> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          { text: "Importante: el usuario es de Costa Rica. Teniendo esto en cuenta, realiza una evaluación nutricional de la comida en la imagen. Primero, identifica el plato (si es un plato típico costarricense como un casado, gallo pinto, etc., usa su nombre local). Luego, estima el tamaño de la porción, proporciona un recuento de calorías estimadas y, lo más importante, desglosa el plato en porciones por grupo alimenticio: harinas, vegetales, proteínas, frutas y grasas. Finalmente, lista los ingredientes principales. Adicionalmente, si la imagen contiene metadatos EXIF, extrae la fecha y hora en que se tomó la foto ('DateTimeOriginal') y devuélvela en formato ISO 8601. Si no hay datos EXIF de fecha disponibles, omite por completo el campo del timestamp en la respuesta." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            photoTimestamp: {
              type: Type.STRING,
              description: "Opcional. La fecha y hora en que se tomó la foto, extraída de los metadatos EXIF, en formato ISO 8601 (ej: '2023-10-27T10:30:00Z'). Si no hay datos EXIF de fecha, este campo debe omitirse.",
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
                grasas: { type: Type.NUMBER, description: "Número de porciones de grasas." },
              },
              required: ["harinas", "vegetales", "proteinas", "frutas", "grasas"],
            }
          },
          required: ["foodName", "portionSize", "ingredients", "estimatedCalories", "foodGroups"],
        },
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Análisis fallido: La IA no pudo identificar ninguna comida en la imagen. Por favor, intenta con una foto más clara o un ángulo diferente.");
    }

    let parsedJson;
    try {
        parsedJson = JSON.parse(jsonText);
    } catch (parseError) {
        console.error("Failed to parse JSON response from Gemini:", jsonText);
        throw new Error("Análisis fallido: La IA devolvió una respuesta en un formato inesperado. Por favor, inténtalo de nuevo.");
    }
    
    // Basic validation to ensure the parsed object matches our type
    if (
      !parsedJson.foodName ||
      !parsedJson.portionSize ||
      !Array.isArray(parsedJson.ingredients) ||
      typeof parsedJson.estimatedCalories !== 'number' ||
      !parsedJson.foodGroups
    ) {
      console.error("Gemini response was missing required fields:", parsedJson);
      throw new Error("Análisis fallido: La respuesta de la IA estaba incompleta. Por favor, inténtalo de nuevo.");
    }
    
    return parsedJson as FoodAnalysis;

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
