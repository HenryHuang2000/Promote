export default function draw_image(name, ctx, x, y, w, h) {

    let img = new Image();
    img.onload = function () {
        ctx.drawImage(img, x, y, w, h);
    }
    img.src = 'client/images/' + name;
}