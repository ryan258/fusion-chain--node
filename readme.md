# FusionChain

FusionChain is a Node.js library for running and evaluating multiple AI models or agents on a series of prompts. It allows for easy comparison and fusion of different model outputs, making it ideal for ensemble learning, multi-agent systems, and model evaluation in various natural language processing tasks.

## Features

- Run multiple AI models or agents on a series of prompts
- Handle context and back-references in prompts
- Evaluate model performances and select top responses
- Support for both synchronous and parallel execution (parallel execution coming soon)
- Easy-to-use API for integrating with various AI models and evaluation metrics
- Demonstration with Ollama for local AI model interaction
- Flexible architecture supporting various use cases from summarization to multi-agent analysis and creative writing

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

The project includes three demos that showcase how to use FusionChain with Ollama:

1. Text Summarization Demo
2. Multi-Agent Analysis Demo
3. Creative Writing Collaboration Demo

### Running the Demos

1. Start your local Ollama server.

2. Run the text summarization demo:
   ```
   npm start
   ```

3. Run the multi-agent analysis demo:
   ```
   npm run multi-agent
   ```

4. Run the creative writing collaboration demo:
   ```
   npm run creative-writing
   ```

### Text Summarization Demo

This demo in `fusion-chain-demo.js` does the following:

1. Defines three "models" with different summarization styles (Concise, Detailed, Creative).
2. Sets up a two-step summarization process:
   - Initial summary generation
   - Summary refinement
3. Uses FusionChain to run these models and evaluate their outputs.
4. Selects the best summary based on adherence to word limit and quality.

### Multi-Agent Analysis Demo

This demo in `multi-agent-analysis-demo.js` showcases:

1. Five specialized AI agents (Linguist, Historian, Psychologist, Economist, Futurist) analyzing a text from different perspectives.
2. A two-step analysis process for each agent:
   - Initial analysis of the text
   - Focused insight or recommendation based on the initial analysis
3. Utilization of FusionChain to manage multiple agents and evaluate their outputs.

### Creative Writing Collaboration Demo

This demo in `creative-writing-demo.js` illustrates:

1. Four different writing styles (Descriptive, Dialogue-focused, Action-oriented, Character-driven) applied to the same story context.
2. A series of three creative writing tasks: generating dialogue, describing settings, and writing action sequences.
3. Use of a shared story context across all prompts and models.
4. A simple evaluation function that considers both length and the presence of relevant keywords.
5. How FusionChain can be applied to creative tasks, allowing for the collaboration of different writing styles and the generation of varied story elements.

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

You can customize the demos by modifying:

- The text to be summarized or analyzed
- The story context and prompts for creative writing
- The system prompts for each "model" or agent
- The evaluation criteria in the `evaluator` function
- The prompts used for each task

## Extending FusionChain

FusionChain can be extended to work with various AI models and APIs. The `callable` function in the demos shows how to integrate with Ollama, but this can be adapted to work with other AI services or local models.

## Contributing

Contributions to FusionChain are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This project uses Ollama for local AI model interactions.
- Inspired by the concept of fusion algorithms, multi-agent systems, and collaborative creativity in AI.