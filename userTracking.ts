// lib/userTracking.ts
import { database1, ref, set, get } from "./src/app/firebase-int";

// Function to handle user presence
const trackUserPresence = (userId: string) => {
  const sessionKey = 'userPresenceKey'; // Key for session storage
  const presenceRef = ref(database1, `users/${userId}`);
  const timeoutDuration = 5000; // 5 seconds timeout duration

  // Set the user's presence to online
  const updatePresence = (status: boolean) => {
    set(presenceRef, {
      online: status,
      lastSeen: new Date().toISOString(),
    }).catch((error) => {
      console.error('Error updating user presence:', error);
    });
  };

  const storedUserId = sessionStorage.getItem(sessionKey);

  // If user ID is not stored in session storage, proceed with presence tracking
  if (!storedUserId) {
    sessionStorage.setItem(sessionKey, userId);
    updatePresence(true);

    // Heartbeat mechanism to regularly update the presence
    const heartbeatInterval = setInterval(() => {
      updatePresence(true);
    }, 5000); // Update every 5 seconds

    // Function to handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden or closed
        updatePresence(false);
        clearInterval(heartbeatInterval);
      } else {
        // Tab is visible
        updatePresence(true);
      }
    };

    // Event listener for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to be called on unmount
    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updatePresence(false);
      sessionStorage.removeItem(sessionKey);
    };
  }

  // Return an empty cleanup function if the user is already tracked
  return () => {};
};

export default trackUserPresence;
