/**
 * A class which manages the emission and movement of sprites like particles.
 * 
 * Create a new instance to use this class.
 * 
 * Dependencies:
 * - classes/MonoUpdate.js
 * - classes/Random.js
 */
class ParticleSystem {

    // this.container; == Contains the particle sprites
    // this.instantiator; == Function which returns a new instance of the particle sprite.
    // this.curTime; == Current particle emission time.
    // this.prevTime; == Previous particle emission time.
    // this.settings; == Base modifier for all general particles.
    // this.emission; == Particle emission modifier.
    // this.modifiers[]; == Array of modifiers which determine how this particle system behaves.
    // this.updateId; == MonoUpdate action identifier.
    // this.isPlaying; == Whether the particle system is playing.

    constructor(container, instantiator) {
        if(renko.isNullOrUndefined(container)) {
            throw new Error("ParticleSystem - container must be a valid symbol instance!");
        }
        if(typeof instantiator !== "function") {
            throw new Error("ParticleSystem - instantiator must be a valid function!");
        }

        this.update = this.update.bind(this);

        this.container = container;
        this.instantiator = instantiator;
        this.curTime = 0;
        this.prevTime = 0;
        this.settings = new ParticleSettings(this);
        this.emission = new ParticleEmission(this);
        this.modifiers = [this.settings];
        this.isPlaying = false;

        this.updateId = null;
        this.setActive(true);
    }

    /**
     * Stops or resumes update routine.
     * @param {boolean} isActive 
     */
    setActive(isActive) {
        if(isActive) {
            if(this.updateId === null) {
                this.updateId = renko.monoUpdate.addAction(this.update);
            }
        }
        else {
            if(this.updateId !== null) {
                renko.monoUpdate.removeAction(this.updateId);
                this.updateId = null;
            }
        }
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
        this.prevTime = 0;
    }

    /**
     * Deactivates all active particles.
     */
    clear() {
        this.emission.clearParticles();
    }

    /**
     * Destroys the particle by deactivating itself and disposing all used objects.
     */
    destroy() {
        this.clear();
        this.setActive(false);
        var objects = this.emission.recycler.objects;
        for(var i=0; i<objects.length; i++) {
            this.container.removeChild(objects[i]);
        }
        this.emission.recycler.objects.length = 0;
        this.emission.activeParticles.length = 0;
        this.emission.newParticles.length = 0;
    }

    /**
     * (Internal)
     * Updates the particle system.
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        deltaTime *= this.settings.speed;

        var didCycle = false;
        if(this.isPlaying) {
            this.curTime += deltaTime;
            if(this.curTime >= this.settings.duration) {
                didCycle = true;
                if(this.settings.isLoop) {
                    this.curTime %= this.settings.duration;
                }
                else {
                    this.stop();
                }
            }
        }

        // Update emission and get newly created particles
        var newParticles = this.emission.update(deltaTime, this.prevTime, this.curTime, didCycle);
        // Handle modification of newly created particle sprites.
        for(var i=0; i<newParticles.length; i++) {
            var particle = newParticles[i];

            for(var c=0; c<this.modifiers.length; c++) {
                this.modifiers[c].modifyCreation(particle);
            }
        }
        // Handle modification of all particle sprites.
        var activeParticles = this.emission.activeParticles;
        for(var i=0; i<activeParticles.length; i++) {
            var particle = activeParticles[i];
            var progress = renko.clamp(particle.curAliveTime / particle.maxAliveTime, 0, 1);
            // Handle modification
            for(var c=0; c<this.modifiers.length; c++) {
                this.modifiers[c].modifyAction(particle, deltaTime, progress);
            }
            // Update the particle
            particle.update();
        }
        // Kill all particles where each one's alive time has reached the end.
        this.emission.killParticles();

        // Store previous time.
        this.prevTime = this.curTime;
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
    // this.isColorSet == Whether start color is set to a non-white color and needs handling.
    // this.aliveTime[]; == Range of alive times of each particle.
    // this.startRotation[]; == Range of random starting rotation.
    // this.startScale[]; == Range of random starting scale.
    // this.startColor[]; == Range of random starting color.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.aliveTime = new Array(2);
        this.startRotation = new Array(2);
        this.startScale = new Array(2);
        this.startColor = new Array(2);
        this.isColorSet = false;

        this.setMaxParticles(1000);
        this.setDuration(5);
        this.setIsLoop(true);
        this.setSpeed(1);
        this.setAliveTime(1);
        this.setStartRotation(0);
        this.setStartScale(1);
        this.setStartColor(null);
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
    setDuration(duration) { this.duration = renko.clamp(duration, 0.01, duration); }

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
     * Sets the particles' starting color to a random value between colorA and colorB.
     * 
     * @param {object} colorA 
     * @param {object} colorB 
     */
    setStartColor(colorA, colorB) {
        if(renko.isNullOrUndefined(colorA)) {
            colorA = {r:1, g:1, b:1, a:1};
        }
        if(renko.isNullOrUndefined(colorB)) {
            colorB = colorA;
        }
        this.startColor[0] = colorA;
        this.startColor[1] = colorB;
        // Once set to true, this flag won't be disabled.
        if(!this.isColorSet) {
            this.isColorSet = !(
                colorA.r === 1 &&
                colorA.g === 1 &&
                colorA.b === 1 &&
                colorA.a === 1 &&
                colorB.r === 1 &&
                colorB.g === 1 &&
                colorB.b === 1 &&
                colorB.a === 1
            );
        }
    }

    /**
     * (Internal)
     * Sets min and max range values to specified target array.
     * @param {number} min 
     * @param {number} max 
     * @param {Array<number>} target 
     */
    setRange(min, max, target) {
        min = renko.clamp(min, 0, min);
        if(typeof max !== "number") {
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

        particle.setPosition(0, 0);

        var scale = renko.random.range(this.startScale[0], this.startScale[1]);
        particle.setScale(scale, scale);
        particle.variables.initialScale = scale;

        if(this.isColorSet) {
            var colorR = renko.random.range(this.startColor[0].r, this.startColor[1].r);
            var colorG = renko.random.range(this.startColor[0].g, this.startColor[1].g);
            var colorB = renko.random.range(this.startColor[0].b, this.startColor[1].b);
            var colorA = renko.random.range(this.startColor[0].a, this.startColor[1].a);

            if(particle.variables.colorFilter === null) {
                var filter = particle.variables.colorFilter = new createjs.ColorFilter(colorR, colorG, colorB, colorA, 0, 0, 0, 0);
                var addResult = particle.addFilter(filter);
                if(!addResult) {
                    particle.variables.colorFilter = null;
                }
            }
            else {
                var filter = particle.variables.colorFilter;
                filter.redMultiplier = colorR;
                filter.greenMultiplier = colorG;
                filter.blueMultiplier = colorB;
                filter.alphaMultiplier = colorA;
                particle.variables.isFilterChanged = true;
            }
        }
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     * @param {number} deltaTime
     * @param {number} progress
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
    // this.curBurstIndex; == Current burst info iteration index.
    // this.activeParticles[]; == Array of ParticleSprite objects currently active.
    // this.bursts[]; == Array of burst emissions registered.
    // this.newParticles[]; == Array of newly created particles on an update.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.recycler = new ParticleRecycler(system);
        this.curEmitThreshold = 0;
        this.curBurstIndex = 0;
        this.activeParticles = [];
        this.bursts = [];
        this.newParticles = [];

        this.setEmissionRate(10);
    }

    /**
     * Adds a new burst event with specified options.
     * @param {number} time 
     * @param {number} minCount 
     * @param {number} maxCount 
     */
    addBurst(time, minCount, maxCount) {
        if(arguments.length === 2) {
            maxCount = minCount;
        }
        this.bursts.push(new ParticleBurst(time, minCount, maxCount));
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
     * @param {number} prevTime
     * @param {number} curTime
     * @param {boolean} didCycle
     */
    update(deltaTime, prevTime, curTime, didCycle) {
        var newParticles = this.newParticles;
        newParticles.length = 0;

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
                this.spawnParticle(1, newParticles);
            }

            // Handling burst emission
            if(this.bursts.length > 0) {
                var backupTime = curTime;
                // If the playback time has cycled, we should process the emission two times:
                // prevTime ~ Duration && 0 ~ curTime
                if(didCycle) {
                    curTime = this.system.settings.duration;
                }
                this.processBurst(prevTime, curTime, newParticles);
                // Emission for the remaining time.
                if(didCycle) {
                    this.curBurstIndex = 0;
                    prevTime = 0;
                    curTime = backupTime;
                    this.processBurst(prevTime, curTime, newParticles);
                }
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
     * Handles the creation routine of burst particles.
     * @param {number} prevTime 
     * @param {number} curTime 
     */
    processBurst(prevTime, curTime) {
        var isLimited = false;
        for(var i=this.curBurstIndex; i<this.bursts.length; i++) {
            var burst = this.bursts[i];

            // If burst time reached
            if(burst.time >= prevTime && burst.time < curTime) {
                this.curBurstIndex = i;

                // Use an extra flag to prevent unnecessary calculations.
                if(!isLimited) {
                    // Check first if the particle spawn count is not limited.
                    var maxSpawnable = this.system.settings.maxParticles - this.activeParticles.length;
                    if(maxSpawnable > 0) {
                        var spawnCount = burst.getBurstCount();
                        if(spawnCount >= maxSpawnable) {
                            isLimited = true;
                            spawnCount = maxSpawnable;
                        }
                        this.spawnParticle(spawnCount, this.newParticles);
                    }
                }
            }
        }
    }

    /**
     * (Internal)
     * Spawns particles by specified options.
     * @param {number} count
     */
    spawnParticle(count) {
        for(var i=0; i<count; i++) {
            var particle = this.recycler.getObject(this.system.settings.getRandomAliveTime());
            this.activeParticles.push(particle);
            this.newParticles.push(particle);
        }
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
    // this.modeParams[]; == Data array that contains current shape mode details.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.offsets = new Array(2);
        this.shapePos = new Array(2);
        this.modeParams = new Array(4);

        this.setShapeNone();
        this.setOffset(0, 0);
        this.setRotation(0);
    }

    /**
     * Sets the particle spawn pattern to a single point (no shape).
     */
    setShapeNone() {
        this.modeParams[0] = 0;
        
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
        this.modeParams[0] = 1;
        this.modeParams[1] = radius;
        this.modeParams[2] = isOnEdge;

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
        this.modeParams[0] = 2;
        this.modeParams[1] = width;
        this.modeParams[2] = isVertical;

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
        this.modeParams[0] = 3;
        this.modeParams[1] = width;
        this.modeParams[2] = height;
        this.modeParams[3] = isOnEdge;

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
        if(typeof customShaper !== "function") {
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
     * Function can take 3 parameters ({number} progress, {number} deltaTime, {number} curAlpha).
     * Function must return a number representing the alpha.
     * @param {Function} easeAlpha 
     */
    setEase(easeAlpha) {
        if(typeof easeAlpha !== "function") {
            throw new Error("ParticleAlpha.setEase - easeAlpha must be a valid function!");
        }
        this.easeAlpha = easeAlpha;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle 
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
 * Particle modifier which manages the color tint of particle sprites.
 * Note that this effect comes at a high performance cost.
 * If possible, use other alternatives such as:
 * - ParticleAlpha, if you want to modify the alpha channel only; or
 * - changing symbol frames.
 */
class ParticleColor {

    // this.system; == The particle system instance which owns this object.
    // this.easeColor; == Function which returns the corresponding color values for specified progress.
    // this.color[]; == Cached array for performance.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.color = [1, 1, 1, 1];
        
        // White tint by default.
        this.setEase(() => {
            this.color[0] = this.color[1] = this.color[2] = this.color[3] = 1;
        });
    }

    /**
     * Sets the function that handles alpha value tween of particle sprites.
     * Function can take 2 parameters ({Array([0]:R, [1]:G, [2]:B, [3]:A)} color, {number} progress).
     * Function must return the color array passed as parameter after modifying its elements.
     * @param {Function} easeColor 
     */
    setEase(easeColor) {
        if(typeof easeColor !== "function") {
            throw new Error("ParticleColor.setEase - easeColor must be a valid function!");
        }
        this.easeColor = easeColor;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle 
     */
    modifyCreation(particle) {
        if(particle.variables.colorFilter === null) {
            var filter = particle.variables.colorFilter = new createjs.ColorFilter(1, 1, 1, 1, 0, 0, 0, 0);
            var addResult = particle.addFilter(filter);
            // If failed to add the filter, just nullify it so we don't update this sprite.
            if(!addResult) {
                particle.variables.colorFilter = null;
            }
        }
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     * @param {number} deltaTime
     * @param {number} progress
     */
    modifyAction(particle, deltaTime, progress) {
        var filter = particle.variables.colorFilter;
        if(filter === null) {
            return;
        }
        var baseColor = particle.variables.color;

        // Handle ease
        var color = this.easeColor(this.color, progress);

        // Apply color to filter
        filter.redMultiplier = color[0] * baseColor.r;
        filter.greenMultiplier = color[1] * baseColor.g;
        filter.blueMultiplier = color[2] * baseColor.b;
        filter.alphaMultiplier = color[3] * baseColor.a;
        particle.variables.isFilterChanged = true;
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
     * Function can take 3 parameters ({number} progress, {number} deltaTime, {number} curScaleX).
     * Function must return a number representing the scaleX.
     * @param {Function} easeScaleX 
     */
    setEaseX(easeScaleX) {
        if(typeof easeScaleX !== "function") {
            throw new Error("ParticleScale.setEaseX - easeScaleX must be a valid function!");
        }
        this.easeScaleX = easeScaleX;
    }

    /**
     * Sets the function that handles scale Y value tween of particle sprites.
     * Function can take 3 parameters ({number} progress, {number} deltaTime, {number} curScaleY).
     * Function must return a number representing the scaleY.
     * @param {Function} easeScaleY 
     */
    setEaseY(easeScaleY) {
        if(typeof easeScaleY !== "function") {
            throw new Error("ParticleScale.setEaseY - easeScaleY must be a valid function!");
        }
        this.easeScaleY = easeScaleY;
    }

    /**
     * Sets the function that handles scale XY value tween of particle sprites.
     * Function can take 3 parameters ({number} progress, {number} deltaTime, {number} curScaleXY).
     * Function must return a number representing the scaleX/scaleY.
     * @param {Function} easeScale
     */
    setEaseXY(easeScale) {
        if(typeof easeScale !== "function") {
            throw new Error("ParticleScale.setEaseXY - easeScale must be a valid function!");
        }
        this.easeScaleX = this.easeScaleY = easeScale;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle 
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
    // this.vel[]; == Cached array for performance.
    // this.modeParams[]; == Data array that contains current movement mode details.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;
        this.vel = [0, 0];
        this.modeParams = new Array(5);

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

        this.modeParams[0] = 0;
        this.modeParams[1] = minX;
        this.modeParams[2] = maxX;
        this.modeParams[3] = minY;
        this.modeParams[4] = maxY;

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

        this.modeParams[0] = 1;
        this.modeParams[1] = minSpeed;
        this.modeParams[2] = maxSpeed;

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

        this.modeParams[0] = 2;
        this.modeParams[1] = minSpeed;
        this.modeParams[2] = maxSpeed;

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
     * Sets the function that handles value tween of particle sprites.
     * Function can take 1 parameter ({Array(2)} velocity).
     * Function must return the received array after applying change.
     * @param {Function} mover 
     */
    setMoveCustom(mover) {
        if(typeof mover !== "function") {
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
        var acceleration = particle.variables.acceleration;
        particle.setPosition(
            particle.variables.positionX + particle.variables.velocityX * deltaTime * acceleration,
            particle.variables.positionY + particle.variables.velocityY * deltaTime * acceleration
        );
    }
}

/**
 * Particle modifier which manages the accleration/deceleration of particle movement.
 * This modifier requires ParticleMovement to take effect.
 */
class ParticleAcceleration {

    // this.system; == The particle system instance which owns this object.
    // this.curAccelerator; == Function which returns the particles' acceleration scale for movement.
    // this.accelScale; == Value passed into setAccelScale.

    /**
     * @param {ParticleSystem} system 
     */
    constructor(system) {
        this.system = system;

        this.setAccelScale(1);
    }

    /**
     * Sets the acceleration/deceleration scale to specified value.
     * @param {number} scale
     */
    setAccelScale(scale) {
        if(typeof scale !== "number") {
            throw new Error("ParticleAcceleration.setAcceleration - scale must be a valid numeric value!");
        }
        this.accelScale = scale;
        this.curAccelerator = function(progress, deltaTime, curScale) {
            return renko.lerp(curScale, scale, progress);
        }
    }

    /**
     * Sets the function that handles custom acceleration/deceleration scale of particle movement.
     * Function can take 2 parameters ({number} progress, {number} deltaTime, {number} curScale).
     * Function must return the received array after applying change.
     * @param {Function} accelerator
     */
    setAccelCustom(accelerator) {
        if(typeof accelerator !== "function") {
            throw new Error("ParticleAccelerator.setAccelCustom - accelerator must be a valid function!");
        }
        this.curAccelerator = accelerator;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     */
    modifyCreation(particle) {
        particle.variables.acceleration = 1;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle
     * @param {number} deltaTime
     * @param {number} progress
     */
    modifyAction(particle, deltaTime, progress) {
        particle.variables.acceleration = this.curAccelerator(progress, deltaTime, particle.variables.acceleration);
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
        if(arguments.length === 1) {
            max = min;
        }

        this.rotation[0] = min;
        this.rotation[1] = max;
    }

    /**
     * (Internal)
     * @param {ParticleSprite} particle 
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
 * Class which its objects are managed by ParticleEmission instance for burst emission effect.
 */
class ParticleBurst {

    // this.time; == The time at which the burst should occur.
    // this.range[]; == Range of particles to spawn on burst.

    constructor(time, minCount, maxCount) {
        this.time = time;
        this.range = [minCount, maxCount];
    }

    /**
     * Returns the number of particles to spawn on calling this method.
     */
    getBurstCount() { return renko.random.range(this.range[0], this.range[1]); }
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
            isFilterChanged: false,

            positionX: 0,
            positionY: 0,
            rotation: 0,
            alpha: 1,
            scaleX: 0,
            scaleY: 0,

            initialScale: 0,
            gravity: 0,
            velocityX: 0,
            velocityY: 0,
            acceleration: 1,
            offsetX: 0,
            offsetY: 0,
            torque: 0,
            color: {r:1, g:1, b:1, a:1},

            colorFilter: null
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
     * Adds the specified filter to the owner.
     * Returns whether adding the filter was successful.
     * @returns {boolean}
     */
    addFilter(filter) {
        var bounds = this.owner.getBounds();
        if(renko.isNullOrUndefined(bounds)) {
            console.log("ParticleSprite.addFilter - Couldn't retrieve bound data for following object:");
            console.log(this.owner);
            return false;
        }

        // Create filters array if null and add filter.
        if(renko.isNullOrUndefined(this.owner.filters)) {
            this.owner.filters = [];
        }
        this.owner.filters.push(filter);
        // Cache the owner.
        this.owner.cache(bounds.x, bounds.y, bounds.width, bounds.height);
        return true;
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
        if(this.variables.isFilterChanged) {
            this.variables.isFilterChanged = false;
            this.owner.updateCache();
        }
    }

    /**
     * Overrides frame_0 to prevent the internal engine from calling it after 1 frame.
     */
    overrideFrame0() {
        // If frame 0 is not defined, just return
        if(typeof this.owner.frame_0 !== "function") {
            return;
        }

        // Get binded frame_0 function
        const originalFrame0 = this.owner.frame_0.bind(this.owner);

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
        if(typeof listener === "function") {
            listener.bind(this.owner)();
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