/**
 * Class that wraps over SoundJS module to manage sounds programmatically.
 * 
 * Access "renko.audioManager" to use this class.
 */
class AudioManager {
	
	constructor() {
		this.managedAudio = {};
		this.loadCallbacks = {};
		this.isLoadEventHooked = false;
	}
	
	/**
	 * Plays the audio with specified id.
	 * @param {String} audioId 
	 */
	play(audioId) {
		createjs.Sound.play(audioId);
	}

	/**
	 * Loads an external audio file to SoundJS.
	 * @param {String} fileName 
	 * @param {String} audioId 
	 * @param {Action<String>} callback 
	 */
	load(fileName, audioId, callback) {
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
	 * Plays the audio with specified id.
	 * "identifier" parameter can be specified to stop the audio using stopManaged() function.
	 * @param {String} audioId 
	 * @param {boolean} loop 
	 * @param {String} identifier 
	 */
	playManaged(audioId, loop, identifier) {
		var sound = createjs.Sound.play(audioId, {loop: loop ? -1 : 1});
		this.managedAudio[identifier] = sound;
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
	 * Sets overall volume.
	 * @param {number} volume 
	 */
	setVolume(volume) {
		createjs.Sound.volume = volume;
	}

	/**
	 * Returns overall volume.
	 * @returns {number} 
	 */
	getVolume() {
		return createjs.Sound.volume;
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
	 * Returns whether volume is not muted.
	 * @returns {boolean}
	 */
	isVolumeEnabled() {
		return createjs.Sound.volume > 0;
	}
	
	/**
	 * (Internal)
	 * Returns the SoundJS audio clip managed under specified identifier.
	 * @param {String} identifier 
	 * @returns {*}
	 */
	getManagedAudio(identifier) {
		return this.managedAudio[identifier];
	}
	
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
				if(renko.isNullOrUndefined(sound))
					return;
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