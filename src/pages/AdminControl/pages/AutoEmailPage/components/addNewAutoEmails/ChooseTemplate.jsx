import React from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

const ChooseTemplate = ({ selectedTemplate, setSelectedTemplate }) => {
  return (
    <div>
      <Stack direction='row' spacing={2}>
        <Button
          variant={selectedTemplate === 1 ? 'contained' : 'outlined'}
          onClick={() => setSelectedTemplate(1)}
          sx={{ padding: '0.45rem' }}
        >
          Template 1
        </Button>
        <Button
          variant={selectedTemplate === 2 ? 'contained' : 'outlined'}
          onClick={() => setSelectedTemplate(2)}
          sx={{ padding: '0.45rem' }}
        >
          Template 2
        </Button>
        <Button
          variant={selectedTemplate === 3 ? 'contained' : 'outlined'}
          onClick={() => setSelectedTemplate(3)}
          sx={{ padding: '0.45rem' }}
        >
          Template 3
        </Button>
      </Stack>
    </div>
  )
}

export default ChooseTemplate
