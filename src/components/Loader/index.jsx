import React from "react";
import "./Loader.css";
import loadingIcon from "../../assets/gif/Bitcoin-loading.gif";

const Loader = () => {
        return <div className="loaderOuter">
            <div className="loaderInner">
                <img 
                src={loadingIcon}
                className="loaderimg"
                />
                <p>Connecting you to the Live Game...</p>
            </div>

        </div>
}

export default Loader;