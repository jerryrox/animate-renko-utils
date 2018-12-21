// Audio context must be supported to use WavCombiner
if (typeof webkitAudioContext !== "undefined") {
	window.AudioContext = window.webkitAudioContext;
}
else if (typeof window.mozAudioContext !== "undefined") {
	window.AudioContext = window.mozAudioContext;
}
else {
	console.log("WavCombiner - Error: WavCombiner is not supported in this browser!")
	return;
}

/**
 * Class that combines multiple audio files into a single wav file.
 * 
 * Create a new instance to use this class.
 * 
 * Tested audio types:
 * - MP3
 * 
 * Dependencies:
 * - external/FetchPolyfill.js
 * - external/PromisePolyfill.js
 * - classes/DownloadUtility.js
 */
class WavCombiner {

	constructor() {
		this.audioContext = new AudioContext();
		this.reset();
	}

    /**
     * Resets the combiner for next time use.
     */
	reset() {
		this.audioDataLoaders = [];
		this.outputBlob = null;
	}

    /**
     * Adds array of audio file paths.
     * @param {Array<String>} files 
     */
	addFiles(files) {
		for(var i=0; i<files.length; i++) {
			var req = fetch(files[i])
				.then(function(value) {
					return value.arrayBuffer();
				})
				.then(function(arrBuffer) {
					return this.audioContext.decodeAudioData(
						arrBuffer,
						function(audioBuffer) {
							console.log("WavCombiner.addFiles - Loaded audio buffers. length: " + audioBuffer.length);
						},
						function(e) {
							console.log("WavCombiner.addFiles - Error while decoding audio data!");
							console.log(e);
						}
					);
				}.bind(this))
				.catch(function(e) {
					console.log("WavCombiner.addFiles - Error while processing!");
					console.log(e);
				}
			);
			this.audioDataLoaders.push(req);
		}
	}

    /**
     * Returns the properties of the output audio.
     * @param {Array<AudioBuffer>} buffers 
     */
	getMetadata(buffers) {
		var numberOfChannels = 9999;
		var totalLength = 0;
		var sampleRate = buffers[0].sampleRate;
		for(var i=0; i<buffers.length; i++) {
			numberOfChannels = Math.min(numberOfChannels, buffers[i].numberOfChannels);
			totalLength += buffers[i].length;
		}
		return {
			numberOfChannels,
			totalLength,
			sampleRate
		};
	}

	/**
	 * Returns the output blob created from combine process.
	 */
	getBlob() {
		return this.outputBlob;
	}

	/**
	 * Returns the url to the output blob.
	 */
	getBlobUrl() {
		return window.URL.createObjectURL(this.outputBlob);
	}

	/**
	 * Requests download for the output audio.
	 * @param {String} fileName 
	 */
	download(fileName) {
		renko.downloadUtility.downloadBlob(this.getBlob(), fileName);
	}

	/**
	 * Combines all audio added from addFiles() function.
	 * @param {Action<boolean>} callback 
	 */
	combineAudio(callback) {
		Promise.all(this.audioDataLoaders).then(function(buffers) {
			// Get metadata of all audio buffers
			var metadata = this.getMetadata(buffers);
			// Offline context which will render final audio
			var offlineContext = new OfflineAudioContext(metadata.numberOfChannels, metadata.totalLength, metadata.sampleRate);
			// Combine audio buffers and get an AudioContext that represents it
			var outputBuffer = this.appendBuffer(offlineContext, buffers, metadata);
			// Connect outputBuffer to offline context as a source for rendering.
			var outputBufferSource = offlineContext.createBufferSource();
			outputBufferSource.buffer = outputBuffer;
			outputBufferSource.connect(offlineContext.destination);
			outputBufferSource.start();
	
			// Render audio
			offlineContext.startRendering().then(function(finalBuffer) {
				this.outputBlob = this.bufferToWave(finalBuffer, 0, finalBuffer.length);
				callback(true);
			}.bind(this))
			.catch(function(e) {
				console.log("WavCombiner.combineAudio - Error while rendering audio!");
				console.log(e);
				callback(false);
			});
		}.bind(this))
		.catch(function(e) {
			console.log("WavCombiner.combineAudio - Error while appending buffer!");
			console.log(e);
			callback(false);
		});
	}

	/**
	 * (Internal)
	 * Appends the specified audio buffers together.
	 * @param {AudioContext} context 
	 * @param {AudioBuffer} buffers 
	 * @param {*} metadata 
	 */
	appendBuffer(context, buffers, metadata) {
		// Create a temporary AudioContext for holding audio buffers.
		var tmp = context.createBuffer(metadata.numberOfChannels, metadata.totalLength, metadata.sampleRate);
		for(var c=0; c<metadata.numberOfChannels; c++) {
			var channel = tmp.getChannelData(c);
			var offset = 0;
			for(var i=0; i<buffers.length; i++) {
				channel.set(buffers[i].getChannelData(c), offset);
				offset += buffers[i].length;
			}
		}
		return tmp;
	}
	
	/**
	 * (Internal)
	 * Converts the audio buffer to wave data.
	 * @param {AudioBuffer} abuffer 
	 * @param {number} offset 
	 * @param {*} len 
	 */
	bufferToWave(abuffer, offset, len) {
		// Couldn't find the source url after closing my tabs.
		// But thanks a lot for this code

		var numOfChan = abuffer.numberOfChannels,
			length = len * numOfChan * 2 + 44,
			buffer = new ArrayBuffer(length),
			view = new DataView(buffer),
			channels = [], i, sample,
			pos = 0;
	
		function setUint16(data) {
			view.setUint16(pos, data, true);
			pos += 2;
		}
	  
		function setUint32(data) {
			view.setUint32(pos, data, true);
			pos += 4;
		}
	  
		// write WAVE header
		setUint32(0x46464952);                         // "RIFF"
		setUint32(length - 8);                         // file length - 8
		setUint32(0x45564157);                         // "WAVE"
	  
		setUint32(0x20746d66);                         // "fmt " chunk
		setUint32(16);                                 // length = 16
		setUint16(1);                                  // PCM (uncompressed)
		setUint16(numOfChan);
		setUint32(abuffer.sampleRate);
		setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
		setUint16(numOfChan * 2);                      // block-align
		setUint16(16);                                 // 16-bit (hardcoded in this demo)
	  
		setUint32(0x61746164);                         // "data" - chunk
		setUint32(length - pos - 4);                   // chunk length
	  
		// write interleaved data
		for(i = 0; i < abuffer.numberOfChannels; i++)
		  channels.push(abuffer.getChannelData(i));
	  
		while(pos < length) {
		  for(i = 0; i < numOfChan; i++) {             // interleave channels
			sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
			sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
			view.setInt16(pos, sample, true);          // update data chunk
			pos += 2;
		  }
		  offset++                                     // next source sample
		}
	  
		// create Blob
		return new Blob([buffer], {type: "audio/wav"});
	}
}
