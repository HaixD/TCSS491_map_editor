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
        LINE: 2,
        FILL: 3,
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
        const tool = GUI.getTool();

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

            switch (tool) {
                case User.TOOLS.FILL:
                    this.#fill();
                    break;
                case User.TOOLS.PEN:
                    this.#fillHighlightedTiles();
                    break;
            }
        } else {
            // left up
            if (this.#firstLeftPosition !== null) {
                switch (tool) {
                    case User.TOOLS.LINE:
                    case User.TOOLS.RECT:
                        this.#fillHighlightedTiles();
                        break;
                }
            }
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

    #fill() {
        const TARGET_TILE = GameMap.getTile(this.#mousePosition.x, this.#mousePosition.y);
        if (TARGET_TILE === GUI.getTile()) {
            return;
        }

        const stack = [this.#mousePosition];
        while (stack.length > 0) {
            const { x, y } = stack.pop();
            if (
                (x !== this.#mousePosition.x || y !== this.#mousePosition.y) &&
                (GameMap.getTile(x, y) !== TARGET_TILE || GameMap.getChunkForTile(x, y) === null)
            ) {
                continue;
            }

            console.log(x, y);
            GameMap.setTile(x, y, GUI.getTile());

            stack.push(new Vector(x + Tile.SIZE, y));
            stack.push(new Vector(x - Tile.SIZE, y));
            stack.push(new Vector(x, y + Tile.SIZE));
            stack.push(new Vector(x, y - Tile.SIZE));
        }
    }

    #fillHighlightedTiles() {
        for (const [x, col] of Object.entries(this.#highlightedTiles)) {
            for (const y of col) {
                GameMap.setTile(Number(x), y, GUI.getTile());
            }
        }
    }

    /**
     * Uses the Bresenham's line algorithm.
     *
     * Note: code obtained from: https://stackoverflow.com/a/4672319/15187689;
     */
    #highlightLine() {
        let { x: x0, y: y0 } = this.#firstLeftPosition.map(value => Math.round(value / Tile.SIZE));
        let { x: x1, y: y1 } = this.#mousePosition.map(value => Math.round(value / Tile.SIZE));

        const dx = Math.abs(x1 - x0); // change in X
        const dy = Math.abs(y1 - y0); // change in Y
        const sx = Math.sign(x1 - x0); // sign X
        const sy = Math.sign(y1 - y0); // sign Y

        let error = dx - dy;
        while (true) {
            this.#highlightTile(x0 * Tile.SIZE, y0 * Tile.SIZE);

            if (x0 === x1 && y0 === y1) {
                break;
            }

            const e2 = error * 2;
            if (e2 > -dy) {
                error -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                error += dx;
                y0 += sy;
            }
        }
    }

    #highlightRect() {
        const { left, right, top, bottom } = this.#getClickAndHoldBoundary();

        for (let x = left; x <= right; x += Tile.SIZE) {
            this.#highlightTile(x, top);
            this.#highlightTile(x, bottom);
        }
        for (let y = top; y <= bottom; y += Tile.SIZE) {
            this.#highlightTile(left, y);
            this.#highlightTile(right, y);
        }
    }

    #highlightTile(gridX, gridY) {
        if (gridX in this.#highlightedTiles) {
            this.#highlightedTiles[gridX].add(gridY);
        } else {
            this.#highlightedTiles[gridX] = new Set();
            this.#highlightTile(gridX, gridY);
        }
    }

    #updateHighlightedTiles() {
        this.#highlightedTiles = {};

        switch (GUI.getTool()) {
            case User.TOOLS.RECT:
                if (this.#firstLeftPosition !== null) {
                    this.#highlightRect();
                    break;
                }
            case User.TOOLS.LINE:
                if (this.#firstLeftPosition !== null) {
                    this.#highlightLine();
                    break;
                }
            case User.TOOLS.PEN:
            case User.TOOLS.FILL:
                this.#highlightTile(this.#mousePosition.x, this.#mousePosition.y);
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

    #getClickAndHoldBoundary() {
        return new Boundary(
            Math.min(this.#firstLeftPosition.x, this.#mousePosition.x),
            Math.max(this.#firstLeftPosition.x, this.#mousePosition.x),
            Math.min(this.#firstLeftPosition.y, this.#mousePosition.y),
            Math.max(this.#firstLeftPosition.y, this.#mousePosition.y)
        );
    }
}
