// File: fusion-chain-demo.js

import { FusionChain, MinimalChainable } from './fusion-chain.js';
import fetch from 'node-fetch';

// Simulated models with different system prompts
const models = [
  { name: 'Concise', systemPrompt: 'You are a highly efficient AI that provides concise summaries.' },
  { name: 'Detailed', systemPrompt: 'You are an AI that provides detailed and comprehensive summaries.' },
  { name: 'Creative', systemPrompt: 'You are a creative AI that provides engaging and unique summaries.' }
];

// Sample text to summarize
const textToSummarize = `
The Internet of Things (IoT) is transforming the way we interact with our environment. 
It refers to the interconnected network of physical devices, vehicles, home appliances, 
and other items embedded with electronics, software, sensors, and network connectivity, 
which enables these objects to collect and exchange data. The IoT allows for seamless 
communication between people, processes, and things. Its applications range from smart 
homes and cities to industrial automation and healthcare. As the technology continues to 
evolve, it promises to bring about significant improvements in efficiency, accuracy, and 
economic benefits across various sectors.
`;

// Context for our prompts
const context = {
  text: textToSummarize,
  maxWords: 50
};

// Updated prompts for our summarization task
const prompts = [
  "Summarize the following text in {{maxWords}} words or less: {{text}}",
  "Given the previous summary: '{{output[-1]}}', improve it by making it more concise and clear while keeping it under {{maxWords}} words."
];

// Function to interact with the Ollama API
async function callOllama(systemPrompt, userPrompt) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.1:latest',
      prompt: userPrompt,
      system: systemPrompt,
    }),
  });

  const text = await response.text();
  let result = '';
  
  try {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    for (const line of lines) {
      const data = JSON.parse(line);
      if (data.response) {
        result += data.response;
      }
    }
  } catch (error) {
    console.error('Error parsing Ollama response:', error);
    console.error('Raw response:', text);
    throw error;
  }

  return result;
}

// Updated callable function for FusionChain
async function callable(model, prompt) {
  let fullPrompt = prompt;
  if (prompt.includes("{{output[-1]}}")) {
    // This is the second prompt, so we need to include the previous summary
    fullPrompt = prompt.replace("{{output[-1]}}", model.previousSummary || "No previous summary available.");
  }
  const result = await callOllama(model.systemPrompt, fullPrompt);
  model.previousSummary = result; // Store the result for the next round
  return result;
}

// Updated evaluation function
async function evaluator(outputs) {
  const scores = outputs.map(output => {
    const wordCount = output.split(/\s+/).length;
    return wordCount <= context.maxWords ? 1 / Math.abs(wordCount - context.maxWords) : 0;
  });
  const topResponse = outputs[scores.indexOf(Math.max(...scores))];
  return [topResponse, scores];
}

// Main function to run the demo
async function runDemo() {
  console.log("Running FusionChain demo for text summarization...\n");
  console.log("Original text:");
  console.log(textToSummarize);
  console.log("\nGenerating summaries...\n");

  const result = await FusionChain.run(
    context,
    models,
    callable,
    prompts,
    evaluator,
    model => model.name
  );

  console.log("Results:");
  console.log("Top response:", result.topResponse);
  console.log("Performance scores:", result.performanceScores);
  console.log("\nAll summaries:");
  result.allPromptResponses.forEach((responses, index) => {
    console.log(`\nModel: ${result.modelNames[index]}`);
    console.log("Initial summary:", responses[0]);
    console.log("Final summary:", responses[responses.length - 1]);
  });
}

// Run the demo
runDemo().catch(console.error);