import { parentPort, workerData } from 'worker_threads';
import fetch from 'node-fetch';

const { context, models, prompts } = workerData;

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

async function processModel(model, prompts) {
  const outputs = [];
  const contextFilledPrompts = [];

  for (const prompt of prompts) {
    let filledPrompt = prompt;
    for (const [key, value] of Object.entries(context)) {
      filledPrompt = filledPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    contextFilledPrompts.push(filledPrompt);

    const result = await callOllama(model.systemPrompt, filledPrompt);
    outputs.push(result);
  }

  return [outputs, contextFilledPrompts];
}

async function processModels() {
  const allOutputs = [];
  const allContextFilledPrompts = [];

  for (const model of models) {
    const [outputs, contextFilledPrompts] = await processModel(model, prompts);
    allOutputs.push(outputs);
    allContextFilledPrompts.push(contextFilledPrompts);
  }

  parentPort.postMessage({ outputs: allOutputs, contextFilledPrompts: allContextFilledPrompts });
}

processModels().catch(error => {
  console.error('Error in worker:', error);
  parentPort.postMessage({ error: error.message });
});