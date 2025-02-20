/** @typedef {import("./tile")} */

class GridUI extends GameObject {
    /**
     * @param {number} value
     */
    static toGridValue(value) {
        return Math.floor(value / Tile.SIZE);
    }

    /**
     * @param {Vector} position
     */
    static toGridPosition(position) {
        return position.map(GridUI.toGridValue);
    }

    getBoundary() {
        return new Boundary(-Infinity, Infinity, -Infinity, Infinity);
    }

    /**
     * Draws this Game Object on to the canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        super.draw(ctx);

        ctx.save();

        ctx.strokeStyle = "gray";

        const scene = GameEngine.getActiveScene();
        const viewBounds = scene.getViewBounds();

        const left = Math.floor(viewBounds.left / Tile.SIZE) * Tile.SIZE;
        const right = Math.ceil(viewBounds.right / Tile.SIZE) * Tile.SIZE;
        const top = Math.floor(viewBounds.top / Tile.SIZE) * Tile.SIZE;
        const bottom = Math.ceil(viewBounds.bottom / Tile.SIZE) * Tile.SIZE;

        for (let x = left; x <= right; x += Tile.SIZE) {
            ctx.beginPath();

            ctx.moveTo(x, viewBounds.top);
            ctx.lineTo(x, viewBounds.bottom);

            ctx.stroke();
        }

        for (let y = top; y <= bottom; y += Tile.SIZE) {
            ctx.beginPath();

            ctx.moveTo(viewBounds.left, y);
            ctx.lineTo(viewBounds.right, y);

            ctx.stroke();
        }

        ctx.restore();
    }
}
