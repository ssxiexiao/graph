function Node(){
    this.force = [0, 0];
    this.location = {x:0, y:0};
    this.change = true;
    this.color = "";
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
function CalMove(node){
    var move = 0;
    var minMove = 2;
    for(var i = 0; i < node.length; i++){
        var len = Math.sqrt(Math.pow(node[i].force[0], 2) + Math.pow(node[i].force[1], 2));
        move += len;
    }
    if(move < minMove){
        for(var i = 0; i < node.length; i++){
            node[i].force = [0, 0];
        }
    }
}
function GetForce(amount, location1, location2, direct){
    var x = location1.x - location2.x;
    var y = location1.y - location2.y;
    var unit = direct * Math.sqrt(Math.pow(amount, 2) / (Math.pow(x, 2) + Math.pow(y, 2)));
    return [[x*unit, y*unit], [-x*unit, -y*unit]];
}
function CalcRepulsionForce(node1, node2){
    var CONSTANT = 500;
    var distance = Math.max(CalcDistance(node1.location, node2.location), 1);
    var force = GetForce(CONSTANT / Math.pow(distance,2), node1.location, node2.location, 1);
    node1.addForce(force[0]);
    node2.addForce(force[1]);
}
function CalcAttractionForce(node1, node2, springlen){
    var CONSTANT = 0.03;
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
    CalMove(nodelist);
    for(var i = 0; i < nodelist.length; i++){
        nodelist[i].resetPosition();
        nodelist[i].resetForce();
    }
}
function getColor(){
    var r = Math.floor(Math.random()*155)+100;
    var g = Math.floor(Math.random()*155)+100;
    var b = Math.floor(Math.random()*155)+100;
    return "rgb("+r+","+g+","+b+")";
}
function genColor(n){
    color = [];
    for(var i = 0; i < n; i++){
        color.push(getColor());
    }
}
function display(node, edge){
    var circles = document.getElementById("force").getElementsByTagName("g");
    for(var i = 0; i < node.length; i++){
        circles[i].setAttribute("transform","translate("+node[i].location.x+","+node[i].location.y+")");
        var str = drawClip(node, i, r);
        var clip = document.getElementById("clip-"+i);
        clip.getElementsByTagName("path")[0].setAttribute("d", str);
    }
    var lines = document.getElementById("force").getElementsByTagName("line");
    for(var i = 0; i < edge.length; i++){
        var a = parseInt(edge[i].source);
        var b = parseInt(edge[i].target);
        //var force = GetForce(circles[a].getAttribute("r"), node[a].location, node[b].location, -1)
        lines[i].setAttribute("x1",node[a].location.x);
        lines[i].setAttribute("y1",node[a].location.y);
        lines[i].setAttribute("x2",node[b].location.x);
        lines[i].setAttribute("y2",node[b].location.y);
    }
}
function drawClip(node, n, r){
    var points = [{x:(-r),y:(-r)},{x:r,y:(-r)},{x:r,y:r},{x:(-r),y:r}];
    var p = [];
    for(var i = 0; i < node.length; i++){
        if(i!=n && CalcDistance(node[i].location, node[n].location) < 2*r){
            p.push({location:node[i].location});
        }
    }
    var count = 0;
    for(var i = 0; i < p.length; i++){
        var line = getLine(node[n].location, p[i].location);
        count = 0;
        var part1 = [];
        var part2 = [];
        var part3 = [];
        var newpoint1;
        var newpoint2;
        for(var j = 0; j < points.length; j++){
            if(j < points.length-1) {
                var _p = getInterSection(points[j], points[j+1], line);
            }
            else{
                var _p = getInterSection(points[j], points[0], line);
            }
            if(_p != null){
                count++;
                if(count === 1){
                    part1.push({x:points[j].x, y:points[j].y});
                    newpoint1 = _p;
                }
                else if(count === 2){
                    part2.push({x:points[j].x, y:points[j].y});
                    newpoint2 = _p;
                }
            }
            else{
                if(count === 0){
                    part1.push({x:points[j].x, y:points[j].y});
                }
                else if(count === 1){
                    part2.push({x:points[j].x, y:points[j].y});
                }
                else if(count === 2){
                    part3.push({x:points[j].x, y:points[j].y});
                }
            }
        }
        if(count == 2) {
            if(CalcDistance(part2[0], {x:0,y:0}) < CalcDistance(part2[0], {x:p[i].location.x-node[n].location.x, y:p[i].location.y-node[n].location.y})){
                points = [];
                points.push(newpoint1);
                points = points.concat(part2);
                points.push(newpoint2);
            }
            else{
                part1.push(newpoint1);
                part1.push(newpoint2);
                points = part1.concat(part3);
            }
        }
    }
    var str = "M";
    for(var i = 0; i < points.length; i++){
        if(i === 0){
            str += points[i].x+","+points[i].y;
        }
        else{
            str += " L"+points[i].x+","+points[i].y;
        }
    }
    str += " L"+points[0].x+","+points[0].y;
    return str;
}
function getLine(l1, l2){
    var dx = l2.x-l1.x,
        dy = l2.y-l1.y;
    if(dy === 0){
        var k = 999999;
        var b = (dx/2);
    }
    else{
        var k = -dx/dy;
        var b = (dy/2) - k*(dx/2);
    }
    return {k:k, b:b};
}
function getInterSection(p1, p2, l){
    if(l.k === 999999){
        if(p1.x < l.b && p2.x > l.b){
            var y = p1.y + (p2.y-p1.y)*((l.b-p1.x)/(p2.x-p1.x));
            return {x: l.b, y:y};
        }
        else if(p1.x > l.b && p2.x < l.b){
            var y = p2.y + (p1.y-p2.y)*((l.b-p2.x)/(p1.x-p2.x));
            return {x: l.b, y:y};
        }
        else{
            return null;
        }
    }
    else{
        var d1 = p1.x*l.k + l.b - p1.y;
        var d2 = p2.x* l.k + l.b - p2.y;
        if(d1 > 0 && d2 < 0){
            var d = (-d1)/(l.k*(p2.x-p1.x) - (p2.y-p1.y));
            return {x:p1.x+d*(p2.x-p1.x), y:p1.y+d*(p2.y-p1.y)};
        }
        else if(d1 < 0 && d2 > 0){
            var d = (-d2)/(l.k*(p1.x-p2.x) - (p1.y-p2.y));
            return {x:p2.x+d*(p1.x-p2.x), y:p2.y+d*(p1.y-p2.y)};
        }
        else{
            return null;
        }
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
    objX = parseFloat(node[i].location.x);
    objY = parseFloat(node[i].location.y);
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
var period = 2;
var w = 1200;
var h = 1200;
var padding = 20;
var node = [];
var len = 60;
var svg = null;
var color = null;
var r = 20;
window.onload = function(){
    svg = document.getElementById("force");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    genColor(11);
    d3.json("miserables.json", function(json){
        for(var i = 0; i < json.nodes.length; i++){
            var newnode = new Node();
            newnode.color = color[parseInt(json.nodes[i].group)];
            node.push(newnode);
        }
        for(var j = 0; j < node.length; j++){
            var newcircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
            newcircle.setAttribute("r", r);
            newcircle.setAttribute("fill", node[j].color);
            newcircle.setAttribute("fill-opacity", 0.5);
            newcircle.onmousedown = down;
            newcircle.setAttribute("name", j);
            var g = document.createElementNS("http://www.w3.org/2000/svg","g");
            g.appendChild(newcircle);
            g.setAttribute("name", j);
            g.setAttribute("clip-path","url(#clip-"+j+")");
            var clipPath = document.createElementNS("http://www.w3.org/2000/svg","clipPath");
            clipPath.setAttribute("id", "clip-"+j);
            var path = document.createElementNS("http://www.w3.org/2000/svg","path");
            path.setAttribute("d", "M"+(-r)+","+(-r)+"L"+r+","+(-r)+"L"+r+","+r+"L"+(-r)+","+r+"L"+(-r)+","+(-r));
            clipPath.appendChild(path);
            svg.appendChild(clipPath);
            svg.appendChild(g);
        }
        for(var j = 0; j < json.links.length; j++){
            var newline = document.createElementNS("http://www.w3.org/2000/svg","line");
            newline.setAttribute("stroke", "gray");
            newline.setAttribute("stroke-width", 1);
            newline.setAttribute("stroke-opacity", 0.3);
            svg.appendChild(newline);
        }

        RandomInitial(node, w, h, padding);
        setInterval(function(){
            display(node, json.links);
            Iterate(node, json.links, len);
        }, period);
    });
}