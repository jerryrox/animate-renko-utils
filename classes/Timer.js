/**
 * Javascript port of old Renko-L Timer library.
 * 
 * Access "renko.timer" to use this class.
 * 
 * Dependencies:
 * - classes/MonoUpdate.js
 */
class Timer {

    // this.nextId;
    // this.deltaTime;
    // this.speed;
    // this.items;

    constructor() {
        this.nextId = 0;
        this.speed = 1;
        this.items = [];
        
        // Listen to update calls.
        this.update = this.update.bind(this);
        renko.monoUpdate.addAction(this.update);
    }

    /**
     * Creates a new item that provides a delayed callback after specified duration.
     * @param {number} duration
     * @param {number} repeat
     * @param {Function<TimerItem>} finishHandler
     */
    createDelay(duration, repeat, finishHandler) {
        var item = new TimerItem(this.nextId++, duration, repeat, finishHandler);
        this.addItem(item);
        return item;
    }

    /**
     * Creates a new itemthat provides a callback event after a frame.
     * @param {Function<TimerItem>} finishHandler
     */
    createFrameDelay(finishHandler) {
        var item = new TimerItem(this.nextId++, 0, 0, finishHandler);
        this.addItem(item);
        return item;
    }

    /**
     * Returns the global speed.
     */
    getSpeed() { return this.speed; }

    /**
     * Sets all items' update speed.
     * @param {number} speed 
     */
    setSpeed(speed) {
        speed = renko.clamp(speed, 0.0000001, speed);
        this.speed = speed;
        for(var i=0; i<this.items.length; i++) {
            this.items[i].setSpeed(speed);
        }
    }

    /**
     * Registers the specified item to processing list.
     * @param {TimerItem} item 
     */
    addItem(item) { this.items.push(item); }

    /**
     * Stops the specified item from processing list.
     * @param {TimerItem} item 
     */
    removeItem(item) { this.items.remove(item); }

    /**
     * Removes the item with specified id.
     * @param {number} itemId 
     */
    stopByItemId(itemId) {
        for(var i=0; i<this.items.length; i++) {
            var item = this.items[i];
            if(item.id === itemId) {
                item.stop();
                break;
            }
        }
    }

    /**
     * Removes the items with specified group id.
     * @param {number} groupId 
     */
    stopByGroupId(groupId) {
        for(var i=0; i<this.items.length; i++) {
            var item = this.items[i];
            if(item.groupId === groupId) {
                item.stop();
            }
        }
    }

    update(deltaTime) {
        this.deltaTime = deltaTime;

        for(var i=this.items.length-1; i>=0; i--) {
            var item = this.items[i];

            if(!item.getIsUpdating()) {
                item.start();
            }
            item.update();
            if(item.getIsStopped()) {
                this.items.splice(i, 1);
            }
        }
    }
}
renko.timer = new Timer();

class TimerItem {

    // this.id;
    // this.groupId;
    // this.speed;
    // this.duration;
    // this.isPaused;
    // this.isUpdating;
    // this.isStopped;
    // this.onItemUpdate;
    // this.onItemRepeat;
    // this.onItemFinish;
    // this.startedTime;
    // this.currentTime;
    // this.repeatedCount;
    // this.targetRepeats;

    /**
     * 
     * @param {number} id
     * @param {number} duration
     * @param {number} repeat 
     * @param {TimerItem} finishHandler 
     */
    constructor(id, duration, repeat, finishHandler) {
        this.id = id;
        this.groupId = 0;
        this.speed = renko.timer.speed;
        this.duration = duration;
        this.isPaused = false;
        this.isUpdating = false;
        this.isStopped = false;
        this.onItemUpdate = null;
        this.onItemRepeat = null;
        this.onItemFinish = finishHandler;
        this.startedTime = 0;
        this.currentTime = 0;
        this.repeatedCount = 0;
        this.targetRepeats = repeat;
    }

    /**
     * Returns the individual identifier of this item.
     */
    getId() { return this.id; }

    /**
     * Sets the individual identifier of this item.
     * @param {number} value 
     */
    setId(value) { this.id = value; }

    /**
     * Returns the group identifier of this item.
     */
    getGroupId() { return this.groupId; }

    /**
     * Sets the group identifier of this item.
     * @param {number} value 
     */
    setGroupId(value) { this.groupId = value; }

    /**
     * Returns this item's timescale.
     */
    getSpeed() { return this.speed; }

    /**
     * Sets this item's timescale.
     * @param {number} value 
     */
    setSpeed(value) { this.speed = value; }

    /**
     * Returns the number of repeated times.
     */
    getRepeatCount() { return this.repeatedCount; }

    /**
     * Sets the max number of repeats to make.
     * @param {number} value 
     */
    setRepeatCount(value) { this.targetRepeats = value; }

    /**
     * Returns the current duration of this item.
     */
    getDuration() { return this.duration; }

    /**
     * Sets the current duration of this item per repeat.
     * @param {number} value 
     */
    setDuration(value) { this.duration = value; }

    /**
     * Returns the current update progress between start and end time (0~1).
     */
    getProgress() {
        return renko.lerp(this.startedTime, this.startedTime + this.duration, this.currentTime);
    }

    /**
     * Sets the current update progress between start and end time (0~1).
     * @param {number} value 
     */
    setProgress(value) {
        this.currentTime = renko.lerp(this.startedTime, this.startedTime + this.duration, value);
    }

    /**
     * Returns the amount of time passed since update start.
     */
    getTimePassed() { return this.currentTime - this.startedTime; }

    /**
     * Sets the amount of time passed since update start.
     * @param {number} value 
     */
    setTimePassed(value) {
        this.currentTime = renko.lerp(
            value + this.startedTime,
            this.startedTime,
            this.startedTime + this.duration
        );
    }

    /**
     * Returns the amount of time left before current repeat finishes.
     */
    getTimeLeft() { return this.startedTime + this.duration - this.currentTime; }

    /**
     * Sets the amount of time left before current repeat finishes.
     * @param {number} value 
     */
    setTimeLeft(value) {
        this.currentTime = renko.lerp(
            this.startedTime + this.duration - value,
            this.startedTime,
            this.startedTime + this.duration
        );
    }

    /**
     * Returns whether this item is paused.
     */
    getIsPaused() { return this.isPaused; }

    /**
     * Sets whether this item is paused.
     * @param {boolean} value 
     */
    setIsPaused(value) { this.isPaused = value; }

    /**
     * Returns whether this item is currently updating.
     */
    getIsUpdating() { return this.isUpdating; }

    /**
     * Returns whether this item has stopped processing and should be disposed in the next update.
     */
    getIsStopped() { return this.isStopped; }

    /**
     * Sets the item update event listener.
     * @param {Action<TimerItem>} value 
     */
    setOnItemUpdate(value) { this.onItemUpdate = value; }

    /**
     * Sets the item repeat event listener.
     * @param {Action<TimerItem>} value 
     */
    setOnItemRepeat(value) { this.onItemRepeat = value; }

    /**
     * Sets the item finish event listener.
     * @param {Action<TimerItem>} value 
     */
    setOnItemFinish(value) { this.onItemFinish = value; }

    start() {
        if(this.isUpdating) {
            return;
        }
        this.currentTime = this.startedTime = 0;
        this.reset();
    }

    pause() {
        this.isPaused = true;
    }

    stop() {
        this.isStopped = true;
    }

    finish() {
        this.stop();
        if(!renko.isNullOrUndefined(this.onItemFinish)) {
            this.onItemFinish(this);
        }
    }

    reset() {
        this.isPaused = false;
        this.isUpdating = true;
        this.isStopped = false;
    }

    update() {
        if(this.isPaused || this.isStopped) {
            return;
        }
        // Checking this before update ensures that at least 1 frame is passed before notifying end event.
        if(this.currentTime > this.startedTime + this.duration) {
            if(!this.repeat()) {
                this.finish();
                return;
            }
        }
        this.currentTime += renko.timer.deltaTime * this.speed;
        if(!renko.isNullOrUndefined(this.onItemUpdate)) {
            this.onItemUpdate(this);
        }
    }

    /**
     * Returns whether this item should be repeated.
     */
    repeat() {
        this.repeatedCount ++;
        if(this.repeatedCount > this.targetRepeats) {
            return false;
        }

        this.startedTime += this.duration;
        if(!renko.isNullOrUndefined(this.onItemRepeat)) {
            this.onItemRepeat(this);
        }
        return true;
    }
}