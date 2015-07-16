function getColor() {
	var r = Math.floor(Math.random() * 255) + 1;
	var g = Math.floor(Math.random() * 255) + 1;
	var b = Math.floor(Math.random() * 255) + 1;
	return "rgb(" + r + "," + g + "," + b + ")";
}

function isOverlap(circle, queue) {
	for (var i = 0; i < queue.length; i++) {
		var d = Math.sqrt(Math.pow(queue[i].x - circle.x, 2) + Math.pow(queue[i].y - circle.y, 2));
		if (circle.r + queue[i].r - d > 0)
			return true;
	}
	return false;
}

function getPosition(circle1, circle2) {
	var getAngle = function(cur, center) {
		var angle = Math.atan2(-cur.y + center.y, cur.x - center.x);
		return angle;
	}
	var r1 = circle1.r + 1,
		r2 = circle2.r + 1,
		d = Math.sqrt(Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2));
	if (d > r1 + r2)
		return null;
	var a = (d * d + r1 * r1 - r2 * r2) / (2 * d),
		b = Math.abs(r1 * r1 - a * a);
	b = Math.sqrt(b);
	var angle = getAngle({
		x: circle2.x,
		y: circle2.y
	}, {
		x: circle1.x,
		y: circle1.y
	});
	var x = Math.cos(angle) * a + circle1.x,
		y = -Math.sin(angle) * a + circle1.y;
	angle += Math.PI / 2;
	var x1 = Math.cos(angle) * b + x,
		y1 = -Math.sin(angle) * b + y;
	return {
		x: x1,
		y: y1
	};
}
var Scale = {
	createNew: function() {
		var scale = {};
		scale.range = function(min, max) {
			scale.yMin = min;
			scale.yMax = max;
			return scale;
		};
		scale.domain = function(min, max) {
			scale.xMin = min;
			scale.xMax = max;
			return scale;
		};
		scale.scale = function(value) {
			var p = (value - scale.xMin) / (scale.xMax - scale.xMin);
			return (p * (scale.yMax - scale.yMin)) + scale.yMin;
		};
		return scale;
	}
};

function Circle() {
	this.r = 0;
	this.x = 0;
	this.y = 0;
	this.children = [];
	this.color = "white";
	this.size = 0;
	this.name = "";
	this.svg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
}
Circle.prototype.getRange = function() {
	if (this.children.length == 0) {
		return {
			max: this.size,
			min: this.size
		};
	} else {
		for (var i = 0; i < this.children.length; i++) {
			var range = this.children[i].getRange();
			if (i == 0) {
				var min = range.min,
					max = range.max;
			} else {
				min = Math.min(min, range.min);
				max = Math.max(max, range.max);
			}
		}
		return {
			max: max,
			min: min
		};
	}
};
Circle.prototype.initialWithJson = function(json) {
	if (!json.children) {
		this.name = json.name;
		this.size = json.size;
		return;
	} else {
		for (var i = 0; i < json.children.length; i++) {
			var circle = new Circle();
			circle.initialWithJson(json.children[i]);
			this.children.push(circle);
		}
		this.name = json.name;
		this.size = json.size;
		return;
	}
};
Circle.prototype.transition = function(dx, dy) {
	this.x += dx;
	this.y += dy;
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].transition(dx, dy);
	}
	return;
};
Circle.prototype.circleLayout = function() {
	var data = this.children;
	if (data.length == 0)
		return;
	data.sort(function(a, b) {
		return a.r - b.r;
	});
	var center = {
		x: 0,
		y: 0
	};
	var queue = [];
	var count = 0;
	for (var i = 0; i < data.length; i++) {
		if (i == 0) {
			data[i].transition(center.x - data[i].x, center.y - data[i].y);
			queue.push(data[i]);
		} else {
			while (1) {
				if (i == 1) {
					data[i].transition(queue[count].x + data[i].r + queue[count].r - data[i].x, queue[count].y - data[i].y);
					queue.push(data[i]);
					break;
				}
				var circle1 = {
					x: queue[count].x,
					y: queue[count].y,
					r: queue[count].r + data[i].r
				};
				var circle2 = {
					x: queue[queue.length - 1].x,
					y: queue[queue.length - 1].y,
					r: queue[queue.length - 1].r + data[i].r
				};
				var p = getPosition(circle1, circle2);
				if (p == null) {
					console.log(circle1);
					console.log(circle2);
					console.log('-------------------');
					count++;
					continue;
				}
				data[i].transition(p.x - data[i].x, p.y - data[i].y);
				if (isOverlap(data[i], queue)) {
					count++;
				} else {
					queue.push(data[i]);
					break;
				}
			}
		}
	}
	return;
};
Circle.prototype.surroundLayout = function() {
	if (this.children.length == 0) {
		return;
	} else {
		var xMin, xMax, yMin, yMax;
		for (var i = 0; i < this.children.length; i++) {
			console.log(this.children[i].y);
			if (i == 0) {
				xMin = this.children[i].x - this.children[i].r;
				xMax = this.children[i].x + this.children[i].r;
				yMin = this.children[i].y - this.children[i].r;
				yMax = this.children[i].y + this.children[i].r;
			} else {
				xMin = Math.min(xMin, this.children[i].x - this.children[i].r);
				xMax = Math.max(xMax, this.children[i].x + this.children[i].r);
				yMin = Math.min(yMin, this.children[i].y - this.children[i].r);
				yMax = Math.max(yMax, this.children[i].y + this.children[i].r);
			}
		}
		var d = Math.sqrt(Math.pow(xMax - xMin, 2) + Math.pow(yMax - yMin, 2));
		var r = d / 2;
		this.x = (xMin + xMax) / 2;
		this.y = (yMin + yMax) / 2;
		this.r = r;
		return;
	}
};
Circle.prototype.layout = function(scale) {
	if (this.children.length == 0) {
		this.r = scale.scale(this.size);
	} else {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].layout(scale);
		}
		this.circleLayout();
		this.surroundLayout();
	}
};
Circle.prototype.draw = function(svg) {
	var circle = this.svg;
	circle.setAttribute('cx', this.x);
	circle.setAttribute('cy', this.y);
	circle.setAttribute('r', this.r);
	circle.setAttribute('fill', this.color);
	circle.setAttribute('stroke', 'black');
	svg.appendChild(circle);
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].draw(svg);
	}
};

function main() {
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	document.getElementsByTagName("body")[0].appendChild(svg);
	var w = 1200,
		h = 1200;
	svg.style.width = w;
	svg.style.height = h;
	var BACKGROUND = "rgb(117, 220, 205)";
	d3.json("flare.json", function(json) {
		console.log(json);
		circle = new Circle();
		circle.initialWithJson(json);
		var range = circle.getRange();
		console.log(range);
		var scale = Scale.createNew();
		scale.domain(range.min, range.max).range(5, 20);
		circle.layout(scale);
		circle.transition((w / 2) - circle.x, (h / 2) - circle.y);
		console.log(circle);
		circle.draw(svg);
	});
}
window.onload = main;