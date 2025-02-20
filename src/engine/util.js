/**
 * Normalizes a number.
 * @param {number} value
 */
function getDirection(value) {
    if (value > 0) {
        return 1;
    } else if (value === 0) {
        return 0;
    }

    return -1;
}

/**
 * Returns true if the directions of a and b are not zero and are not equal
 * @param {number} a
 * @param {number} b
 */
function isDirectionalCounter(a, b) {
    return Boolean(getDirection(a) && getDirection(b)) && getDirection(a) !== getDirection(b);
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
