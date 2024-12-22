import React, { useState } from 'react'
import ChooseTemplate from './addNewAutoEmails/ChooseTemplate'
import ShowTemplate from './addNewAutoEmails/ShowTemplate'

const AddNewAutoEmail = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(1)
  return (
    <div>
      <div className='flex justify-center mb-6'>
        <ChooseTemplate
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
        />
      </div>
      <ShowTemplate selectedTemplate={selectedTemplate} />
    </div>
  )
}

export default AddNewAutoEmail
