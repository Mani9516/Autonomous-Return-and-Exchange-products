

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
  description: "Resolution Agent: Executes a return transaction in the database (FastAPI Backend). ONLY call this after the user has confirmed specific details about the issue.",
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
  description: "Resolution Agent: Executes an exchange in the database.",
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
  description: "Vision Agent: Triggers the Python Computer Vision backend using YOLOv5. REQUIRED for all image/video uploads.",
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
  description: "Vision Agent: Uses Python OCR to extract Order IDs from invoice images.",
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
  description: "Policy Agent: Consults the Policy Engine (ChromaDB) for rules.",
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
  description: "Policy Agent: Semantic search (ChromaDB) for complex questions.",
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
  description: "Resolution Agent: Calculates the final decision based on Policy outcomes.",
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
You are the **AutoReturn Intelligent System**, a multi-agent orchestrator running on a Python/FastAPI backend.
You coordinate 4 specialized agents defined in \`backend/agents.py\`:

**1. VISION AGENT (YOLOv5)**
   - **Role**: Analyze visual evidence (images/videos).
   - **Tool**: \`runPythonVisionAnalysis\`
   - **Trigger**: Whenever the user uploads media or claims "damage", "defect", or "broken".
   - **Protocol**: You MUST call the tool to get the YOLOv5 detection results. 
   - **CRITICAL**: After receiving the vision result, **DO NOT** process the return immediately. You MUST first acknowledge the finding (e.g., "I see the screen is cracked") and ask clarifying questions (e.g., "Was the shipping box also damaged?").

**2. POLICY AGENT (ChromaDB)**
   - **Role**: Consult the rules engine and knowledge base.
   - **Tools**: \`checkReturnPolicy\`, \`searchKnowledgeBase\`
   - **Trigger**: After the Vision Agent provides findings and you have discussed it with the user.
   - **Protocol**: Verify if the defect/reason is eligible for return under the current time window.

**3. RESOLUTION AGENT (Logic)**
   - **Role**: Make the final decision and execute transactions.
   - **Tools**: \`determineResolution\`, \`processReturn\`, \`processExchange\`
   - **Trigger**: Once Policy Agent confirms eligibility AND the user has answered your diagnostic questions.
   - **Protocol**: If eligible, execute the return/exchange. If not, explain why using the Policy data.

**4. COMMUNICATION AGENT (LLM)**
   - **Role**: Interact with the user.
   - **Behavior**: You ARE this agent. Use the outputs from the other 3 agents to formulate professional, empathetic responses.

**STANDARD RETURN REASONS:**
   - Sizing or fit issues
   - Damaged or defective item
   - Did not meet expectations
   - Changed mind or impulse purchase
   - Incorrect order
   - Delivery delays
   - Unwanted gifts
   - Misleading product information

**CRITICAL CONVERSATION PROTOCOL:**
   - **Step 1: NLP Analysis**: Always start with \`performNlpAnalysis\`.
   - **Step 2: DIAGNOSTIC PHASE (MANDATORY)**: 
     - **DO NOT** process a return or offer a refund immediately when the user initiates a request.
     - **YOU MUST ASK** at least one clarifying diagnostic question.
     - **Examples**:
       - "I see you have sizing issues. Was it too loose, too tight, or was the cut uncomfortable?"
       - "I'm sorry to hear about the damage. Could you describe exactly what is broken? Is it cosmetic or a functional failure?"
       - "For the 'Not as expected' return, what specifically was different from the description?"
   - **Step 3: Evidence**: If the user claims damage, you **MUST** ask for a photo before proceeding.
   - **Step 4: Vision Verification**: After \`runPythonVisionAnalysis\`, confirm the detected defect with the user (e.g., "The analysis detected a cracked screen. Is this correct?").
   - **Step 5: Resolution**: Only call \`processReturn\` after you have gathered this specific feedback and the user confirms they want to proceed.

**General Rules:**
   - Do not ask for Order ID if you can find it using \`getUserOrders\`.
   - Be concise and professional.
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
             // Handle potential missing args or nulls gracefully
             const args = call.args || {};
             const result = await toolExecutor(call.name, args);
             
             functionResponses.push({
               id: call.id,
               name: call.name,
               response: { result: result }
             });
           } catch (toolError) {
             console.error(`Tool Execution Error (${call.name}):`, toolError);
             const errStr = toolError instanceof Error ? toolError.message : String(toolError);
             functionResponses.push({
               id: call.id,
               name: call.name,
               response: { error: `Backend Tool Error: ${errStr}` }
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
      const errStr = String(error?.message || error);
      if (errStr.includes("API_KEY")) {
        return "Backend Error: Invalid or missing API Key. Please check configuration.";
      }
      return "Backend Error: Orchestrator unreachable. Service may be down or rate-limited.";
    }
  }
}