/**
 * Class that wraps over SoundJS module to manage sounds programmatically.
 * 
 * Access "renko.audioManager" to use this class.
 */
class AudioManager {
	
	constructor() {
		this.loadedCount = 0;
		this.totalCount = 0;
		this.managedAudio = {};
		this.loadCallbacks = {};
		this.isLoadEventHooked = false;
	}
	
	/**
	 * Sets overall volume.
	 * @param {number} volume 
	 */
	setVolume(volume) { createjs.Sound.volume = volume; }

	/**
	 * Returns overall volume.
	 * @returns {number} 
	 */
	getVolume() { return createjs.Sound.volume; }
	
	/**
	 * Returns whether volume is not muted.
	 * @returns {boolean}
	 */
	isVolumeEnabled() { return createjs.Sound.volume > 0; }

	/**
	 * Returns the number of loaded audios.
	 */
	getLoadedCount() { return this.loadedCount; }

	/**
	 * Returns the total number of audios being loaded and already loaded.
	 */
	getTotalCount() { return this.totalCount; }

	/**
	 * Returns the current audio load progress ranging from 0 to 1.
	 */
	getLoadProgress() { return this.loadedCount / this.totalCount; }

	/**
	 * Returns whether all requested.
	 */
	isLoadedAll() { return this.loadedCount >= this.totalCount; }

	/**
	 * Plays the audio with specified id and returns the object reference.
	 * @param {String} audioId 
	 */
	play(audioId) {
		return createjs.Sound.play(audioId);
	}

	/**
	 * Loads an external audio file to SoundJS.
	 * @param {String} fileName 
	 * @param {String} audioId 
	 * @param {Action<String>} callback 
	 */
	load(fileName, audioId, callback) {
		// Increase total number of audios
		this.totalCount ++;

		// If there is a callback
		if(!renko.isNullOrUndefined(callback))
		{
			// Register callback for this audio id
			this.registerCallback(audioId, callback);
		}

		// Load audio through SoundJS
		createjs.Sound.registerSound(fileName, audioId);
	}
	
	/**
	 * Plays the audio with specified id and returns the object reference.
	 * "identifier" parameter can be specified to stop the audio using stopManaged() function.
	 * @param {String} audioId 
	 * @param {boolean} loop 
	 * @param {String} identifier 
	 */
	playManaged(audioId, loop, identifier) {
		var sound = createjs.Sound.play(audioId, {loop: loop ? -1 : 1});
		this.managedAudio[identifier] = sound;
		return sound;
	}

	/**
	 * Stops audio being managed under specified identifier.
	 * @param {String} identifier 
	 */
	stopManaged(identifier) {
		var sound = this.managedAudio[identifier];
		if(renko.isNullOrUndefined(sound))
			return;
		
		this.managedAudio[identifier] = null;
		sound.stop();
	}
	
	/**
	 * Toggles overall volume to 0 or 1.
	 */
	toggleVolume() {
		if(createjs.Sound.volume > 0)
			setVolume(0)
		else
			setVolume(1);
	}
	
	/**
	 * Returns the SoundJS audio clip managed under specified identifier.
	 * @param {String} identifier 
	 * @returns {*}
	 */
	getManagedAudio(identifier) { return this.managedAudio[identifier]; }
	
	/**
	 * Returns whether there is an audio instance with specified identifier being managed.
	 * @param {String} identifier 
	 */
	isPlayingManaged(identifier) { return !renko.isNullOrUndefined(this.getManagedAudio(identifier)); }

	/**
	 * (Internal)
	 * Registers the specified callback with the audio id.
	 * @param {String} audioId 
	 * @param {Action<String>} callback 
	 */
	registerCallback(audioId, callback) {
		// If SoundJS load callback is not registered yet
		if(!this.isLoadEventHooked)
		{
			this.isLoadEventHooked = true;

			// Setup load callback
			createjs.Sound.on("fileload", function (sound) {
				if(renko.isNullOrUndefined(sound)) {
					return;
				}
				// Increase the number of loaded audios
				this.loadedCount ++;
				// Fire custom load event if exists.
				this.fireLoadEvent(sound.id);
			}.bind(this));
		}

		this.loadCallbacks[audioId] = callback;
	}

	/**
	 * (Internal)
	 * Fires audio loaded event for specified audio id.
	 * @param {String} audioId 
	 */
	fireLoadEvent(audioId) {
		// Check for a callback registered to specified id.
		if(renko.isNullOrUndefined(this.loadCallbacks[audioId]))
			return;
		
		this.loadCallbacks[audioId](audioId);
		this.loadCallbacks[audioId] = null;
	}
}
renko.audioManager = new AudioManager();