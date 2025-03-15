/** @typedef {import('./vector')} */

class InstanceVector extends Vector {
    /**
     * @override
     * @param {Vector | InstanceVector | number | undefined} arg1
     * @param {number | undefined} arg2
     */
    constructor(arg1, arg2) {
        super(arg1, arg2);
    }

    /**
     * Sets the x and y value of this Vector
     * @override
     * @param {Vector | InstanceVector | number} arg1
     * @param {number | undefined} arg2
     */
    set(arg1, arg2) {
        const { x, y } = new Vector(arg1, arg2);
        this.x = x;
        this.y = y;

        return this;
    }

    /**
     * Adds this vector with another Vector
     * @override
     * @param {Vector | InstanceVector | number} arg1
     * @param {number | undefined} arg2
     */
    add(arg1, arg2) {
        this.set(super.add(arg1, arg2));

        return this;
    }

    /**
     * Subtracts another Vector from this Vector (a-b where a is this and b is other)
     * @override
     * @param {Vector | InstanceVector | number} arg1
     * @param {number | undefined} arg2
     */
    subtract(arg1, arg2) {
        this.set(super.subtract(arg1, arg2));

        return this;
    }

    /**
     * Negates this Vector such that it becomes -a
     */
    negate() {
        return this.set(super.negate());
    }

    /**
     * Normalizes this vector such that its magnitude becomes 1
     */
    normalize() {
        return this.set(super.normalize());
    }

    /**
     * Performs a scalar multiplication on this Vector.
     * @param {number} scalar
     */
    multiply(scalar) {
        return this.set(super.multiply(scalar));
    }

    /**
     * Applies the transformation on each element of a copy of this Instance Vector
     * @param {(value: number) => number} transformation
     */
    map(transformation) {
        return new InstanceVector(super.map(transformation));
    }

    /**
     * Applies the transformation on each element of this Instance Vector
     * @param {(value: number) => number} transformation
     */
    forEach(transformation) {
        this.set(this.map(transformation));

        return this;
    }

    /**
     * Makes a deep copy of this Vector.
     * @returns a new InstanceVector
     */
    copy() {
        return new InstanceVector(this.x, this.y);
    }

    /**
     * Converts this InstanceVector into a Vector
     * @readonly a new Vector
     */
    asVector() {
        return new Vector(this.x, this.y);
    }

    /**
     * @returns a string representation of this Vector
     */
    toString() {
        return `InstanceVector(x=${this.x}, y=${this.y})`;
    }
}
