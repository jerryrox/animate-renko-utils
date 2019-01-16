/**
 * Component which provides a parallax effect on a certain object based on mouse position.
 * 
 * Create a new instance to use this class.
 * 
 * Dependencies:
 * - classes/MonoUpdate.js
 */
class Parallax {

    // this.target;
    // this.isActive;
    // this.speed;
    // this.screenFactor{ x, y };
    // this.mouseOffset{ x, y };
    // this.mousePos{ x, y };
    // this.scale{ x, y };
    // this.center{ x, y };
    // this.bounds{ top, bottom, left, right };
    // this.updateId;

    constructor(target, isActive) {
        if(renko.isNullOrUndefined(target)) {
            throw new Error("Parallax - target must be a valid symbol instance.");
        }
        this.target = target;
        this.screenFactor = {
            x: 2 / renko.appWidth,
            y: 2 / renko.appHeight
        };
        this.mouseOffset = {};
        this.mousePos = {};
        this.scale = {};
        this.center = {};
        this.bounds = {};

        this.update = this.update.bind(this);

        // Set default mouse offset
        var globalPos = target.localToGlobal(0, 0);
        var relativeScale = 1 / renko.getWindowScale() / 2;
        this.setMouseOffset(globalPos.x * relativeScale, globalPos.y * relativeScale);

        // Set other default values
        this.setSpeed(1);
        this.setScale(10, 10);
        this.setCenter(target.x, target.y);
        this.setBounds(target.y - 10, target.y + 10, target.x - 10, target.x + 10);
        this.reset();

        // Activate on initialization?
        this.setActive(isActive !== false);
    }

    /**
     * Sets the mouse offset to subtract from current mouse position to indicate
     * where the center(0,0) is located at.
     * By default, the offset is referred from the global position of the target.
     */
    setMouseOffset(x, y) {
        this.mouseOffset.x = x;
        this.mouseOffset.y = y;
    }

    /**
     * Sets the center position of the target.
     * By default, the center value is the target's position upon initialization.
     * @param {number} x
     * @param {number} y
     */
    setCenter(x, y) {
        this.center.x = x;
        this.center.y = y;
    }
    
    /**
     * Sets the boundaries to restrict the target from moving after certain point.
     * By default, the bounds are set to ±10 from the center.
     * @param {number} top
     * @param {number} bottom
     * @param {number} left
     * @param {number} right
     */
    setBounds(top, bottom, left, right) {
        this.bounds.top = top;
        this.bounds.bottom = bottom;
        this.bounds.left = left;
        this.bounds.right = right;
    }

    /**
     * Sets the amount of distance to move per half width/height.
     * By default, x and y are set to 10.
     * @param {number} x
     * @param {number} y
     */
    setScale(x, y) {
        this.scale.x = -x;
        this.scale.y = -y;
    }

    /**
     * Sets the interpolation speed from current to target position.
     * By default, speed is set to 1.
     * @param {number} speed
     */
    setSpeed(speed) {
        this.speed = speed;
    }

    /**
     * Resets the target's position to its center.
     * Recommended to call this after calling setActive(false).
     */
    reset() {
        this.target.x = this.center.x;
        this.target.y = this.center.y;
    }

    /**
     * Sets the active state of parallax effect.
     * @param {boolean} isActive 
     */
    setActive(isActive) {
        this.isActive = isActive;

        if(isActive) {
            if(typeof this.updateId !== "number") {
                this.updateId = renko.monoUpdate.addAction(this.update);
            }
        }
        else {
            if(typeof this.updateId === "number") {
                renko.monoUpdate.removeAction(this.updateId);
                this.updateId = null;
            }
        }
    }

    /**
     * (Internal)
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        var mousePos = renko.getMousePos();
        mousePos.x -= this.mouseOffset.x;
        mousePos.y -= this.mouseOffset.y;

        // Calculate the target move position
        var targetX = this.screenFactor.x * mousePos.x * this.scale.x + this.center.x;
        var targetY = this.screenFactor.y * mousePos.y * this.scale.y + this.center.y;

        targetX = renko.lerp(this.target.x, targetX, deltaTime * this.speed);
        targetY = renko.lerp(this.target.y, targetY, deltaTime * this.speed);

        // Clamp within bounds
        if(targetY < this.bounds.top) {
            targetY = this.bounds.top;
        }
        else if(targetY > this.bounds.bottom) {
            targetY = this.bounds.bottom;
        }
        if(targetX < this.bounds.left) {
            targetX = this.bounds.left;
        }
        else if(targetX > this.bounds.right) {
            targetX = this.bounds.right;
        }

        // Apply movement
        this.target.x = targetX;
        this.target.y = targetY;
    }
}