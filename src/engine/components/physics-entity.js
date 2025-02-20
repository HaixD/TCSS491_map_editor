/** @typedef {import("../types/vector")} */
/** @typedef {import("../types/instance-vector")} */
/** @typedef {import("../util")} */

class PhysicsEntity {
    /** Acceleration towards velocity=0 */
    #counterAcceleration;
    /** Acceleration towards abs(velocity)=terminal velocity if velocity is high enough */
    #terminalAcceleration;

    /**
     * @param {Vector | undefined} terminalVelocity
     */
    constructor(terminalVelocity) {
        this.terminalVelocity = terminalVelocity || new Vector(Infinity, Infinity);
        this.velocity = new InstanceVector();
        this.acceleration = new InstanceVector();
        this.#counterAcceleration = new InstanceVector();
        this.#terminalAcceleration = new InstanceVector();
    }

    /**
     * Updates the velocity based on the current acceleration
     * @param {number} deltaTime
     * @returns displacement
     */
    updateVelocity(deltaTime) {
        const initialVelocity = this.velocity.asVector();

        // apply acceleration
        const accelerationVelocity = this.acceleration.multiply(deltaTime);
        this.velocity.add(accelerationVelocity);
        const absVelocity = this.velocity.map(Math.abs);
        if (
            !isDirectionalCounter(initialVelocity.x, accelerationVelocity.x) &&
            absVelocity.x > this.terminalVelocity.x
        ) {
            if (Math.abs(initialVelocity.x) < this.terminalVelocity.x) {
                this.velocity.x = getDirection(this.velocity.x) * this.terminalVelocity.x;
            } else {
                this.velocity.x = initialVelocity.x;
            }
        }
        if (
            !isDirectionalCounter(initialVelocity.y, accelerationVelocity.y) &&
            absVelocity.y > this.terminalVelocity.y
        ) {
            if (Math.abs(initialVelocity.y) < this.terminalVelocity.y) {
                this.velocity.y = getDirection(this.velocity.y) * this.terminalVelocity.y;
            } else {
                this.velocity.y = initialVelocity.y;
            }
        }

        // apply counter acceleration
        const preCounterVelocity = this.velocity.asVector();
        this.#updateCounterAcceleration(preCounterVelocity);
        this.velocity.add(this.acceleration.multiply(deltaTime));

        if (!this.#counterAcceleration.isZero()) {
            if (isDirectionalCounter(preCounterVelocity.x, this.velocity.x)) {
                this.velocity.x = 0;
            }
            if (isDirectionalCounter(preCounterVelocity.y, this.velocity.y)) {
                this.velocity.y = 0;
            }
        }

        // apply terminal acceleration
        const preTerminalVelocity = this.velocity.map(Math.abs);
        this.#addTerminalAcceleration();

        const terminalVelocity = this.acceleration.multiply(deltaTime);

        if (preTerminalVelocity.x > this.terminalVelocity.x) {
            const difference =
                Math.min(terminalVelocity.x, preTerminalVelocity.x - this.terminalVelocity.x) *
                -getDirection(this.velocity.x);
            this.velocity.x += difference;
        }
        if (preTerminalVelocity.y > this.terminalVelocity.y) {
            const difference =
                Math.min(terminalVelocity.y, preTerminalVelocity.y - this.terminalVelocity.y) *
                -getDirection(this.velocity.y);
            this.velocity.y += difference;
        }

        // reset temporary states
        this.acceleration.set(0, 0);
        this.#counterAcceleration.set(0, 0);
        this.#terminalAcceleration.set(0, 0);

        return this.velocity.asVector().multiply(deltaTime);
    }

    /**
     * Adds the given acceleration to this Physics Entity's state
     * @param {Vector} acceleration
     */
    applyAcceleration(acceleration) {
        this.acceleration.add(acceleration);
    }

    /**
     * Applies an acceleration that goes in the opposite direction of velocity.
     * @param {Vector} acceleration
     */
    applyCounterAcceleration(acceleration) {
        this.#counterAcceleration.add(acceleration);
    }

    /**
     * Applies an acceleration that goes in the opposite direction of velocity (towards terminal velocity instead of 0).
     * @param {Vector} acceleration
     */
    applyTerminalAcceleration(acceleration) {
        this.#terminalAcceleration.add(acceleration);
    }

    /**
     * Adds counterAcceleration to acceleration in the opposite direction of intermediate velocity
     * @param {Vector} intermediateVelocity
     */
    #updateCounterAcceleration(intermediateVelocity) {
        this.acceleration.set(0, 0);
        if (intermediateVelocity.x > 0) {
            this.acceleration.add(new Vector(-this.#counterAcceleration.x, 0));
        } else if (intermediateVelocity.x < 0) {
            this.acceleration.add(new Vector(this.#counterAcceleration.x, 0));
        }

        if (intermediateVelocity.y > 0) {
            this.acceleration.add(new Vector(0, -this.#counterAcceleration.y));
        } else if (intermediateVelocity.y < 0) {
            this.acceleration.add(new Vector(0, this.#counterAcceleration.y));
        }
    }

    #addTerminalAcceleration() {
        this.acceleration.set(this.#terminalAcceleration);
    }
}
