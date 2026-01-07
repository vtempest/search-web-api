import { predictNextWordsWithSmallLocalModel } from "../lib/suggest-next-words/autocomplete-ai.js";

const samplePrompts = [
  "what can help build ai is that",
  "well-suited for sequence generation and can be",
  "the flagship model is estimated to have",
];

for (const prompt of samplePrompts) {
  const result = await predictNextWordsWithSmallLocalModel(prompt);
  console.log(prompt, "->", result);
}
