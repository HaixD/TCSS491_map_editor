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
    static async getAudio(path) {
        if (AssetManager.#audioData[path] !== undefined) {
            return AssetManager.#audioData[path];
        }

        let audio = new Audio();

        return new Promise((resolve, reject) => {
            audio.oncanplaythrough = () => {
                AssetManager.#audioData[path] = audio;
                resolve(audio);
            };
            audio.onerror = () => reject(`Could not load audio: ${path}`);

            audio.src = path;
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

        let image = new Image();

        return new Promise((resolve, reject) => {
            image.onload = () => {
                AssetManager.#imageData[path] = image;
                resolve(image);
            };
            image.onerror = () => reject(`Could not load image: ${path}`);

            image.src = path;
        });
    }

    /**
     * Sets the muted state of all Audio objects stored
     * @param {boolean} mute
     */
    static muteAllAudio(mute) {
        for (const audio of Object.values(AssetManager.#audioData)) {
            audio.muted = mute;
        }
    }

    /**
     * Sets the volume of all Audio objects stored
     * @param {number} volume
     */
    static setAllVolume(volume) {
        for (const audio of Object.values(AssetManager.#audioData)) {
            audio.volume = volume;
        }
    }
}
