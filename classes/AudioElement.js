class AudioElement {

	constructor(id) {
		this.audio = document.createElement("audio");
		this.audio.setAttribute("id", id);

		// Append input to parent
		var parentNode = canvas.parentElement;
		parentNode.appendChild(this.audio);
		this.audio.style.visibility = "hidden";
	}

	setSource(source) {
		this.audio.setAttribute("src", source);
	}

	setVolume(volume) {
		this.audio.volume = volume;
	}

	getElement() {
		return this.audio;
	}

	play() {
		this.audio.play();
	}

	pause() {
		this.audio.pause();
	}

	stop() {
		this.audio.currentTime = 0;
		this.pause();
	}

	isPlaying() {
		return !this.audio.paused && this.audio.currentTime > 0;
	}
}