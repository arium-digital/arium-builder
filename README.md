# Arium Metaverse Builder 

This repository contains an open-source, collaborative, real-time metaverse world builder with basic multiplayer functionality.

It contains much of the code used to run the [Arium](https://twitter.com/ariumspaces) platform, including:

* Browser-based, collaborative, and real-time metaverse world builder.
* Ability to invite collaborators to edit a space with you.
* Ability for multiple spaces to exists, and for each user to be owner of multiple spaces.
* Ability to connect spaces together with portals.
* Ability to enter the space with a cube , and upload a photo as a custom avatar.
* Ability to see others in the space in real-time.
* Ability to live edit a space when other are in it.

It **does not** contain the following features from the Arium platform:
* Peer to peer webcam and mic spatial communication.
* Broadcasting
* Screensharing

## Example Experiences Built Using the Arium Platform

## Underlying Frameworks

Most of the application is built in typescript and react.  It is serverless, relying on a few Firebase Cloud Functions to perform any backend needs, and uses Firebase Firestore and RealtimeDB for data storage and syncing state across user sessions.

* [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
* [React Three Drei](https://github.com/pmndrs/drei)
* [react](https://reactjs.org/)
* [next](https://nextjs.org/)
* [rxjs](https://rxjs.dev/)
* [typescript]

## Setup

## Setting up Firebase

ToDO: fill out

#### Generate a service account key

1. Go to firebase admin -> settings -> Service Accounts.
2. Click 'Generate new Private Key'
3. Download the file to the root of this source code, and name it `serviceAccount.json`
4. Run `./setCredentials.sh`

#### Setup environment variables

1. Copy `.env.example` to `.env`
2. In `.env` Replace the value next to `MEDIASOUP_ANNOUNCED_IP` with your local network ip adddress.

#### Build the cloud functions

    cd functions && yarn build

#### Copy firebase data down to your computer

    yarn db:copy-export-data

#### Start up the firebase emulator

    yarn start:emulator

### Running just the front-end

If you don't need any back-end functionality, you can easily start just the front end development server:

[Follow the instructions to install yarn](https://classic.yarnpkg.com/en/docs/install/)

In the root of the directory, install all dependencies:

    yarn

or if using npm:

    npm install

Start the node.js server, and start the javascript development server:

    yarn start

Or if using npm:

    npm start

Open the page at `https://localhost:3000`



## Deploying

### Prerequisites

Follow the direction to [install and initialize the gcloud compute sdk](https://cloud.google.com/sdk/docs/quickstart)

Ensure [you have docker installed.](https://docs.docker.com/get-docker/)

### Deployment scripts

All deployment scripts should be called with the environment at the end.

Build the staging docker container, and push it to the Google Container Registry:

    ./ops/build.sh staging

Create a managed instance group that users a container, where the environment is `staging` and instance group name is `shared`:

    ./ops/create_mig.sh staging shared

Deploy a container to a managed instance group, where the environment is `staging` and instance group name is `shared`:

    ./ops/deploy_mig.sh staging shared

For `production` instance group deployment - substitute `staging` above with `production`

## Building the bundled sdk

Make sure to clone the repository with:

    git clone git@github.com:arium-digital/arium.git --recursive

If you already have the repository cloned, then:

    git submodule update --init --recursive

Build the sdk into a minified bundle:

    yarn build-package

### To deploy

cd into `sdk`

Bump the `version` in package.json

Run:

    npm publish

Cd into exampleSite, and update the version to be the version that was published.

To push changes to github, save all files, and commit them, both in the submodule and root module.

Then, in root module:

    git push --recurse-submodules=on-demand
