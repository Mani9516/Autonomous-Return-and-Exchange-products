import { GoogleGenAI } from "@google/genai";
import { AgentLog, ChatMessage } from "../types";
import { COMPANY_POLICY_TEXT } from "../constants";

// Helper to handle API key
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};

// --- SUPPORT CHAT AGENT ---
export const runSupportChat = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = 'gemini-2.5-flash';

    const systemInstruction = `
      You are the AutoResolve Customer Support AI, a highly advanced and conversational assistant.
      
      Your Goal: Provide detailed, comprehensive, and friendly assistance. Do not give short, one-line answers. 
      Engage the user in a meaningful conversation. If they ask about a product, describe its features in depth. 
      If they ask about returns, explain the policy thoroughly using the context below.
      
      Company Policy Context:
      ${COMPANY_POLICY_TEXT}
      
      Tone: Professional, empathetic, and very thorough.
    `;

    // Using generateContent with formatted history for statelessness
    const conversation = history.map(h => `${h.role === 'user' ? 'User' : 'Model'}: ${h.text}`).join('\n');
    const fullPrompt = `${systemInstruction}\n\nConversation History:\n${conversation}\nUser: ${newMessage}\nModel:`;

    const response = await ai.models.generateContent({
        model: model,
        contents: fullPrompt
    });

    return response.text || "I apologize, but I'm having trouble formulating a detailed response right now. Could you please rephrase your question?";

  } catch (error) {
    console.error("Chat Error", error);
    return "I am currently experiencing higher than normal traffic, which is affecting my ability to process complex queries. Please try again in a moment.";
  }
};

// --- AGENT 1: VISION AGENT (Simulating YOLOv5 / GPT-4o Vision) ---
export const runVisionAgent = async (
  imageBase64: string, 
  userDescription: string,
  logCallback: (log: AgentLog) => void
): Promise<string> => {
  try {
    logCallback({
      id: Date.now().toString(),
      agentName: 'Vision Agent',
      status: 'processing',
      message: 'Initiating deep visual analysis. Scanning image for object identification and defect verification...',
      timestamp: Date.now()
    });

    const ai = getAIClient();
    const model = 'gemini-2.5-flash'; 
    
    const prompt = `
      You are an expert Quality Assurance Vision Agent. 
      Analyze this image of a product return.
      User Product/Defect Description: "${userDescription}"
      
      Task:
      1. Identify the primary object in the image.
      2. CRITICAL VERIFICATION: Does the object in the image match the User's Product Description?
         - If the user says "Laptop" but the image is of a "Shoe" or "Box", set "is_item_match" to false.
         - If the image is unclear or completely unrelated, set "is_item_match" to false.
      3. Detect any visible damage (cracks, scratches, water damage, denting).
      4. Classify the likely cause.
      
      Output strict JSON:
      {
        "detected_object": "string",
        "is_item_match": boolean,
        "damage_description": "string (provide a long, detailed observation of the physical state)",
        "likely_cause": "string",
        "severity_score_0_to_10": number
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: "application/json" }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText);
    
    // Log based on match result
    if (resultJson.is_item_match === false) {
       logCallback({
        id: Date.now().toString(),
        agentName: 'Vision Agent',
        status: 'failure',
        message: `MISMATCH DETECTED: Analyzed object '${resultJson.detected_object}' does not match user description. Marking for denial.`,
        details: JSON.stringify(resultJson, null, 2),
        timestamp: Date.now()
      });
    } else {
      logCallback({
        id: Date.now().toString(),
        agentName: 'Vision Agent',
        status: 'success',
        message: `Identity Verified: Object matches description. Analysis: ${resultJson.damage_description}`,
        details: JSON.stringify(resultJson, null, 2),
        timestamp: Date.now()
      });
    }

    return resultText;

  } catch (error) {
    console.error(error);
    logCallback({
      id: Date.now().toString(),
      agentName: 'Vision Agent',
      status: 'failure',
      message: 'Visual analysis pipeline encountered an error processing the image data.',
      timestamp: Date.now()
    });
    throw error;
  }
};

// --- AGENT 2: POLICY AGENT (Simulating ChromaDB/Vector Search + RAG) ---
export const runPolicyAgent = async (
  visionAnalysisJson: string,
  returnReason: string,
  logCallback: (log: AgentLog) => void
): Promise<string> => {
  try {
    logCallback({
      id: Date.now().toString(),
      agentName: 'Policy Agent',
      status: 'processing',
      message: 'Cross-referencing vision telemetry with corporate return policy vector database...',
      timestamp: Date.now()
    });

    const ai = getAIClient();
    
    const prompt = `
      You are the Policy Enforcement Agent.
      
      Context (Retrieved from Policy Database):
      ${COMPANY_POLICY_TEXT}
      
      Input Data:
      - Vision Analysis: ${visionAnalysisJson}
      - User Stated Reason: "${returnReason}"
      
      Task:
      Compare the damage analysis against the policy rules.
      
      CRITICAL RULE:
      - If 'is_item_match' in Vision Analysis is FALSE, the decision must be "DENIED" immediately. Reason: "The item in the photo does not match the product description."
      
      For other cases:
      - Compare damage type to policy.
      - Determine if APPROVED, DENIED, or FLAGGED.
      
      Output strict JSON:
      {
        "decision": "APPROVED" | "DENIED" | "FLAGGED",
        "policy_citation": "string (quote the specific rule applied or explain the mismatch)",
        "confidence_score": number,
        "reasoning": "string (long, detailed explanation of why this decision was made)"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText);

    logCallback({
      id: Date.now().toString(),
      agentName: 'Policy Agent',
      status: resultJson.decision === 'APPROVED' ? 'success' : 'failure', // Visual distinction for denial
      message: `Policy Decision: ${resultJson.decision}. ${resultJson.reasoning}`,
      details: resultText,
      timestamp: Date.now()
    });

    return resultText;

  } catch (error) {
    logCallback({
      id: Date.now().toString(),
      agentName: 'Policy Agent',
      status: 'failure',
      message: 'Failed to retrieve or apply policy rules.',
      timestamp: Date.now()
    });
    throw error;
  }
};

// --- AGENT 3: RESOLUTION & COMMUNICATION AGENT (Simulating LangGraph Router) ---
export const runResolutionAgent = async (
  policyResultJson: string,
  productName: string,
  logCallback: (log: AgentLog) => void
): Promise<string> => {
  try {
    logCallback({
      id: Date.now().toString(),
      agentName: 'Resolution Agent',
      status: 'processing',
      message: 'Compiling final resolution case file and generating customer communication...',
      timestamp: Date.now()
    });

    const ai = getAIClient();
    
    const prompt = `
      You are the Resolution Communication Agent.
      
      Decision Input: ${policyResultJson}
      Product: ${productName}
      
      Task:
      Draft a very detailed, polite, and professional email to the customer explaining the decision.
      
      If APPROVED: 
         - Confirm the full refund amount.
         - Provide simulated next steps for shipping.
         - Be extremely gracious.
         
      If DENIED: 
         - Explain exactly why based on the input reasoning.
         - If the denial is due to "Item Mismatch" (wrong photo), be firm but polite, asking them to restart the process with the correct item.
         - If denied due to damage type, explain the policy clearly.
      
      Output plain text (the email body).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    logCallback({
      id: Date.now().toString(),
      agentName: 'Resolution Agent',
      status: 'success',
      message: 'Communication drafted and dispatched.',
      details: response.text,
      timestamp: Date.now()
    });

    return response.text || "Error generating email.";

  } catch (error) {
    console.error(error);
    throw error;
  }
};
