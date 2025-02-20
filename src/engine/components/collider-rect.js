/** @typedef {import("../types/vector")} */
/** @typedef {import("../types/instance-vector")} */
/** @typedef {import("../types/boundary")} */
/** @typedef {import("../types/game-object")} */
/** @typedef {import("../types/component")} */

/** @typedef {{nextColliderID: number, colliders: {[key: string]: ColliderRect}}} ColliderContext */

/**
 * ColliderRect exists to detect and resolve collisions between 2 or more rectangles
 *
 * NOTE: for "perfect fit" scenarios, ensure there is between [1, 0) unit of space (things will appear to be a perfect fit)
 */
class ColliderRect {
    /** @type {{[context: string]: ColliderContext}}} */
    static #contexts = {};
    static #activeContext = "";

    #colliderID;
    #context;

    /**
     * @param {GameObject} parent
     * @param {InstanceVector} position
     * @param {Vector} offset
     * @param {Vector} shape
     * @param {...Symbol} collisionTargets
     */
    constructor(parent, position, offset, shape, ...collisionTargets) {
        this.parent = parent;
        this.position = position;
        this.offset = offset;
        this.shape = shape;
        this.collisionTargets = new Set(collisionTargets);

        if (ColliderRect.#activeContext === "") {
            throw new Error("No active context set");
        }
        this.#context = ColliderRect.#contexts[ColliderRect.#activeContext];

        this.#colliderID = this.#context.nextColliderID++;
        this.#context.colliders[this.#colliderID] = this;
    }

    /**
     * Adds a context under the given key and sets the active context to that key
     *
     * Note: this function should only be used by the game engine, only use to override default behavior
     * @param {string} key
     */
    static addContext(key) {
        ColliderRect.#contexts[key] = { nextColliderID: 0, colliders: {} };
        ColliderRect.setContext(key);
    }

    /**
     * Sets the active context to the given key
     *
     * Note: this function should only be used by the game engine, only use to override default behavior
     * @param {string} key
     */
    static setContext(key) {
        if (!(key in ColliderRect.#contexts)) {
            throw new Error("Context does not exist");
        }
        ColliderRect.#activeContext = key;
    }

    delete() {
        delete this.#context.colliders[this.#colliderID];
    }

    /**
     * Finds the first colliding rectangle and returns it.
     * @returns The ColliderRect object which collides with this one
     */
    *getCollisions() {
        for (const collider of Object.values(this.#context.colliders)) {
            if (collider.parent.delete) {
                collider.delete();
                continue;
            }

            if (
                this !== collider &&
                this.collisionTargets.has(collider.parent.getTypeID()) &&
                this.collidesWith(collider)
            ) {
                yield collider;
            }
        }
    }

    /**
     * Gets all colliders colliding with the given boundary in the current active context
     * @param {...Symbol} collisionTargets
     * @param {Boundary} boundary
     * @returns The ColliderRect object which collides with this one
     */
    static *scanColliders(boundary, ...collisionTargets) {
        const colliders = ColliderRect.#contexts[ColliderRect.#activeContext].colliders;
        for (const collider of Object.values(colliders)) {
            if (collider.parent.delete) {
                collider.delete();
                continue;
            }

            if (
                collisionTargets.has(collider.parent.getTypeID()) &&
                boundary.containsBoundary(collider.getBoundary())
            ) {
                yield collider;
            }
        }
    }

    /**
     * Gets the x and y starts and ends of this ColliderRect.
     * @returns The bounds of this ColliderRect
     */
    getBoundary() {
        const start = this.offset.add(this.position);
        const end = start.add(this.shape);

        return new Boundary(start.x, end.x, start.y, end.y);
    }

    /**
     * Checks if this ColliderRect collides with the other ColliderRect
     * @param {ColliderRect} other
     * @returns true if there is a collision and false otherwise
     */
    collidesWith(other) {
        return this.getBoundary().containsBoundary(other.getBoundary());
    }

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    drawCollider(ctx) {
        const position = this.position.asVector().add(this.offset);

        ctx.strokeRect(position.x, position.y, this.shape.x, this.shape.y);
    }

    /**
     * Resolves the collision of this ColliderRect with the other (other ColliderRect treated as immovable)
     * @param {Vector} displacement
     * @param {ColliderRect} other
     * @returns the displacement this ColliderRect needs to not be in collision
     */
    resolveCollision(displacement, other) {
        return this.getBoundary().resolveCollision(displacement, other.getBoundary());
    }

    /**
     * Resolves all collisions currently happening with this ColliderRect
     * @param {Vector} displacement
     * @returns the displacement this ColliderRect needs to not be in collision
     */
    resolveCollisions(displacement) {
        return this.resolveCollisionsWith(displacement, [...this.getCollisions()]);
    }

    /**
     * Resolves all collisions within the given array of collisions
     * @param {Vector} displacement
     * @param {ColliderRect[]} collisions
     */
    resolveCollisionsWith(displacement, collisions) {
        return this.getBoundary().resolveCollisions(
            displacement,
            collisions.map(collider => collider.getBoundary())
        );
    }
}
