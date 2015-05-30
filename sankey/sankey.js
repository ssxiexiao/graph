var dragging = false;
var obj,
    objY,
    mouseY;
window.onload = function(){
    var w = 1200,
        h = 1200;
    var baseHeight = [];
    var rectW = 30;
    var wInterval = 500,
        hInterval = 50;
    var hFactor = 10;
    d3.json("data.json", function(json){
        var svg = document.getElementsByTagName("svg")[0];
        svg.setAttribute("width", w);
        svg.setAttribute("height", h);
        for(var i = 0; i < json.nodes.length; i++){
            json.nodes[i].in = 0;
            json.nodes[i].out = 0;
        }
        for(var i = 0; i < json.links.length; i++){
            var s = parseInt(json.links[i].source);
            var t = parseInt(json.links[i].target);
            var v = parseInt(json.links[i].value);
            json.nodes[s].out += v;
            json.nodes[t].in += v;
        }
        for(var i = 0; i < json.nodes.length; i++){
            json.nodes[i].total = Math.max(json.nodes[i].in, json.nodes[i].out);
            if(json.nodes[i].in === 0){
                json.nodes[i].layer = 0;
            }
            json.nodes[i].inH = 0;
            json.nodes[i].outH = 0;
        }
        for(var i = 0; i < json.links.length; i++){
            var s = parseInt(json.links[i].source);
            var t = parseInt(json.links[i].target);
            var v = parseInt(json.links[i].value);
            if(json.nodes[t].layer === undefined && json.nodes[s].layer != undefined){
                json.nodes[t].layer = json.nodes[s].layer+1;
            }
            json.links[i].sH = json.nodes[s].outH;
            json.links[i].tH = json.nodes[t].inH;
            json.nodes[s].outH += v*hFactor;
            json.nodes[t].inH += v*hFactor;
        }
        for(var i = 0; i < json.nodes.length; i++){
            if(baseHeight.length <=json.nodes[i].layer){
                for(var j = baseHeight.length; j <=json.nodes[i].layer; j++){
                    baseHeight[j] = 0;
                }
            }
            json.nodes[i].h = baseHeight[json.nodes[i].layer];
            baseHeight[json.nodes[i].layer] += json.nodes[i].total*hFactor + hInterval;
        }
        for(var i = 0; i < json.nodes.length; i++){
            var rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
            rect.setAttribute("fill", getColor());
            rect.setAttribute("stroke", "black");
            rect.onmousedown = down;
            json.nodes[i].rect = rect;
            svg.appendChild(rect);
            var nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            nameText.innerHTML = json.nodes[i].name;
            var numText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            numText.innerHTML = json.nodes[i].total;
            numText.setAttribute("text-anchor", "middle");
            json.nodes[i].nameText = nameText;
            json.nodes[i].numText = numText;
            svg.appendChild(nameText);
            svg.appendChild(numText);
        }
        for(var i = 0; i < json.links.length; i++){
            var path = document.createElementNS("http://www.w3.org/2000/svg","path");
            json.links[i].path = path;
            svg.appendChild(path);
        }
        for(var i = 0; i < json.nodes.length; i++){
            drawRect(json.nodes[i]);
        }
        display();
        function display(){
            for(var i = 0; i < json.links.length; i++){
                drawPath(json.links[i], json.nodes);
            }
            for(var i = 0; i < json.nodes.length; i++){
                drawText(json.nodes[i]);
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
            dragging = true;
            obj = targ;
            mouseY = parseFloat(e.clientY);
            objY = parseFloat(targ.getAttribute("y"));
        }
        function move(e){
            var targ;
            if (!e){
                var e = window.event;
            }
            if(dragging == true){
                var y;
                y = e.clientY - mouseY + objY;
                obj.setAttribute("y", y);
            }
            display();
        }
        function up(){
            dragging = false;
        }
        document.onmouseup = up;
        document.onmousemove = move;
    });
    function drawPath(link, nodes){
        var s = parseInt(link.source);
        var t = parseInt(link.target);
        var v = parseInt(link.value);
        var x1 = parseInt(nodes[s].rect.getAttribute("x"))+parseInt(nodes[s].rect.getAttribute("width")),
            y1 = parseFloat(nodes[s].rect.getAttribute("y"))+link.sH;
        var x2 = parseInt(nodes[t].rect.getAttribute("x")),
            y2 = parseFloat(nodes[t].rect.getAttribute("y"))+link.tH;
        var x3 = x1,
            y3 = y1+v*hFactor;
        var x4 = x2,
            y4 = y2+v*hFactor;
        var xLen = Math.abs(x1-x2)/2;
        var yLen = v*hFactor/2;
        if(x1 < x2) {
            var d = "M" + x1 + " " + y1 + "C" + (x1 + xLen) + " " + y1 + " " + (x2 - xLen) + " " + y2 + " " + x2 + " " + y2 + "L" + x4 + " " + y4 + "C" + (x4 - xLen) + " " + y4 + " " + (x3 + xLen) + " " + y3 + " " + x3 + " " + y3 + "L" + x1 + " " + y1;
        }
        else{

        }
        link.path.setAttribute("d", d);
        link.path.setAttribute("fill", nodes[s].rect.getAttribute("fill"));
        link.path.setAttribute("fill-opacity", 0.5);
    }
    function drawRect(node){
        node.rect.setAttribute("x", node.layer*(wInterval + rectW));
        node.rect.setAttribute("y", node.h);
        node.rect.setAttribute("width", rectW);
        node.rect.setAttribute("height", node.total*hFactor);
    }
    function drawText(node){
        var y = parseFloat(node.rect.getAttribute("y")) + (node.total/2)*hFactor;
        var xNum = parseFloat(node.rect.getAttribute("x")) + (parseFloat(node.rect.getAttribute("width"))/2);
        node.numText.setAttribute("x", xNum);
        node.numText.setAttribute("y", y);
        var xName = parseFloat(node.rect.getAttribute("x")) + parseFloat(node.rect.getAttribute("width"));
        node.nameText.setAttribute("x", xName);
        node.nameText.setAttribute("y", y);
    }
    function getColor(){
        var r = Math.floor(Math.random()*255)+0;
        var g = Math.floor(Math.random()*255)+0;
        var b = Math.floor(Math.random()*255)+0;
        return "rgb("+r+","+g+","+b+")";
    }
}