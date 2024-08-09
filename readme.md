# FusionChain

FusionChain is a Node.js library for running and evaluating multiple AI models on a series of prompts. It allows for easy comparison and fusion of different model outputs, making it ideal for ensemble learning and model evaluation in natural language processing tasks.

## Features

- Run multiple AI models on a series of prompts
- Handle context and back-references in prompts
- Evaluate model performances and select top responses
- Support for both synchronous and parallel execution (parallel execution coming soon)
- Easy-to-use API for integrating with various AI models and evaluation metrics
- Demonstration with Ollama for local AI model interaction

## Prerequisites

- Node.js (version 14 or later)
- Ollama installed on your local machine
- The 'llama3.1:latest' model available in your Ollama installation

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/fusion-chain.git
   cd fusion-chain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Ensure you have the 'llama3.1:latest' model in Ollama:
   ```
   ollama pull llama3.1:latest
   ```

## Usage

The project includes a demo that showcases how to use FusionChain with Ollama for text summarization. Here's how to run it:

1. Start your local Ollama server.

2. Run the demo script:
   ```
   npm start
   ```

This will run a text summarization task using three different system prompts with the 'llama3.1:latest' model, simulating different "models" for the task.

### Demo Overview

The demo in `fusion-chain-demo.js` does the following:

1. Defines three "models" with different summarization styles (Concise, Detailed, Creative).
2. Sets up a two-step summarization process:
   - Initial summary generation
   - Summary refinement
3. Uses FusionChain to run these models and evaluate their outputs.
4. Selects the best summary based on adherence to word limit and quality.

## API Reference

### FusionChain

#### `FusionChain.run(context, models, callable, prompts, evaluator, getModelName)`

Runs the FusionChain process.

- `context`: An object containing context variables for the prompts.
- `models`: An array of model objects to be used.
- `callable`: A function that takes a model and a prompt, and returns the model's output.
- `prompts`: An array of prompt strings.
- `evaluator`: A function that takes an array of outputs and returns [topResponse, scores].
- `getModelName`: A function that takes a model object and returns its name.

Returns a `FusionChainResult` object.

### MinimalChainable

#### `MinimalChainable.run(context, model, callable, prompts)`

Runs a series of prompts for a single model.

- `context`: An object containing context variables for the prompts.
- `model`: The model object to be used.
- `callable`: A function that takes a model and a prompt, and returns the model's output.
- `prompts`: An array of prompt strings.

Returns an array `[outputs, contextFilledPrompts]`.

## Customization

You can customize the demo by modifying:

- The text to be summarized
- The system prompts for each "model"
- The evaluation criteria in the `evaluator` function
- The prompts used for summarization

## Contributing

Contributions to FusionChain are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.