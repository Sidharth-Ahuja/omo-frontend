const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json'); // Path to Firebase service account key

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://game-33e6e-default-rtdb.firebaseio.com/", // Your Firebase database URL
});

const db = admin.database();
const timerRef = db.ref('timer');

const TIMER_DURATION = 15; // 15 seconds
let timerValue = TIMER_DURATION;
let isPaused = false;

const startTimer = () => {
  setInterval(() => {
    if (isPaused) return; // Skip the interval when paused
    
    if (timerValue <= 0) {
      isPaused = true;
      timerRef.set(0)
        .then(() => {
          console.log(`Timer stopped at 0 for 3 seconds`);

          // Reset timerValue to 15 immediately after reaching 0
          timerValue = TIMER_DURATION;

          setTimeout(() => {
            isPaused = false; // Resume countdown after 3 seconds
          }, 5000); // Pause for 5 seconds
        })
        .catch((error) => {
          console.error('Error updating timer:', error);
        });
    } else {
      timerRef.set(timerValue)
      .then(() => {
        console.log(`Timer updated: ${timerValue} seconds remaining`);
         timerValue--;
      })
      .catch((error) => {
        console.error('Error updating timer:', error);
      });
    }
  }, 1000);
};

// Start the timer
startTimer();

// Set up an HTTP server to comply with Cloud Run requirements
const app = express();
const PORT = process.env.PORT || 8083;

app.get('/', (req, res) => {
  res.send('Timer is running...');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
