class AudioManager {
	
	constructor() {
		this.managedAudio = {};
	}
	
	play(audioId) {
		createjs.Sound.play(audioId);
	}
	
	playManaged(audioId, loop, identifier) {
		var sound = createjs.Sound.play(audioId, {loop: loop ? -1 : 1});
		this.managedAudio[identifier] = sound;
	}
	
	stopManaged(identifier) {
		var sound = this.managedAudio[identifier];
		if(sound === undefined || sound === null)
			return;
		sound.stop();
	}
	
	setVolume(volume) {
		createjs.Sound.volume = volume;
	}
	
	toggleVolume() {
		if(createjs.Sound.volume > 0)
			setVolume(0)
		else
			setVolume(1);
	}
	
	isVolumeEnabled() {
		return createjs.Sound.volume > 0;
	}
	
	getManagedAudio(identifier) {
		return this.managedAudio[identifier];
	}
}
renko.audioManager = new AudioManager();