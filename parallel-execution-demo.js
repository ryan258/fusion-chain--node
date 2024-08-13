// File: parallel-execution-demo.js

import { FusionChain } from './fusion-chain.js';
import fetch from 'node-fetch';

// Generate a large number of models
const generateModels = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Model ${i + 1}`,
    systemPrompt: `You are an AI assistant with a unique perspective. Your ID is ${i + 1}.`
  }));
};

const models = generateModels(20); // Generate 20 models

const context = {
  task: "Analyze the impact of artificial intelligence on society",
};

const prompts = [
  "Provide a brief analysis of the {{task}} from your unique perspective.",
  "Based on your previous analysis, suggest one policy recommendation.",
];

async function evaluator(outputs) {
  // Simple evaluation based on length and keyword presence
  const scores = outputs.map(output => {
    const wordCount = output.split(/\s+/).length;
    const keywordScore = ['AI', 'society', 'impact', 'future', 'technology']
      .filter(keyword => output.toLowerCase().includes(keyword)).length;
    return (wordCount >= 50 && wordCount <= 200 ? 1 : 0) + keywordScore * 0.2;
  });
  const topResponse = outputs[scores.indexOf(Math.max(...scores))];
  return [topResponse, scores];
}

async function runDemo() {
  console.log("Running Parallel Execution demo...\n");
  console.log(`Number of models: ${models.length}`);
  console.log("Context:", context);
  console.log("\nGenerating responses...\n");

  console.time("Parallel Execution");
  const parallelResult = await FusionChain.runParallel(
    context,
    models,
    prompts,
    evaluator,
    model => model.name,
    4 // number of worker threads
  );
  console.timeEnd("Parallel Execution");

  console.log("\nResults:");
  console.log("Top response:", parallelResult.topResponse);
  console.log("Performance scores:", parallelResult.performanceScores);
}

runDemo().catch(console.error);