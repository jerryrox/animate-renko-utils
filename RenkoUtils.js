const renko = {};

// App resolution
renko.appWidth = 960;
renko.appHeight = 568;

// List of views used in ACC app.
renko.views = {
	
};

// Global variables
renko.variables = {
	
};

/**
 * Presenting the view registered in renko.views.
 * @param {string} viewName 
 */
renko.showView = function(viewName) {
	if(renko.views[viewName] === undefined || renko.views[viewName] === null)
	{
		console.log("RenkoUtils.showView - The specified view " + viewName + " was not found!");
		return;
	}
	renko.views[viewName].visible = true;
	
	if(typeof renko.views[viewName].onEnabled != 'undefined')
		renko.views[viewName].onEnabled();
}

/**
 * Hiding the view registered in renko.views.
 * @param {string} viewName 
 */
renko.hideView = function(viewName) {
	if(viewName instanceof String)
		renko.views[viewName].visible = false;
	else
		viewName.visible = false;
}

/**
 * Creates a 2D array using specified dimensions.
 * @param {number} row 
 * @param {number} column 
 */
renko.create2DArray = function(row, column) {
	var array = [];
	for(var i=0; i<row; i++) {
		array[i] = [];
		for(var c=0; c<column; c++) {
			array[i][c] = 0;
		}
	}
	return array;
};

/**
 * Returns the current mouse position relative to the ACC canvas.
 */
renko.getMousePos = function() {
	var scale = renko.getWindowScale();
	return {
		x: stage.mouseX / scale / 2,
		y: stage.mouseY / scale / 2
	};
};

/**
 * Returns the scale between screen physical pixel resolution to ACC canvas.
 */
renko.getWindowScale = function() {
	var realWidth = canvas.width / 2;
	return realWidth / renko.appWidth;
};

/**
 * Downloads current canvas screen as a jpeg file.
 * @param {string} fileName 
 */
renko.saveCanvasAsImage = function(fileName) {
	var link = document.createElement("a");
	link.href = canvas.toDataURL("image/jpeg");
	link.download = fileName;
	link.click();
};

/**
 * Returns the interpolated value between from and to using ratio, t.
 * @param {number} from
 * @param {number} to
 * @param {number} t
 */
renko.lerp = function(from, to, t) {
	return (to - from) * t + from;
}

/**
 * Returns the ratio t between from and to using interpolated value.
 * @param {number} from
 * @param {number} to 
 * @param {number} value 
 */
renko.inverseLerp = function(from, to, value) {
	return (value - from) / (to - from);
}

/**
 * String.format similar to C#
 */
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}