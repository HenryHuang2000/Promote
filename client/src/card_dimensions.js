import {winWidth, winHeight} from './canvas';

// Find suitable card dimensions.
const maxCardHeight = (winWidth - 20) * 1.452 / 13.5;
const cardHeight = maxCardHeight > winHeight / 5 ? winHeight / 5 : maxCardHeight;
const cardWidth  = cardHeight / 1.452;
const vPos = winHeight - cardHeight - 10;

export default {
        height: cardHeight,
        width: cardWidth,
        vPos: vPos
};