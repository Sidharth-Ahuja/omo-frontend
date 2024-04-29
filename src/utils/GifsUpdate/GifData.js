import AdamEveThumbnail from "../../assets/gif/Sorted Gifs/Adam&eve VS Evolution/Adam & Eve/adam thumbnail.png"
import AdamPressed from "../../assets/gif/Sorted Gifs/Adam&eve VS Evolution/Adam & Eve/adam-press.gif"
import AdamWait from "../../assets/gif/Sorted Gifs/Adam&eve VS Evolution/Adam & Eve/adam-waiting.gif"
import EvoultionThumbnail from "../../assets/gif/Sorted Gifs/Adam&eve VS Evolution/Evolution/evolution.png"
import EvoultionPressed from "../../assets/gif/Sorted Gifs/Adam&eve VS Evolution/Evolution/evolution-press.gif";
import EvoultionWaiting from "../../assets/gif/Sorted Gifs/Adam&eve VS Evolution/Evolution/evolution-waiting.gif";
import CandleOffThumbnail from "../../assets/gif/Sorted Gifs/candles/Lights off/non light.png"
import CandleOffPressed from "../../assets/gif/Sorted Gifs/candles/Lights off/non-light-press.gif"
import CandleOffWaiting from "../../assets/gif/Sorted Gifs/candles/Lights off/non-light-waiting.gif"
import candleOnThumbnail from "../../assets/gif/Sorted Gifs/candles/lights Up/light up.png"
import candleOnPressed from "../../assets/gif/Sorted Gifs/candles/lights Up/light-up-press (1).gif"
import candleOnWaiting from "../../assets/gif/Sorted Gifs/candles/lights Up/ligth-up-waiting.gif"
import goodThumbnail from "../../assets/gif/Sorted Gifs/Good vs Evil/Good/good thumbnail.png"
import goodPressed from "../../assets/gif/Sorted Gifs/Good vs Evil/Good/good-press.gif"
import goodWaiting from "../../assets/gif/Sorted Gifs/Good vs Evil/Good/good-waiting.gif"
import badThumbnail from "../../assets/gif/Sorted Gifs/Good vs Evil/Evil/bad thumbnail.png"
import badPressed from "../../assets/gif/Sorted Gifs/Good vs Evil/Evil/bad-press.gif"
import badWaiting from "../../assets/gif/Sorted Gifs/Good vs Evil/Evil/bad-waiting.gif"
import healthyThumbnail from "../../assets/gif/Sorted Gifs/Healthy vs Fast Food/Healthy/fruit thumbnail.png"
import healthyPressed from "../../assets/gif/Sorted Gifs/Healthy vs Fast Food/Healthy/fruit-press.gif"
import healthyWaiting from "../../assets/gif/Sorted Gifs/Healthy vs Fast Food/Healthy/fruit-waiting.gif"
import fastThumbail from "../../assets/gif/Sorted Gifs/Healthy vs Fast Food/Fast Food/fast food Thumbnail.png"
import fastPressed from "../../assets/gif/Sorted Gifs/Healthy vs Fast Food/Fast Food/fast-food-press.gif"
import fastWaiting from "../../assets/gif/Sorted Gifs/Healthy vs Fast Food/Fast Food/fast-food-waiting.gif"
import coldThumbnail from "../../assets/gif/Sorted Gifs/Hot vs Cold/cold/Cold thumbnail.png"
import coldPressed from "../../assets/gif/Sorted Gifs/Hot vs Cold/cold/Cold_Press.gif"
import coldWaiting from "../../assets/gif/Sorted Gifs/Hot vs Cold/cold/Cold_Waiting.gif"
import  hotThumbnail from "../../assets/gif/Sorted Gifs/Hot vs Cold/hot/Hot Thumbnail.png"
import hotPressed from "../../assets/gif/Sorted Gifs/Hot vs Cold/hot/Hot_Press.gif"
import hotWaiting from "../../assets/gif/Sorted Gifs/Hot vs Cold/hot/Hot_Waiting.gif"
import thorThumbnail from "../../assets/gif/Sorted Gifs/Thor vs Loki/Thor/Thor Thumbnail.gif"
import thorPressed from "../../assets/gif/Sorted Gifs/Thor vs Loki/Thor/Thor press.gif"
import thorWaiting from "../../assets/gif/Sorted Gifs/Thor vs Loki/Thor/Thor waiting.gif"
import lokiThumbnail from "../../assets/gif/Sorted Gifs/Thor vs Loki/Loki/loki thumbnail.gif"
import lokiPressed from "../../assets/gif/Sorted Gifs/Thor vs Loki/Loki/loki press.gif"
import lokiWaiting from "../../assets/gif/Sorted Gifs/Thor vs Loki/Loki/loki Waiting.gif"
import UpThumbnail from "../../assets/gif/Sorted Gifs/Up vs Down/up/up-press.gif"
import UpPressed from "../../assets/gif/Sorted Gifs/Up vs Down/up/up-waiting.gif";
import DownThumbnail from "../../assets/gif/Sorted Gifs/Up vs Down/down/down-press.gif"
import DownPressed  from "../../assets/gif/Sorted Gifs/Up vs Down/down/down-waiting.gif"
import WinnerOneBTC from "../../assets/gif/Conclusion gifs/Coin_Left.gif"
import WinnerTwoBTC from "../../assets/gif/Conclusion gifs/Coin_Right.gif"
import YouWin from "../../assets/gif/Conclusion gifs/You Win.gif"
import YouLose from "../../assets/gif/Conclusion gifs/You lose.gif"
import Draw from "../../assets/gif/Conclusion gifs/draw2.gif"
import BonusWinner from "../../assets/gif/Conclusion gifs/you win BONUS GIF.gif"
import BonusRound from "../../assets/gif/Conclusion gifs/BONUS ROUND.gif"
import BonusRoundEffect from "../../assets/gif/Conclusion gifs/bonus round effect around mobile screen.gif"
import FreeRound from "../../assets/gif/Conclusion gifs/FREE ROUND.gif"
import FreeRoundEffect from '../../assets/gif/Conclusion gifs/free roundd.gif'
import Lock from "../../assets/gif/Conclusion gifs/Lock.gif"
import Spectator from "../../assets/gif/Conclusion gifs/Spectator.gif"


const time1 = 2000;
const time2 = 3000;

export const GifData = [
    {
        thummbnailOne : CandleOffThumbnail,
        pressedOne : CandleOffPressed,
        waitingOne : CandleOffWaiting,
        thumbnailTwo : candleOnThumbnail,
        pressedTwo: candleOnPressed,
        waitingTwo : candleOnWaiting,
        timerOne : 1650,
        timerTwo : 2100,
        rotateTwo : true
    },
    {
        thummbnailOne : AdamEveThumbnail,
        pressedOne : AdamPressed,
        waitingOne : AdamWait,
        thumbnailTwo : EvoultionThumbnail,
        pressedTwo: EvoultionPressed,
        waitingTwo : EvoultionWaiting,
        timerOne : 1750,
        timerTwo : 2450,
        designChangeTwo : true,
    },
    {
        thummbnailOne : coldThumbnail,
        pressedOne : coldPressed,
        waitingOne : coldWaiting,
        thumbnailTwo : hotThumbnail,
        pressedTwo: hotPressed,
        waitingTwo : hotWaiting,
        timerOne : 600,
        timerTwo : 750,
        sideOneTwo : true,
    },
    {
        thummbnailOne : goodThumbnail,
        pressedOne : goodPressed,
        waitingOne : goodWaiting,
        thumbnailTwo : badThumbnail,
        pressedTwo: badPressed,
        waitingTwo : badWaiting,
        timerOne : 1250,
        timerTwo : 1550,
    },
    {
        thummbnailOne : healthyThumbnail,
        pressedOne : healthyPressed,
        waitingOne : healthyWaiting,
        thumbnailTwo : fastThumbail,
        pressedTwo: fastPressed,
        waitingTwo : fastWaiting,
        timerOne : 1700,
        timerTwo : 2250,
    },
    {
        thummbnailOne : thorThumbnail,
        pressedOne : thorPressed,
        waitingOne : thorWaiting,
        thumbnailTwo : lokiThumbnail,
        pressedTwo: lokiPressed,
        waitingTwo : lokiWaiting,
        timerOne : 1000,
        timerTwo : 1200,
    },
    {
        thummbnailOne : UpThumbnail,
        pressedOne : UpPressed,
        waitingOne : UpPressed,
        thumbnailTwo : DownThumbnail,
        pressedTwo: DownPressed,
        waitingTwo : DownPressed,
        timerOne : time1,
        timerTwo : time2,
    }
];

export const ConclusionData = {
    BitCoinOne : WinnerOneBTC,
    BitCoinTwo : WinnerTwoBTC,
    YouWin : YouWin,
    YouLose : YouLose,
    draw : Draw,
    lock : Lock,
    spectator : Spectator,
    bonusRound : BonusRound,
    freeRound : FreeRound,
    bonusWinner : BonusWinner
}