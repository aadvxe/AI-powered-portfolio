
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_API_KEY is not set");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy to get client, actually model listing is on the class usually or client
    // Actually the SDK has a way to list models.
    // Let's use the raw fetch if the SDK doesn't expose it easily in this version, 
    // BUT the @google/generative-ai SDK does have listModels on the class or manager.
    // Wait, typical usage:
    // const genAI = new GoogleGenerativeAI(API_KEY);
    // There isn't a direct listModels on genAI instance in some versions?
    
    // Let's try raw REST call to be sure what the API sees
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
        console.log("Available Models:");
        data.models.forEach((m: any) => {
            if (m.name.includes("embed")) {
                console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods})`);
            }
        });
    } else {
        console.log("No models found or error:", data);
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
