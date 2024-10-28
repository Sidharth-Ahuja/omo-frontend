import React from "react";
import ImagesComp from "../ImagesComp";
import RealTimeCounter from "../RealTimeCounter";
import RealTimeUsers from "../RealTimeUsers";

const Timer = (props) => {

  return (
    <div style={{position:"relative"}}>
      <div style={{position: "absolute",top: "calc(7vh + 16px)", right: "16px",zIndex:1}}><RealTimeCounter /></div>
      <div style={{position: "absolute",top: "calc(7vh + 16px)", left: "16px",zIndex:1}}><RealTimeUsers/></div>
      <ImagesComp {...props}/>
    </div>
  );
};

export default Timer;
