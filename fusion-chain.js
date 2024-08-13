import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FusionChainResult {
  constructor(topResponse, allPromptResponses, allContextFilledPrompts, performanceScores, modelNames) {
    this.topResponse = topResponse;
    this.allPromptResponses = allPromptResponses;
    this.allContextFilledPrompts = allContextFilledPrompts;
    this.performanceScores = performanceScores;
    this.modelNames = modelNames;
  }
}

class FusionChain {
  static async runParallel(context, models, prompts, evaluator, getModelName, numWorkers = 4) {
    const batchSize = Math.ceil(models.length / numWorkers);
    const workerPromises = [];

    for (let i = 0; i < models.length; i += batchSize) {
      const batchModels = models.slice(i, i + batchSize);
      workerPromises.push(
        new Promise((resolve, reject) => {
          const worker = new Worker('./worker.js', {
            workerData: { 
              context, 
              models: batchModels, 
              prompts
            }
          });
          worker.on('message', resolve);
          worker.on('error', reject);
          worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
          });
        })
      );
    }

    const results = await Promise.all(workerPromises);
    const allOutputs = results.flatMap(r => r.outputs);
    const allContextFilledPrompts = results.flatMap(r => r.contextFilledPrompts);

    const lastOutputs = allOutputs.map(outputs => outputs[outputs.length - 1]);
    const [topResponse, performanceScores] = await evaluator(lastOutputs);

    const modelNames = models.map(getModelName);

    return new FusionChainResult(
      topResponse,
      allOutputs,
      allContextFilledPrompts,
      performanceScores,
      modelNames
    );
  }
}

export { FusionChainResult, FusionChain };