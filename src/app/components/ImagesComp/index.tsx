"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import "./ImagesComp.css";
import { database1, ref, onValue, set } from "../../firebase-int";
import { runTransaction } from "firebase/database";
import FullScreenCard from "./components/FullScreenCard"; 
import { imageSets } from "./constants";
import React from "react";
import { useNavigate } from "react-router-dom";


const ImagesComp = (props) => {
    const {winHandler, loseHandler, winningAmount,winningSide} = props;
    const [currentSetIndex, setCurrentSetIndex] = useState<number | null>(null);
    const [gifPlayingImage, setGifPlayingImage] = useState<string>("");
    const [playEndingVideo, setPlayEndingVideo] = useState<boolean>(false);
    const [isEndingVideoLoaded, setIsEndingVideoLoaded] = useState<boolean>(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [, setIsLocked] = useState<boolean>(false);
    const [hasSelectedSide, setHasSelectedSide] = useState<boolean>(false);
    const [endingAudio, setEndingAudio] = useState<HTMLAudioElement | null>(null);
    const [preloadedEndingAudio, setPreloadedEndingAudio] = useState<{ [key: string]: HTMLAudioElement }>({});
    const [preloadedGifs, setPreloadedGifs] = useState<{ [key: string]: HTMLImageElement }>({});
    const [clickCounts, setClickCounts] = useState<{ left: number; right: number }>({ left: 0, right: 0 });
    const [timer, setTimer] = useState<number | null>(null);
    const [isRoundFinished, setIsRoundFinished] = useState<boolean>(false);
    const [showCoin,setShowCoin] = useState(false);
    const [showResultGif, setShowResultGif] = useState<string | null>(null); // To store win/lose GIF
    const [, setResultSide] = useState<string | null>(null); // To store which side to show the result GIF
    const [isFlipping, setIsFlipping] = useState<boolean>(false); // New state to track flip animation
    const [userWon, setUserWon] = useState<boolean>(false);
    const [spectatorCount, setSpectatorCount] = useState<number>(0);
    const currentImageSet = useMemo(() => currentSetIndex !== null ? imageSets[currentSetIndex] : [], [currentSetIndex]);
    const endingVideoRef = useRef<any>(null);


    const navigate = useNavigate();


    useEffect(() => {
        const clickCountsRef = ref(database1, 'clickCounts');

        // Listen for real-time updates to total click counts from Firebase
        const unsubscribeClickCounts = onValue(clickCountsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setClickCounts({
                    left: data.left || 0,
                    right: data.right || 0,
                });
            }
        });

        return () => unsubscribeClickCounts();
    }, []);

    useEffect(() => {
        if (spectatorCount >= 3) {
            // Redirect the user to a deposit page
            navigate("/deposit")
        }
    }, [spectatorCount]);

    // useEffect(() => {
    //     if (currentSetIndex !== null) {
    //         setIsFlipping(true); // Start the flip animation
    //         setTimeout(() => {
    //             setIsFlipping(false); // End the flip animation after 1 second
    //         }, 1000); // 1 second for the animation
    //     }
    // }, [currentSetIndex]);

    useEffect(() => {
            if(showCoin){
                setTimeout(() => setShowCoin(false),3000);
            }
    },[showCoin])

    useEffect(() => {
        const checkRoundEnd = async () => {
            if (timer === 0 && !isRoundFinished) {
                setIsRoundFinished(true); // Stop the timer
                const totalClicks = clickCounts.left + clickCounts.right;
                const leftPercentage = totalClicks > 0 ? Math.round((clickCounts.left / totalClicks) * 100) : 0;
                const rightPercentage = totalClicks > 0 ? Math.round((clickCounts.right / totalClicks) * 100) : 0;

                // Determine the winner: the side with the lesser percentage wins
                const userSide = gifPlayingImage.includes('Left') ? 'left' : 'right';
                const isWinner = (userSide === 'left' && leftPercentage < rightPercentage) ||
                (userSide === 'right' && rightPercentage < leftPercentage);
                setUserWon(isWinner);
                const isDraw = leftPercentage === rightPercentage && !!gifPlayingImage;
                // Show the result GIF on the selected side
                setResultSide(userSide);
                if(winningSide)
                setShowCoin(true);
                setShowResultGif(isDraw ? '/stills/draw.gif' : isWinner ? '/stills/you_win.gif' : '/stills/you_lose.gif'); // Win or Lose GIF
                if(!isDraw && hasSelectedSide){
                    if(isWinner){
                        winHandler();
                    } else {
                        loseHandler()};
                }


                if (endingAudio) {
                    endingAudio.pause();
                    endingAudio.currentTime = 0;
                }

                 // Play respective result audio
                const resultAudio = new Audio(isWinner ? '/stills/you_win.mp3' : '/stills/you_lose.mp3');
                if(!isDraw && hasSelectedSide)
                    resultAudio.play();

                // Show results for 3 seconds and then restart the timer
                await new Promise((resolve) => setTimeout(resolve, 5000));

                setTimeout(async() => {
                const newIndex = !isDraw ? ((currentSetIndex || 0)  + 1) % imageSets.length : ((currentSetIndex || 0)  - 1) % imageSets.length; 
                setGifPlayingImage("");
                setPlayEndingVideo(false);
                setIsEndingVideoLoaded(false);
                // Update the image set index in Firebase
                const indexRef = ref(database1, 'currentImageSetIndex');
                await set(indexRef, newIndex);
                }, 200);

                if (!hasSelectedSide) {
                    setSpectatorCount(prev => prev + 1);
                } else {
                    setSpectatorCount(0);
                }
                
            
                // Clear the result GIF and restart the timer
                setShowResultGif(null);
                setResultSide(null); // Clear the result side
                setIsRoundFinished(false); // Restart the timer
            }
        };

        checkRoundEnd();
    }, [timer]);

    useEffect(() => {
        if (timer !== null && timer % 15 === 0 && timer !== 0) {
            const clickCountsRef = ref(database1, 'clickCounts');
            set(clickCountsRef, { left: 0, right: 0 }); // Reset click counts
        }
    }, [timer]);


    useEffect(() => {
        const updateImageSetIndex = async () => {
            if (timer !== null && currentSetIndex !== null) {
                if (timer <= 3) {
                    if (hasSelectedSide) {
                        setIsLocked(true);
                    } else {
                        setIsLocked(false);  // Ensure the lock is not shown if no side is selected
                    }
                } else {
                    setIsLocked(false);
                }

                if (timer % 15 === 0 && timer !== 0) {
                    // const newIndex = (currentSetIndex + 1) % imageSets.length;
                    // setIsFlipping
                    // setCurrentSetIndex(newIndex);
                    //  // Reset side selection for the new set

                    // // Update the image set index in Firebase
                    // const indexRef = ref(database1, 'currentImageSetIndex');
                    // await set(indexRef, newIndex);

                    // Stop any currently playing ending audio
                    setHasSelectedSide(false);  // Reset side selection for the new set
                    
                   

                    if (endingAudio) {
                        endingAudio.pause();
                        endingAudio.currentTime = 0;
                    }
                }
            }
        };

        updateImageSetIndex();
    }, [timer]);


    // Fetch and sync the current image set index and timer from Firebase
    useEffect(() => {
        const indexRef = ref(database1, 'currentImageSetIndex');
        const timerRef = ref(database1, 'timer');

        const onIndexChange = (snapshot: any) => {
            const data = snapshot.val();
            if (data !== null) {
                setCurrentSetIndex(data);
            } else {
                set(indexRef, 0);
            }
        };

        const onTimerChange = (snapshot: any) => {
            const data = snapshot.val();
            setTimer(data);
        };

        const unsubscribeIndex = onValue(indexRef, onIndexChange);
        const unsubscribeTimer = onValue(timerRef, onTimerChange);

        return () => {
            unsubscribeIndex(); // Clean up index listener
            unsubscribeTimer(); // Clean up timer listener
        };
    }, []);

    // Reset click counts and update image set when the round ends (after the 3-second result display)
    useEffect(() => {
        const handleNewRound = async () => {
            if (!isRoundFinished && timer === 0) {
                // Reset click counts and update image set after the result display
                const clickCountsRef = ref(database1, 'clickCounts');
                await set(clickCountsRef, { left: 0, right: 0 }); // Reset click counts

            }
        };

        handleNewRound();
    }, [isRoundFinished]);




    useEffect(() => {
        if (gifPlayingImage) {
            const endingImage = currentImageSet.find(image => image.alt.includes(gifPlayingImage)) || '';

            if(endingVideoRef.current){
                clearTimeout(endingVideoRef.current);
            }

            if (endingImage) {
                if(endingImage.fullScreen) {
                    const img = new Image();
                    img.src = endingImage.endingSrc.replace("left","right");
                    img.onload = () => {
                        setIsEndingVideoLoaded(true);
                        endingVideoRef.current = setTimeout(() => setPlayEndingVideo(true), currentImageSet?.[0]?.duration || 2200); // Short delay to avoid flicker
                    }; 
                }
                const img = new Image();
                img.src = endingImage.endingSrc;
                img.onload = () => {
                    clearTimeout(endingVideoRef.current);
                    setIsEndingVideoLoaded(true);
                    endingVideoRef.current = setTimeout(() => setPlayEndingVideo(true), currentImageSet?.[0]?.duration || 2200); // Short delay to avoid flicker
                };
            }

            // Stop any currently playing audio
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }

            // Play audio for the current image
            const element: any = currentImageSet.find(image => image.alt.includes(gifPlayingImage));
            const audioSrc: any = (gifPlayingImage === "Right" && currentImageSet?.[0]?.fullScreen) ? element?.rightAudioSrc : element?.audioSrc;
            if (audioSrc) {
                const newAudio = new Audio(audioSrc);
                newAudio.play();
                setAudio(newAudio);
            }
        } else if (audio) {
            // Stop the audio when no GIF is playing
            audio.pause();
            audio.currentTime = 0;
        }
    }, [gifPlayingImage, currentSetIndex]);

    useEffect(() => {
        // Handle audio for the ending GIF
        if (playEndingVideo) {
            const endingElement: any = currentImageSet.find(image => image.alt.includes(gifPlayingImage)) || '';
            const endingAudioSrc: any = (gifPlayingImage === "Right" && currentImageSet?.[0]?.fullScreen) ? endingElement?.endingRightAudioSrc : endingElement?.endingAudioSrc;

            if (endingAudioSrc) {
                const preloadedAudio = preloadedEndingAudio[gifPlayingImage+"-ending"];
                if (preloadedAudio) {
                    preloadedAudio.play();
                    setEndingAudio(preloadedAudio);
                } else {
                    const newEndingAudio = new Audio(endingAudioSrc);
                    newEndingAudio.play();
                    setEndingAudio(newEndingAudio);
                }
            }
        } else if (endingAudio) {
            // Stop the ending audio when not playing
            endingAudio.pause();
            endingAudio.currentTime = 0;
        }
    }, [playEndingVideo]);

    useEffect(() => {
        const clickCountsRef = ref(database1, 'clickCounts');
        const unsubscribeClickCounts = onValue(clickCountsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setClickCounts(data);
            }
        });

        return () => {
            unsubscribeClickCounts(); // Clean up listener
        };
    }, []);

    const totalClicks = clickCounts.left + clickCounts.right;
    const leftPercentage = totalClicks > 0 ? Math.round((clickCounts.left / totalClicks) * 100) : 0;
    const rightPercentage = totalClicks > 0 ? Math.round((clickCounts.right / totalClicks) * 100) : 0;

    const handleImageClick = (alt: string) => {
        if (timer !== null && timer > 3 && !isRoundFinished) {
            const side = alt.includes('Left') ? 'left' : 'right';
             // Stop and reset any currently playing audio
             if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }

            // Play audio for the clicked image
            const element: any = currentImageSet.find(image => image.alt.includes(alt));
            const audioSrc: any = (alt === "Right" && currentImageSet?.[0]?.fullScreen) ? element?.rightAudioSrc : element?.audioSrc;
            if (audioSrc) {
                const newAudio = new Audio(audioSrc);
                newAudio.play();
                setAudio(newAudio);
            }
            
            // Track the previous side the user clicked on
            const previousSide = gifPlayingImage && (gifPlayingImage.includes('Left') ? 'left' : 'right');

            setHasSelectedSide(true);  // Mark that a side has been selected
            setPlayEndingVideo(false);
            setIsEndingVideoLoaded(false);
            setGifPlayingImage(alt);
            const clickCountsRef = ref(database1, `clickCounts`);

            // Use Firebase transaction to atomically increment the count for the selected side
            runTransaction(clickCountsRef, (prevClicks) => {
                let tempObj = {
                    ...prevClicks,
                }

                if (side !== previousSide) {
                    tempObj = { ...tempObj, [side]: (prevClicks[side] || 0) + 1 }
                    if (previousSide !== "") {
                        tempObj = { ...tempObj, [previousSide]: prevClicks[previousSide] - 1 }
                    }
                }

                return tempObj;
            })

        }
    };

    if(currentImageSet?.[0]?.fullScreen)
    return   <FullScreenCard 
    {...{winningAmount,winningSide,currentSetIndex,timer,isFlipping, currentImageSet, gifPlayingImage, playEndingVideo, isEndingVideoLoaded, handleImageClick, hasSelectedSide, showResultGif, leftPercentage, rightPercentage,userWon,showCoin}}
    />

    return (
        <div className={`imageContainer ${isFlipping ? 'flip-animation' : ''} ${timer !== null && timer <= 3 ? "resistClick" : ""}`} style={(currentImageSet?.[0] as any)?.fullBackground ? {backgroundImage : `url(${(currentImageSet?.[0] as any)?.fullBackground})` ,backgroundSize: "100% 100%"} : {background: (currentImageSet?.[0] as any)?.fullBackgroundColor ||  "#e0e0e0"}}>
            {(currentImageSet?.[0] as any)?.fullBackground && <div className="dimBg"/>}
            {currentImageSet.map((image, index) => {
                const isPlayingGif = gifPlayingImage === image.alt;
                const imageSrc = isPlayingGif
                    ? (playEndingVideo && isEndingVideoLoaded ? image.endingSrc : image.src.replace('.png', '.gif'))
                    : image.src;
                const fullScreenSideClicked = hasSelectedSide &&  image.fullScreen;

                return (
                    imageSrc && (
                        <div style={{ overflow: "hidden", position: "relative", display: "flex", justifyContent: "center" }} className={fullScreenSideClicked && gifPlayingImage.toLowerCase().includes(image.placement) ? "fullSize" : ""}>
                            <img
                                key={index}
                                src={imageSrc}
                                alt={image.alt}
                                style={{ width: 'calc(100% + 2px)', height: 'auto', maxWidth: "unset" }}
                                onClick={() => handleImageClick(image.alt)}
                                className={`image ${isPlayingGif ? 'hiddenGif' : ''}  ${image.fullScreen ? image.alt.includes("Left") ? "removeRightBorder" : "removeLeftBorder" :""} ${fullScreenSideClicked ? "": ""}`}
                            />
                            {showResultGif && <div className="percentages">{image.alt.includes("Left") ? leftPercentage + "%" : rightPercentage + "%"}</div>}
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


            {showResultGif && (!userWon || !showCoin) &&  hasSelectedSide && <img
                src={showResultGif}
                alt="Result GIF"
                style={{ width: '100%' }}
                className="fullScreenGif locked"
            />}
        </div>
    );
};

export default ImagesComp;
