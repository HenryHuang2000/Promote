import {win_ctx, win_canvas, winWidth, winHeight} from "./canvas";

export default function win_screen(winner) {

    // Show the win canvas.
    win_canvas.style.display = "inline";

    // Draw the table.
    let table = new Image();
    table.onload = function() {

        win_ctx.drawImage(table, 0, 0, winWidth, winHeight);
        win_ctx.fillStyle = 'black';
        win_ctx.font = "bold 100px Arial";
        win_ctx.textAlign = "center";
        win_ctx.shadowBlur = 0;
        win_ctx.fillText('Player ' + winner + ' has won!', winWidth / 2, winHeight / 2);
    }
    table.src = "client/images/table.jpg";    
}