import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import { config } from "dotenv";

// Load .env.local from project root
config({ path: path.resolve(import.meta.dirname, "../.env.local") });

const GEMINI_MODEL = "gemini-3.1-flash-image-preview";

async function generateHeroImage(lessonHtmlPath) {
  // Read the HTML file and extract the generation prompt from KNOWLEDGE_LESSON_META
  const html = fs.readFileSync(lessonHtmlPath, "utf-8");

  const metaMatch = html.match(
    /<!--KNOWLEDGE_LESSON_META\s*([\s\S]*?)\s*KNOWLEDGE_LESSON_META-->/
  );
  if (!metaMatch) {
    throw new Error("KNOWLEDGE_LESSON_META block not found in " + lessonHtmlPath);
  }

  const meta = JSON.parse(metaMatch[1]);
  const prompt = meta.hero_image?.generation_prompt;
  if (!prompt) {
    throw new Error("No hero_image.generation_prompt in metadata");
  }

  // Append portrait aspect ratio instruction for the hero layout
  const fullPrompt = prompt + " Aspect ratio: 3:4 (portrait orientation).";

  console.log(`Lesson ${meta.lesson_number}: "${meta.title}"`);
  console.log(`Prompt: ${fullPrompt}\n`);

  // Generate image via Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  console.log(`Generating image with ${GEMINI_MODEL}...`);
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: fullPrompt,
    config: {
      responseModalities: ["IMAGE"],
    },
  });

  // Find the image part in the response
  const parts = response.candidates[0].content.parts;
  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart) {
    const textParts = parts.filter((p) => p.text).map((p) => p.text);
    throw new Error(
      "No image returned by Gemini. Text response: " + textParts.join("\n")
    );
  }

  // Save image next to the HTML file, never overwriting existing files
  const dir = path.dirname(lessonHtmlPath);
  const stem = path.basename(lessonHtmlPath, ".html");
  const ext = imagePart.inlineData.mimeType === "image/webp" ? "webp" : "png";
  let outFile = path.join(dir, `${stem}_hero.${ext}`);
  let counter = 1;
  while (fs.existsSync(outFile)) {
    outFile = path.join(dir, `${stem}_hero_${counter}.${ext}`);
    counter++;
  }

  const buffer = Buffer.from(imagePart.inlineData.data, "base64");
  fs.writeFileSync(outFile, buffer);

  console.log(`Saved: ${outFile} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return outFile;
}

// CLI: pass the lesson HTML path as argument
const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/generate-hero-image.mjs <lesson.html>");
  process.exit(1);
}

generateHeroImage(path.resolve(target));
