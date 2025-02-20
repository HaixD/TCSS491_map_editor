// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
/** @typedef {import("./timer")} */
/** @typedef {import("./types/scene")} */
/** @typedef {import("./types/input-events")} */
/** @typedef {import("./types/vector")} */

class GameEngine {
    /** @type {CanvasRenderingContext2D | null} */
    static #ctx = null;
    /** @type {{[key: string]: Scene}} */
    static #scenes = {};
    static #activeScene = "";
    static #inputEvents = new InputEvents();

    /**
     * Returns the world Vector of the given mouse event;
     * @param {MouseEvent} event
     */
    static #processMouseEvent(event) {
        const screenVector = new Vector(
            event.clientX - GameEngine.#ctx.canvas.getBoundingClientRect().left,
            event.clientY - GameEngine.#ctx.canvas.getBoundingClientRect().top
        );

        return screenVector;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    static init(ctx) {
        GameEngine.#ctx = ctx;

        GameEngine.#ctx.canvas.addEventListener("mousemove", e => {
            GameEngine.#inputEvents.canvasMousePosition.set(GameEngine.#processMouseEvent(e));
            GameEngine.#inputEvents.worldMousePosition.set(
                GameEngine.getActiveScene().getWorldVector(GameEngine.#processMouseEvent(e))
            );
        });
        GameEngine.#ctx.canvas.addEventListener("click", e => {
            GameEngine.#inputEvents.leftClick = GameEngine.#processMouseEvent(e);
        });
        GameEngine.#ctx.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            GameEngine.#inputEvents.scroll = e.deltaY;
        });
        GameEngine.#ctx.canvas.addEventListener("contextmenu", e => {
            e.preventDefault();
            GameEngine.#inputEvents.rightClick = GameEngine.#processMouseEvent(e);
        });
        GameEngine.#ctx.canvas.addEventListener("keydown", e => {
            GameEngine.#inputEvents.keys[e.key] = true;
        });
        GameEngine.#ctx.canvas.addEventListener("keyup", e => {
            GameEngine.#inputEvents.keys[e.key] = false;
        });
        GameEngine.#ctx.canvas.addEventListener("mousedown", e => {
            GameEngine.#inputEvents.mouseDown = e.buttons;
        });
        GameEngine.#ctx.canvas.addEventListener("mouseup", e => {
            GameEngine.#inputEvents.mouseDown = e.buttons;
        });
    }

    static getActiveScene() {
        if (GameEngine.#activeScene === "") {
            throw new Error("There is currently no active scene");
        }

        return GameEngine.#scenes[GameEngine.#activeScene];
    }

    /**
     * Stores a scene using the given key. The first added scene will be set as the active scene
     * @param {string} key
     * @param {Scene} scene
     */
    static addScene(key, scene) {
        ColliderRect.addContext(key);
        GameEngine.#scenes[key] = scene;
        GameEngine.#activeScene ||= key;
    }

    /**
     * Creates a scene object and ColliderRect context to go with that scene
     * @param {string} key
     * @param {(scene: Scene) => void} callback
     */
    static createScene(key, callback) {
        if (GameEngine.#ctx === null) {
            throw new Error("GameEngine not initialized");
        }

        const scene = new Scene(GameEngine.#ctx);
        GameEngine.addScene(key, scene);

        callback(scene);

        ColliderRect.setContext(GameEngine.#activeScene);
    }

    /**
     * Adds the Game Object to the active scene (Game Object will not be updated or drawn until next loop)
     * @param {string} layer
     * @param {GameObject} gameObject
     */
    static addGameObject(layer, gameObject) {
        const activeScene = GameEngine.getActiveScene();

        activeScene.addGameObject(layer, gameObject);
    }

    /**
     * Sets the active scene to the given key
     * @param {String} key
     */
    static setScene(key) {
        if (!(key in this.#scenes)) {
            throw new Error("Scene does not exist");
        }

        GameEngine.#activeScene = key;
        ColliderRect.setContext(key);
    }

    /**
     * Starts the game loop. If there is no active scene, the game loop will immediately end
     */
    static start() {
        let lastTimestamp = Date.now();

        const gameLoop = () => {
            if (GameEngine.#activeScene === "") {
                return;
            }

            const newTimestamp = Date.now();
            const deltaTime = Math.min((newTimestamp - lastTimestamp) / 1000, 0.16);
            lastTimestamp = newTimestamp;

            const activeScene = this.getActiveScene();

            activeScene.update(deltaTime, GameEngine.#inputEvents);
            GameEngine.#ctx.clearRect(
                0,
                0,
                GameEngine.#ctx.canvas.width,
                GameEngine.#ctx.canvas.height
            );
            GameEngine.#ctx.beginPath();
            activeScene.render();

            GameEngine.#inputEvents.reset();

            window.requestAnimationFrame(gameLoop, GameEngine.#ctx.canvas);
        };

        gameLoop();
    }
}
