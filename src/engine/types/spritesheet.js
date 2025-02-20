class Spritesheet {
    #totalTime;

    /**
     * @param {ReturnType<AssetManager.getImage>} spritesheet
     * @param {Vector} start
     * @param {Vector} shape
     * @param {number} scale
     * @param {number} frameCount total number of frames in animation
     * @param {number} frameDuration seconds
     */
    constructor(spritesheet, start, shape, scale, frameCount, frameDuration) {
        this.spritesheet = spritesheet;
        this.start = start;
        this.shape = shape;
        this.scale = scale;
        this.frameCount = frameCount;
        this.frameDuration = frameDuration;

        this.#totalTime = this.getTotalTime();
    }

    getTotalTime() {
        return this.frameCount * this.frameDuration;
    }

    /**
     * Gets the x offset value within the spritesheet
     * @param {number} time seconds
     * @returns
     */
    getXOffset(time) {
        return (
            this.start.x + this.shape.x * Math.floor((time % this.#totalTime) / this.frameDuration)
        );
    }
}
