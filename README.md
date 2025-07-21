# LamiaAI: A flexible AI co-writing app
LamiaAI is a simple AI co-writing app with privacy-first priority. Unlike many other AI-assisted writing tools, Lamia was designed to use base models instead of ones fine-tuned for instruct mode. People familiar with NovelAI or KoboldAI's story mode will be familiar with this method of interacting with LLMs. 

## Download

### Automatic
> Currently unavailable at this time.

### Manual
> **INFO:** This guide assumes you are running in a Unix environment. The commands may be slightly different on Windows.

Make sure you have git and npm installed. Then run the following commands:

`$ git clone https://github.com/annoawesome/lamia-ai`

`$ cd lamia-ai`

`$ npm install -D`

`$ npm run tsc`

Make sure to have a `.env` file ready, as LamiaAI will not run without them. Default ones are provided in [`defaults/env/`](./defaults/env/). They provide all the necessary variables necessary to run the application. To use them, run this command at the project root:

`$ cp defaults/env/example.env .env`

Next, we need to build the frontend. To do this, run the following:

`$ cd src/public`

`$ npm install -D`

`$ npx vite build --emptyOutDir`

Finally, we should return to the project root.

`$ cd ../..`

`$ npm run start`

## Building
LamiaAI is built off of Electron and uses Electron Forge for building the desktop application. Both Windows and Linux are available targets.

To build on both platforms, make sure you are using a suitable `.env.production` file. More details, such as required variables and settings can be found in [`defaults/env/example.prod.electron.env`](./defaults/env/example.prod.electron.env). The following command works on both OSes:

`$ npm run make`

Wait for a few minutes for the build to finish. The outputted files should be in `out/make`.

## Why Use Base Models?
We believe using base models over instruct provides several benefits.
1) Freedom. Many instruct models go through alignment after pre-training, which neuters their ability to write about sensitive topics. Base models are largely free of this reprogramming.
2) Creativity. Fine-tuning datasets introduces the model to "slop", degrading quality and introducing telltale AI cliches. Common examples include "shivers down your spine", "maybe, just maybe" and "ministrations".
3) Engagement. Writing *with* the AI, as opposed to the AI writing *for* you, is a deeply engaging process. You have far more direct control compared to regular prompting, though this comes at the slight cost of requiring some writing skill.

## Privacy
Lamia automatically encrypts all the stories you write. If you use the desktop app, all data will be kept local and nothing is sent back to us.

Running models locally is fully supported. Currently, LamiaAI only supports the KoboldCpp API, though other APIs aren't off the table.

## Brainless Mode
For those who wish to write without the assistance of AI, Lamia also provides a "brainless" mode. Many tools provided by LamiaAI work both for humans and the LLM, so you won't lose out by opting out.