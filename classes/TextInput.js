class TextInput {
	
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
		
		// Set events
		// Input focus event
		this.input.addEventListener("focus", function () {
			this.style.outline = "none";
			if(this.onFocus !== null && this.onFocus !== undefined)
				this.onFocus();
		}.bind(this));
		// Input change event
		this.input.addEventListener("change", function () {
			if(this.onChange !== null && this.onChange !== undefined)
				this.onChange();
		}.bind(this));
		// Input input event
		this.input.addEventListener("input", function (e) {
			if(this.onInput !== null && this.onInput !== undefined)
				this.onInput(e);
		}.bind(this));
		
		// Setup resizing interval
		this.resize();
		this.resizeInterval = window.setInterval(function() {
			this.resize();
		}.bind(this), 1000);
	}
	
	resize() {
		// Resize input rect and font size based on current resolution.
		this.setRect(this.savedPosX, this.savedPosY, this.savedSizeX, this.savedSizeY, false);
		this.setFontSize(this.savedFontSize, false);

		// Handle custom callback event.
		if(this.onResize !== undefined && this.onResize !== null) {
			this.onResize();
		}
	};
	
	setOnInput(onInput) {
		this.onInput = onInput;
	}
	
	setOnChange(onChange) {
		this.onChange = onChange;
	}
	
	setOnFocus(onFocus) {
		this.onFocus = onFocus;
	}
	
	setOnResize(onResize) {
		this.onResize = onResize;
	}
	
	setRect(posX, posY, sizeX, sizeY, save) {
		if(save === undefined || save) {
			// Set saved pos for window resize event.
			this.savedPosX = posX;
			this.savedPosY = posY;
			this.savedSizeX = sizeX;
			this.savedSizeY = sizeY;
		}
		
		var scale = renko.getWindowScale() * (2 / window.devicePixelRatio);
		
		posX = posX - sizeX/2 + appWidth/2;
		posY = posY - sizeY/2 + appHeight/2;
		
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
	
	setActive(enabled) {
		if(enabled)
			this.input.removeAttribute("disabled");
		else
			this.input.setAttribute("disabled", "true");
		this.style.visibility = enabled ? "visible" : "hidden";
	}

	setReadonly(isReadonly) {
		if(isReadonly)
			this.input.setAttribute("readonly", "true");
		else
			this.input.removeAttribute("readonly");
	}
	
	setMaxLength(length) {
		this.input.setAttribute("maxlength", length);
	}
	
	setPlaceholder(placeholder) {
		this.input.setAttribute("placeholder", placeholder);
	}
	
	setFontSize(size, save) {
		if(save === undefined || save) {
			this.savedFontSize = size;
		}
		
		size = size * window.getWindowScale();
		size = size * (2 / window.devicePixelRatio);
		
		this.style.fontSize = String(size) + "px";
	}
	
	setPadding(padding) {
		this.style.padding = String(padding) + "px";
	}
	
	setValue(value) {
		this.input.value = value;
	}
	
	setTextAlign(option) {
		this.style.textAlign = option;
	}
	
	setColor(color) {
		this.style.color = color;
	}
	
	getElement() {
		return this.input;
	}
	
	getStyle() {
		return this.style;
	}
	
	getValue() {
		return this.input.value;
	}
	
	dispose() {
		this.input.parentNode.removeChild(this.input);
		window.clearInterval(this.resizeInterval);
	}
}