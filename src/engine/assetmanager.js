class AssetManager {
    /** @type {{[key: string]: HTMLAudioElement}} */
    static #audioData = {};

    /** @type {{[key: string]: HTMLImageElement}} */
    static #imageData = {};

    constructor() {
        throw Error("AssetManager is a Singleton, do not create an instance (use static methods)");
    }

    /**
     * Gets the Audio object which correlates to the given path. If an Audio is not downloaded, this will synchronously download it
     * @param {string} path
     * @returns {Promise<HTMLAudioElement> | HTMLAudioElement} a (loaded) Audio object
     */
    static getAudio(path) {
        if (AssetManager.#audioData[path] !== undefined) {
            return AssetManager.#audioData[path];
        }

        return new Promise((resolve, reject) => {
            const audio = new Audio(path);
            audio.oncanplaythrough = () => {
                AssetManager.#audioData[path] = audio;
                resolve(audio);
            };
            audio.onerror = () => reject(`Could not load audio: ${path}`);
        });
    }

    /**
     * Gets the Image object which correlates to the given path. If an Image is not downloaded, this will synchronously download it
     * @param {string} path
     * @returns {Promise<HTMLImageElement> | HTMLImageElement} a (loaded) Image object
     */
    static getImage(path) {
        if (AssetManager.#imageData[path] !== undefined) {
            return AssetManager.#imageData[path];
        }

        const image = new Image();

        return new Promise((resolve, reject) => {
            image.src = path;
            image.onload = () => {
                AssetManager.#imageData[path] = image;
                resolve(image);
            };
            image.onerror = () => reject(`Could not load image: ${path}`);
        });
    }
}
