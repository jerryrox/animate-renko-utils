/**
 * Encapsulates HTML input object to make it controllable via script.
 * 
 * Dependencies:
 * - ./MonoUpdate.js
 */
class TextInput {

	// this.style;
	// this.input;
	// this.onFocus;
	// this.onChange;
	// this.onInput;
	// this.onResize;
	// this.updateID;
	// this.savedPosX;
	// this.savedPosY;
	// this.savedSizeX;
	// this.savedSizeY;
	// this.savedFontSize;
	
	constructor(id, isTextArea) {
		if(isTextArea === undefined) {
			isTextArea = false;
		}

		// Create input
		this.input = document.createElement(!isTextArea ? "input" : "textarea");
		this.input.setAttribute("id", id);
		this.input.setAttribute("type", "text");
		this.input.value = "";
		
		// Append input to parent
		var parentNode = canvas.parentElement;
		parentNode.appendChild(this.input);
		
		// Apply initial style
		this.style = this.input.style;
		this.style.position = "absolute";
		this.style.left = 0;
		this.style.top = 0;
		this.style.background = "none";
		this.style.border = "none";
		this.style.padding = "0";
		this.style.margin = "0";
		this.style.boxSizing = "border-box";
		if(isTextArea) {
			this.style.resize = "vertical";
		}
		
		// Input focus event
		this.input.addEventListener("focus", function () {
			this.style.outline = "none";
			if(!renko.isNullOrUndefined(this.onFocus))
				this.onFocus(this);
		}.bind(this));

		// Input change event
		this.input.addEventListener("change", function () {
			if(!renko.isNullOrUndefined(this.onChange))
				this.onChange(this);
		}.bind(this));

		// Input input event
		this.input.addEventListener("input", function (e) {
			// Apply input character restriction
			if(!renko.isNullOrUndefined(this.inputRangeChecker)) {
				var val = this.getValue();
				var isChanged = false;
				while(!this.inputRangeChecker(val)) {
					isChanged = true;
					val = val.substring(0, val.length - 1);
				}
				if(isChanged) {
					this.setValue(val);
				}
			}
			// Handle event
			if(!renko.isNullOrUndefined(this.onInput))
				this.onInput(this);
		}.bind(this));
		
		// Setup resizing interval
		this.nextUpdate = 1;
		this.updateID = renko.monoUpdate.addAction(function(deltaTime) {
			this.nextUpdate -= deltaTime;
			if(this.nextUpdate <= 0) {
				this.nextUpdate = 1;
				
				// Refresh input rect and font size for current resolution.
				this.refreshRect();
				this.refreshFontSize();

				// Handle custom callback event.
				if(!renko.isNullOrUndefined(this.onResize)) {
					this.onResize(this);
				}
			}
		}.bind(this));
	}

	/**
	 * Sets the display rect of this input.
	 * @param {number} posX
	 * @param {number} posY 
	 * @param {number} sizeX 
	 * @param {number} sizeY 
	 * @param {number} adjustToCenter 
	 */
	setRect(posX, posY, sizeX, sizeY, adjustToCenter) {
		this.savedPosX = posX;
		this.savedPosY = posY;
		this.savedSizeX = sizeX;
		this.savedSizeY = sizeY;
		if(adjustToCenter === true) {
			this.savedPosX += sizeX / 2;
			this.savedPosY += sizeY / 2;
		}
		this.refreshRect();
	}

	/**
	 * Sets the font size of the input.
	 * @param {number} size 
	 */
	setFontSize(size) {
		this.savedFontSize = size;
		this.refreshFontSize();
	}

	/**
	 * 
	 * @param {Object} regexPattern 
	 */
	setInputRestriction(regexPattern) {
		this.inputRangeChecker = function(value) {
			if(renko.isNullOrUndefined(value) || value.length === 0) {
				return true;
			}
			return regexPattern.test(value);
		};
	}
	
	/**
	 * Sets the listener function for input event.
	 * @param {Action<TextInput>} onInput 
	 */
	setOnInput(onInput) { this.onInput = onInput; }
	
	/**
	 * Sets the listener function for change event.
	 * @param {Action<TextInput>} onChange 
	 */
	setOnChange(onChange) { this.onChange = onChange; }
	
	/**
	 * Sets the listener function for focus event.
	 * @param {Action<TextInput>} onFocus 
	 */
	setOnFocus(onFocus) { this.onFocus = onFocus; }
	
	/**
	 * Sets the listener function for resize event.
	 * @param {Action<TextInput>} onResize 
	 */
	setOnResize(onResize) { this.onResize = onResize; }
	
	/**
	 * Sets the visibility state of this input.
	 * @param {boolean} enabled 
	 */
	setActive(enabled) {
		if(enabled)
			this.input.removeAttribute("disabled");
		else {
			this.input.setAttribute("disabled", "true");
			this.input.blur();
		}
		this.style.visibility = enabled ? "visible" : "hidden";
	}

	/**
	 * Sets readonly attribute of this input.
	 * @param {boolean} isReadonly 
	 */
	setReadonly(isReadonly) {
		if(isReadonly)
			this.input.setAttribute("readonly", "true");
		else
			this.input.removeAttribute("readonly");
	}
	
	/**
	 * Sets the max character limit of this input.
	 * @param {number} length 
	 */
	setMaxLength(length) { this.input.setAttribute("maxlength", length); }
	
	/**
	 * Sets the input placeholder text.
	 * @param {string} placeholder 
	 */
	setPlaceholder(placeholder) { this.input.setAttribute("placeholder", placeholder); }
	
	/**
	 * Sets the top, bottom, left, right padding style of the input.
	 * @param {number} padding 
	 */
	setPadding(padding) { this.style.padding = String(padding) + "px"; }
	
	/**
	 * Sets the text value on the input.
	 * @param {string} value 
	 */
	setValue(value) { this.input.value = value; }
	
	/**
	 * Sets the text alignment style to specified value.
	 * @param {string} option 
	 */
	setTextAlign(option) { this.style.textAlign = option; }
	
	/**
	 * Sets the text color style to specified value.
	 * @param {string} color 
	 */
	setColor(color) { this.style.color = color; }
	
	/**
	 * Returns the raw input object being wrapped over.
	 */
	getElement() { return this.input; }
	
	/**
	 * Returns the style property of the input.
	 */
	getStyle() { return this.style; }
	
	/**
	 * Returns the text value entered on the input.
	 */
	getValue() { return this.input.value; }
	
	/**
	 * Refreshes the input's rect based on window's current size.
	 */
	refreshRect() {
		var posX = this.savedPosX;
		var posY = this.savedPosY;
		var sizeX = this.savedSizeX;
		var sizeY = this.savedSizeY;
		
		// Calculate actual position and scale
		var scale = renko.getWindowScale() * (2 / window.devicePixelRatio);
		posX = posX - sizeX/2 + renko.appWidth/2;
		posY = posY - sizeY/2 + renko.appHeight/2;
		posX *= scale;
		posY *= scale;
		sizeX *= scale;
		sizeY *= scale;
		
		// Apply transform
		this.style.left = String(posX) + "px";
		this.style.top = String(posY) + "px";
		this.style.width = String(sizeX) + "px";
		this.style.height = String(sizeY) + "px";
	}

	/**
	 * Refreshes the input's font size based on window's current size.
	 */
	refreshFontSize() {
		var size = this.savedFontSize;
		size = size * renko.getWindowScale();
		size = size * (2 / window.devicePixelRatio);
		this.style.fontSize = String(size) + "px";
	}

	/**
	 * Completely removes the input object and reference from DOM.
	 * Once you call this method, this input will no longer be functional.
	 */
	dispose() {
		this.input.parentNode.removeChild(this.input);
		renko.monoUpdate.removeAction(this.updateID);
	}
}