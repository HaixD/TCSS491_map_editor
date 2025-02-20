/**
 * Point is ONLY meant for debugging purposes
 */
class Point {
    /**
     * @param {InstanceVector} parent
     * @param {Vector | undefined} offset
     */
    constructor(parent, offset) {
        this.position = parent;
        this.offset = offset || new Vector();
    }

    /**
     * Draws this point on to the canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    drawPoint(ctx) {
        ctx.save();

        const { x, y } = this.position.asVector().add(this.offset);

        ctx.fillStyle = "lime";
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
