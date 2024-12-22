import React from 'react'
import Template1 from './Template1'
import Template2 from './Template2'
import Template3 from './Template3'

const ShowTemplate = ({ selectedTemplate }) => {
  return (
    <div>
      {/* Keep all components mounted but only show the one matching `sideBarMenu` */}
      <div style={{ display: selectedTemplate === 1 ? 'block' : 'none' }}>
        <Template1 />
      </div>
      <div style={{ display: selectedTemplate === 2 ? 'block' : 'none' }}>
        <Template2 />
      </div>
      <div style={{ display: selectedTemplate === 3 ? 'block' : 'none' }}>
        <Template3 />
      </div>
    </div>
  )
}

export default ShowTemplate
