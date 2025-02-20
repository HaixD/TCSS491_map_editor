/** @typedef {import ('./boundary')} */
/** @typedef {import('./game-object')} */
/** @typedef {import('./input-events')} */

/** @typedef {{[key: string]: GameObject}} Layer */

class Scene {
    #offset;
    /** @type {{[key: string]: Layer}} */
    #gameObjects;
    /** @type {{[key: string]: number}} */
    #nextLayerID;

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.#offset = new InstanceVector();
        this.#gameObjects = {};
        this.#nextLayerID = {};
        this.scale = 1;
    }

    /**
     * Adds a layer to the end of the current Game Object layers
     * @param {string} layer
     */
    addLayer(layer) {
        if (layer in this.#gameObjects) {
            throw new Error("Layer already exists");
        }
        this.#gameObjects[layer] = {};
        this.#nextLayerID[layer] = 0;
    }

    /**
     * Deletes the given layer key
     * @param {string} layer
     */
    deleteLayer(layer) {
        if (!his.#gameObjects[layer]) {
            throw new Error(`Layer '${layer}' does not exist`);
        }
        delete this.#gameObjects[layer];
    }

    /**
     * Adds the Game Object to the layer
     * @param {string} layer
     * @param {GameObject} gameObject
     */
    addGameObject(layer, gameObject) {
        let layerObject = this.#gameObjects[layer];
        if (!layerObject) {
            this.addLayer(layer);
            layerObject = this.#gameObjects[layer];
        }
        layerObject[this.#nextLayerID[layer]++] = gameObject;
    }

    /**
     * Sets the offset to the given InstanceVector
     * @param {InstanceVector} instanceVector
     */
    setOffset(instanceVector) {
        this.#offset = instanceVector;
    }

    /**
     * Calculates the view Boundary and returns it
     * @returns the view Boundary
     */
    getViewBounds() {
        const { width, height } = this.ctx.canvas;

        const inverseScale = 1 / this.scale;
        const scaledWidth = width * inverseScale;
        const scaledHeight = height * inverseScale;

        const left = this.#offset.x + width / 2 - scaledWidth / 2;
        const right = left + scaledWidth;
        const top = this.#offset.y + height / 2 - scaledHeight / 2;
        const bottom = top + scaledHeight;

        return new Boundary(left, right, top, bottom);
    }

    /**
     * Updates all Game Objects belonging to this scene.
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        for (const layer of Object.values(this.#gameObjects)) {
            for (const [gameObjectKey, gameObject] of Object.entries(layer)) {
                if (gameObject.isDeleted()) {
                    delete layer[gameObjectKey];
                    continue;
                }
                gameObject.update(deltaTime, events);
            }
        }
    }

    /**
     * Triggers the draw function of Game Objects if they are in bounds of this scene.
     */
    render() {
        if (isNaN(this.#offset.x) || isNaN(this.#offset.y)) {
            throw new Error("Invalid offset (either offset.x or offset.y is NaN)");
        }

        this.ctx.save();

        const { width, height } = this.ctx.canvas;

        const translationRight = ((1 - this.scale) * width) / 2;
        const translationDown = ((1 - this.scale) * height) / 2;
        this.ctx.translate(translationRight, translationDown);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.#offset.x, -this.#offset.y);

        const viewBounds = this.getViewBounds();
        for (const layer of Object.values(this.#gameObjects)) {
            for (const gameObject of Object.values(layer)) {
                const boundary = gameObject.getBoundary();
                if (
                    !gameObject.isDrawReady() ||
                    boundary === null ||
                    !viewBounds.containsBoundary(boundary)
                ) {
                    continue;
                }

                gameObject.draw(this.ctx);
            }
        }

        this.ctx.restore();
    }

    /**
     * Converts screen Vector to world Vector
     * @param {Vector} screenVector vector of sceen position (not in world)
     */
    getWorldVector(screenVector) {
        const { left, top } = this.getViewBounds();

        return screenVector.multiply(1 / this.scale).add(left, top);
    }
}
