class ResizeManager {
	
	constructor() {
		var callbacks = this.callbacks = [];
		window.addEventListener("resize", function() {
			for(var i=callbacks.length-1; i>=0; i--) {
				var c = callbacks[i];
				if(c === null || c === undefined) {
					callbacks.splice(i, 1);
					continue;
				}
				c();
			}
		});
	}
	
	add(callback) {
		this.callbacks.push(callback);
	}
	
	remove(callback) {
		var inx = this.callbacks.indexOf(callback);
		if(inx >= 0 && inx < this.callbacks.length)
			this.callbacks.splice(inx, 1);
	}
}
renko.resizeManager = new ResizeManager();