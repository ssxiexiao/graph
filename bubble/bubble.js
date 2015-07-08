function placeBubble(canvas, position, bubble) {
	var cxt = canvas.getContext("2d");
	cxt.fillStyle = bubble.color;
	cxt.beginPath();
	cxt.arc(position.x, position.y, bubble.r, 0, 2 * Math.PI, true);
	cxt.fill();
}

function Bubble(color, r) {
	this.color = color;
	this.r = r;
}

function Position(x, y) {
	this.x = x;
	this.y = y;
	this.clone = clonePosition;
}

function clonePosition() {
	return new Position(this.x, this.y);
}

function getNextPosition(cur, center) {
	const angle = 0.5;
	var r = Math.sqrt(Math.pow(cur.x - center.x, 2) + Math.pow(cur.y - center.y, 2));
	if (r == 0) {
		cur.x -= 10;
	}
	r += 1;
	var curAngle = Math.atan2(-cur.y + center.y, cur.x - center.x);
	var newAngle = curAngle - angle;
	var dx = r * Math.cos(newAngle);
	var dy = r * Math.sin(newAngle);
	return new Position(Math.floor(center.x + dx), Math.floor(center.y - dy));
}

function main() {
	var w = 1000,
		h = 1000;
	var canvas1 = document.getElementsByTagName("canvas")[0];
	var canvas2 = document.getElementsByTagName("canvas")[1];
	canvas1.width = w;
	canvas1.height = h;
	canvas2.width = w;
	canvas2.height = h;
	var data = [];
	for (var i = 0; i < 200; i++) {
		data.push(new Bubble(getColor(), Math.floor(Math.random() * 35) + 5));
	}
	var center = new Position(w / 2, h / 2);
	for (var i = 0; i < data.length; i++) {
		console.log(i);
		var position = center.clone();
		var cxt1 = canvas1.getContext("2d"),
			cxt2 = canvas2.getContext("2d");
		placeBubble(canvas2, {
			x: data[i].r,
			y: data[i].r
		}, data[i]);
		var imgData1 = cxt1.getImageData(0, 0, canvas1.width, canvas1.height),
			imgData2 = cxt2.getImageData(0, 0, 2 * data[i].r, 2 * data[i].r);
		cxt2.clearRect(0, 0, canvas2.width, canvas2.height);
		while (!isOverlap(imgData1, imgData2, position, data[i])) {
			position = getNextPosition(position, center);
		}
		placeBubble(canvas1, position, data[i]);
	}

	function isOverlap(imgData1, imgData2, position, bubble) {
		var x1 = position.x - bubble.r,
			y1 = position.y - bubble.r,
			x2 = position.x + bubble.r,
			y2 = position.y + bubble.r;
		var count = 0;
		for (var i = x1; i <= x2; i++) {
			for (var j = y1; j <= y2; j++) {
				var id = (j * canvas1.width + i) * 4;
				for (var k = 0; k < 3; k++) {
					if (imgData1.data[id + k] == 0 || imgData2.data[count * 4 + k] == 0) {

					} else {
						return false;
					}
				}
				count++;
			}
		}
		return true;
	}
}

function getColor() {
	var r = Math.floor(Math.random() * 255) + 1;
	var g = Math.floor(Math.random() * 255) + 1;
	var b = Math.floor(Math.random() * 255) + 1;
	return "rgb(" + r + "," + g + "," + b + ")";
}
window.onload = main;