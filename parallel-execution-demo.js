import { FusionChain } from './fusion-chain.js';
import fs from 'fs/promises';

const generateModels = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Model ${i + 1}`,
    systemPrompt: `You are AI assistant ${i + 1}, an expert in analyzing societal impacts of technology.`
  }));
};

const models = generateModels(20);

const context = {
  task: "Analyze the impact of artificial intelligence on society"
};

const prompts = [
  "Provide a brief analysis of the {{task}} from your unique perspective.",
  "Based on your previous analysis '{{output[-1]}}', suggest one specific policy recommendation."
];

async function evaluator(outputs) {
  const scores = outputs.map(output => {
    const wordCount = output.split(/\s+/).length;
    const keywordScore = ['AI', 'society', 'impact', 'policy', 'recommendation', 'analysis']
      .filter(keyword => output.toLowerCase().includes(keyword)).length;
    const structureScore = output.includes('Based on') ? 0.5 : 0;
    return (wordCount >= 100 && wordCount <= 300 ? 1 : 0) + keywordScore * 0.2 + structureScore;
  });
  const topResponse = outputs[scores.indexOf(Math.max(...scores))];
  return [topResponse, scores];
}

async function writeResultsToFile(results) {
  let logContent = "Detailed Results:\n\n";
  
  results.allPromptResponses.forEach((responses, index) => {
    logContent += `Model ${index + 1}:\n`;
    responses.forEach((response, i) => {
      logContent += `Prompt ${i + 1} response:\n${response}\n\n`;
    });
    logContent += `Performance score: ${results.performanceScores[index]}\n\n`;
  });

  logContent += `Top Response:\n${results.topResponse}\n`;

  await fs.writeFile('results.log', logContent);
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
    4
  );
  console.timeEnd("Parallel Execution");

  console.log("\nResults:");
  console.log("Top response:", parallelResult.topResponse);
  console.log("Performance scores:", parallelResult.performanceScores);
  
  // Write detailed results to file
  await writeResultsToFile(parallelResult);
  console.log("\nDetailed results have been written to results.log");
}

runDemo().catch(console.error);