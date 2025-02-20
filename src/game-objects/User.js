/** @typedef {import("../engine/types/instance-vector")} */
/** @typedef {import("../engine/types/game-object")} */
/** @typedef {impor("../gui")} */

class User extends GameObject {
    static TYPE_ID = Symbol(User.name);
    static SCALES = [0.125, 0.25, 0.5, 1, 2, 4, 8];

    /** @type {Vector | null} */
    #lastRightPosition;
    #mousePosition;
    #scaleIndex;

    /**
     * @param {InstanceVector} position
     * @param {Vector} cameraOffset
     */
    constructor(position, cameraOffset) {
        super();

        this.position = position;
        this.cameraOffset = cameraOffset;

        this.cameraPosition = new InstanceVector(position).add(cameraOffset);

        this.#lastRightPosition = null;
        this.#mousePosition = new Vector();
        this.#scaleIndex = 3;
    }

    getBoundary() {
        return new Boundary(-Infinity, Infinity, -Infinity, Infinity);
    }

    /**
     * Updates the state of this Game Object
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        super.update(deltaTime, events);

        const scene = GameEngine.getActiveScene();

        // move
        this.#mousePosition = GridUI.toGridPosition(events.worldMousePosition).multiply(Tile.SIZE);

        if (events.mouseDown & 0b10) {
            if (this.#lastRightPosition === null) {
                this.#lastRightPosition = events.canvasMousePosition.asVector();
            } else {
                const currentMousePosition = events.canvasMousePosition.asVector();
                this.position.add(
                    currentMousePosition
                        .subtract(this.#lastRightPosition)
                        .negate()
                        .multiply(1 / scene.scale)
                );
                this.#lastRightPosition = currentMousePosition;
            }
        } else {
            this.#lastRightPosition = null;
        }
        if (events.mouseDown & 0b1) {
            GameMap.setTile(this.#mousePosition.x, this.#mousePosition.y, GUI.getTile());
        }

        this.cameraPosition.set(this.cameraOffset.add(this.position));

        // scale
        if (events.scroll !== null) {
            if (events.scroll < 0) {
                this.#scaleIndex = Math.min(this.#scaleIndex + 1, User.SCALES.length - 1);
            } else {
                this.#scaleIndex = Math.max(this.#scaleIndex - 1, 0);
            }

            GameEngine.getActiveScene().scale = User.SCALES[this.#scaleIndex];
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(this.#mousePosition.x, this.#mousePosition.y, Tile.SIZE, Tile.SIZE);
    }
}
