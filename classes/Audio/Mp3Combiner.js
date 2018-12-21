/**
 * Class that combines multiple MP3 files into a single MP3 file.
 * Only MP3 files are supported!
 * 
 * Create a new instance to use this class.
 * 
 * Dependencies:
 * - external/FetchPolyfill.js
 * - external/PromisePolyfill.js
 * - classes/DownloadUtility.js
 */
class Mp3Combiner {

    constructor() {
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
				.catch(function(e) {
					console.log("Mp3Combiner.addFiles - Error while processing!");
					console.log(e);
				}
			);
			this.audioDataLoaders.push(req);
		}
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
			this.outputBlob = new Blob([...buffers], {type: "audio/mp3"});
			callback(true);
		}.bind(this))
		.catch(function(e) {
			console.log("Mp3Combiner.combineAudio - Error while appending buffer!");
			console.log(e);
			callback(false);
		});
	}
}