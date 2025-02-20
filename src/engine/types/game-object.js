/** @typedef {import('./scene')} */
/** @typedef {import('./instance-vector')} */
/** @typedef {import('./boundary')} */

class GameObject {
    static TYPE_ID = Symbol(GameObject.name);

    #delete;
    #drawReady;

    constructor() {
        this.#delete = false;
        this.#drawReady = false;
    }

    /**
     * Triggers this Game Object to be deleted just before the next update
     */
    triggerDelete() {
        this.#delete = true;
    }

    /**
     * checks if thisGame Object should be (or is) deleted
     * @returns whether or not this Game Object should be (or is) deleted
     */
    isDeleted() {
        return this.#delete;
    }

    /**
     * checks if this Game Object is ready to be drawn to the canvas
     * @returns  whether or not this Game Object is ready to be drawn
     */
    isDrawReady() {
        return !this.isDeleted() && this.#drawReady;
    }

    /**
     * Gets the boundary of this Game Object
     * @returns {Boundary | null}
     */
    getBoundary() {
        return null;
    }

    /**
     * Gets the TYPE_ID property of this Game Object
     * @returns {Symbol}
     */
    getTypeID() {
        return this.constructor.TYPE_ID;
    }

    /**
     * Updates the state of this Game Object
     * @param {number} deltaTime
     * @param {InputEvents} events
     */
    update(deltaTime, events) {
        this.#drawReady = true;
    }

    /**
     * Draws this Game Object on to the canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        this.#drawReady = false;
    }
}
