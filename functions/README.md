# Gcloud Functions

This folder contains gcloud functions for executing one off tasks on google cloud.

It currently contains functionality for running a test agent that connects to an Arium server.

These functions can be run locally.

## Running locally:

install all dependencies:

    yarn

Open a single agent:

    yarn cli open [url] [instanceId] [duration] [video] [x] [z]

All values above have defaults.

## Running on google cloud:

To open a single agent:

    yarn remotecli open [url] [instanceId] [duration] [video] [x] [z]

To open multiple agents:

    yarn remotecli open [url] [instanceId] [numberInstances] [duration]

Each agent will open in a random position with a random video.
    
## Deploying an updated function

    yarn deploy