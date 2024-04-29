import omoLogo from "../../assets/img/omo-logo.png";
import { GoogleIcon } from "../../assets/icons";
import mobileGif from "../../assets/gif/mobile.gif";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import app from "../../config/firebase";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  RecaptchaVerifier,
  getMultiFactorResolver,
  PhoneMultiFactorGenerator,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore, getDoc, doc, setDoc } from "firebase/firestore";

import { useLoginInValidator } from './useLoginValidator.js'
import InputWithLabel from '../../components/InputFieldWithLabel'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { DarkMode } from '../../atom/Atom.js'
import BackGround from "../../assets/img/DarkMode/Background.png"
import DarkModeButton from '../../components/DarkModeButton/DarkModeButton.jsx'
import DarkLoginButton from '../../components/DarkModeButton/DarkLoginButton.jsx'
import RightDarkButton from '../../components/DarkModeButton/RightDarkButton.jsx'

// import CustomFlagSelect from '../../components/CustomFlagSelect'

const auth = getAuth(app);
const fireStore = getFirestore(app);

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    login_hint: "user@example.com",
  });
  signInWithPopup(auth, provider);
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState("");
  const [showForgotPasswordPage, setShowForgotPasswordPage] = useState(false);
  const [emailFP, setEmailFP] = useState("");
  const [errorFP, setErrorFP] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mailFPsent, setMailFPsent] = useState(false);
  const [displayFlag, setDisplayFlag] = useState(false);
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [errorMF, setErrorMF] = useState("");

  const [userAuth] = useAuthState(auth);

  const navigate = useNavigate();

  const {
    fields,
    trigger,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useLoginInValidator();

  function shortenId(longId) {
    const alphanumericOnly = longId.replace(/[^a-zA-Z0-9]/g, "");
    const shortId = alphanumericOnly.substring(0, 8);
    return shortId;
  }

  function getServerTime() {
    return Math.floor(Date.now() / 1000);
  }

  const handleUserAuthenticated = () => {
    const userRef = doc(fireStore, "users", userAuth.uid);
    setDoc(userRef, {
      email: userAuth.email,
      name: userAuth.displayName,
      tokenBalance: 0,
      bonusBalance: 10,
      shortID: shortenId(userAuth.uid),
      registeredAt: getServerTime(),
    });

    localStorage.setItem("userAuthID", userAuth.uid);
    navigate("/deposit");
  };

  useEffect(() => {
    if (userAuth) {
      if (userAuth.providerData[0].providerId === "google.com") {
        getDoc(doc(fireStore, "users", userAuth.uid))
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              localStorage.setItem("userAuthID", userAuth.uid);
              navigate("/deposit");
            } else {
              handleUserAuthenticated();
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error checking user:", error);
          });
      } else if (userAuth.email === "omo6042game@gmail.com") {
        localStorage.setItem("adminAuthID", userAuth.uid);
        navigate("/admin/activeUsers");
        setLoading(false);
      } else if (userAuth.email === "rainy8882399321@gmail.com") {
        localStorage.setItem("adminAuthID", userAuth.uid);
        navigate("/admin/activeUsers");
        setLoading(false);
      } else {
        localStorage.setItem("userAuthID", userAuth.uid);
        navigate("/deposit");
        setLoading(false);
      }
    }
  }, [userAuth]);

  const onSubmitLogIn = () => {
    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container-id",
      undefined,
      auth
    );
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // handle successful sign in
      })
      .catch((error) => {
        if (error.code == "auth/multi-factor-auth-required") {
          setErrorMF(error);
          const resolver = getMultiFactorResolver(auth, error);
          // Ask user which second factor to use.
          if (
            resolver.hints[0].factorId === PhoneMultiFactorGenerator.FACTOR_ID
          ) {
            const phoneInfoOptions = {
              multiFactorHint: resolver.hints[0],
              session: resolver.session,
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            // Send SMS verification code
            return phoneAuthProvider
              .verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
              .then(function (verificationId) {
                // let verificationCode = otp;
                setLoading(false);
                // handleOtp(verificationId);
                setVerificationId(verificationId);
                setIsCodeSent(true);
                // alert(otp);
                // console.log("verificationCode", otp);
              })
              .then(function (userCredential) {
                // User successfully signed in with the second factor phone number.
              });
          }
        }
        if (error.code === "auth/wrong-password") {
          setAuthError("Wrong Password. Please try again.");
        } else if (error.code === "auth/user-not-found") {
          setAuthError("User with this email address does not exist");
        } else
          setAuthError(
            error.message.substring(9).split(new RegExp("\\((.*)\\)"))[0]
          );
        setLoading(false);
      });
  };

  const handleOtp = () => {
    const resolver = getMultiFactorResolver(auth, errorMF);
    // Ask user for the SMS verification code. Then:
    const cred = PhoneAuthProvider.credential(verificationId, otp);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
    // Complete sign-in.
    return resolver.resolveSignIn(multiFactorAssertion);
  };

  useEffect(() => {
    if (otp && otp.length == 6) {
      handleOtp();
    }
  }, [otp]);

  const handleRestorePasswordClick = async () => {
    try {
      if (!/\S+@\S+\.\S+/.test(emailFP)) {
        setErrorFP(true);
        setErrorMsg("Please enter valid email address");
      }
      await sendPasswordResetEmail(auth, emailFP);
      setMailFPsent(true);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setErrorFP(true);
        setErrorMsg("This user account does not exist");
      } else {
        console.log("Error sending password reset email:", error);
      }
    }
  };

  const handleInputFPclick = (e) => {
    setEmailFP(e.target.value)
    setErrorFP(false)
  }

  // const laguangeHandler = () =>{
  //     setDisplayFlag(!displayFlag);
  // }

  // const laguangeHandler = () =>{
  //     setDisplayFlag(!displayFlag);
  // }

  return (
    <div
      className='lg:w-full lg:h-[100vh] flex'
    >
      <div className='w-full px-8 py-24 md:w-[70%] md:mx-auto lg:w-[35%] lg:px-[50px]'>
        {/* <div class="container">
        <CustomFlagSelect />
        </div> */}
        <div className='w-full flex justify-center py-[25px]'>

          <img src={omoLogo} className='h-[75px] w-[250px]' />

        </div>

        {showForgotPasswordPage ? (
          <div className={' ' + (isDarkMode ? " text-white" : "")}>
            <div className='font-medium text-lg mb-4 text-center'>
              Forgot your password?
            </div>
            {mailFPsent ? (
              <div className="my-7 text-sm sm:text-md text-center">
                <div>Message has been sent to {emailFP}.</div>
                <p>
                  Please check your email and follow the link to restore your
                  account and password.
                </p>
              </div>
            ) : (
              <div className='flex flex-col items-center'>
                <div className='mb-5 '>
                  Enter your email and we'll send you a link to reset password
                  and get back into your account.
                </div>
                <div className='mb-5 w-full flex flex-col'>
                  <div className='mb-4'>
                    <label className='font-medium text-[14px] flex mb-[3px]'>
                      Email <div className='text-red-700'>*</div>
                    </label>
                    <input
                      className={`block text-[14px] appearance-none rounded-[3px] text-[#182021] font-normal placeholder-gray-400 border p-[8px]
                     hover:outline-none hover:ring-0 
                    ${!errorFP
                          ? 'hover:border-[#00A1FF] hover:ring-[#00A1FF] border-gray-300 focus:border-[#00A1FF] hover:ring-[1px] focus:ring-[#00A1FF]'
                          : 'hover:border-[#D86161] hover:ring-[#D86161] border-[#D86161] focus:border-[#D86161] focus:ring-[#D86161]'
                        }
                    focus:outline-none focus:ring-[1.5px]` + (isDarkMode ? " golden bg-transparent" : "")}
                      style={{
                        width: `100%`,
                        height: `33px`,
                      }}
                      placeholder="someone@example.com"
                      value={emailFP}
                      onChange={(e) => handleInputFPclick(e)}
                    />
                    {errorFP && (
                      <div className="text-[12px] text-red-700">{errorMsg}</div>
                    )}
                  </div>

                  {
                    isDarkMode ? <button type='submit' className='relative left-6 mt-2 w-fit self-center flex justify-center items-center'>
                      <DarkLoginButton title={'Restore Password'} isRestore={true} />
                    </button> : <button
                      type='submit'
                      className='w-full mt-[10px] text-white bg-[#000000] hover:bg-gray-800 focus:outline-none font-medium rounded-md px-5 py-2.5 mr-2 mb-2'
                      onClick={handleRestorePasswordClick}
                    >
                      Restore Password
                    </button>
                  }

                </div>
              </div>
            )}
            <div className="w-full flex justify-center">
              <div
                className=' text-sm font-semibold  cursor-pointer flex items-center gap-2'
              >
                Back to {" "}
                {
                  isDarkMode ? <span
                    onClick={() => setShowForgotPasswordPage(false)}>
                    <RightDarkButton title={"Sign in"} />
                  </span>
                    : <span
                      onClick={() => setShowForgotPasswordPage(false)}
                      className='text-[#00A1FF] hover:underline'
                    >
                      Sign in
                    </span>
                }

              </div>
            </div>
          </div>
        ) : (
          <div>
            <form
              onSubmit={handleSubmit(onSubmitLogIn)}
              className="flex flex-col"
            >
              <div className="mb-[14px]">
                <InputWithLabel
                  name="email"
                  labelText="Email"
                  labelTextSize="14px"
                  marginLabelField="4px"
                  labelStyling="font-[500] text-gray-500"
                  isRequired={true}
                  placeholderText="someone@example.com"
                  height="36px"
                  width="100%"
                  setValue={setValue}
                  validation={{ ...fields.email }}
                  errors={errors.email}
                  trigger={trigger}
                  onChangeTrigger={false}
                  inputState={email}
                  setInputState={setEmail}
                />
              </div>

              <div className="mb-[14px]">
                <InputWithLabel
                  name="password"
                  labelText="Password"
                  labelTextSize="14px"
                  marginLabelField="4px"
                  labelStyling="font-[500] text-gray-500"
                  inputType="password"
                  isRequired={true}
                  placeholderText="Enter Password"
                  height="36px"
                  width="100%"
                  setValue={setValue}
                  validation={{ ...fields.password }}
                  errors={errors.password}
                  trigger={trigger}
                  inputState={password}
                  setInputState={setPassword}
                />
              </div>
              {isCodeSent ? null : <div id="recaptcha-container-id" />}
              {isCodeSent ? (
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter verification code"
                />
              ) : null}
              <div className={'self-end text-[1rem] text-white font-[500] cursor-pointer mb-4 ' + (isDarkMode ? "block" : "hidden")}>
                <div onClick={() => setShowForgotPasswordPage(true)}>
                  Forgot Password?
                </div>
              </div>
              

              {authError && (
                <div className="text-[14px] text-[#D86161]">{authError}</div>
              )}

              {
                isDarkMode ? <button type='submit' className='w-fit self-center flex justify-center items-center'>
                  <DarkLoginButton title={loading ? 'Loading...' : 'Sign in'} />
                </button>
                  :
                  <button
                    type='submit'
                    className={'w-full mt-[10px] text-white bg-[#000000] hover:bg-gray-800 focus:outline-none font-medium rounded-md px-5 py-2.5 mr-2 mb-2 '}
                  >
                    {loading ? 'Loading...' : 'Sign in'}
                  </button>
              }



            </form>

            <div className={'w-full  justify-center text-[#00A1FF] mt-3 ' + (isDarkMode ? "hidden" : " flex")}>
              <div className='w-fit text-[#00A1FF] text-sm font-semibold hover:underline cursor-pointer'>
                <div onClick={() => setShowForgotPasswordPage(true)}>
                  Forgot Password?
                </div>
              </div>
            </div>

            <div className={' my-[20px] md:my-[10px] ' + (isDarkMode ? "hidden" : "flex")}>
              <hr className='w-[45%] mt-[9px] h-[2px] mx-auto bg-gray-300 border-0 rounded lg:my-7' />
              <span className='text-gray-500 text-[13px] lg:my-5'>or</span>
              <hr className='w-[45%] mt-[9px] h-[2px] mx-auto  bg-gray-300 border-0 rounded lg:my-7' />
            </div>

            <button
              type='button'
              className={'text-center text-gray-700 bg-white w-full hover:bg-gray-100 text-[17px] border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-md py-2.5 items-center ' + (isDarkMode ? "hidden" : "inline-flex")}
              onClick={signInWithGoogle}
            >
              <div className="flex w-full justify-center">
                <GoogleIcon className="w-[21px] mr-[10px]" />
                Sign in with Google
              </div>
            </button>

            <div className={'w-full flex justify-center my-7 items-center ' + (isDarkMode ? "text-white" : "text-gray-700")}>
              <span className='mr-[5px]'>Don't have an account?</span>
              <Link to='/signup'>
                {
                  isDarkMode ? <RightDarkButton title={"Sign up"} /> : <span className='text-[#00A1FF] font-bold hover:underline'>
                    Sign up
                  </span>
                }

              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="hidden lg:block lg:w-[60%] bg-black">
        <img src={mobileGif} className="h-[90vh] mx-auto mt-8 rounded-lg" />
      </div>
    </div>
  );
};

export default LoginPage;
