/**
 * Renko chan!
 * https://github.com/jerryrox/animate-renko-utils
 */
const renko = {};

// App resolution
renko.appWidth = 960;
renko.appHeight = 568;
renko.appVersion = 0;

// List of views used in Animate web app.
renko.views = {
	
};

// Global variables
renko.variables = {
	
};

/**
 * Sets app resolution to use in rect calculation for some modules and functions.
 * @param {number} width
 * @param {number} height
 */
renko.setResolution = function(width, height) {
	renko.appWidth = width;
	renko.appHeight = height;
}

/**
 * Sets app version to specified value and outputs through console.
 * @param {number} version 
 */
renko.setVersion = function(version) {
	renko.appVersion = version;
	console.log("Game version: " + version);
}

/**
 * Registers specified view to renko view manager framework.
 * @param {Object} view
 * @param {string} viewName
 * @param {boolean} visible
 */
renko.registerView = function(view, viewName, visible) {
	// Invalid view or viewname should be ignored.
	if(renko.isNullOrUndefined(view))
	{
		console.log(`RenkoUtils.registerView - Invalid view (${view}) was specified.`);
		return;
	}
	if(renko.isNullOrUndefined(viewName))
	{
		console.log(`RenkoUtils.registerView - Invalid viewName (${viewName}) was specified.`);;
		return;
	}
	// If view already exists, it should be ignored.
	if(!renko.isNullOrUndefined(renko.views[viewName]))
	{
		console.log(`RenkoUtils.registerView - Specified view (${viewName}) is already registered!`);
		return;
	}

	// Visibility is false by default.
	if(renko.isNullOrUndefined(visible))
	{
		visible = false;
	}

	renko.views[viewName] = view;
	view.visible = visible;
	view.stop();
}

/**
 * Invokes a one-time initialization for specified view.
 * @param {Object} view 
 * @param {Action} routine 
 */
renko.registerAwake = function(view, routine) {
	var views = renko.variables._registerAwakeViews;
	if(views === undefined)
	{
		views = renko.variables._registerAwakeViews = [];
	}

	if(!views.includes(view))
	{
		views.push(view);
		routine.bind(view)();
	}
}

/**
 * Presenting the view registered in renko.views.
 * @param {string} viewName 
 */
renko.showView = function(viewName, args) {
	if(renko.isNullOrUndefined(renko.views[viewName]))
	{
		console.log(`RenkoUtils.showView - The specified view (${viewName}) was not found!`);
		return;
	}
	renko.views[viewName].visible = true;
	
	if(typeof renko.views[viewName].onEnabled === 'function')
		renko.views[viewName].onEnabled(args);
}

/**
 * Hiding the view registered in renko.views.
 * @param {string} viewName 
 */
renko.hideView = function(view) {
	if(renko.isNullOrUndefined(view))
	{
		console.log(`RenkoUtils.hideView - Invalid view (${view}) was specified!`);
		return;
	}

	if(view instanceof String)
	{
		if(renko.isNullOrUndefined(renko.views[view]))
		{
			console.log(`RenkoUtils.hideView - View with name (${view}) is not registered!`);
			return;
		}
		renko.views[view].visible = false;
		if(typeof renko.views[view].onDisabled === 'function')
			renko.views[view].onDisabled();
	}
	else
	{
		view.visible = false;
		if(typeof view.onDisabled === 'function')
			view.onDisabled();
	}
}

/**
 * Creates a 2D array using specified dimensions.
 * All elements will be null by default.
 * @param {number} row 
 * @param {number} column 
 */
renko.create2DArray = function(row, column) {
	var array = [];
	for(var i=0; i<row; i++) {
		array[i] = [];
		for(var c=0; c<column; c++) {
			array[i][c] = null;
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
 * Puts videoElement behind the targetElement.
 * If targetElement is null or not specified, canvas will be used.
 * @param {Node} videoElement
 * @param {Node} targetElement
 * @param {boolean} shouldPlay
 */
renko.reorderVideoBehind = function(videoElement, targetElement, shouldPlay) {
	// Set default target if not specified.
	if(renko.isNullOrUndefined(targetElement))
	{
		targetElement = canvas;
	}
	// Get the div that contains video element
	var vidHolder = videoElement.parentElement.parentElement;
	// Reorder elements
	renko.reorderElement(vidHolder, targetElement);

	// Play video if requested
	if(shouldPlay === true)
	{
		videoElement.play();
	}
}

/**
 * Puts prevElement before nextElement.
 * Note that two elements must have the same parent.
 * @param {Node} prevElement
 * @param {Node} nextElement
 */
renko.reorderElement = function(prevElement, nextElement) {
	// If parent does not match, return.
	if(prevElement.parentElement !== nextElement.parentElement)
	{
		console.log(`RenkoUtils.reorderElement - prevElement's parent (${prevElement.parentElement}) does not match the nextElement's parent (${nextElement.parentElement})!`)
		return;
	}
	prevElement.parentElement.insertBefore(prevElement, nextElement);
}

/**
 * Makes an active element blurred.
 * For example, call this method to hide keyboard on ios safari.
 */
renko.blurActive = function() {
	document.activeElement.blur();
}

/**
 * Returns the unclamped interpolated value between from and to using ratio, t.
 * @param {number} from
 * @param {number} to
 * @param {number} t
 * @returns {number}
 */
renko.lerp = function(from, to, t) {
	return (to - from) * t + from;
}

/**
 * Returns the unclamped ratio t between from and to using interpolated value.
 * @param {number} from
 * @param {number} to 
 * @param {number} value
 * @returns {number} 
 */
renko.inverseLerp = function(from, to, value) {
	return (value - from) / (to - from);
}

/**
 * Returns the clamped value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
renko.clamp = function(value, min, max) {
	if(value < min)
		return min;
	if(value > max)
		return max;
	return value;
}

/**
 * Returns whether specified value is null or undefined.
 * @param {Object} value
 * @returns {boolean}
 */
renko.isNullOrUndefined = function(value) {
	return value === undefined || value === null;
}

/**
 * Returns whether current user agent is a mobile device.
 * https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 */
renko.isMobileDevice = function() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};

/**
 * Returns whether current user agent is a mobile or tablet device.
 * https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 */
renko.isMobileOrTabletDevice = function() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};

/**
 * Returns whether current user agent is a Safari browser.
 */
renko.isSafari = function() {
	return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * Returns whether current user agent is a Chrome browser.
 */
renko.isChrome = function() {
	var nav = window.navigator;
	// Google Chrome for iOS
	if(nav.userAgent.match("CriOS")) {
		return true;
	}
	// Google Chrome for other platforms
	if(!renko.isNullOrUndefined(window.chrome) &&
		nav.vendor === "Google Inc." &&
		!renko.isEdge() &&
		!renko.isOpera()) {
		return true;
	}
	return false;
}

/**
 * Returns whether current user agent is a Firefox browser.
 */
renko.isFirefox = function() {
	return /firefox/i.test(navigator.userAgent) ||
		/fxios/i.test(navigator.userAgent);
}

/**
 * Returns whether current user agent is an Opera browser.
 */
renko.isOpera = function() {
	return navigator.userAgent.match(/Opera|OPR\//) ||
		!renko.isNullOrUndefined(window.opera) ||
		!renko.isNullOrUndefined(window.opr)
}

/**
 * Returns whether current user agent is an Edge browser.
 */
renko.isEdge = function() {
	return navigator.userAgent.indexOf("Edge") > -1 ||
		navigator.userAgent.indexOf("EdgiOS") > -1 ||
		navigator.userAgent.indexOf("EdgA") > -1;
}

/**
 * Returns whether current device is an Android device.
 */
renko.isAndroid = function() {
	return /android/i.test(navigator.userAgent.toLowerCase());
}

/**
 * Returns whether current device is an iOS device.
 */
renko.isiOS = function() {
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Returns whether current user agent is an Internet Explorer browser.
 */
renko.isIE = function() {
	var agent = window.navigator.userAgent;
	if(renko.isNullOrUndefined(agent))
		return false;
	return agent.indexOf("MSIE") > 0 || agent.indexOf("Trident/") > 0;
}

/**
 * Returns whether current user agent is a Samsung Mobile browser.
 */
renko.isSamsungBrowser = function() {
	return /samsungbrowser/i.test(navigator.userAgent);
}

/**
 * Returns whether current user agent is a Kakao talk WebView.
 */
renko.isKakaoBrowser = function() {
	return /kakaotalk/i.test(navigator.userAgent);
}

/**
 * Returns the android version in float value.
 * If not applicable, a null value is returned.
 */
renko.getAndroidVersion = function() {
	var match = navigator.userAgent.toLowerCase().match(/android\s([0-9\.]*)/);
	if(match) {
		return parseFloat(match[1]);
	}
	return null;
}

/**
 * Attempts to fix video not being rendered on screen on safari browsers.
 * It was discovered that the video actually plays but it doesn't show
 * for some reason.
 * This method fixes it by rapidly changing the top value of the video's css.
 * Note that video must be of a JQuery object.
 * @param {Object} video
 * @param {number} topOffset
 * @param {boolean} force
 */
renko.fixVideo = function(video, topOffset, force) {
	// If not safari and not being forced, return
	if(!renko.isSafari() && (renko.isNullOrUndefined(force) || !force))
	{
		return;
	}
	// If invalid video, return
	if(renko.isNullOrUndefined(video))
	{
		console.log(`RenkoUtils.fixVideo - Invalid video (${video}) was specified.`);
		return;
	}
	// By default, there is no offset.
	if(renko.isNullOrUndefined(topOffset))
	{
		topOffset = 0;
	}

	for(var i=0; i<350; i++)
	{
		const show = (i % 2 === 1);
		setTimeout(function() {
			if(show)
				video.parent().css("top", (topOffset)+"px");
			else
				video.parent().css("top", (topOffset+1)+"px");
		}, 2 * i);
	}
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
/**
 * Polyfill for String.startsWith
 */
if(!String.prototype.startsWith) {
	String.prototype.startsWith = function(value) {
		if(value === undefined || value === null || this.length < value) {
			return false;
		}
		for(var i=0; i<value.length; i++) {
			if(this.charAt(i) !== value.charAt(i)) {
				return false;
			}
		}
		return true;
	}
}
/**
 * Polyfill for Array.includes
 */
if (!Array.prototype.includes) {
	Array.prototype.includes = function(element) {
		for(var i=0; i<this.length; i++)
		{
			if(this[i] === element)
				return true;
		}
		return false;
	};
}
/**
 * Remove method support for Array
 */
if(!Array.prototype.remove) {
	Array.prototype.remove = function(element) {
		for(var i=0; i<this.length; i++) {
			if(this[i] === element) {
				this.splice(i, 1);
				break;
			}
		}
	}
}
/**
 * Utility extension for Array
 * - Returns the last element in the array. If none, undefined will be returned.
 */
if(!Array.prototype.getLast) {
	Array.prototype.getLast = function() {
		if(this.length === 0) {
			return undefined;
		}
		return this[this.length-1];
	}
}
/**
 * Utility extension for Array
 * - Returns a random index within the current array's bounds. If there length is 0, -1 will be returned.
 */
if(!Array.prototype.randomIndex) {
	Array.prototype.randomIndex = function() {
		if(this.length === 0) {
			return -1;
		}
		return Math.floor(Math.random() * this.length);
	}
}
/**
 * Utility extension for Array
 * - Returns a random element within the current array. If there length is 0, null will be returned.
 */
if(!Array.prototype.randomElement) {
	Array.prototype.randomElement = function() {
		if(this.length === 0) {
			return null;
		}
		return this[Math.floor(Math.random() * this.length)];
	}
}
/**
 * Utility extension for Array
 * - Mixes the array's elements in a random order.
 */
if(!Array.prototype.randomize) {
	Array.prototype.randomize = function() {
		for(var i=0; i<this.length; i++) {
			var other = Math.floor(Math.random() * this.length);
			var temp = this[i];
			this[i] = this[other];
			this[other] = temp;
		}
	}
}