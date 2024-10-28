import "./FullScreenCard.css";
import React from "react"

const FullScreenCard = (props: any) => {
    const { timer, currentImageSet, gifPlayingImage, playEndingVideo, isEndingVideoLoaded, handleImageClick, hasSelectedSide, showResultGif, leftPercentage, rightPercentage,isFlipping,userWon,winningSide,winningAmount, showCoin,currentSetIndex} = props;
    
    return <div style={(currentImageSet?.[0] as any)?.fullBackground ? { backgroundImage: `url(${(currentImageSet?.[0] as any)?.fullBackground})`, backgroundSize: "100% 100%" } : {background:"#e0e0e0"}} className={`imageContainer ${isFlipping ? 'flip-animation' : ''} removeSpacing ${timer !== null && timer <= 3 ? "resistClick" : ""}`}>
        {(currentImageSet?.[0] as any)?.fullBackground && <div className="dimBg" />}
        {currentImageSet.map((image: any, index: number) => {
            const isPlayingGif = !!gifPlayingImage && image.alt.includes(gifPlayingImage);
            const imageSrc = isPlayingGif
                ? (playEndingVideo && isEndingVideoLoaded ? gifPlayingImage === "Left" ? image.endingSrc : image.endingRightSrc : image.src.replace('.png', `${gifPlayingImage}.gif`))
                : image.src;
            return (
                imageSrc && (
                    <div style={{ overflow: "hidden", position: "relative", display: "flex", justifyContent: "center" }}>
                        <div onClick={() => handleImageClick("Left")} style={{ position: "absolute", background: "transparent", width: "50%", height: "100%", top: "0", left: "0", display: "flex", justifyContent: "center" }} >
                            {showResultGif && <div className="percentages" >{leftPercentage + "%"}</div>}
                        </div>
                        <div onClick={() => handleImageClick("Right")} style={{ position: "absolute", background: "transparent", width: "50%", height: "100%", top: "0", right: "0", display: "flex", justifyContent: "center" }} >
                            {showResultGif && <div className="percentages">{rightPercentage + "%"}</div>}
                        </div>
                        <img
                            key={index}
                            src={imageSrc}
                            alt={image.alt}
                            style={{ width: 'calc(100% + 2px)', height: 'auto', maxWidth: "unset" }}
                            className={`image ${isPlayingGif ? 'hiddenGif' : ''}`}
                        />
                    </div>
                )
            );
        })}



        {/* Show lock.gif if a side is selected, otherwise show spectator.gif */}
        {timer !== null && timer <= 3 && (hasSelectedSide ? timer >= 1 : true) && (
            <div className="locked">
                <img
                    src={hasSelectedSide ? '/stills/lock.gif' : '/stills/spectator.gif'}
                    alt={hasSelectedSide ? 'Selection Locked' : 'Spectator Mode'}
                />
            </div>
        )}
 {showResultGif && hasSelectedSide && userWon && winningSide && winningAmount && <><img
                        src={`/stills/coin_${gifPlayingImage.includes('Left') ? 'Left' : 'Right'}.gif?t=${currentSetIndex}`}
                        alt="Coin GIF"
                        style={{ width: '100%' }}
                        className={`locked ${!showCoin ? "hideCoin" : ""}`}
                    />
                        <div className={`showWinningAmount ${winningSide}Direction`}>
                            ${winningAmount}
                        </div>
                    </>} 


        {showResultGif && (!userWon || !showCoin) && hasSelectedSide && <img
            src={showResultGif}
            alt="Result GIF"
            style={{ width: '100%' }}
            className="fullScreenGif locked"
        />}
    </div>
}

export default FullScreenCard;