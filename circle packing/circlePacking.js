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
		if (circle.r + queue[i].r - d > 0)
			return true;
	}
	return false;
}

function getPosition(circle1, circle2) {
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
	for (var i = 0; i < 200; i++) {
		data.push(new Bubble(getColor(), Math.floor(Math.random() * 35) + 5));
	}
	data.sort(function(a, b) {
		return a.r - b.r;
	});
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
				if (i == 1) {
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
					console.log(circle1);
					console.log(circle2);
					console.log('-------------------');
					count++;
					continue;
				}
				data[i].x = p.x;
				data[i].y = p.y;
				if (isOverlap(data[i], queue)) {
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