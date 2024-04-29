import React from 'react'

export default function RightDarkButton({title}) {
  return (
    <div className={' font-bold ' + (title === "Loading..." || title === "Withdraw"   ? 
    "withdrawDesign" : "greenButton"
    )}>
      {title}
    </div>
  )
}
