export function DateUtil(seconds, nanoseconds) {
  // Example timestamp data
  const timestampData = {
    seconds: seconds,
    nanoseconds: nanoseconds,
  };

  // Convert Firestore timestamp to a JavaScript Date object
  const firestoreTimestamp =
    timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000;

  // Get the current date as a JavaScript Date object
  const currentDate = new Date().getTime();
  console.log("currentDate", currentDate);
  console.log("firestoreTimestamp", firestoreTimestamp);

  // Compare the Firestore timestamp with the current date
 if (
    firestoreTimestamp <= currentDate &&
    firestoreTimestamp > currentDate - 86400000
  ) {
    return true

  } else {
    return false
  }
  
}
