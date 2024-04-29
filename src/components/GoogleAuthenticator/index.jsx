import React, { useState } from 'react';
import app from "../../config/firebase";
import {getApp} from 'firebase/app';

import { getAuth , PhoneMultiFactorGenerator, PhoneAuthProvider, multiFactor, GoogleAuthProvider,RecaptchaVerifier , linkWithCredential} from 'firebase/auth';

// import { getAuth, PhoneAuthProvider, RecaptchaVerifier } from 'firebase/auth';


const MfaVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  // Assuming you have functions to handle sending the verification code and initializing the timer
// const sendVerificationCode = () => {...};
// const startVerificationCodeTimer = () => {...};

const MAX_VERIFICATION_CODE_TIMEOUT = 300000; // 5 minutes in milliseconds
let verificationCodeTimer;

// Function to start the timer
const startVerificationCodeTimer = () => {
  verificationCodeTimer = setTimeout(() => {
    console.log("Verification code expired. Request a new one.");
    // Implement logic to request a new verification code
    sendVerificationCode();
    // Restart the timer for the new verification code
    startVerificationCodeTimer();
  }, MAX_VERIFICATION_CODE_TIMEOUT);
};

// // Call this function when you send the initial verification code
// sendVerificationCode();

// // Start the timer for the initial verification code
// startVerificationCodeTimer();

// Example of handling the button click to manually request a new verification code
const requestNewVerificationCode = () => {
  // Clear the existing timer
  clearTimeout(verificationCodeTimer);
  
  console.log("Manually requesting a new verification code.");
  // Implement logic to request a new verification code
  sendVerificationCode();
  // Restart the timer for the new verification code
  startVerificationCodeTimer();
};

// Call this function when the user manually requests a new verification code
// requestNewVerificationCode();


  const sendVerificationCode = async () => {
    try {
      const provider = new PhoneAuthProvider(auth);
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', undefined, auth);
      const multiFactorSession = await multiFactor(user).getSession();

    const phoneInfoOptions = {
              phoneNumber: phoneNumber,
              session: multiFactorSession
          };
      const verificationId = await provider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      );
      console.log("verificationId", verificationId);

      setVerificationId(verificationId);
      setIsCodeSent(true);
      startVerificationCodeTimer();

      console.log("Verification code sent successfully!");
    } catch (error) {
      console.error("Error sending verification code:", error);
    }
  };

  const enableMFA = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      console.log("user", user);

      await linkWithCredential(user, credential);

      console.log("Multi-Factor Authentication enabled successfully!");
    }catch (error) {
      if (error.code === "auth/code-expired") {
        console.error("Error: Verification code expired. Request a new one.");
        // Implement logic to request a new verification code
        requestNewVerificationCode();
      } else {
        console.error("Error enabling Multi-Factor Authentication:", error);
      }
    }
  };

  return (
    <div>
      <h1>Enable Multi-Factor Authentication</h1>
      {/* Input field for phone number */}
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter your phone number"
      />
       <div id="recaptcha-container" />
      {/* Button to send verification code */}
      <button onClick={sendVerificationCode}>Send Verification Code</button>
      
      {isCodeSent && (
        <div>
          {/* Input field for verification code */}
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
          />
          {/* Button to enable MFA */}
          <button onClick={enableMFA}>Enable MFA</button>
        </div>
      )}
    </div>
  );
};

// export default EnableMFA;

// const MfaVerification = () => {


  
//   // Specify the DOM element where you want the reCAPTCHA widget to be rendered
//   // const recaptchaContainer = document.getElementById('recaptcha-container'); 

 

// // const transporter = nodemailer.createTransport({
// //   service: 'Gmail',
// //   auth: {
// //     user: 'omo6042game@gmail.com',
// //     pass: 'omo123456',
// //   },
// // });

// // const mailOptions = {
// //   from: 'omo6042game@gmail.com',
// //   to: 'rainy8882399321@gmail.com',
// //   subject: 'Your OTP Code',
// //   text: `Your OTP code is: 3456`,
// // };



//   const [otp, setOTP] = useState('');

//   const auth = getAuth();
//   const user = auth.currentUser;

// const handleSendOtp = async () =>{

// //   const firebase = getApp();
// //   // const auth = getAuth();
// //   console.log(firebase);
// //   // const user = auth.currentUser;
// //   // console.log("user", user);

// // // Check if MFA is already enabled
// // if (!user.multiFactor.enrolledFactors.some((factor) => factor.uid === 'google.com')) {
// //   // Enroll the user with Google Authenticator
// //   const provider = new firebase.auth.GoogleAuthProvider();

// //   // Start the enrollment process
// //   user
// //     .multiFactor.getSession()
// //     .then((session) => {
// //       return session.multiFactor.enroll([provider]);
// //     })
// //     .then(() => {
// //       console.log('Google Authenticator MFA enrollment successful');
// //     })
// //     .catch((error) => {
// //       console.error('Error enrolling in Google Authenticator MFA:', error);
// //     });
// // } else {
// //   console.log('Google Authenticator MFA is already enabled for this user');
// // }


//   // const auth = getAuth();
//   // const firebase = getApp();


//   console.log(user.multiFactor);

//   const Multifactor = multiFactor(user);
// //-----------------------------------------------------------------------------------//
// //   // Check if MFA is already enabled
// //   if (!Multifactor.enrolledFactors.some((factor) => factor.uid === 'google.com')) {
// //     const appVerifier = new RecaptchaVerifier('recaptcha-container', {
// //       size: 'invisible', // Set the reCAPTCHA size as per your UI design
// //       // callback: (response) => {
// //       //   // reCAPTCHA verification successful
// //       //   // You can proceed with phone number verification here
// //       // },
// //       // 'expired-callback': () => {
// //       //   // Handle reCAPTCHA expiration or verification failure
// //       // },
// //     }, auth);
// //     // Enroll the user with Google Authenticator
// //     const provider = new GoogleAuthProvider();
// //     const multiFactorUser = multiFactor(auth.currentUser);


// // const multiFactorSession = await multiFactorUser.getSession();
// // const phoneNumber = "+919791093107";

// //     // Send verification code.
// // const phoneAuthProvider = new PhoneAuthProvider(auth);
// // const phoneInfoOptions = {
// //   phoneNumber: phoneNumber,
// //   session: multiFactorSession
// // };
// // const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);

// // // Obtain verification code from user.
// // const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, "1234");
// // const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
// // const response  = await multiFactorUser.enroll(multiFactorAssertion);

// //   // const multiFactorSession = await multiFactorUser.getSession();
// //     // Start the enrollment process
// //     // multiFactorUser.getSession()
// //       // .then((session) => {
// //     // const response = await multiFactorUser.enroll([provider]);
// //     console.log(response);
// //       // })
// //       // .then(() => {
// //       //   console.log('Google Authenticator MFA enrollment successful');
// //       // })
// //       // .catch((error) => {
// //       //   console.error('Error enrolling in Google Authenticator MFA:', error);
// //       // });
// //   } else {
// //     console.log('Google Authenticator MFA is already enabled for this user');
// //   }
// //-----------------------------------------------------------------------------------//

// // const multiFactorAssertion = MultiFactorAssertion;

// // // Generate a QR code for Google Authenticator enrollment
// // const multiFactorInfoOptions = {
// //   uid: user.uid,
// //   displayName: 'Soundarya Dash', // Replace with the user's display name
// // };

// // const multiFactorInfo = await multiFactorAssertion.assert(
// //   multiFactorAssertion.SUPPORTED_FACTORS.GOOGLE,
// //   multiFactorInfoOptions
// // );

// // // Display the QR code to the user (you can use a QR code library for this)
// // const qrCodeUrl = multiFactorInfo.mfaEnrollmentQrCode;




//     // let response = await sendEmailVerification(user);
//     // console.log(response);
//     // .then(() => {
//     //   // Email with OTP sent successfully
//     //   console.log("Email with OTP sent successfully");
//     // })
//     // .catch((error) => {
//     //   // Error sending the email, handle accordingly
//     //   console.log("Error sending the email");
//     // });

//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     console.error('Error sending email:', error);
//     //   } else {
//     //     console.log('Email sent:', info.response);
//     //   }
//     // });

// }

//   const handleVerify = async () => {
// //     const verificationCode = '123456'; // Replace with the code provided by the user
// //   const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(
// //       verificationCode,
// //       phoneInfo
// //   );

// // // Enroll the user in 2FA
// // try {
// //   await user.multiFactor.enroll([multiFactorAssertion], 'My Second Factor');
// //   console.log('2FA successfully enabled');
// // } catch (error) {
// //   console.error('Error enabling 2FA:', error);
// // }

// //     // const isOTPValid = enteredOTP === generatedOTP; // Compare the entered OTP with the generated OTP

// //     // if(isOTPValid){
// //     //   console.log("otp is valid!");
// //     // }else{
// //     //   console.log("otp is invalid!");
// //     // }

// const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', undefined, auth);
// multiFactor(user).getSession()
//     .then(function (multiFactorSession) {
//         // Specify the phone number and pass the MFA session.
//         const phoneInfoOptions = {
//             phoneNumber: "+919791-093107",
//             session: multiFactorSession
//         };

//         const phoneAuthProvider = new PhoneAuthProvider(auth);

//         // Send SMS verification code.
//         return phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
//     }).then(function (verificationId) {
//         // Ask user for the verification code. Then:
//         let verificationCode = otp;
//         const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
//         const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

//         // Complete enrollment.
//         return multiFactor(user).enroll(multiFactorAssertion, "omo-admin-mfa");
//     });

//   };

//   return (
//     <div>
//       {/* <h1>Google Authenticator</h1> */}
      
//       <button className='border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1' onClick={handleVerify}>Enable Multifactor</button>
//       <div id="recaptcha-container" />
//       <label>Verification OTP: </label>
//       <input
//        className='border'
//         type="text"
//         value={otp}
//         onChange={(e) => setOTP(e.target.value)}
//       />
//       <button className = 'border rounded-md bg-blue-500 text-white cursor-pointer px-4 py-1 mb-2 ml-2'onClick={handleVerify}>Verify</button>
//     </div>
//   );
// };

export default MfaVerification;
