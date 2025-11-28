import { GoogleGenAI, Type, FunctionDeclaration, Tool, Content, Part } from "@google/genai";

// --- Tool Definitions ---

const performNlpAnalysisTool: FunctionDeclaration = {
  name: "performNlpAnalysis",
  description: "Python-based NLP Service (spaCy/NLTK). Analyzes text for sentiment, intent, and named entities.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING }
    },
    required: ["text"],
  },
};

const getUserOrdersTool: FunctionDeclaration = {
  name: "getUserOrders",
  description: "Retrieves recent orders for the current user. CALL THIS FIRST if the user mentions an item name (e.g., 'return my blender') but hasn't given an Order ID.",
  parameters: {
    type: Type.OBJECT,
    properties: { userId: { type: Type.STRING } },
    required: ["userId"],
  },
};

const getOrderTool: FunctionDeclaration = {
  name: "getOrderDetails",
  description: "Retrieves specific details by Order ID.",
  parameters: {
    type: Type.OBJECT,
    properties: { orderId: { type: Type.STRING } },
    required: ["orderId"],
  },
};

const processReturnTool: FunctionDeclaration = {
  name: "processReturn",
  description: "Executes a return transaction in the database (FastAPI Backend).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: { type: Type.STRING },
      reason: { type: Type.STRING },
      approvedBy: { type: Type.STRING, description: "Name of the resolution agent approving this." }
    },
    required: ["orderId", "reason"],
  },
};

const processExchangeTool: FunctionDeclaration = {
  name: "processExchange",
  description: "Executes an exchange in the database.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: { type: Type.STRING },
      newItemDescription: { type: Type.STRING },
    },
    required: ["orderId", "newItemDescription"],
  },
};

// Vision Agent (Python Backend - YOLOv5)
const runPythonVisionAnalysisTool: FunctionDeclaration = {
  name: "runPythonVisionAnalysis",
  description: "Triggers the Python Computer Vision backend using YOLOv5 for object detection and defect localization. REQUIRED for all image/video uploads.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      mediaType: { type: Type.STRING, description: "'image' or 'video'" },
      defectClass: { type: Type.STRING, description: "Detected object class (e.g. 'torn_fabric', 'scratch', 'screen_glitch')" },
      technicalDetails: { type: Type.STRING, description: "Technical specs (e.g. 'YOLO confidence 0.9', 'Box [10,10,50,50]')" },
      severityScore: { type: Type.NUMBER, description: "0.0 to 1.0" },
    },
    required: ["mediaType", "defectClass", "severityScore"],
  },
};

const scanInvoiceTool: FunctionDeclaration = {
  name: "scanInvoice",
  description: "Uses Python OCR (Tesseract/EasyOCR) to extract Order IDs from invoice images.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      documentType: { type: Type.STRING }
    },
    required: ["documentType"],
  },
};

// Policy Agent (ChromaDB)
const checkPolicyTool: FunctionDeclaration = {
  name: "checkReturnPolicy",
  description: "Consults the Policy Agent (ChromaDB) for rules.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      scenario: { type: Type.STRING },
      timeSincePurchase: { type: Type.STRING }
    },
    required: ["scenario"],
  },
};

const searchKnowledgeBaseTool: FunctionDeclaration = {
  name: "searchKnowledgeBase",
  description: "Semantic search (ChromaDB) for complex questions (recycling, manuals, etc.).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING }
    },
    required: ["query"],
  },
};

// Resolution Agent
const determineResolutionTool: FunctionDeclaration = {
  name: "determineResolution",
  description: "Calculates the final decision.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      findings: { type: Type.STRING },
      policyOutcome: { type: Type.STRING },
      customerRequest: { type: Type.STRING }
    },
    required: ["findings", "policyOutcome", "customerRequest"],
  },
};

const getRecommendationsTool: FunctionDeclaration = {
  name: "getRecommendations",
  description: "Uses LangGraph + ChromaDB to find personalized products.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      userPreferences: { type: Type.STRING },
      category: { type: Type.STRING }
    },
    required: ["userPreferences"],
  },
};

export const tools: Tool[] = [{
  functionDeclarations: [
    performNlpAnalysisTool,
    getUserOrdersTool,
    getOrderTool,
    processReturnTool, 
    processExchangeTool, 
    runPythonVisionAnalysisTool,
    scanInvoiceTool, 
    checkPolicyTool,
    searchKnowledgeBaseTool, 
    determineResolutionTool, 
    getRecommendationsTool
  ]
}];

export const systemInstruction = `
You are the **AutoReturn Intelligent Orchestrator**, running on a **LangGraph** architecture with a **Python/FastAPI** backend and **YOLOv5** vision.

**CRITICAL PROTOCOL:**
1.  **NLP FIRST**: For ANY user message, your FIRST action MUST be to call \`performNlpAnalysis(text)\`. 
    *   Use the output (Sentiment, Intent) to guide your tone and next steps.

**WORKFLOWS:**

1.  **SMART ORDER LOOKUP:**
    *   If NLP Intent is 'return_item' or 'exchange_item' and no Order ID is known, call \`getUserOrders(userId)\`.
    *   **Logic**: Look at the list. If you find a matching item, use its ID automatically.

2.  **VISION AGENT (YOLOv5 Backend):**
    *   **Images/Videos**: You possess Multimodal capabilities to SEE. However, you MUST formalize your findings by calling the Python backend tool \`runPythonVisionAnalysis\`.
    *   **Protocol**:
        1.  Analyze the image/video visually yourself first.
        2.  Call \`runPythonVisionAnalysis\` to trigger the **YOLOv5** inference engine. Pass your visual findings as arguments (e.g., defectClass='scratched_lens', severityScore=0.95).
        3.  The backend will return bounding box data simulating a YOLO detection.
    *   **Constraint**: If a user claims "damage" or "defect", you **MUST** request media proof (Image for physical, Video for technical) if not provided.

3.  **STANDARD RETURN REASONS**:
    *   The user may provide one of the following standard reasons:
        *   Sizing or fit issues
        *   Damaged or defective item
        *   Did not meet expectations
        *   Changed mind or impulse purchase
        *   Incorrect order
        *   Delivery delays
        *   Unwanted gifts
        *   Misleading product information
    *   Use these categories when processing policies. For "Damaged/Defective", always ask for images.

**LANGGRAPH PIPELINE:**
*   **Input** -> **NLP Node (spaCy)** -> **Router**
*   **Router** -> (Defect) -> **Vision (YOLOv5)** -> **Policy** -> **Resolution**.
*   **Router** -> (Question) -> **Knowledge Base (ChromaDB)**.
*   **Router** -> (Recommendation) -> **RecSys**.

**TONE:**
Professional, efficient, empathetic.
`;

export class GeminiAgent {
  private ai: GoogleGenAI;
  private modelName: string = "gemini-2.5-flash";

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY is missing");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || "" });
  }

  async sendMessage(
    message: string,
    attachment: { base64: string, mimeType: string } | null,
    chatHistory: Content[],
    toolExecutor: (name: string, args: any) => Promise<any>
  ): Promise<string> {
    
    const parts: Part[] = [{ text: message }];
    if (attachment) {
        parts.push({
            inlineData: {
                data: attachment.base64,
                mimeType: attachment.mimeType
            }
        });
    }

    const userContent: Content = { role: "user", parts: parts };
    const currentHistory = [...chatHistory, userContent];

    try {
      let response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: currentHistory,
        config: {
          tools: tools,
          systemInstruction: systemInstruction,
        }
      });

      let responseContent = response.candidates?.[0]?.content;
      
      while (response.functionCalls && response.functionCalls.length > 0) {
        if (responseContent) {
           currentHistory.push(responseContent);
        }

        const functionResponses = [];

        for (const call of response.functionCalls) {
           console.log(`[LangGraph Node] Executing: ${call.name}`, call.args);
           
           try {
             const result = await toolExecutor(call.name, call.args);
             functionResponses.push({
               id: call.id,
               name: call.name,
               response: { result: result }
             });
           } catch (toolError) {
             console.error(`Tool Execution Error (${call.name}):`, toolError);
             functionResponses.push({
               id: call.id,
               name: call.name,
               response: { error: `Backend Tool Error: ${toolError}` }
             });
           }
        }

        currentHistory.push({
            role: "tool",
            parts: functionResponses.map(fr => ({ functionResponse: fr }))
        });

        response = await this.ai.models.generateContent({
            model: this.modelName,
            contents: currentHistory,
            config: {
              tools: tools,
              systemInstruction: systemInstruction,
            }
        });
        responseContent = response.candidates?.[0]?.content;
      }

      return response.text || "Workflow complete.";

    } catch (error: any) {
      console.error("Gemini Error:", error);
      if (error.message?.includes("API_KEY")) {
        return "Backend Error: Invalid or missing API Key. Please check configuration.";
      }
      return "Backend Error: Orchestrator unreachable. Service may be down or rate-limited.";
    }
  }
}