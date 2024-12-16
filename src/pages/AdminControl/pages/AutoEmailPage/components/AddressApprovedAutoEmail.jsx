import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import app from '../../../../../config/firebase'

const AddressApprovedAutoEmail = () => {
  const fireStore = getFirestore(app)
  const storage = getStorage(app)
  const [emailData, setEmailData] = useState(null) // Store email template data
  const [formData, setFormData] = useState(null) // Editable form data
  const [loading, setLoading] = useState(true) // Loading state
  const [isEditing, setIsEditing] = useState(false) // Edit mode toggle

  const fetchEmailTemplate = async () => {
    try {
      const docRef = await doc(fireStore, 'auto-email-templates', 'addressApproved')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()

        // Fetch secure URLs dynamically for each image field
        const bgimageRef = ref(storage, data.bgimage)
        const bgimageURL = await getDownloadURL(bgimageRef)

        const logoRef = ref(storage, data.logo)
        const logoURL = await getDownloadURL(logoRef)

        const featuredImage1Ref = ref(storage, data.featuredImage1)
        const featuredImage1URL = await getDownloadURL(featuredImage1Ref)

        setEmailData({
          ...data,
          bgimage: bgimageURL,
          logo: logoURL,
          featuredImage1: featuredImage1URL,
        })
        setFormData({
          ...data,
          bgimage: bgimageURL,
          logo: logoURL,
          featuredImage1: featuredImage1URL,
        })
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
      const docRef = await doc(fireStore, 'auto-email-templates', 'addressApproved')
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
      const storagePath = `auto-email-templates-images/addressApproved/${field}`
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
                <div className='text-[#FCC100] text-lg font-semibold'>
                  Change Background Image
                </div>
                <input
                  type='file'
                  onChange={(e) => handleImageUpload(e, 'bgimage')}
                  className='text-white bg-transparent border p-2 w-full'
                />
                <div className='text-[#FCC100] text-lg font-semibold mt-2'>
                  Change OMO logo
                </div>
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
              <p className='text-lg mt-4 font-light'>
                {emailData.personalizedMessage}
              </p>
            )}
            {isEditing ? (
              <>
                <div className='text-[#FCC100] text-lg font-normal mt-2'>
                  Change Image
                </div>
                <input
                  type='file'
                  onChange={(e) => handleImageUpload(e, 'featuredImage1')}
                  className='text-white bg-transparent border p-2 w-full font-light mb-6'
                />
              </>
            ) : (
              <img
                src={emailData.featuredImage1}
                alt='Featured Image 1'
                className='w-full mt-4 rounded-lg mb-8'
              />
            )}
            <p className='text-lg'>
              <span className='text-[#FCC100] font-semibold'>
                Full Access:{' '}
              </span>
              {isEditing ? (
                <textarea
                  value={formData.FullAccessText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      FullAccessText: e.target.value,
                    })
                  }
                  className='text-white bg-transparent border p-2 w-full font-light'
                />
              ) : (
                <span className='font-light'>{emailData.FullAccessText}</span>
              )}
            </p>

            <p className='text-lg'>
              <span className='text-[#FCC100] font-semibold'>
                Secure Experience:{' '}
              </span>
              {isEditing ? (
                <textarea
                  value={formData.SecureExperienceText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      SecureExperienceText: e.target.value,
                    })
                  }
                  className='text-white bg-transparent border p-2 w-full font-light'
                />
              ) : (
                <span className='font-light'>{emailData.SecureExperienceText}</span>
              )}
            </p>

            <p className='text-lg mb-6'>
              <span className='text-[#FCC100] font-semibold'>
                Ready to Go:{' '}
              </span>
              {isEditing ? (
                <textarea
                  value={formData.ReadyToGoText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ReadyToGoText: e.target.value,
                    })
                  }
                  className='text-white bg-transparent border p-2 w-full font-light'
                />
              ) : (
                <span className='font-light'>{emailData.ReadyToGoText}</span>
              )}
            </p>

            {isEditing ? (
              <textarea
                value={formData.MainText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    MainText: e.target.value,
                  })
                }
                rows='4'
                className='text-white bg-transparent border p-2 w-full font-light text-lg'
              />
            ) : (
              <span className='text-white whitespace-pre-line text-lg font-light'>
                {emailData.MainText}
              </span>
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

export default AddressApprovedAutoEmail
