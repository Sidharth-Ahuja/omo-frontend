import omoLogo from '../../assets/img/omo-logo.png'
import { GoogleIcon } from '../../assets/icons'
import mobileGif from '../../assets/gif/mobile.gif'

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import app from '../../config/firebase'
import {
  getAuth,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useSignupValidator } from './useSignupValidator'
import InputWithLabel from '../../components/InputFieldWithLabel'
import SelectOneDropdown from '../../components/SelectOneDropdown'
import { daysList, monthsList, yearsList } from '../VerificationPage/data'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import Checkbox from '../../components/Checkbox'
import CustomFlagSelect from '../../components/CustomFlagSelect'
import { useRecoilState } from 'recoil'
import { DarkMode } from '../../atom/Atom'
import DarkLoginButton from '../../components/DarkModeButton/DarkLoginButton'
import RightDarkButton from '../../components/DarkModeButton/RightDarkButton'

const auth = getAuth(app)
const fireStore = getFirestore(app)

const SignupPage = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordUnmatchError, setPasswordUnmatchError] = useState(undefined)
  const [dobDate, setDobDate] = useState('')
  const [dobMonth, setDobMonth] = useState('')
  const [dobYear, setDobYear] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupCode, setSignupCode] = useState('')
  const [isSignupCode, setIsSignupCode] = useState(false)
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode)

  const navigate = useNavigate()
  const referrerID = useParams().referrerID

  const [userAuth, loadingUser] = useAuthState(auth)

  const {
    fields,
    trigger,
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useSignupValidator()

  const onSubmitSignUp = async (data) => {
    setLoading(true)
    setPasswordUnmatchError(undefined)
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // handle successful sign up
        sendEmailVerification(userCredential.user)
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          setAuthError('This email address is already in use')
        } else if (error.code === 'auth/weak-password') {
          setAuthError(
            error.message.substring(9).split(new RegExp('\\((.*)\\)'))[0]
          )
        } else {
          setAuthError(error.message)
        }
        setLoading(false)
      })
  }

  function shortenId(longId) {
    const alphanumericOnly = longId.replace(/[^a-zA-Z0-9]/g, '')
    const shortId = alphanumericOnly.substring(0, 8)
    return shortId
  }

  const signUpOnClick = () => { }

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      login_hint: 'user@example.com',
    })
    signInWithPopup(auth, provider)
  }

  const updateReferrerData = async () => {
    const usersQuery = query(
      collection(fireStore, 'users'),
      where('shortID', '==', referrerID)
    )
    const userQuerySnapshot = await getDocs(usersQuery)

    if (userQuerySnapshot.size > 0) {
      const referrerDoc = userQuerySnapshot.docs[0]
      const userRefCollectionRef = doc(
        collection(referrerDoc.ref, 'usersReferred')
      )

      await setDoc(userRefCollectionRef, {
        userId: userAuth.uid,
        claimed: false,
      })
      updateDoc(referrerDoc.ref, {
        usersReferred: increment(1),
      })
    } else {
      console.log('referrer id does not exist')
    }
  }

  function getServerTime() {
    return Math.floor(Date.now() / 1000)
  }

  const handleUserAuthenticated = () => {
    // Updating current user data
    const userRef = doc(fireStore, 'users', userAuth.uid)
    setDoc(userRef, {
      email: userAuth.email,
      name: userAuth.displayName,
      username: username,
      lang: 'en',
      tokenBalance: 0,
      bonusBalance: 10,
      shortID: shortenId(userAuth.uid),
      referrerID: referrerID ? referrerID : null,
      registeredAt: getServerTime(),
      dob: dobDate.title + ' ' + dobMonth.title + ' ' + dobYear.title,
      signupCode: signupCode ? signupCode : null,
      lang: localStorage.getItem('flag') || 'en'
    })

    referrerID && updateReferrerData()

    localStorage.setItem('userAuthID', userAuth.uid)
    navigate('/deposit')
  }

  useEffect(() => {
    if (userAuth) {
      getDoc(doc(fireStore, 'users', userAuth.uid))
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            localStorage.setItem('userAuthID', userAuth.uid)
            navigate('/deposit')
          } else {
            handleUserAuthenticated()
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error checking user:', error)
        })
    }
    return () => { }
  }, [userAuth])

  return (
    <div className={'lg:w-full lg:h-[100vh] flex ' + (isDarkMode ? " text-white" : "")}>
      <div className='w-full px-8 md:w-[70%] md:mx-auto lg:w-[35%] lg:px-[50px]  overflow-scroll scrollbar-hide'>
        <div class="container">
          <CustomFlagSelect />
        </div>
        <div className='w-full flex justify-center py-[25px]'>
          <img src={omoLogo} className='h-[75px] w-[250px]' />
        </div>
        <form onSubmit={handleSubmit(onSubmitSignUp)} className='flex flex-col'>
          <div className='mb-4'>
            <InputWithLabel
              name='email'
              labelText='Email'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling='font-[500] text-gray-500'
              isRequired={true}
              placeholderText='someone@example.com'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.email }}
              errors={errors.email}
              trigger={trigger}
              inputState={email}
              setInputState={setEmail}
            />
          </div>

          <div className='mb-4'>
            <InputWithLabel
              name='username'
              labelText='Username'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling='font-[500] text-gray-500'
              isRequired={true}
              placeholderText='username'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.username }}
              errors={errors.username}
              trigger={trigger}
              onChangeTrigger={true}
              inputState={username}
              setInputState={setUsername}
            />
          </div>

          <div className='mb-4'>
            <InputWithLabel
              name='password'
              labelText='Password'
              labelTextSize='14px'
              marginLabelField='4px'
              labelStyling='font-[500] text-gray-500'
              inputType='password'
              isRequired={true}
              placeholderText='Create Password'
              height='36px'
              width='100%'
              setValue={setValue}
              validation={{ ...fields.password }}
              errors={errors.password}
              customError={passwordUnmatchError}
              trigger={trigger}
              inputState={password}
              setInputState={setPassword}
            />
          </div>

          <div className='mb-4'>
            <div className={'text-[14px] font-[500] flex ' + (isDarkMode ? "text-white" : "text-[#182021]")}>
              Date of birth
              <span className='text-red-600'>*</span>
              {(errors.dobDate || errors.dobMonth || errors.dobYear) && (
                <ExclamationCircleIcon
                  className={`h-[14px] w-[14px] text-[#d76161] font-bold mt-1 ml-1`}
                  aria-hidden='true'
                />
              )}
            </div>
            <div className='flex w-full justify-between'>
              <div className='w-[33%] mr-4'>
                <SelectOneDropdown
                  required={false}
                  height='36px'
                  width='100%'
                  labelStyling='font-[500]'
                  control={control}
                  setValue={setValue}
                  optionData={daysList}
                  errors={errors.dobDate}
                  option={dobDate}
                  setOption={setDobDate}
                  selectFieldName='dobDate'
                  selectFieldLabel='Date of Birth'
                  isRequired={false}
                  placeholder='Day'
                  trigger={trigger}
                  noLabel={true}
                />
              </div>
              <div className='w-[33%] mr-4'>
                <SelectOneDropdown
                  required={false}
                  height='36px'
                  width='100%'
                  labelStyling='font-[500]'
                  control={control}
                  setValue={setValue}
                  optionData={monthsList}
                  errors={errors.dobMonth}
                  option={dobMonth}
                  noLabel={true}
                  setOption={setDobMonth}
                  selectFieldName='dobMonth'
                  selectFieldLabel='Month of birth'
                  placeholder='Month'
                  trigger={trigger}
                />
              </div>
              <div className='w-[33%]'>
                <SelectOneDropdown
                  required={false}
                  height='36px'
                  width='100%'
                  labelStyling='font-[500]'
                  control={control}
                  setValue={setValue}
                  optionData={yearsList}
                  errors={errors.dobYear}
                  option={dobYear}
                  noLabel={true}
                  setOption={setDobYear}
                  selectFieldName='dobYear'
                  selectFieldLabel='Year of birth'
                  placeholder='Year'
                  trigger={trigger}
                />
              </div>
            </div>
          </div>

          <div className='mb-4'>
            <Checkbox
              control={control}
              error={errors.agreeTnC}
              name='agreeTnC'
              type='termsConditions'
              required={true}
            />
          </div>

          <div className='mb-4'>
            <label>
              <input
                className=''
                type='checkbox'
                onChange={(e) => setIsSignupCode(e.target.checked)}
                checked={isSignupCode}
              />
              <span className='ml-2 text-[15px]'>Code (Optional)</span>
            </label>
            {isSignupCode && (
              <InputWithLabel
                name='signupCode'
                labelText=''
                labelTextSize='14px'
                marginLabelField='4px'
                labelStyling='font-[500] text-gray-500'
                isRequired={false}
                placeholderText='Sign up Code'
                height='36px'
                width='100%'
                setValue={setValue}
                validation={{ ...fields.signupCode }}
                errors={errors.signupCode}
                trigger={trigger}
                onChangeTrigger={true}
                inputState={signupCode}
                setInputState={setSignupCode}
              />
            )}
          </div>

          {authError && (
            <div className='text-[14px] text-[#D86161]'>{authError}</div>
          )}

          {
            isDarkMode ? <button type='submit' className='w-fit self-center flex justify-center items-center'>
              <DarkLoginButton title={'Sign up'} />
            </button> :

              <button
                type='submit'
                className='w-full mt-[10px] text-white bg-[#000000] hover:bg-gray-800 focus:outline-none font-medium rounded-md px-5 py-2.5 mr-2 mb-2'
                onClick={signUpOnClick}
              >
                {loadingUser || loading ? (
                  <span>Loading...</span>
                ) : (
                  <span>Sign up</span>
                )}
              </button>
          }
        </form>

        <div className={' my-[20px] md:my-[10px] ' + (isDarkMode ? "hidden" : "flex")}>
          <hr className='w-[45%] mt-[9px] h-[2px] mx-auto bg-gray-300 border-0 rounded lg:my-7' />
          <span className='text-gray-500 text-[13px] lg:my-5'>or</span>
          <hr className='w-[45%] mt-[9px] h-[2px] mx-auto  bg-gray-300 border-0 rounded lg:my-7' />
        </div>

        <button
          type='button'
          className={'text-center text-gray-700 bg-white w-full hover:bg-gray-100 text-[17px] border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-md py-2.5  items-center ' + (isDarkMode ? "hidden" : "inline-flex")}
          onClick={signInWithGoogle}
        >
          <div className='flex w-full justify-center'>
            <GoogleIcon className='w-[21px] mr-[10px]' />
            Sign up with Google
          </div>
        </button>

        <div className={'w-full flex justify-center my-7 mb-11 items-center ' + (isDarkMode ? "text-white" : "text-gray-700")}>
          <span className='mr-[5px]'>Already have an account?</span>
          <Link to='/login'>
            {
              isDarkMode ? <RightDarkButton title={"Sign in"} /> : <span className='text-[#00A1FF] font-bold hover:underline'>
                Sign in
              </span>
            }

          </Link>
        </div>
      </div>
      <div className='hidden lg:block lg:w-[60%] bg-black'>
        <img src={mobileGif} className='h-[90vh] mx-auto mt-8 rounded-lg' />
      </div>
    </div>
  )
}
export default SignupPage
