/**
 * Class that provides a frame-based updating using requestAnimationFrame() API.
 * 
 * Access "renko.audioManager" to use this class.
 */
class MonoUpdate {

    // this.prevTimeStamp;
    // this.updateID;
    // this.nextID;
    // this.actions;
    // this.timeScale;

    constructor() {
        this.prevTimeStamp = 0;
        this.updateID = null;
        this.nextID = 0;
        this.actions = [];
        this.timeScale = 1;

        window.requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(f){return setTimeout(f, 1000/60)}
     
        window.cancelAnimationFrame = window.cancelAnimationFrame
            || window.mozCancelAnimationFrame
            || function(requestID){clearTimeout(requestID)}

        this.update = this.update.bind(this);
        this.startUpdate();
    }

    /**
     * Returns the current global timescale.
     */
    getTimescale() { return this.timeScale; }

    /**
     * Sets the current global timescale.
     * @param {number} value 
     */
    setTimescale(value) { this.timeScale = renko.clamp(value, 0.0000001, value); }

    /**
     * Adds specified action to update listener queue.
     * @param {Action<number>} action
     * @returns {number}
     */
    addAction(action) {
        var id = this.nextID++;
        this.actions.push({
            id,
            action
        });
        return id;
    }

    /**
     * Removes the action associated with specified id from update listener queue.
     * @param {number} id 
     */
    removeAction(id) {
        for(var i=0; i<this.actions.length; i++) {
            if(!renko.isNullOrUndefined(this.actions[i]) && this.actions[i].id === id) {
                this.actions[i] = null;
                return;
            }
        }
    }

    /**
     * Starts the update routine.
     */
    startUpdate() {
        if(this.updateID !== null) {
            return;
        }

        this.updateID = window.requestAnimationFrame(this.update);
    }

    /**
     * Stops the update routine.
     */
    stopUpdate() {
        if(this.updateID === null) {
            return;
        }

        window.cancelAnimationFrame(this.updateID);
    }

    update(timestamp) {
        if(this.prevTimeStamp > 0)
        {
            var deltaTime = (timestamp - this.prevTimeStamp) * 0.001 * this.timeScale;

            for(var i=this.actions.length-1; i>=0; i--) {
                if(renko.isNullOrUndefined(this.actions[i])) {
                    this.actions.splice(i, 1);
                    continue;
                }
                this.actions[i].action(deltaTime);
            }
        }
        this.prevTimeStamp = timestamp;
        window.requestAnimationFrame(this.update);
    }
}
renko.monoUpdate = new MonoUpdate();