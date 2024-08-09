// File: creative-writing-demo.js

import { FusionChain, MinimalChainable } from './fusion-chain.js';
import fetch from 'node-fetch';

// Define 4 different writing style models
const writingStyles = [
  { name: 'Descriptive', systemPrompt: 'You are a writer known for rich, vivid descriptions and poetic language.' },
  { name: 'Dialogue-focused', systemPrompt: 'You are a writer skilled in crafting realistic and engaging dialogues.' },
  { name: 'Action-oriented', systemPrompt: 'You are a writer who excels at creating thrilling and dynamic action sequences.' },
  { name: 'Character-driven', systemPrompt: 'You are a writer who focuses on deep character development and internal monologues.' }
];

// Context for our story
const storyContext = {
  genre: "Science Fiction",
  plotOutline: "A team of astronauts discovers an ancient alien artifact on a distant planet, which begins to influence their minds and reveal the universe's secrets.",
  characters: [
    { name: "Captain Zara Chen", description: "Experienced and pragmatic mission leader" },
    { name: "Dr. Elias Nkosi", description: "Brilliant but arrogant xenoarchaeologist" },
    { name: "Lt. Freya Odinsdottir", description: "Ex-military pilot with a mysterious past" }
  ]
};

// Prompts for our creative writing tasks
const prompts = [
  "Generate a dialogue between Captain Chen and Dr. Nkosi as they first encounter the alien artifact. Context: {{context}}",
  "Describe the alien planet's landscape and the atmosphere as the team approaches the artifact site. Context: {{context}}",
  "Write an action sequence where Lt. Odinsdottir must navigate a sudden storm to land the ship near the artifact. Context: {{context}}"
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
async function callable(style, prompt) {
  const fullPrompt = prompt.replace('{{context}}', JSON.stringify(storyContext));
  return await callOllama(style.systemPrompt, fullPrompt);
}

// Evaluation function
async function evaluator(outputs) {
  // In a real scenario, this would be a more sophisticated evaluation
  // For this demo, we'll use a simple length-based scoring combined with keyword presence
  const scores = outputs.map(output => {
    const wordCount = output.split(/\s+/).length;
    const keywordScore = ['artifact', 'alien', 'discover', 'influence', 'universe']
      .filter(keyword => output.toLowerCase().includes(keyword)).length;
    return (wordCount >= 100 && wordCount <= 300 ? 1 : 0) + keywordScore * 0.2;
  });
  const topResponse = outputs[scores.indexOf(Math.max(...scores))];
  return [topResponse, scores];
}

// Main function to run the demo
async function runDemo() {
  console.log("Running Creative Writing Collaboration demo...\n");
  console.log("Story Context:");
  console.log(JSON.stringify(storyContext, null, 2));
  console.log("\nGenerating story elements...\n");

  const result = await FusionChain.run(
    storyContext,
    writingStyles,
    callable,
    prompts,
    evaluator,
    style => style.name
  );

  console.log("Results:");
  console.log("Top response:", result.topResponse);
  console.log("Performance scores:", result.performanceScores);
  console.log("\nAll story elements:");
  result.allPromptResponses.forEach((responses, index) => {
    console.log(`\nWriting Style: ${result.modelNames[index]}`);
    responses.forEach((response, i) => {
      console.log(`\nTask ${i + 1}:`);
      console.log(response);
    });
  });
}

// Run the demo
runDemo().catch(console.error);