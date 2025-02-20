/** @typedef {import("../types/spritesheet")} */
/** @typedef {import("../types/instance-vector")} */

/**
 * Sprite is a component used to display a spritesheet on to the canvas
 */
class Sprite {
    #state;
    #offset;
    #verticalFlip;
    #horizontalFlip;
    #timeline;
    #maxTime;
    #onLoopEnd;

    /**
     * @param {InstanceVector} parent
     * @param  {Object<string, Spritesheet} animations
     */
    constructor(parent, animations) {
        if (Object.keys(animations).length === 0) {
            throw new Error("Must pass at least 1 animation into Sprite");
        }

        this.parent = parent;
        this.animations = animations;

        /** @type {string} */
        this.#state = Object.keys(animations)[0];
        this.#offset = new Vector();
        this.rotation = 0;
        this.#verticalFlip = 1;
        this.#horizontalFlip = 1;
        this.#timeline = 0;
        this.#maxTime = Infinity;
        this.#onLoopEnd = () => {};
    }

    /**
     * Sets the offset of this sprite
     * @param {Vector} offset
     */
    setOffset(offset) {
        this.#offset = offset;
    }

    /**
     * Sets the rotation of this sprite to the given radians
     * @param {number} radians
     */
    setRotation(radians) {
        this.rotation = radians;
    }

    /**
     * Increments the timeline by the given deltaTime
     * @param {number} deltaTime
     */
    incrementTimeline(deltaTime) {
        this.#timeline = Math.min(this.#timeline + deltaTime, this.#maxTime);
    }

    resetTimeline() {
        this.#timeline = 0;
    }

    /**
     * Sets the currently playing animation and resets the timeline
     * @param {string} state
     */
    setState(state) {
        if (!Object.hasOwn(this.animations, state)) {
            throw new Error("Invalid state value (state does not exist)");
        }

        if (state !== this.#state) {
            this.resetTimeline();
            this.#state = state;
        }
    }

    /**
     * Flips the sprite vertically (all pixels above the middle appear at the bottom, and bottom pixels appear at the top)
     * @param {boolean} flip true if there should be vertical flip and false otherwise
     */
    setVerticalFlip(flip) {
        this.#verticalFlip = flip ? -1 : 1;
    }

    /**
     * Flips the sprite horizontally (all pixels left the middle appear at the right, and right pixels appear at the left)
     * @param {boolean} flip true if there should be horizontal flip and false otherwise
     */
    setHorizontalFlip(flip) {
        this.#horizontalFlip = flip ? -1 : 1;
    }

    /**
     * Draws the sprite on to the canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    drawSprite(ctx) {
        const currentState = this.#state;
        const animation = this.animations[currentState];
        if ("then" in animation.spritesheet) {
            animation.spritesheet.then(image => {
                animation.spritesheet = image;
                this.#drawAnimation(ctx, this.animations[currentState]);
            });
        } else {
            this.#drawAnimation(ctx, animation);
        }
    }

    /**
     * Draws the animation on to the canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {Spritesheet} animation
     */
    #drawAnimation(ctx, animation) {
        const shape = animation.shape.multiply(animation.scale);
        const position = this.parent.asVector().add(this.#offset);
        const translation = position.add(shape.multiply(0.5));

        ctx.save();

        ctx.translate(translation.x, translation.y);
        ctx.rotate(-this.rotation);
        ctx.translate(-translation.x, -translation.y);
        ctx.scale(this.#horizontalFlip, this.#verticalFlip);

        ctx.drawImage(
            animation.spritesheet,
            animation.getXOffset(this.#timeline),
            animation.start.y,
            animation.shape.x,
            animation.shape.y,
            position.x * this.#horizontalFlip,
            position.y * this.#verticalFlip,
            shape.x * this.#horizontalFlip,
            shape.y * this.#verticalFlip
        );

        ctx.restore();

        if (this.#timeline === this.#maxTime) {
            this.#onLoopEnd();
        }
    }

    setLoops(loops) {
        const animation = this.animations[this.#state];
        this.#maxTime = animation.getTotalTime() * loops;
    }

    setOnLoopEnd(callback) {
        this.#onLoopEnd = callback;
    }

    /**
     * Draws an outline of this Sprite instead of an image
     * @param {CanvasRenderingContext2D} ctx
     */
    drawOutline(ctx) {
        const shape = this.animations[this.#state].shape.multiply(
            this.animations[this.#state].scale
        );
        const position = this.parent.asVector().add(this.#offset);
        const translation = position.add(shape.multiply(0.5));

        ctx.save();

        ctx.translate(translation.x, translation.y);
        ctx.rotate(-this.rotation);
        ctx.translate(-translation.x, -translation.y);
        ctx.scale(this.#horizontalFlip, this.#verticalFlip);
        ctx.strokeStyle = "red";

        const x = position.x * this.#horizontalFlip;
        const y = position.y * this.#verticalFlip;
        const w = shape.x * this.#horizontalFlip;
        const h = shape.y * this.#verticalFlip;

        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = "red";
        drawPoint(ctx, new Vector(x + w / 2, y + h / 2), 3);

        ctx.restore();
    }
}
