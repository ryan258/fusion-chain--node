// File: multi-agent-analysis-demo.js

import { FusionChain, MinimalChainable } from './fusion-chain.js';
import fetch from 'node-fetch';

// Define 5 different agents with specialized roles
const agents = [
  { name: 'Linguist', systemPrompt: 'You are an expert linguist. Analyze the text focusing on language use, style, and rhetorical devices.' },
  { name: 'Historian', systemPrompt: 'You are a historian. Analyze the text for historical context, references, and implications.' },
  { name: 'Psychologist', systemPrompt: 'You are a psychologist. Analyze the text for insights into human behavior, motivations, and emotions.' },
  { name: 'Economist', systemPrompt: 'You are an economist. Analyze the text for economic implications, market trends, and financial insights.' },
  { name: 'Futurist', systemPrompt: 'You are a futurist. Analyze the text for potential future trends, technological implications, and long-term societal impacts.' }
];

// Sample text to analyze
const textToAnalyze = `
As we stand on the brink of a new era, the rapid advancement of artificial intelligence 
promises to reshape our world in ways we can scarcely imagine. From healthcare to finance, 
from education to entertainment, AI is poised to revolutionize every aspect of human society. 
Yet, as we embrace this technological marvel, we must also grapple with its ethical implications 
and potential risks. The decisions we make today regarding AI development and regulation will 
echo through generations, shaping the very fabric of our future civilization.
`;

// Context for our prompts
const context = {
  text: textToAnalyze,
  maxWords: 100
};

// Prompts for our multi-step analysis
const prompts = [
  "Analyze the following text from your expert perspective in {{maxWords}} words or less: {{text}}",
  "Based on your initial analysis '{{output[-1]}}', provide a more focused insight or recommendation in {{maxWords}} words or less."
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

// Callable function for FusionChain
async function callable(agent, prompt) {
  let fullPrompt = prompt;
  if (prompt.includes("{{output[-1]}}")) {
    fullPrompt = prompt.replace("{{output[-1]}}", agent.previousAnalysis || "No previous analysis available.");
  }
  const result = await callOllama(agent.systemPrompt, fullPrompt);
  agent.previousAnalysis = result;
  return result;
}

// Evaluation function
async function evaluator(outputs) {
  // For this demo, we'll use a simple length-based scoring
  // In a real scenario, you might use more sophisticated metrics
  const scores = outputs.map(output => {
    const wordCount = output.split(/\s+/).length;
    return wordCount <= context.maxWords ? 1 / Math.abs(wordCount - context.maxWords) : 0;
  });
  const topResponse = outputs[scores.indexOf(Math.max(...scores))];
  return [topResponse, scores];
}

// Main function to run the demo
async function runDemo() {
  console.log("Running Multi-Agent Analysis demo...\n");
  console.log("Text to analyze:");
  console.log(textToAnalyze);
  console.log("\nGenerating analyses...\n");

  const result = await FusionChain.run(
    context,
    agents,
    callable,
    prompts,
    evaluator,
    agent => agent.name
  );

  console.log("Results:");
  console.log("Top response:", result.topResponse);
  console.log("Performance scores:", result.performanceScores);
  console.log("\nAll analyses:");
  result.allPromptResponses.forEach((responses, index) => {
    console.log(`\nAgent: ${result.modelNames[index]}`);
    console.log("Initial analysis:", responses[0]);
    console.log("Focused insight:", responses[responses.length - 1]);
  });
}

// Run the demo
runDemo().catch(console.error);