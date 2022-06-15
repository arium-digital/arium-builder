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

## Setup

### Setting up Firebase

Running this project **requires a *Firebase* account,** and using Firebase Cloud Functions which is core to much of the functinoality requires a **Blaze (paid)** account.

* **Create a new Firebase project [here](https://firebase.google.com/)**
* [Upgrade to the *Blaze* plan](https://docs.firerun.io/getting-started/upgrading-from-the-firebase-spark-plan-to-the-blaze-plan-tled)
* [Install the firebase cli](https://firebase.google.com/docs/cli#install-cli-mac-linux)
* Set firebase cli to use your project: `firebase use {firebase project name}`
* In the firebase admin panel, create a Firestore Database, and a Realtime Database
* Update the file `.firebaserc` to change the project name from `arium-builder-example` to your project name.
* Deploy the cloud functions, firestore database rules, realtime database rules, and storage rules: `firebase deploy`
* Setup CORS on your firebase   storage bucket, there is an example cors.json config in admin.  To use it: `gsutil cors set firebase/cors.json {your bucket url}`
* Open src/config.ts and replace the `firebaseConfig` structure with firebase config from your project.

### Generate a service account key and loading it for node admin purposes.

* Go to firebase admin -> settings -> Service Accounts.
* Click 'Generate new Private Key'
* Download the file to the root of this source code folder, and name it `serviceAccount.json`

### Loading Starter Data (space templates and standard assets)

Get your cloud storage bucket url (this)

#### Copy Assets to your Local Bucket:

This will copy both space templates and standard assets to your firestore storage bucket

```sh
gsutil -m -cp -r gs://arium-open-source.appspot.com/export {yourBucketBaseUrl}
```

So for example if your bucket url is: `gs://my-metaverse-app.appspot.com` the command would be:

```sh
gsutil -m -cp -r gs://arium-open-source.appspot.com/export gs://my-metaverse-app.appspot.com
```

#### Load the default space templates to your firestore database:

```sh
gcloud firestore import {yourBucketBaseUrl}/db
```

So for example if your bucket url is: `gs://my-metaverse-app.appspot.com` the command would be:

```sh
gcloud firestore import gs://my-metaverse-app.appspot.com/db
```

### Setup ImageKit for Image Resizing

* [ImageKit](https://imagekit.io/) is used for resizing images; Create a free account, then Add an External storage, and connect it to the google cloud storage bucket in your Firebase project.  For service account key and email, you can generate one in your firebase admin panel under Project Settings -> Service Accounts.  This can generate a servicAccount json file which you can upload in the ImageKit add external storage dialog.  Once you have configured imageKit, set `imageKitBaseUrl` property in `config.ts`

### Setup Authentication, Register and make yourself and admin user

* In the firebase admin panel, enable *email* and *anonymous* auth.
* Open the site: [http://localhost:3000](http://localhost:3000) - it should redirect you to sign in or register.
* Register with an email address.
* Make your user an admin; to do this, in the root folder where this code sits, in the terminal:  `yarn makeAdmin {yourEmailAddress}`

## Setting up your Environment

#### Setup environment variables

1. Copy `.env.example` to `.env`

## Deploying

The entire application is deployed on a combination of Firebase and your front-end provider of choice, for now we will set it up with Netlify because this lines up with existing work.

### Deploying Netlify

ToDo: fill out

### Deploying Firebase

Deploy firestore rules and indexes, realtime db rules and indexes, storage rules, functions:

    firestore deploy

#### Deploy only the cloud functions

    firebase deploy --only functions

#### Build the cloud functions

    cd functions && yarn build

#### Start up the firebase emulator

    yarn start:emulator

### Running the application

Start local front-end development server:

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