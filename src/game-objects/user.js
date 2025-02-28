/** @typedef {import("../engine/types/instance-vector")} */
/** @typedef {import("../engine/types/game-object")} */
/** @typedef {import("../gui")} */
/** @typedef {import("./grid-ui")} */

class User extends GameObject {
    static TYPE_ID = Symbol(User.name);
    static SCALES = [0.125, 0.25, 0.5, 1, 2, 4, 8];
    static TOOLS = {
        PEN: 0,
        RECT: 1,
    };

    /** @type {Vector | null} */
    #firstLeftPosition;
    #lastRightPosition;
    #mousePosition;
    #scaleIndex;

    /** @type {{[x: string]: Set<int>}} */
    #highlightedTiles;

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

        this.#highlightedTiles = {};
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
        this.#updateHighlightedTiles();

        if (events.mouseDown & 0b10) {
            // right down
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
            // right up
            this.#lastRightPosition = null;
        }

        if (events.mouseDown & 0b1) {
            // left down
            if (this.#firstLeftPosition === null) {
                this.#firstLeftPosition = this.#mousePosition;
            }
            switch (GUI.getTool()) {
                case User.TOOLS.PEN:
                    GameMap.setTile(this.#mousePosition.x, this.#mousePosition.y, GUI.getTile());
                    break;
            }
        } else {
            // left up
            this.#firstLeftPosition = null;
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

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        this.#drawHighlights(ctx);

        ctx.restore();
    }

    #updateHighlightedTiles() {
        this.#highlightedTiles = {};
        const highlightTile = (gridX, gridY) => {
            if (gridX in this.#highlightedTiles) {
                this.#highlightedTiles[gridX].add(gridY);
            } else {
                this.#highlightedTiles[gridX] = new Set();
                highlightTile(gridX, gridY);
            }
        };

        switch (GUI.getTool()) {
            case User.TOOLS.RECT:
                if (this.#firstLeftPosition !== null) {
                    const left = Math.min(this.#firstLeftPosition.x, this.#mousePosition.x);
                    const right = Math.max(this.#firstLeftPosition.x, this.#mousePosition.x);
                    const top = Math.min(this.#firstLeftPosition.y, this.#mousePosition.y);
                    const bottom = Math.max(this.#firstLeftPosition.y, this.#mousePosition.y);

                    for (let x = left; x <= right; x += Tile.SIZE) {
                        highlightTile(x, top);
                        highlightTile(x, bottom);
                    }
                    for (let y = top; y <= bottom; y += Tile.SIZE) {
                        highlightTile(left, y);
                        highlightTile(right, y);
                    }

                    break;
                }
            case User.TOOLS.PEN:
                highlightTile(this.#mousePosition.x, this.#mousePosition.y);
                break;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    #drawHighlights(ctx) {
        for (const [x, col] of Object.entries(this.#highlightedTiles)) {
            for (const y of col) {
                ctx.fillRect(Number(x), y, Tile.SIZE, Tile.SIZE);
            }
        }
    }
}
