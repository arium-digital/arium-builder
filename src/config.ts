export const defaultCameraHeight = 1.75;
export const cameraHeightOffset = 0.5;

export const BASE_CAMERA_HEIGHT = 1.75;
export const COLLISION_DETECTION_HEIGHT = 0.25;
const STARTING_POSITION = {
  x: [-1, 1],
  z: [-1, 1],
};
export const RANDOM_STARTING_POSITION_RANGE = STARTING_POSITION;

export const COLLISION_DETECTION_LAYER = 2;
export const GROUND_DETECTION_LAYER = 3;
export const CURSOR_POSITION_DETECTION_LAYER = 4;
export const GLOBAL_POINTER_OVER_LAYER = 5;

export const CURSOR_POSITION_DETECTION_MAX_DISTANCE = 30;
export const GLOBAL_POINTER_OVER_MAX_DISTANCE = 300;
export const MAX_UNDO = 100;

type AssetVariant = "1k" | "2k" | "4k" | "8k" | "thumbnail";
export const HDRI_QUALITY: AssetVariant = "1k";
export const SKYBOX_QUALITY: AssetVariant = "8k";

export const TOUCH_PANNING_SPEED_FACTOR = 2.5;

export const DEFAULT_CAMERA_FOV = 75;
export const DEFAULT_CAMERA_FAR = 1000;
export const DEFAULT_FOV_TRANSITION_SPEED_SECONDS = 1;
export const DEFAULT_FAR_TRANSITION_SPEED_SECONDS = 1;

// Replace the below with configuration from your project.
export const firebaseConfig = {
  apiKey: "AIzaSyAoPz3c-2OHJzl9qPy6IzzSlROHIUeAvS4",
  authDomain: "arium-builder-example.firebaseapp.com",
  databaseURL: "https://arium-builder-example-default-rtdb.firebaseio.com",
  projectId: "arium-builder-example",
  storageBucket: "arium-builder-example.appspot.com",
  messagingSenderId: "346607153918",
  appId: "1:346607153918:web:105d693144732ee7a22baf",
};

export const mediaHostUrl = "https://arium-builder-example.web.app";

// Replace the below with configuration from your project.
export const imageKitBaseUrl = "https://ik.imagekit.io/ariumbuilderexample/";
