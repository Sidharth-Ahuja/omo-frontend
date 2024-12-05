import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore'
import app from '../../../../../config/firebase'

const RegistrationAutoEmail = () => {
  const fireStore = getFirestore(app)
  const [emailData, setEmailData] = useState(null) // Store email template data
  const [formData, setFormData] = useState(null) // Editable form data
  const [loading, setLoading] = useState(true) // Loading state
  const [isEditing, setIsEditing] = useState(false) // Edit mode toggle

  useEffect(() => {
    // Fetch email template from Firestore when the component mounts
    const fetchEmailTemplate = async () => {
      try {
        const docRef = doc(fireStore, 'auto-email-templates', 'registration')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setEmailData(docSnap.data()) // Set data if document exists
          setFormData(docSnap.data()) // Initialize formData with fetched data
        } else {
          console.log('No such document!')
        }
      } catch (error) {
        console.error('Error fetching email template: ', error)
      } finally {
        setLoading(false) // Set loading to false after fetch
      }
    }

    fetchEmailTemplate()
  }, [])

  // Save updated data to Firestore
  const saveData = async () => {
    try {
      const docRef = doc(fireStore, 'auto-email-templates', 'registration')
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

  return (
    <div>
      <div
        className='bg-cover bg-no-repeat max-w-xl'
        style={{
          backgroundImage:
            "url('https://i.ibb.co/thbp4L5/background-design.jpg')",
        }}
      >
        <div className='max-w-3xl mx-auto p-8 rounded-lg shadow-lg'>
          <div className='text-center mb-8'>
            <img
              src='https://omov8-bebd1.web.app/assets/omo-logo-389de2f2.png'
              alt='OMO Logo'
              className='max-w-[208px] mx-auto'
            />
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
                className='text-white text-lg font-semibold border-[1px] border-[#FCC100] mt-4 mx-1 px-10 bg-transparent text-center w-96'
              />
            ) : (
              <h4 className='text-white text-lg font-semibold border-[1px] border-[#FCC100] mt-4 mx-16 py-1'>
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
                className='bg-transparent text-white border p-2 w-56 mb-4'
              />
            ) : (
              <h5 className='text-lg font-semibold'>{emailData.salutation}</h5>
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
                className='bg-transparent text-white border p-2 w-full'
              />
            ) : (
              <p className='text-lg mt-4'>{emailData.personalizedMessage}</p>
            )}
            {isEditing ? (
              <input
                type='text'
                value={formData.header2}
                onChange={(e) =>
                  setFormData({ ...formData, header2: e.target.value })
                }
                className='bg-transparent text-white border p-2 mb-4 mt-8 text-lg border-[#FCC100] flex mx-auto py-1 text-center'
              />
            ) : (
              <h4 className='mb-4 text-[#FCC100] mt-8 text-lg font-semibold border-[1px] border-[#FCC100] mx-16 py-1 text-center'>
                {emailData.header2}
              </h4>
            )}
            
              <p className='text-lg'>
                <span className='text-[#FCC100] font-bold'>Explore: </span>
                {isEditing ? (
              <textarea
                value={formData.gettingStartedText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gettingStartedText: e.target.value,
                  })
                }
                className='text-white bg-transparent border p-2 w-full'
              />
            ) : (
              <span>
                {emailData.gettingStartedText}
              </span>
            )}
              </p>
            <img
              src='https://omov8-bebd1.web.app/assets/FirstTemplateFirst-2e7f4d9a.png'
              alt='Feature 1 Image'
              className='w-full mt-4 rounded-lg'
            />
            <p className='text-lg'>
              <span className='text-[#FCC100] font-bold'>
                Secure Transactions:{' '}
              </span>
              {isEditing ? (
                <textarea
                  value={formData.featureText}
                  onChange={(e) =>
                    setFormData({ ...formData, featureText: e.target.value })
                  }
                  className='text-white bg-transparent border p-2 w-full'
                />
              ) : (
                emailData.featureText
              )}
            </p>
            <img
              src='https://omov8-bebd1.web.app/assets/FirstTemplatesecond-39ba3c79.png'
              alt='Feature 2 Image'
              className='w-full mt-4 rounded-lg'
            />
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
