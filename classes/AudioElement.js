/**
 * Class that uses HTML5 audio element to manage playback of audio.
 * 
 * Create a new instance to use this class.
 */
class AudioElement {

	constructor(id) {
		// Create a new audio element
		this.audio = document.createElement("audio");
		this.audio.setAttribute("id", id);

		// Append element to parent
		var parentNode = canvas.parentElement;
		parentNode.appendChild(this.audio);

		// Hide element
		this.audio.style.visibility = "hidden";
	}

	/**
	 * Sets the source url of the audio to play.
	 * @param {String} source 
	 */
	setSource(source) {
		this.audio.setAttribute("src", source);
	}

	/**
	 * Sets the volume of this audio.
	 * @param {number} volume 
	 */
	setVolume(volume) {
		this.audio.volume = volume;
	}

	/**
	 * Returns the raw DOM element being wrapped over.
	 */
	getElement() {
		return this.audio;
	}

	/**
	 * Plays audio.
	 */
	play() {
		this.audio.play();
	}

	/**
	 * Pauses audio.
	 */
	pause() {
		this.audio.pause();
	}

	/**
	 * Stops audio.
	 */
	stop() {
		this.audio.currentTime = 0;
		this.pause();
	}

	/**
	 * Returns whether audio is playing.
	 */
	isPlaying() {
		return !this.audio.paused && this.audio.currentTime > 0;
	}
}