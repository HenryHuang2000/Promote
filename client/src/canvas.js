// Setup canvas in proportion to the window.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const winWidth  = window.innerWidth;
const winHeight = window.innerHeight;

canvas.width  = winWidth;
canvas.height = winHeight;

export {winWidth, winHeight, ctx};