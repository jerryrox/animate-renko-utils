/**
 * Javascript port of old Renko-L FateFX library.
 * 
 * Access "renko.fateFX" to use this class.
 * 
 * Dependencies:
 * ./MonoUpdate.js
 */
class FateFX {
    
    // this.items;
    // this.deltaTime;

    constructor() {
        // Initialize fields
        this.items = [];
        this.deltaTime = 0;

        // Bind the function so we don't do this every time.
        this.update = this.update.bind(this);

        // Listen to update calls.
        renko.monoUpdate.addAction(this.update);
    }

    /**
     * Registers the spe ified item to update queue.
     * @param {FateItem} item 
     */
    registerItem(item) {
        if(this.items.includes(item)) {
            return;
        }
        this.items.push(item);
    }

    /**
     * Removes the specified item from update queue.
     * @param {FateItem} item 
     */
    removeItem(item) {
        for(var i=this.items.length-1; i>=0; i--) {
            if(this.items[i] === item) {
                this.items[i] = null;
                return;
            }
        }
    }

    update(deltaTime) {
        this.deltaTime = deltaTime;
        for(var i=this.items.length-1; i>=0; i--) {
            if(renko.isNullOrUndefined(this.items[i])) {
                this.items.splice(i, 1);
                continue;
            }
            this.items[i].update();
        }
    }
}
renko.fateFX = new FateFX();

/**
 * The item which represents a single FateFX animation.
 */
class FateItem {

    // this.onReset;
    // this.sections;
    // this.speed;
    // this.duration;
    // this.totalDuration;
    // this.curTime;
    // this.startDelay;
    // this.endDelay;
    // this.isLoop;
    // this.isPlaying;
    // this.defaultBind;

    getSpeed() { return this.speed; }
    setSpeed(speed) { this.speed = speed; }

    getIsLoop() { return this.isLoop; }
    setIsLoop(isLoop) { this.isLoop = isLoop; }

    getIsPlaying() { return this.isPlaying; }

    getDuration() { return this.duration; }

    getTotalDuration() { return this.totalDuration; }

    getCurrentTime() { return renko.clamp(this.curTime, 0, this.totalDuration) }

    getProgress() { return (this.duration - this.curTime) / this.duration; }

    constructor(defaultBind) {
        this.onReset = null;
        this.sections = [];
        this.speed = 1;
        this.duration = 0;
        this.totalDuration = 0;
        this.curTime = 0;
        this.startDelay = 0;
        this.endDelay = 0;
        this.isLoop = false;
        this.isPlaying = false;
        this.defaultBind = defaultBind;
    }

    /**
     * Updates the item's animation frame.
     */
    update() {
        var lastTime = this.curTime;
        this.curTime += renko.fateFX.deltaTime * this.speed;

        this.updateSections(this.curTime, lastTime);

        // On update finished
        if(this.curTime > this.totalDuration) {
            this.handleUpdateFinished();
        }
    }

    /**
     * Plays the animation.
     */
    play() {
        this.isPlaying = true;

        this.seekTo(this.curTime, false);
        renko.fateFX.registerItem(this);
    }

    /**
     * Pauses the animation.
     */
    pause() {
        this.isPlaying = false;

        renko.fateFX.removeItem(this);
    }

    /**
     * Stops the animation and resets time to 0.
     * If update is true, this method will call SeekTo with time 0.
     * Else, only the time is set to 0 and the view state will stay.
     */
    stop(update = false) {
        this.isPlaying = false;

        if(update) {
            this.seekTo(0, false);
        }
        else {
            this.curTime = 0;
        }

        renko.fateFX.removeItem(this);
        this.invokeResetter();
    }

    /**
     * Sets current time to specified value.
     * If isRatio is true, the specified 'time' will be interpreted as an interpolant value (0~1).
     * @param {number} time 
     * @param {boolean} isRatio 
     */
    seekTo(time, isRatio) {
        if(isRatio) {
            this.curTime = renko.lerp(0, this.totalDuration, time);
        }
        else {
            this.curTime = renko.clamp(this.curTime, 0, this.totalDuration);
        }

        this.updateSections(this.curTime, this.curTime - renko.fateFX.deltaTime * this.speed);
    }

    /**
     * Clears all sections in this item.
     */
    clear() {
        this.sections = [];
    }

    /**
     * Sets the amount of delay to apply on animation start/end.
     * @param {number} startDelay 
     * @param {number} endDelay 
     */
    setDelays(startDelay, endDelay) {
        this.startDelay = startDelay;
        this.endDelay = endDelay;

        this.refreshTimeValues();
    }

    /**
     * Creates a new section, adds it, and returns it.
     */
    createSection(startTime, endTime) {
        return this.addSection(new FateSection(this, startTime, endTime));
    }

    /**
     * Createsa a fate section for callback event when current time reaches the specified value.
     * @param {number} time 
     * @param {Action<FateSection>} callback 
     */
    createEvent(time, callback) {
        var section = new FateSection(this, time, time);
        section.onStart = this.bindAction(callback);
        return this.addSection(section);
    }

    /**
     * Adds the specified section and returns it.
     * @param {FateSection} section 
     */
    addSection(section) {
        this.sections.push(section);
        this.refreshTimeValues();
        return section;
    }

    /**
     * Binds the specified action to default bind object (if exists) and returns it.
     */
    bindAction(action) {
        if(renko.isNullOrUndefined(this.defaultBind)) {
            return action;
        }
        return action.bind(this.defaultBind);
    }

    /**
     * Invokes the OnReset handler.
     */
    invokeResetter() {
        if(!renko.isNullOrUndefined(this.onReset)) {
            this.onReset(this);
        }
    }

    /**
     * Refreshes local variables related to timing.
     */
    refreshTimeValues() {
        this.applyDelay();
        this.findDuration();

        // startDelay is already included in duration.
        this.totalDuration = this.duration + this.endDelay;
    }

    /**
     * Applies delay for each fate section.
     */
    applyDelay() {
        for(var i=0; i<this.sections.length; i++) {
            this.sections[i].setDelay(this.startDelay);
        }
    }

    /**
     * Iterates through each section to find the duration of this item.
     */
    findDuration() {
        this.duration = 0;
        for(var i=0; i<this.sections.length; i++) {
            var sectionEnd = this.sections[i].getEndTime();
            if(sectionEnd > this.duration) {
                this.duration = sectionEnd;
            }
        }
    }

    /**
     * Updates all sections with specified time values.
     * @param {number} curTime 
     * @param {number} lastTime 
     */
    updateSections(curTime, lastTime) {
        for(var i=0; i<this.sections.length; i++) {
            this.sections[i].update(curTime, lastTime);
        }
    }

    /**
     * Handles update finish event.
     */
    handleUpdateFinished() {
        if(this.isLoop) {
            this.curTime = 0;
        }
        else {
            this.pause();
        }

        this.invokeResetter();
    }
}

/**
 * A class that represents a time section within FateFX.
 */
class FateSection {

    // this.item;
    // this.onStart;
    // this.onEnd;
    // this.actions;
    // this.startTime;
    // this.endTime;
    // this.delayedStartTime;
    // this.delayedEndTime;

    getDuration() { return this.endTime - this.startTime; }

    getStartTime() { return this.delayedStartTime; }

    getEndTime() { return this.delayedEndTime; }

    getDelay() { return this.delayedStartTime - this.startTime; }

    constructor(item, startTime, endTime) {
        this.item = item;
        this.onStart = null;
        this.onEnd = null;
        this.actions = [];
        this.startTime = startTime;
        this.endTime = endTime;
        this.delayedStartTime = 0;
        this.delayedEndTime = 0;
    }

    /**
     * Updates fate actions.
     * @param {number} curTime 
     * @param {number} lastTime 
     */
    update(curTime, lastTime) {
        if(curTime < this.delayedStartTime || lastTime >= this.delayedEndTime) {
            return;
        }

        // On start event
        if(lastTime <= this.delayedStartTime) {
            this.invokeEvent(this.onStart);
        }

        // On end event.
        // Here, we manually call AnimateActions with progress 1 so it should just return after event.
        if(curTime >= this.delayedEndTime) {
            this.animateActions(1);
            this.invokeEvent(this.onEnd);
            return;
        }

        // Update progress
        this.animateActions(renko.inverseLerp(
            this.delayedStartTime,
            this.delayedEndTime,
            curTime
        ));
    }

    /**
     * Sets the amount of delay to apply on start.
     * Only for FateItem class and therefore shouldn't be used outside.
     * @param {number} delay 
     */
    setDelay(delay) {
        this.delayedStartTime = this.startTime + delay;
        this.delayedEndTime = this.endTime + delay;
    }

    /**
     * Adds the specified action to this section.
     * @param {Action<number>} action 
     */
    addAction(action) {
        this.actions.push(this.item.bindAction(action));
    }

    /**
     * Invokes the specified event if not null.
     * @param {Action<FateSection>} handler 
     */
    invokeEvent(handler) {
        if(!renko.isNullOrUndefined(handler)) {
            handler(this);
        }
    }

    /**
     * Animates all actions in this section.
     * @param {number} progress 
     */
    animateActions(progress) {
        for(var i=0; i<this.actions.length; i++) {
            this.actions[i](progress);
        }
    }
}