/**
 * Returns true if the directions of a and b are not zero and are not equal
 * @param {number} a
 * @param {number} b
 */
function isDirectionalCounter(a, b) {
    return Boolean(Math.sign(a) && Math.sign(b)) && Math.sign(a) !== Math.sign(b);
}

function isBetween(value, a, b) {
    return a <= value && value <= b;
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Vector} offset
 * @param {Vector} position
 * @param {number} radius
 */
function drawPoint(ctx, position, radius) {
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
}
