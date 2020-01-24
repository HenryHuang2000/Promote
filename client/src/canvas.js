// Setup canvas in proportion to the window.
const const_canvas = document.getElementById("const_canvas");
const const_ctx = const_canvas.getContext('2d');

var int_canvas = document.getElementById("int_canvas");
var ctx = int_canvas.getContext("2d");
int_canvas.style.background = "none";

const winWidth  = window.innerWidth;
const winHeight = window.innerHeight;

const_canvas.width  = winWidth;
const_canvas.height = winHeight;

int_canvas.width  = winWidth;
int_canvas.height = winHeight;

export {winWidth, winHeight, const_ctx, ctx, const_canvas, int_canvas};