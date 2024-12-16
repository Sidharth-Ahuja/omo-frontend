import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import app from '../../../../../config/firebase'

const RegistrationAutoEmail = () => {
  const fireStore = getFirestore(app)
  const storage = getStorage(app)
  const [emailData, setEmailData] = useState(null) // Store email template data
  const [formData, setFormData] = useState(null) // Editable form data
  const [loading, setLoading] = useState(true) // Loading state
  const [isEditing, setIsEditing] = useState(false) // Edit mode toggle

  const fetchEmailTemplate = async () => {
    try {
      const docRef = await doc(
        fireStore,
        'auto-email-templates',
        'registration'
      )
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        
        const data = docSnap.data();

        // Fetch secure URLs dynamically for each image field
        const bgimageRef = ref(storage, data.bgimage);
        const bgimageURL = await getDownloadURL(bgimageRef);

        const logoRef = ref(storage, data.logo);
        const logoURL = await getDownloadURL(logoRef);

        const featuredImage1Ref = ref(storage, data.featuredImage1);
        const featuredImage1URL = await getDownloadURL(featuredImage1Ref);

        const featuredImage2Ref = ref(storage, data.featuredImage2);
        const featuredImage2URL = await getDownloadURL(featuredImage2Ref);

        setEmailData({
          ...data,
          bgimage: bgimageURL,
          logo: logoURL,
          featuredImage1: featuredImage1URL,
          featuredImage2: featuredImage2URL,
        });
        setFormData({
          ...data,
          bgimage: bgimageURL,
          logo: logoURL,
          featuredImage1: featuredImage1URL,
          featuredImage2: featuredImage2URL,
        });
      } else {
        console.log('No such document!')
      }
    } catch (error) {
      console.error('Error fetching email template: ', error)
    } finally {
      setLoading(false) // Set loading to false after fetch
    }
  }

  // Fetch email template from Firestore when the component mounts
  useEffect(() => {
    fetchEmailTemplate()
  }, [])

  // Save updated data to Firestore
  const saveData = async () => {
    try {
      const docRef = await doc(
        fireStore,
        'auto-email-templates',
        'registration'
      )
      await setDoc(docRef, formData) // Save edited data to Firestore
      setEmailData(formData) // Update emailData with the saved data
      console.log('Document successfully updated!')
    } catch (error) {
      console.error('Error updating document: ', error)
    }
    setIsEditing(false) // Exit edit mode
  }

  if (loading) {
    return <div>Loading...</div> // Show loading state while fetching data
  }

  if (!emailData) {
    return <div>Error loading email template data.</div> // Error state if no data is found
  }

  const handleImageUpload = async (event, field) => {
    const file = event.target.files[0]
    if (file) {
      // Define the Firebase Storage path to overwrite existing image
      const storagePath = `auto-email-templates-images/registration/${field}`
      const storageRef = await ref(storage, storagePath)

      await uploadBytes(storageRef, file)

      setFormData({
        ...formData,
        [field]: storagePath,
      })
    }
  }

  return (
    <div>
      <div
        className='bg-cover bg-no-repeat max-w-xl font-lexend'
        style={{
          backgroundImage: `url('${emailData.bgimage}')`,
        }}
      >
        <div className='max-w-3xl mx-auto p-8 rounded-lg shadow-lg'>
          <div className='text-center mb-8'>
            {isEditing ? (
              <>
                <div className='text-[#FCC100] text-lg font-semibold'>Change Background Image</div>
                <input
                  type='file'
                  onChange={(e) => handleImageUpload(e, 'bgimage')}
                  className='text-white bg-transparent border p-2 w-full'
                />
                <div className='text-[#FCC100] text-lg font-semibold mt-2'>Change OMO logo</div>
                <input
                  type='file'
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  className='text-white bg-transparent border p-2 w-full'
                />
              </>
            ) : (
              <img
                src={emailData.logo}
                alt='Logo'
                className='max-w-[208px] mx-auto'
              />
            )}
            <h1 className='text-white text-2xl font-semibold mt-4'>
              Welcome to <span className='text-[#FCC100]'>OMO</span>
            </h1>
            {isEditing ? (
              <textarea
                type='text'
                value={formData.subHeaderText}
                onChange={(e) =>
                  setFormData({ ...formData, subHeaderText: e.target.value })
                }
                className='text-white text-lg font-normal border-[1px] border-[#FCC100] mt-4 mx-1 px-10 bg-transparent text-center w-96'
              />
            ) : (
              <h4 className='text-white text-lg font-normal border-[1px] border-[#FCC100] mt-4 mx-16 py-1'>
                {emailData.subHeaderText}
              </h4>
            )}
          </div>
          <div className='text-white mt-10'>
            {isEditing ? (
              <input
                type='text'
                value={formData.salutation}
                onChange={(e) =>
                  setFormData({ ...formData, salutation: e.target.value })
                }
                className='bg-transparent text-white border p-2 w-56 mb-4 font-normal'
              />
            ) : (
              <h5 className='text-lg font-normal'>{emailData.salutation}</h5>
            )}
            {isEditing ? (
              <textarea
                value={formData.personalizedMessage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personalizedMessage: e.target.value,
                  })
                }
                rows='4'
                className='bg-transparent text-white border p-2 w-full font-light'
              />
            ) : (
              <p className='text-lg mt-4 font-light'>{emailData.personalizedMessage}</p>
            )}
            {isEditing ? (
              <input
                type='text'
                value={formData.header2}
                onChange={(e) =>
                  setFormData({ ...formData, header2: e.target.value })
                }
                className='bg-transparent text-white border font-normal p-2 mb-4 mt-8 text-lg border-[#FCC100] flex mx-auto py-1 text-center'
              />
            ) : (
              <h4 className='mb-6 text-[#FCC100] mt-6 text-lg font-normal border-[1px] border-[#FCC100] mx-16 py-1 text-center'>
                {emailData.header2}
              </h4>
            )}

            <p className='text-lg'>
              <span className='text-[#FCC100] font-semibold'>Explore: </span>
              {isEditing ? (
                <textarea
                  value={formData.gettingStartedText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gettingStartedText: e.target.value,
                    })
                  }
                  className='text-white bg-transparent border p-2 w-full font-light'
                />
              ) : (
                <span className='font-light'>{emailData.gettingStartedText}</span>
              )}
            </p>
            {isEditing ? (
              <>
                <div className='text-[#FCC100] text-lg font-normal mt-2'>Change Image</div>
                <input
                  type='file'
                  onChange={(e) => handleImageUpload(e, 'featuredImage1')}
                  className='text-white bg-transparent border p-2 w-full font-light'
                />
              </>
            ) : (
              <img
                src={emailData.featuredImage1}
                alt='Featured Image 1'
                className='w-full mt-4 rounded-lg'
              />
            )}
            <p className='text-lg'>
              <span className='text-[#FCC100] font-semibold'>
                Secure Transactions:{' '}
              </span>
              {isEditing ? (
                <textarea
                  value={formData.featureText}
                  onChange={(e) =>
                    setFormData({ ...formData, featureText: e.target.value })
                  }
                  className='text-white bg-transparent border p-2 w-full font-light'
                />
              ) : (
                <span className='font-light'>{emailData.featureText}</span>
              )}
            </p>
            {isEditing ? (
              <>
                <div className='text-[#FCC100] text-lg font-semibold mt-2'>Change Image</div>
                <input
                  type='file'
                  onChange={(e) => handleImageUpload(e, 'featuredImage2')}
                  className='text-white bg-transparent border p-2 w-full'
                />
              </>
            ) : (
              <img
                src={emailData.featuredImage2}
                alt='Featured Image 2'
                className='w-full mt-4 rounded-lg'
              />
            )}
          </div>
        </div>
      </div>

      <div className='text-center my-4'>
        <button
          onClick={() => {
            if (isEditing) saveData()
            setIsEditing(!isEditing)
          }}
          className='bg-[#1976D2] text-white py-2 px-8 rounded hover:bg-[#0F5CA6]'
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
    </div>
  )
}

export default RegistrationAutoEmail