import { GoogleGenAI, GenerateContentConfig, EmbedContentConfig, GoogleGenAIOptions } from "@google/genai";

// Verified Vertex AI Models
export const CHAT_MODEL = "gemini-2.5-flash";
export const EMBEDDING_MODEL = "text-embedding-004";

let cachedClient: GoogleGenAI | null = null;

/**
 * Initializes and returns a Google Gen AI / GCP Vertex AI client instance.
 * Automatically handles GCP Vertex AI (Project ID, Location, Service Account Credentials, Vertex API Key)
 * or Google AI Studio fallback.
 */
export function getGCPClient(): GoogleGenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const rawProjectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const projectId = rawProjectId && rawProjectId !== "your-gcp-project-id" && rawProjectId.trim() !== "" ? rawProjectId : undefined;
  const location = process.env.GCP_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const apiKey = process.env.GCP_API_KEY || process.env.VERTEX_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const serviceAccountKey = process.env.GCP_SERVICE_ACCOUNT_KEY;

  if (projectId || process.env.GOOGLE_GENAI_USE_ENTERPRISE === "true" || process.env.GOOGLE_GENAI_USE_VERTEXAI === "true") {
    // GCP Vertex AI / Gemini Enterprise Agent Platform mode
    const options: GoogleGenAIOptions = {
      vertexai: true,
      project: projectId,
      location: location,
    };

    if (apiKey) {
      options.apiKey = apiKey;
    }

    if (serviceAccountKey) {
      try {
        const credentials = JSON.parse(serviceAccountKey);
        options.googleAuthOptions = { credentials };
      } catch (err) {
        console.warn("[GCP Client] Failed to parse GCP_SERVICE_ACCOUNT_KEY JSON string:", err);
      }
    }

    cachedClient = new GoogleGenAI(options);
    return cachedClient;
  }

  // Developer API Mode (Google AI Studio fallback)
  cachedClient = new GoogleGenAI({
    apiKey: apiKey || "",
  });

  return cachedClient;
}

/**
 * Generates an embedding vector for a given text input using GCP Vertex AI / Gemini Embeddings (Hardcoded: gemini-embedding-002).
 * Supports taskType specification (e.g. 'RETRIEVAL_DOCUMENT' vs 'RETRIEVAL_QUERY').
 */
export async function getEmbeddingVector(
  text: string,
  options?: {
    model?: string;
    taskType?: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" | "SEMANTIC_SIMILARITY" | "CLASSIFICATION" | "CLUSTERING" | string;
    title?: string;
    outputDimensionality?: number;
  }
): Promise<number[]> {
  const client = getGCPClient();
  const model = options?.model || EMBEDDING_MODEL;

  const config: EmbedContentConfig = {};

  if (options?.taskType) {
    config.taskType = options.taskType;
  }
  if (options?.title) {
    config.title = options.title;
  }
  if (options?.outputDimensionality) {
    config.outputDimensionality = options.outputDimensionality;
  }

  const response = await client.models.embedContent({
    model,
    contents: text,
    config: Object.keys(config).length > 0 ? config : undefined,
  });

  const vector = response.embeddings?.[0]?.values;

  if (!vector || !Array.isArray(vector)) {
    throw new Error(`Failed to generate embedding vector from model '${model}'.`);
  }

  return vector;
}

/**
 * Generates streaming chat completions using GCP Vertex AI / Gemini chat models (Hardcoded: gemini-3.1-flash-lite).
 */
export async function streamChatCompletion(params: {
  messages: Array<{ role: "user" | "assistant" | "model" | "system"; content: string }>;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
}) {
  const client = getGCPClient();
  const model = params.model || CHAT_MODEL;

  // Filter and format messages for Gemini format (roles: "user" | "model")
  const contents = params.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

  const config: GenerateContentConfig = {
    temperature: params.temperature ?? 0.2,
  };

  if (params.systemInstruction) {
    config.systemInstruction = params.systemInstruction;
  }

  return await client.models.generateContentStream({
    model,
    contents,
    config,
  });
}
