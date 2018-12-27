/**
 * A class which manages the emission and movement of sprites like particles.
 * 
 * Create a new instance to use this class.
 * 
 * Dependencies:
 * - classes/MonoUpdate.js
 * - classes/Random.js
 * - classes/Optimizer.js
 */
class ParticleSystem {

    // this.container; == Contains the particle sprites
    // this.instantiator; == Function which returns a new instance of the particle sprite.
    // this.curTime; == Current particle emission time.
    // this.settings; == Base modifier for all general particles.
    // this.emission; == Particle emission modifier.
    // this.modifiers[]; == Array of modifiers which determine how this particle system behaves.
    // this.updateId; == MonoUpdate action identifier.
    // this.isPlaying; == Whether the particle system is playing.

    constructor(container, instantiator) {
        if(renko.isNullOrUndefined(container)) {
            throw new Error("ParticleSystem - container must be a valid symbol instance!");
        }
        if(renko.isNullOrUndefined(instantiator) || typeof instantiator !== "function") {
            throw new Error("ParticleSystem - instantiator must be a valid function!");
        }

        this.container = container;
        this.instantiator = instantiator;
        this.curTime = 0;
        this.settings = new ParticleSettings(this);
        this.emission = new ParticleEmission(this);
        this.modifiers = [this.settings];
        this.updateId = renko.monoUpdate.addAction(this.update.bind(this));
        this.isPlaying = false;
    }

    /**
     * Adds the specified modifier to the system to change the particles' behavior.
     * @param {Object} modifier 
     */
    addModifier(modifier) {
        this.modifiers.push(modifier);
    }

    /**
     * Starts the particle system playback.
     */
    play() {
        this.isPlaying = true;
    }

    /**
     * Stops the particle system playback.
     */
    stop() {
        this.isPlaying = false;
        this.curTime = 0;
    }

    /**
     * Deactivates all active particles.
     */
    clear() {
        this.emission.clearParticles();
    }

    /**
     * (Internal)
     * Updates the particle system.
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        deltaTime *= this.settings.speed;

        if(this.isPlaying) {
            this.curTime += deltaTime;
            if(this.curTime >= this.settings.duration) {
                if(this.settings.isLoop) {
                    this.curTime -= this.settings.duration;
                }
                else {
                    this.stop();
                }
            }
        }

        // Update emission and get newly created particles
        var newParticles = this.emission.update(deltaTime);
        // Handle modification of newly created particle sprites.
        if(newParticles !== null) {
            for(var i=0; i<newParticles.length; i++) {
                var particle = newParticles[i];

                for(var c=0; c<this.modifiers.length; c++) {
                    this.modifiers[c].modifyCreation(particle);
                }
            }
        }
        // Handle modification of all particle sprites.
        var activeParticles = this.emission.activeParticles;
        for(var i=0; i<activeParticles.length; i++) {
            var particle = activeParticles[i];
            var progress = renko.clamp(particle.curAliveTime, 0, 1);
            // Handle modification
            for(var c=0; c<this.modifiers.length; c++) {
                this.modifiers[c].modifyAction(particle, deltaTime, progress);
            }
            // Update the particle
            particle.update();
        }
        // Kill all particles where each one's alive time has reached the end.
        this.emission.killParticles();
    }
}

/**
 * (Internal)
 * A class that represents a single element in a particle system.
 */
class ParticleSprite {

    // this.system; == The particle system that owns this sprite.
    // this.owner; == The symbol instance to be represented as a particle sprite.
    // this.isActive; == Whether this particle is alive.
    // this.isInitialized; == Whether ths sprite has been initialized.
    // this.maxAliveTime; == Max alive time of this sprite;
    // this.curAliveTime; == Current alive time of this sprite;
    // this.variables; == Object that simply holds values used by particle modifiers.

    /**
     * @param {ParticleSystem} system 
     * @param {Object} owner 
     */
    constructor(system, owner) {
        this.system = system;
        this.owner = owner;
        this.isInitialized = false;
        this.maxAliveTime = 0;
        this.curAliveTime = 0;
        this.variables = {
            isPositionChanged: true,
            isRotationChanged: true,
            isAlphaChanged: true,
            isScaleChanged: true,

            positionX: 0,
            positionY: 0,
            rotation: 0,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,

            initialScale: 0,
            gravity: 0,
            velocityX: 0,
            velocityY: 0,
            offsetX: 0,
            offsetY: 0,
            torque: 0
        };

        this.overrideFrame0();

        this.fireEvent("onParticleCreated");
        this.setActive(true);
    }

    /**
     * Sets the active state of this sprite.
     * @param {boolean} isActive 
     */
    setActive(isActive) {
        this.owner.visible = isActive;
        this.isActive = isActive;

        if(isActive) {
            this.fireEvent("onParticleEnabled");
        }
        else {
            this.curAliveTime = 0;
            this.fireEvent("onParticleDisabled");
        }
    }

    /**
     * Sets the max alive tiem of this sprite.
     * @param {number} time 
     */
    setMaxAliveTime(time) { this.maxAliveTime = time; }

    /**
     * Adds the current alive time of this sprite.
     * @param {number} time 
     */
    addCurAliveTime(time) { this.curAliveTime += time; }

    /**
     * Sets the symbol's position.
     * @param {Array<number>} position 
     */
    setPosition(x, y) {
        this.variables.isPositionChanged = true;
        this.variables.positionX = x;
        this.variables.positionY = y;
    }

    /**
     * Sets the symbol's rotation.
     * @param {number} rotation 
     */
    setRotation(rotation) {
        this.variables.isRotationChanged = true;
        this.variables.rotation = rotation;
    }

    /**
     * Sets the symbol's alpha color.
     * @param {number} alpha 
     */
    setAlpha(alpha) {
        this.variables.isAlphaChanged = true;
        this.variables.alpha = alpha;
    }

    /**
     * Sets the symbol's scale.
     * @param {number} x 
     * @param {number} y 
     */
    setScale(x, y) {
        this.variables.isScaleChanged = true;
        this.variables.scaleX = x;
        this.variables.scaleY = y;
    }

    /**
     * Returns whether current alive time is greater than or equal to max alive time.
     */
    shouldDie() { return this.curAliveTime >= this.maxAliveTime; }

    /**
     * Updates the symbol instance's values.
     */
    update() {
        if(this.variables.isPositionChanged) {
            this.variables.isPositionChanged = false;
            this.owner.x = this.variables.positionX;
            this.owner.y = this.variables.positionY;
        }
        if(this.variables.isRotationChanged) {
            this.variables.isRotationChanged = false;
            this.owner.rotation = this.variables.rotation;
        }
        if(this.variables.isAlphaChanged) {
            this.variables.isAlphaChanged = false;
            this.owner.alpha = this.variables.alpha;
        }
        if(this.variables.isScaleChanged) {
            this.variables.isScaleChanged = false;
            this.owner.scaleX = this.variables.scaleX;
            this.owner.scaleY = this.variables.scaleY;
        }
    }

    /**
     * Overrides frame_0 to prevent the internal engine from calling it after 1 frame.
     */
    overrideFrame0() {
        // Get frame_0 function
        const originalFrame0 = this.owner.frame_0.bind(this.owner);
        // If frame 0 is not defined, just return
        if(renko.isNullOrUndefined(originalFrame0)) {
            return;
        }

        // Override the function
        this.owner.frame_0 = function() {
            if(this.isInitialized) {
                // When we reach this point, it means createjs has called it after 1 frame.
                // We should revert the frame_0 function to its original value.
                this.owner.frame_0 = originalFrame0;
                return;
            }
            this.isInitialized = true;
            originalFrame0();
        }.bind(this);

        // Call the overrided function to initialize it right now.
        this.owner.frame_0();
    }

    /**
     * Fires the specified event to the owner instance.
     * Valid event names:
     * - onParticleCreated
     * - onParticleEnabled
     * - onParticleDisabled
     */
    fireEvent(eventName) {
        var listener = this.owner[eventName];
        if(!renko.isNullOrUndefined(listener) && typeof listener === "function") {
            listener();
        }
    }
}

/**
 * (Internal)
 * Class that manages the recycling and creation of particle sprites.
 */
class ParticleRecycler {

    // this.system; == The particle system instance which owns this object.
    // this.objects[]; == Array of reusable objects.
    // this.totalObjects; == Total number of particles created by this recycler.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.objects = [];
        this.system = system;
        this.totalObjects = 0;
    }

    /**
     * Returns either a new or recycled ParticleSprite to use in the system.
     * @param {number} aliveTime
     * @returns {ParticleSprite}
     */
    getObject(aliveTime) {
        // If there are no objects in the stack, we should newly instantiate one.
        if(this.objects.length === 0) {
            var obj = this.createObject();
            obj.setMaxAliveTime(aliveTime);
            return obj;
        }
        // Else, just return the last object in the recycler.
        else {
            var obj = this.objects.pop();
            obj.setActive(true);
            obj.setMaxAliveTime(aliveTime);
            return obj;
        }
    }

    /**
     * Deactivates the specified sprite and stores it for later use.
     * @param {ParticleSprite} obj 
     */
    returnObject(obj) {
        obj.setActive(false);
        this.objects.push(obj);
    }

    /**
     * Creates and returns a new instance of ParticleSprite.
     * @returns {ParticleSprite}
     */
    createObject() {
        // Instantiate the symbol instance
        var newObj = this.system.instantiator();
        newObj.name = "particleSprite"+this.totalObjects;
        this.system.container.addChild(newObj);

        // Increase the total object count.
        this.totalObjects ++;

        // Return the new object as ParticleSprite.
        return new ParticleSprite(this.system, newObj);
    }
}

/**
 * The base particle modifier which only affects the fundamental aspects of any particle system.
 * In most cases, this class shouldn't be instantiated manually.
 */
class ParticleSettings {

    // this.system; == The particle system instance which owns this object.
    // this.maxParticles; == Max number of particles emitted at once.
    // this.duration; == Max amount of time where particles can be spawned.
    // this.isLoop; == Whether particle system playback should be looping.
    // this.speed; == The speed of particle simulation.
    // this.aliveTime[]; == Range of alive times of each particle.
    // this.startRotation[]; == Range of random starting rotation.
    // this.startScale[]; == Range of random starting scale.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.aliveTime = new Array(2);
        this.startRotation = new Array(2);
        this.startScale = new Array(2);

        this.setMaxParticles(1000);
        this.setDuration(5);
        this.setIsLoop(true);
        this.setSpeed(1);
        this.setAliveTime(1);
        this.setStartRotation(0);
        this.setStartScale(1);
    }

    /**
     * Sets the max number of particles that can be displayed simultaneously.
     * @param {number} maxParticles 
     */
    setMaxParticles(maxParticles) { this.maxParticles = maxParticles; }

    /**
     * Sets the duration of emission. Ignored if isLoop flag is true.
     * @param {number} duration 
     */
    setDuration(duration) { this.duration = renko.clamp(duration, 0.0000001, duration); }

    /**
     * Sets whether the particle emission should be looping.
     * @param {boolean} isLoop 
     */
    setIsLoop(isLoop) { this.isLoop = isLoop; }

    /**
     * Sets the particle simulation speed.
     * @param {number} speed 
     */
    setSpeed(speed) { this.speed = renko.clamp(speed, 0.0000001, speed); }

    /**
     * Sets the particles' alive time to a random value between min and max.
     * @param {number} min 
     * @param {number} max 
     */
    setAliveTime(min, max) { this.setRange(min, max, this.aliveTime); }

    /**
     * Sets the particles' starting rotation to a random value between min and max.
     * @param {number} min 
     * @param {number} max 
     */
    setStartRotation(min, max) { this.setRange(min, max, this.startRotation); }

    /**
     * Sets the particles' starting scale to a random value between min and max.
     * @param {number} min 
     * @param {number} max 
     */
    setStartScale(min, max) { this.setRange(min, max, this.startScale); }

    /**
     * (Internal)
     * Sets min and max range values to specified target array.
     * @param {number} min 
     * @param {number} max 
     * @param {Array<number>} target 
     */
    setRange(min, max, target) {
        min = renko.clamp(min, 0, min);
        if(renko.isNullOrUndefined(max)) {
            max = min;
        }
        else {
            max = renko.clamp(max, min, max);
        }

        target[0] = min;
        target[1] = max;
    }

    /**
     * (Internal)
     * Returns a random value between min and max alive times.
     */
    getRandomAliveTime() { return renko.random.range(this.aliveTime[0], this.aliveTime[1]); }

    /**
     * (Internal)
     * @param {ParticleSprite} particle 
     */
    modifyCreation(particle) {
        particle.setRotation(renko.random.range(this.startRotation[0], this.startRotation[1]));

        var scale = renko.random.range(this.startScale[0], this.startScale[1]);
        particle.setScale(scale, scale);
        particle.variables.initialScale = scale;
    }

    /**
     * (Internal)
     * Not used for this modifier.
     */
    modifyAction(particle, deltaTime, progress) {}
}

/**
 * Particle modifier which manages the emission of particle sprites.
 * In most cases, this class shouldn't be instantiated manually.
 */
class ParticleEmission {

    // this.system; == The particle system instance which owns this object.
    // this.recycler; == Manages the creation and recycling of ParticleSprite objects.
    // this.emissionRate; == Rate of particle emission.
    // this.emissionRateTime; == Rate of particle emission in relation to time.
    // this.curEmitThreshold; == Current emission threshold.
    // this.activeParticles[]; == Array of ParticleSprite objects currently active.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.recycler = new ParticleRecycler(system);
        this.curEmitThreshold = 0;
        this.activeParticles = [];

        this.setEmissionRate(10);
    }

    /**
     * Sets the rate of particle emission per second.
     * @param {number} rate 
     */
    setEmissionRate(rate) {
        this.emissionRate = renko.clamp(rate, 0.0000001, rate);
        this.emissionRateTime = 1 / this.emissionRate;
    }

    /**
     * (Internal)
     * Handles particle creation update.
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        var newParticles = null;

        if(this.system.isPlaying) {
            // Handling constant emission
            this.curEmitThreshold += deltaTime;
            while(this.curEmitThreshold > this.emissionRateTime) {
                this.curEmitThreshold -= this.emissionRateTime;

                // If reached the max active particles length, just stop emission.
                if(this.activeParticles.length >= this.system.settings.maxParticles) {
                    this.curEmitThreshold %= this.emissionRateTime;
                    break;
                }

                // Get new particle from recycler and add to active particles list.
                var particle = this.recycler.getObject(this.system.settings.getRandomAliveTime());
                this.activeParticles.push(particle);

                // Add to new particles array so their creation can be modified.
                if(newParticles === null) {
                    newParticles = [];
                }
                newParticles.push(particle);
            }
        }

        // Updating each active particle's alive time.
        for(var i=0; i<this.activeParticles.length; i++) {
            this.activeParticles[i].addCurAliveTime(deltaTime);
        }

        return newParticles;
    }

    /**
     * (Internal)
     * Removes all particles that have reached their alive time.
     */
    killParticles() {
        for(var i=this.activeParticles.length-1; i>=0; i--) {
            var particle = this.activeParticles[i];
            if(particle.shouldDie()) {
                this.recycler.returnObject(particle);
                this.activeParticles.splice(i, 1);
            }
        }
    }

    /**
     * (Internal)
     * Removes all particles.
     */
    clearParticles() {
        for(var i=this.activeParticles.length-1; i>=0; i--) {
            this.recycler.returnObject(this.activeParticles[i]);
        }
        this.activeParticles = [];
    }
}

/**
 * Particle modifier which manages the emission shape of particle sprites.
 */
class ParticleShape {

    // this.system; == The particle system instance which owns this object.
    // this.curShaper; == Function which determines the particle's spawning pattern shape.
    // this.rotation; == Amount of rotation to apply on the shape pattern.
    // this.isRotatable; == Whether current shape pattern should support rotation.
    // this.offsets[]; == Amount of offset X and Y to move the shape by.
    // this.shapePos[]; == Cached array for performance.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.offsets = new Array(2);
        this.shapePos = new Array(2);

        this.setShapeNone();
        this.setOffset(0, 0);
        this.setRotation(0);
    }

    /**
     * Sets the particle spawn pattern to a single point (no shape).
     */
    setShapeNone() {
        this.curShaper = function(arr) {
            arr[0] = 0;
            arr[1] = 0;
            return arr;
        }
        this.isRotatable = false;
    }

    /**
     * Sets the particle spawn pattern to a circle.
     * @param {number} radius 
     * @param {boolean} isOnEdge 
     */
    setShapeCircle(radius, isOnEdge) {
        if(isOnEdge) {
            this.curShaper = function(arr) {
                var pos = renko.random.onUnitCircle();
                arr[0] = pos[0] * radius;
                arr[1] = pos[1] * radius;
                return arr;
            }
        }
        else {
            this.curShaper = function(arr) {
                var pos = renko.random.insideUnitCircle();
                arr[0] = pos[0] * radius;
                arr[1] = pos[1] * radius;
                return arr;
            }
        }
        this.isRotatable = false;
    }

    /**
     * Sets the particle spawn pattern to a straight line.
     * @param {number} width 
     * @param {boolean} isVertical 
     */
    setShapeLine(width, isVertical) {
        width /= 2;

        if(isVertical) {
            this.curShaper = function(arr) {
                arr[0] = 0;
                arr[1] = renko.random.range(-width, width);
                return arr;
            }
        }
        else {
            this.curShaper = function(arr) {
                arr[0] = renko.random.range(-width, width);
                arr[1] = 0;
                return arr;
            }
        }
        this.isRotatable = true;
    }

    /**
     * Sets the particle spawn pattern to a rectangle.
     * @param {number} width 
     * @param {number} height 
     * @param {boolean} isOnEdge 
     */
    setShapeRectangle(width, height, isOnEdge) {
        width /= 2;
        height /= 2;
        if(isOnEdge) {
            const widthRatio = width / (width + height);
            this.curShaper = function(arr) {
                if(Math.random() < widthRatio) {
                    arr[0] = renko.random.range(-width, width);
                    arr[1] = renko.random.sign() * height;
                }
                else {
                    arr[0] = renko.random.sign() * width;
                    arr[1] = renko.random.range(-height, height);
                }
                return arr;
            }
        }
        else {
            this.curShaper = function(arr) {
                arr[0] = renko.random.range(-width, width);
                arr[1] = renko.random.range(-height, height);
                return arr;
            }
        }
        this.isRotatable = true;
    }

    /**
     * Sets the particle spawn pattern to user-specified method.
     * You must take an array (length 2) as parameter and return it after you set its element values.
     * @param {Function} customShaper 
     * @param {boolean} isRotatable
     */
    setShapeCustom(customShaper, isRotatable) {
        if(renko.isNullOrUndefined(customShaper) || typeof customShaper !== "function") {
            throw new Error("ParticleShape.setShapeCustom - customShaper must be a valid function!");
        }
        this.curShaper = customShaper;
        this.isRotatable = isRotatable;
    }

    /**
     * Sets the offset for particle spawning position.
     * @param {number} x 
     * @param {number} y 
     */
    setOffset(x, y) {
        this.offsets[0] = x;
        this.offsets[1] = y;
    }

    /**
     * Sets the rotation for particle spawn pattern.
     * @param {number} rotation 
     */
    setRotation(rotation) {
        rotation %= 360;
        if(rotation < 0) {
            rotation = rotation + 360;
        }
        this.rotation = Math.floor(rotation);
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle 
     */
    modifyCreation(particle) {
        var pos = this.curShaper(this.shapePos);
        if(this.isRotatable) {
            var posX = pos[0];
            var posY = pos[1];
            var cos = renko.particleOptimizer.getCos(this.rotation);
            var sin = renko.particleOptimizer.getSin(this.rotation);
            pos[0] = posX * cos - posY * sin;
            pos[1] = posX * sin + posY * cos;
        }
        particle.variables.offsetX = this.offsets[0];
        particle.variables.offsetY = this.offsets[1];
        particle.setPosition(pos[0] + this.offsets[0], pos[1] + this.offsets[1]);
    }

    /**
     * (Internal)
     * Not used for this modifier.
     */
    modifyAction(particle, deltaTime, progress) {}
}

/**
 * Particle modifier which manages the alpha value of particle sprites.
 */
class ParticleAlpha {

    // this.system; == The particle system instance which owns this object.
    // this.easeAlpha; == Function which returns the corresponding alpha value for specified progress.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.setEase((progress) => 1 - progress);
    }

    /**
     * Sets the function that handles alpha value tween of particle sprites.
     * Function can take 3 parameters (progress, deltaTime, curAlpha).
     * Function must return a number representing the alpha.
     * @param {Function} easeAlpha 
     */
    setEase(easeAlpha) {
        if(renko.isNullOrUndefined(easeAlpha) || typeof easeAlpha !== "function") {
            throw new Error("ParticleAlpha.setEase - easeAlpha must be a valid function!");
        }
        this.easeAlpha = easeAlpha;
    }

    /**
     * (Internal)
     * Not used for this modifier.
     */
    modifyCreation(particle) {}

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     * @param {number} deltaTime
     * @param {number} progress
     */
    modifyAction(particle, deltaTime, progress) {
        particle.setAlpha(this.easeAlpha(progress, deltaTime, particle.variables.alpha));
    }
}

/**
 * Particle modifier which manages the scaling of particle sprites.
 */
class ParticleScale {

    // this.system; == The particle system instance which owns this object.
    // this.easeScaleX; == Function which returns the corresponding scaleX value for specified progress.
    // this.easeScaleY; == Function which returns the corresponding scaleY value for specified progress.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
    }

    /**
     * Sets the function that handles scale X value tween of particle sprites.
     * Function can take 3 parameters (progress, deltaTime, curScaleX).
     * Function must return a number representing the scaleX.
     * @param {Function} easeScaleX 
     */
    setEaseX(easeScaleX) {
        if(renko.isNullOrUndefined(easeScaleX) || typeof easeScaleX !== "function") {
            throw new Error("ParticleScale.setEaseX - easeScaleX must be a valid function!");
        }
        this.easeScaleX = easeScaleX;
    }

    /**
     * Sets the function that handles scale Y value tween of particle sprites.
     * Function can take 3 parameters (progress, deltaTime, curScaleY).
     * Function must return a number representing the scaleY.
     * @param {Function} easeScaleY 
     */
    setEaseY(easeScaleY) {
        if(renko.isNullOrUndefined(easeScaleY) || typeof easeScaleY !== "function") {
            throw new Error("ParticleScale.setEaseY - easeScaleY must be a valid function!");
        }
        this.easeScaleY = easeScaleY;
    }

    /**
     * Sets the function that handles scale XY value tween of particle sprites.
     * Function can take 3 parameters (progress, deltaTime, curScaleX/curScaleY).
     * Function must return a number representing the scaleX/scaleY.
     * @param {Function} easeScale
     */
    setEaseXY(easeScale) {
        if(renko.isNullOrUndefined(easeScale) || typeof easeScale !== "function") {
            throw new Error("ParticleScale.setEaseXY - easeScale must be a valid function!");
        }
        this.easeScaleX = this.easeScaleY = easeScale;
    }

    /**
     * (Internal)
     * Not used for this modifier.
     */
    modifyCreation(particle) {}

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     * @param {number} deltaTime
     * @param {number} progress
     */
    modifyAction(particle, deltaTime, progress) {
        var initialScale = particle.variables.initialScale;
        particle.setScale(
            initialScale * this.easeScaleX(progress, deltaTime, particle.variables.scaleX),
            initialScale * this.easeScaleY(progress, deltaTime, particle.variables.scaleY)
        );
    }
}

/**
 * Particle modifier which manages the gravitational pull of particle sprites.
 */
class ParticleGravity {

    // this.system; == The particle system instance which owns this object.
    // this.gravity; == Amount of gravity to apply to negative Y direction.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.setGravity(9.81);
    }

    /**
     * Sets the gravity acceleration scale.
     * @param {number} gravity 
     */
    setGravity(gravity) {
        this.gravity = gravity;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     */
    modifyCreation(particle) {
        particle.variables.gravity = 0;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     * @param {number} deltaTime
     * @param {number} progress
     */
    modifyAction(particle, deltaTime, progress) {
        particle.variables.gravity += this.gravity * deltaTime;
        particle.setPosition(
            particle.variables.positionX,
            particle.variables.positionY + particle.variables.gravity
        );
    }
}

/**
 * Particle modifier which manages the movement of particle sprites.
 */
class ParticleMovement {

    // this.system; == The particle system instance which owns this object.
    // this.curMover; == Function which determines each particle sprite's velocity.
    // this.vel; == Cached array for performance.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.vel = [0, 0];
        this.setMoveRange(0, 0, 1, 1);
    }

    /**
     * Sets the particle velocity by specified range.
     * @param {number} minX 
     * @param {number} maxX 
     * @param {number} minY 
     * @param {number} maxY 
     */
    setMoveRange(minX, maxX, minY, maxY) {
        // Support for two argument option.
        if(arguments.length === 2) {
            minY = maxX;
            maxX = minX;
            maxY = minY;
        }

        this.curMover = function(arr) {
            arr[0] = renko.random.range(minX, maxX);
            arr[1] = renko.random.range(minY, maxY);
            return arr;
        }
    }

    /**
     * Sets the particle velocity by random direction.
     * @param {number} minSpeed 
     * @param {number} maxSpeed 
     */
    setMoveRandom(minSpeed, maxSpeed) {
        if(arguments.length === 0) {
            minSpeed = maxSpeed = 1;
        }
        else if(arguments.length === 1) {
            maxSpeed = minSpeed;
        }

        this.curMover = function(arr) {
            var dir = renko.random.onUnitCircle();
            var speed = renko.random.range(minSpeed, maxSpeed);
            arr[0] = dir[0] * speed;
            arr[1] = dir[1] * speed;
            return arr;
        }
    }

    /**
     * Sets the particle velocity by spawn position.
     * @param {number} minSpeed 
     * @param {number} maxSpeed 
     */
    setMoveDirectional(minSpeed, maxSpeed) {
        if(arguments.length === 0) {
            minSpeed = maxSpeed = 1;
        }
        else if(arguments.length === 1) {
            maxSpeed = minSpeed;
        }

        this.curMover = function(arr, particle) {
            arr[0] = particle.variables.positionX - particle.variables.offsetX;
            arr[1] = particle.variables.positionY - particle.variables.offsetY;
            
            var magnitude = Math.sqrt(arr[0]*arr[0] + arr[1]*arr[1]);
            if(magnitude === 0) {
                magnitude = 1;
            }

            var speed = renko.random.range(minSpeed, maxSpeed);
            arr[0] = arr[0] * speed / magnitude;
            arr[1] = arr[1] * speed / magnitude;
            return arr;
        }
    }

    /**
     * 
     * @param {Function} mover 
     */
    setMoveCustom(mover) {
        if(renko.isNullOrUndefined(mover) || typeof mover !== "function") {
            throw new Error("ParticleMovement.setMoveCustom - mover must be a valid function.");
        }
        this.curMover = mover;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     */
    modifyCreation(particle) {
        var velocity = this.curMover(this.vel, particle);
        particle.variables.velocityX = velocity[0];
        particle.variables.velocityY = velocity[1];
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     * @param {number} deltaTime
     * @param {number} progress
     */
    modifyAction(particle, deltaTime, progress) {
        particle.setPosition(
            particle.variables.positionX + particle.variables.velocityX * deltaTime,
            particle.variables.positionY + particle.variables.velocityY * deltaTime
        );
    }
}

/**
 * Particle modifier which manages the rotation of particle sprites.
 */
class ParticleRotation {

    // this.system; == The particle system instance which owns this object.
    // this.rotation[]; == Array of current rotation speed range.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.rotation = new Array(2);

        this.setRotateSpeed(0, 0);
    }

    /**
     * Sets rotation speed range.
     * @param {number} min 
     * @param {number} max 
     */
    setRotateSpeed(min, max) {
        if(arguments.length === 0) {
            min = max = 0;
        }
        else if(arguments.length === 1) {
            max = min;
        }

        this.rotation[0] = min;
        this.rotation[1] = max;
    }

    /**
     * (Internal)
     * Not used for this modifier.
     */
    modifyCreation(particle) {
        particle.variables.torque = renko.random.range(this.rotation[0], this.rotation[1]);
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     * @param {number} deltaTime
     * @param {number} progress
     */
    modifyAction(particle, deltaTime, progress) {
        particle.setRotation(particle.variables.rotation + particle.variables.torque * deltaTime);
    }
}

/**
 * (Internal)
 * Provides optimizations for heavy calculations associated with particle simulation.
 */
class ParticleOptimizer {

    // this.sinTable;
    // this.cosTable;

    constructor() {
        this.optimizeSin();
        this.optimizeCos();
    }

    getSin(degrees) {
        return this.sinTable[degrees];
    }

    getCos(degrees) {
        return this.cosTable[degrees];
    }

    /**
     * Creates a table of Math.sin values from 0 to 359 degrees.
     */
    optimizeSin() {
        if(!renko.isNullOrUndefined(this.sinTable)) {
            return;
        }
        this.sinTable = [];
        var degToRad = Math.PI / 180;
        for(var i=0; i<360; i++) {
            this.sinTable.push(Math.sin(degToRad * i));
        }
    }

    /**
     * Creates a table of Math.cos values from 0 to 359 degrees.
     */
    optimizeCos() {
        if(!renko.isNullOrUndefined(this.cosTable)) {
            return;
        }
        this.cosTable = [];
        var degToRad = Math.PI / 180;
        for(var i=0; i<360; i++) {
            this.cosTable.push(Math.cos(degToRad * i));
        }
    }
}
renko.particleOptimizer = new ParticleOptimizer();