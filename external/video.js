/**
 * A modified version of Animate's video component script.
 * This modification allows a flawless automatic playback of videos included in the scene.
 * Simply replace the original code (./components/video/video.js) with this file.
 */

"use strict";

(function ($) {

	$.anwidget("an.Video", {
		options: {
			left: 0,
			top: 0,
			width: 400,
			height: 300,
			source: "",
			autoplay: true,
			position: "absolute"
		},
		_props: ["left", "top", "width", "height", "position", "transform-origin", "transform"],
		_attrs: ["id", "src", "controls", "autoplay", "loop", "class", "muted", "poster"],
		getCreateOptions: function getCreateOptions() {
			return $.extend(this.options, { 'id': "video" + _widgetID++ });
		},
		getCreateString: function getCreateString() {
			return "<div><video muted playsinline/></div>";
		},
		getProperties: function getProperties() {
			return this._props;
		},
		attach: function attach() {
			if (this._attached) return;

			this._superApply(arguments);
			this._$div = $(this._element);
			this._$this = this._$div.find('video');

			this.update(true);
		},
		detach: function detach() {
			if (!this._$div) return;

			this._$div.remove();
			this._attached = false;
			this._$div = null;
			$(parent).trigger("detached", this.getEventData("detached"));
		},
		getAttributes: function getAttributes() {
			return this._attrs;
		},
		show: function show() {
			if (this._$div) this._$div.show();
		},
		hide: function hide() {
			if (this._$div) this._$div.hide();
		},
		applyAttributes: function applyAttributes($el, force) {
			this._superApply(arguments);
			if (!this._options["muted"]) {
				$el.removeAttr("muted");
			}
		},
		update: function update(force) {
			if (!this._$div) return;

			var updateSize = force || this._dirty["width"] || this._dirty["height"];
			this.applyProperties(this._$div, force);
			this.applyAttributes(this._$this, force);

			if (updateSize) {
				// Copy the width and height from parent
				this._$this.css("width", this._$div.css("width"));
				this._$this.css("height", this._$div.css("height"));
			}
		}
	});
})(jQuery);