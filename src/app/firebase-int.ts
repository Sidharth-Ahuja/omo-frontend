// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove, get } from "firebase/database";

// Firebase configuration for your first app
const firebaseConfig1 = {
  apiKey: "AIzaSyDXT1Wb_fxbzQyeDNka5yd70jHNNTOjnYQ",
  authDomain: "game-33e6e.firebaseapp.com",
  databaseURL: "https://game-33e6e-default-rtdb.firebaseio.com",
  projectId: "game-33e6e",
  storageBucket: "game-33e6e.appspot.com",
  messagingSenderId: "491138425763",
  appId: "1:491138425763:web:ecfc894384f606da82f016",
  measurementId: "G-4RF5XRPBD1"
};

// Initialize the default Firebase app
const app1 = initializeApp(firebaseConfig1,"primary");
const database1 = getDatabase(app1);

export { database1, ref, set, onValue, remove, get };
