Array.prototype.first = function() {
	return this[0];
}
Array.prototype.end = function() {
	return this[this.length - 1];
}

function Bubble(color, r) {
	this.color = color;
	this.r = r;
}

function getColor() {
	var r = Math.floor(Math.random() * 255) + 1;
	var g = Math.floor(Math.random() * 255) + 1;
	var b = Math.floor(Math.random() * 255) + 1;
	return "rgb(" + r + "," + g + "," + b + ")";
}

function isOverlap(circle, queue) {
	for (var i = 0; i < queue.length; i++) {
		var d = Math.sqrt(Math.pow(queue[i].x - circle.x, 2) + Math.pow(queue[i].y - circle.y, 2));
		if (d < circle.r + queue[i].r)
			return true;
	}
	return false;
}

function getPosition(circle1, circle2) {
	var a = 2 * circle1.r * (circle1.x - circle2.x);
	var b = 2 * circle1.r * (circle1.y - circle2.y);
	var c = Math.pow(circle2.r, 2) - Math.pow(circle1.r, 2) - Math.pow((circle1.x - circle2.x), 2) - Math.pow((circle1.y - circle2.y), 2);
	var p = Math.pow(a, 2) + Math.pow(b, 2);
	var q = -2 * a * c;
	var r = Math.pow(c, 2) - Math.pow(b, 2);
	if (Math.pow(q, 2) - 4 * p * r < 0)
		return null;
	var cos1 = (Math.pow((Math.pow(q, 2) - 4 * p * r), (1 / 2)) - q) / (2 * p),
		cos2 = -cos1,
		sin1 = Math.sqrt(1 - (cos1 * cos1)),
		sin2 = -sin1;
	var p1 = {
			x: (circle1.r * cos1) + circle1.x,
			y: (circle1.r * sin1) + circle1.y
		},
		p2 = {
			x: (circle1.r * cos1) + circle1.x,
			y: (circle1.r * sin2) + circle1.y
		},
		p3 = {
			x: (circle1.r * cos2) + circle1.x,
			y: (circle1.r * sin1) + circle1.y
		},
		p4 = {
			x: (circle1.r * cos2) + circle1.x,
			y: (circle1.r * sin2) + circle1.y
		};
	var p = [p1, p2, p3, p4];
	var result = [];
	for (var i = 0; i < p.length; i++) {
		var d1 = Math.pow(p[i].x - circle1.x, 2) + Math.pow(p[i].y - circle1.y, 2);
		d1 = Math.sqrt(d1);
		var d2 = Math.pow(p[i].x - circle2.x, 2) + Math.pow(p[i].y - circle2.y, 2);
		d2 = Math.sqrt(d2);
		p[i].bias = Math.abs(d1 - circle1.r) + Math.abs(d2 - circle2.r);
	}
	p.sort(function(a, b) {
		return a.bias - b.bias;
	});
	console.log(p);
	result.push(p[0]);
	result.push(p[1]);
	if (result.length == 2) { 
		var center = {
			x: circle1.x,
			y: circle1.y
		};
		var angle = getAngle({
			x: circle2.x,
			y: circle2.y
		}, center);
		var angle1 = getAngle(result[0], center);
		var angle2 = getAngle(result[1], center);
		// console.log(angle);
		// console.log(result[0]);
		// console.log(angle1);
		// console.log(result[1]);
		// console.log(angle2);
		if (angle1 - angle > 0)
			return result[0];
		else
			return result[1];
	}
}

function getAngle(cur, center) {
	var angle = Math.atan2(-cur.y + center.y, cur.x - center.x);
	return angle;
}

function main() {
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	document.getElementsByTagName("body")[0].appendChild(svg);
	var w = 960,
		h = 960;
	svg.style.width = w;
	svg.style.height = h;
	var data = [];
	for (var i = 0; i < 4; i++) {
		data.push(new Bubble(getColor(), Math.floor(Math.random() * 35) + 5));
	}
	var center = {
		x: w / 2,
		y: h / 2
	};
	var queue = [];
	var count = 0;
	for (var i = 0; i < data.length; i++) {
		if (i == 0) {
			data[i].x = center.x;
			data[i].y = center.y;
			var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute('cx', data[i].x);
			circle.setAttribute('cy', data[i].y);
			circle.setAttribute('r', data[i].r);
			circle.setAttribute('fill', data[i].color);
			svg.appendChild(circle);
			queue.push(data[i]);
		} else {
			while (1) {
				if (queue.length - count == 1) {
					data[i].x = queue[count].x + data[i].r + queue[count].r;
					data[i].y = queue[count].y;
					var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
					circle.setAttribute('cx', data[i].x);
					circle.setAttribute('cy', data[i].y);
					circle.setAttribute('r', data[i].r);
					circle.setAttribute('fill', data[i].color);
					svg.appendChild(circle);
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
					count++;
					continue;
				}
				p.x = Math.floor(p.x);
				p.y = Math.floor(p.y);
				data[i].x = p.x;
				data[i].y = p.y;
				if (0) {
					count++;
				} else {
					var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
					circle.setAttribute('cx', data[i].x);
					circle.setAttribute('cy', data[i].y);
					circle.setAttribute('r', data[i].r);
					circle.setAttribute('fill', data[i].color);
					svg.appendChild(circle);
					queue.push(data[i]);
					break;
				}
			}
		}
	}
}
window.onload = main;