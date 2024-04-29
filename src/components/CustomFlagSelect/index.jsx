import React, { useEffect, useState } from "react";
// import { FaFlag } from 'react-icons/fa'; // Import your flag icons
import { CircleFlag } from "react-circle-flags";
import {
  setDoc,
  getDoc,
  doc,
  collection,
  getFirestore,
  // serverTimestamp,
  // updateDoc,
  // getDocs,
  // query,
  // where,
} from "firebase/firestore";

import app from "../../config/firebase";
import { useRecoilState } from "recoil";
import { DarkMode } from "../../atom/Atom"

function CustomFlagSelect({direction}) {
  const fireStore = getFirestore(app);
  const [showFlags, setShowFlags] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode)

  const EnglishFlag = () => (
    <CircleFlag countryCode="us" height="50" width="50" />
  );
  const SpanishFlag = () => (
    <CircleFlag countryCode="es" height="50" width="50" />
  );
  const ArabicFlag = () => (
    <CircleFlag countryCode="ar" height="50" width="50" />
  );
  // const FrenchFlag = () => <CircleFlag countryCode="fr" height="50" width="50" />
  const ChienseFlag = () => (
    <CircleFlag countryCode="zh" height="50" width="50" />
  );
  const ThaiFlag = () => <CircleFlag countryCode="ar" height="50" width="50" />;
  const Hindilag = () => <CircleFlag countryCode="in" height="50" width="50" />;
  const TurkyFlag = () => (
    <CircleFlag countryCode="tr" height="50" width="50" />
  );
  const flags = [
    { id: "us", name: "United States", icon: <EnglishFlag /> },
    { id: "es", name: "Spain", icon: <SpanishFlag /> },
    { id: "ar", name: "Arabic", icon: <ArabicFlag /> },
    { id: "zh", name: "Chiense", icon: <ChienseFlag /> },
    // { id: 'fr', name: 'Français', icon: <FrenchFlag /> },
    { id: "th", name: "Thai", icon: <ThaiFlag /> },
    { id: "hi", name: "Hindi", icon: <Hindilag /> },
    { id: "tr", name: "Turkish", icon: <TurkyFlag /> },
    // Add more flags here...
  ];

  const toggleFlags = () => {
    setShowFlags(!showFlags);
  };

  const handleFlagClick = async (flag) => {
    setSelectedFlag(flag);
    localStorage.setItem("flag", flag.id == "us"?"en":flag.id);

    console.log("inside flag click", flag);

    const userDocRef = doc(
      fireStore,
      "users",
      localStorage.getItem("userAuthID")
    );
    const userDocSnapshot = await getDoc(userDocRef);

    console.log("userDocSnapshot", userDocSnapshot.data());
    if (userDocSnapshot.exists()) {
      const data = userDocSnapshot.data();
      data.lang = flag.id == "us" ? "en" : flag.id; // Set the default value or the appropriate value

      await setDoc(userDocRef, data, { merge: true });

      console.log("User data updated:", data);
    } else {
      console.log("User not found");
    }
    window.location.reload();
    toggleFlags();
  };

  const fetchUserData = async () => {

    const userRef = collection(fireStore, `users`);
    const query1 = doc(userRef, localStorage.getItem("userAuthID"));
    const usersQuerySnapshot = await getDoc(query1);

    console.log("usersQuerySnapshot.docs", usersQuerySnapshot.data());
    return usersQuerySnapshot.data();
  };
  useEffect(() => {
    // const language = JSON.parse(localStorage.getItem("flag")) || "en";
    const language = fetchUserData();

    language.then((ln) => {
      console.log("language", ln);
      const flag = flags.find((flag) => flag.id == ln.lang || flag.id == "en");
      setSelectedFlag(flag);
      console.log("inside flag", flag);
    });
  }, []);

  return (
    <div className="custom-flag-select">
      <button className="toggle-button" onClick={toggleFlags}>
        {selectedFlag ? (
          selectedFlag.icon
        ) : (
          <button class="circular-button"></button>
        )}
      </button>
      {showFlags && (
        <div className={ direction === "Up" ? `flags-container-UP`  :`flags-container `} style={isDarkMode ? {background: 'black', border: "none"} : {}}>
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flag-card"
              onClick={() => handleFlagClick(flag)}
            >
              {flag.icon} <span className={"flag-name "+ (isDarkMode ?  " text-white" : "")}>{flag.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomFlagSelect;
