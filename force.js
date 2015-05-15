function Node(){
    this.force = [0, 0];
    this.location = {x:0, y:0};
    this.change = true;
}
Node.prototype.addForce = function(newforce){
    this.force[0] += newforce[0];
    this.force[1] += newforce[1];
}
Node.prototype.resetForce = function(){
    this.force = [0, 0];
}
Node.prototype.resetPosition = function(){
    if(this.change){
        this.location.x += this.force[0];
        this.location.y += this.force[1];
    }
}
Node.prototype.setPosition = function(x , y){
    this.location.x = x;
    this.location.y = y;
}
function CalcDistance(location1, location2){
    var distance = Math.sqrt( Math.pow(location1.x - location2.x, 2) + Math.pow(location1.y - location2.y, 2) );
    return distance;
}
function GetForce(amount, location1, location2, direct){
    var x = location1.x - location2.x;
    var y = location1.y - location2.y;
    var unit = direct * Math.sqrt(Math.pow(amount, 2) / (Math.pow(x, 2) + Math.pow(y, 2)));
    return [[x*unit, y*unit], [-x*unit, -y*unit]];
}
function CalcRepulsionForce(node1, node2){
    var CONSTANT = 10000;
    var distance = Math.max(CalcDistance(node1.location, node2.location), 1);
    var force = GetForce(CONSTANT / Math.pow(distance,2), node1.location, node2.location, 1);
    node1.addForce(force[0]);
    node2.addForce(force[1]);
}
function CalcAttractionForce(node1, node2, springlen){
    var CONSTANT = 0.1;
    var distance = CalcDistance(node1.location, node2.location);
    var force = GetForce(CONSTANT * Math.max(distance - springlen, 0), node1.location, node2.location, -1);
    node1.addForce(force[0]);
    node2.addForce(force[1]);
}
function RandomInitial(nodelist, w, h, padding){
    for(var i = 0; i < nodelist.length; i++){
        var newx = Math.random() * (w - 2* padding) + padding;
        var newy = Math.random() * (h - 2* padding) + padding;
        nodelist[i].setPosition(newx, newy);
    }
}
function Iterate(nodelist, edge, len){
    for(var i = 0; i < nodelist.length; i++){
        for(var j = i+1; j < nodelist.length; j++){
            CalcRepulsionForce(nodelist[i], nodelist[j]);
        }
    }
    for(var i = 0; i < edge.length; i++){
        CalcAttractionForce(nodelist[edge[i].source], nodelist[edge[i].target], len);
    }
    for(var i = 0; i < nodelist.length; i++){
        nodelist[i].resetPosition();
        nodelist[i].resetForce();
    }
}
function display(node, edge){
    var circles = document.getElementById("force").getElementsByTagName("circle");
    for(var i = 0; i < node.length; i++){
        circles[i].setAttribute("cx", Math.floor(node[i].location.x));
        circles[i].setAttribute("cy", Math.floor(node[i].location.y));
    }
    var lines = document.getElementById("force").getElementsByTagName("line");
    for(var i = 0; i < edge.length; i++){
        var force = GetForce(circles[edge[i].source].getAttribute("r"), node[edge[i].source].location, node[edge[i].target].location, -1)
        lines[i].setAttribute("x1",node[edge[i].source].location.x + force[0][0]);
        lines[i].setAttribute("y1",node[edge[i].source].location.y + force[0][1]);
        lines[i].setAttribute("x2",node[edge[i].target].location.x + force[1][0]);
        lines[i].setAttribute("y2",node[edge[i].target].location.y + force[1][1]);
    }
}
function down(e){
    var targ;
    if (!e){
        var e = window.event;
    }
    if (e.target){
        targ = e.target;
    }
    else if (e.srcElement){
        targ = e.srcElement;
    }
    if (targ.nodeType == 3){ // defeat Safari bug
        targ = targ.parentNode;
    }
    var i = parseInt(targ.getAttribute("name"));
    node[i].change = false;
    dragging = true;
    obj = targ;
    mouseX = parseFloat(e.clientX);
    mouseY = parseFloat(e.clientY);
    objX = parseFloat(targ.getAttribute("cx"));
    objY = parseFloat(targ.getAttribute("cy"));
}
function move(e){
    var targ;
    if (!e){
        var e = window.event;
    }
    if(dragging == true){
        var x,y;
        var i = parseInt(obj.getAttribute("name"));
        y = e.clientY - mouseY + objY;
        x = e.clientX - mouseX + objX;
        node[i].location.x = x;
        node[i].location.y = y;
    }
}
function up(){
    dragging = false;
    for(var i = 0; i < node.length; i++){
        node[i].change = true;
    }
}
document.onmouseup = up;
document.onmousemove = move;
var dragging = false;
var mouseY;
var mouseX;
var objX;
var objY;
var obj;
var map = {};
var period = 10;
var w = 1200;
var h = 800;
var padding = 20;
var nodenum = 30;
var node = [];
var edge = [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
    { source: 0, target: 4 },
    { source: 0, target: 7 },
    { source: 1, target: 5 },
    { source: 2, target: 5 },
    { source: 3, target: 4 },
    { source: 5, target: 8 },
    { source: 5, target: 9 },
    { source: 6, target: 7 },
    { source: 7, target: 8 },
    { source: 8, target: 9 },
    { source: 8, target: 10},
    { source: 10, target: 11},
    { source: 10, target: 12},
    { source: 5, target: 13},
    { source: 1, target: 13},
    { source: 3, target: 14},
    { source: 8, target: 15},
    { source: 15, target: 16},
    { source: 2, target: 17},
    { source: 16, target: 17},
    { source: 6, target: 18},
    { source: 11, target: 19},
    { source: 3, target: 19},
    { source: 15, target: 20},
    { source: 14, target: 20},
    { source: 17, target: 21},
    { source: 18, target: 22},
    { source: 8, target: 23},
    { source: 2, target: 24},
    { source: 9, target: 25},
    { source: 13, target: 26},
    { source: 19, target: 27},
    { source: 23, target: 28},
    { source: 25, target: 29}
];
var len = 30;
var svg = null;
for(var i = 0; i < nodenum; i++){
    var newnode = new Node();
    node.push(newnode);
}
window.onload = function(){
    svg = document.getElementById("force");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    for(var i = 0; i < node.length; i++){
        var r = Math.floor(Math.random()*255);
        var g = Math.floor(Math.random()*255);
        var b = Math.floor(Math.random()*255);
        var newcircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
        newcircle.setAttribute("r", 10);
        newcircle.setAttribute("fill", "rgb(" + r + "," + g + "," + b+")");
        newcircle.onmousedown = down;
        //newcircle.onmousemove = move;
        newcircle.setAttribute("name", i);
        svg.appendChild(newcircle);
    }
    for(var i = 0; i < edge.length; i++){
        var newline = document.createElementNS("http://www.w3.org/2000/svg","line");
        newline.setAttribute("stroke", "gray");
        newline.setAttribute("stroke-width", 1);
        svg.appendChild(newline);
    }

    RandomInitial(node, w, h, padding);
    setInterval(function(){display(node, edge);Iterate(node, edge, len);}, period);
}