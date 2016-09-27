(function () {

	// Constructor
	function Sprite(className, parent) {
		// Cached base css class names
		this.className = "sprite " + className;

		// The HTML element to use for the sprite
		var element = document.createElement("div");
		element.className = this.className;
		this.element = element;

		// Set the container element for the sprite
		this.setParent(parent);
	};

	// Move the sprite to the specified position over a given time
	Sprite.prototype.moveTo = function (x, y, time) {
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
		this.element.style.transitionDuration = time + "s";
	};

	// Get current X position
	Sprite.prototype.getX = function () {
		return this.element.offsetLeft;
	};

	// Get current Y position
	Sprite.prototype.getY = function () {
		return this.element.offsetTop;
	};

	// Get sprite height
	Sprite.prototype.getHeight = function () {
		return this.element.clientHeight;
	};

	// Get sprite width
	Sprite.prototype.getWidth = function () {
		return this.element.clientWidth;
	}

	// Squared didstance to a point
	Sprite.prototype.distanceToSquared = function (x, y) {
		var dX = this.element.offsetLeft - x;
		var dY = this.element.offsetTop - y;

		return (dX * dX) + (dY * dY);
	};

	// Distance to a point
	Sprite.prototype.distanceTo = function (x, y) {
		return Math.sqrt(this.distanceToSquared(x, y));
	};

	// Flip the sprite either horizontally or vertically
	Sprite.prototype.flip = function (flipX, flipY) {
		var classes;
		if (flipX) {
			classes = " flipX";
		}
		else {
			classes = "";
		}

		if (flipY) classes += " flipY";

		this.element.className = this.className + classes;
	};

	Sprite.prototype.flipX = function (value) {
		if (this.element.classList.contains("flipX") != value) {
			this.element.classList.toggle("flipX");
		}
	}

	// Set the container element for this sprite
	Sprite.prototype.setParent = function (parent) {
		if (this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
		if (parent) {
			parent.appendChild(this.element);
		}
	}

	// Export the Sprite object
	window.Sprite = Sprite;
})();