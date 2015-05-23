var currentPosition = {};
var centerPosition = {};
var interval = 0;
var beta = 0.9;
var tree = null;
var data = null;
var links = [];
var paths = [];
window.onload = function(){
    var w = 1000;
    var h = 1000;
    var padding = 130;
    var r = Math.min(w/2, h/2) - padding;
    currentPosition = {x:w/2+r, y:h/2};
    centerPosition = {x:w/2, y:h/2};
    var svg = document.getElementsByTagName("svg")[0];
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx",w/2);
    circle.setAttribute("cy", h/2);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "white");
    svg.appendChild(circle);
    document.getElementsByTagName("input")[0].onchange = onChange;
    d3.json("flare-import.json", function(json){
        data = json;
        tree = genTree(json);
        interval = (2*Math.PI) / (json.length + getGroupNum(tree));
        setPosition(tree, 1);
        rotateText(tree, 1);
        for(var i = 0; i < json.length; i++) {
            for (var j = 0; j < json[i].imports.length; j++) {
                var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                paths.push(path);
                svg.appendChild(path);
                var _path = LCA(tree, json[i].name, json[i].imports[j]);
                links.push(_path);
            }
        }
        draw(json);
    });
}
function getNextPosition(fix, position, addAngle){
    var r = Math.sqrt(Math.pow(position.x-fix.x,2)+Math.pow(position.y-fix.y,2));
    var currentAngle = Math.atan2(-position.y + fix.y, position.x - fix.x);
    var newAngle = currentAngle - addAngle;
    if(newAngle <= -Math.PI){
        newAngle += (2*Math.PI);
    }
    var dx = r * Math.cos(newAngle);
    var dy = r * Math.sin(newAngle);
    return {x:fix.x + dx, y:fix.y - dy};
}
function getPosition(center, r, angle){
    var dx = r * Math.cos(angle);
    var dy = r * Math.sin(angle);
    return {x:center.x + dx, y:center.y - dy};
}
function getAngle(position1, position2){
    return Math.atan2(-position2.y + position1.y, position2.x - position1.x);
}
function findNode(name, arr){
    for(var i = 0; i < arr.length; i++){
        if(arr[i].name == name){
            return i;
        }
    }
    var text = document.createElementNS("http://www.w3.org/2000/svg","text");
    text.innerHTML = name;
    arr.push({name:name, children:[], text:text, position:{x:0, y:0}});
    return arr.length - 1;
}
function getGroupNum(node){
    var sum = 0;
    var flag = false;
    for(var i = 0; i < node.children.length; i++){
        sum += getGroupNum(node.children[i]);
        if(node.children[i].children.length == 0){
            flag = true;
        }
    }
    if(flag){
        return sum + 1;
    }
    return sum;
}
function genTree(data){
    var text = document.createElementNS("http://www.w3.org/2000/svg","text");
    var tree = {name:"", children:[], parent:null, text:text, position:{x:0, y:0}};
    var current = null;
    var pre = null;
    for(var i = 0; i < data.length; i++){
        var arr = data[i].name.split(".");
        if(i == 0){
            tree.name = arr[0];
            tree.text.innerHTML = tree.name;
        }
        current = tree;
        for(var j = 1; j < arr.length; j++){
            var id = findNode(arr[j], current.children);
            pre = current;
            current.children[id].parent = pre;
            current = current.children[id];
        }
    }
    return tree;
    //console.log(tree);
}
var count = 0;
function setPosition(node, id){
    var svg = document.getElementsByTagName("svg")[0];
    if(node.children.length == 0){
        node.position = currentPosition;
        svg.appendChild(node.text);
        node.text.setAttribute("x", node.position.x);
        node.text.setAttribute("y", node.position.y);
        currentPosition = getNextPosition(centerPosition, currentPosition, interval);
    }
    else {
        var flag = false;
        for (var i = 0; i < node.children.length; i++) {
            if(node.children[i].children.length == 0){
                flag = true;
            }
            setPosition(node.children[i], id + 1);
        }
        if(flag == true){
            count++;
            currentPosition = getNextPosition(centerPosition, currentPosition, interval);
        }
        var angle = getAngle(centerPosition, node.children[0].position) + getAngle(centerPosition, node.children[node.children.length - 1].position);
        angle /= 2;
        var r = Math.sqrt(Math.pow(node.children[0].position.x-centerPosition.x,2)+Math.pow(node.children[0].position.y-centerPosition.y,2));
        node.position = getPosition(centerPosition, r - (r/id), angle);
        svg.appendChild(node.text);
        node.text.setAttribute("x", node.position.x);
        node.text.setAttribute("y", node.position.y);
    }
}
function rotateText(node, id){
    node.text.setAttribute("text-anchor", "middle");
    node.text.setAttribute("dominant-baseline", "middle");
    node.text.setAttribute("font-size", 12);
    node.text.setAttribute("font-family", "Arial");
    for(var i = 0; i < node.children.length; i++){
        rotateText(node.children[i], id+1);
    }
    if(id > 1){
        var angle = getAngle(centerPosition, node.position);
        angle = (angle/(2*Math.PI)) * 360;
        if(angle <=90 && angle >= -90){
            node.text.setAttribute("text-anchor", "start");
            angle = - angle;
        }
        else{
            node.text.setAttribute("text-anchor", "end");
            angle = 180 - angle;
        }
        node.text.setAttribute("transform", "rotate(" + angle + "," + node.position.x + "," + node.position.y + ")");
    }
}
function LCA(tree, str1, str2){
    str1 = str1.split(".");
    str2 = str2.split(".");
    for(var i = 0; i < Math.min(str1.length, str2.length); i++){
        if(str1[i] != str2[i]){
            break;
        }
    }
    var node = tree;
    for(var j = 1; j < i; j++){
        node = node.children[findNode(str1[j], node.children)];
    }
    var arr1 = [];
    var arr2 = [];
    var node1 = node;
    var node2 = node;
    for(var j  = i; j < str1.length; j++){
        var id = findNode(str1[j], node1.children);
        arr1.push({x:0,y:0});
        arr1[arr1.length-1].x = node1.children[id].position.x;
        arr1[arr1.length-1].y = node1.children[id].position.y;
        node1 = node1.children[id];
    }
    for(var j  = i; j < str2.length; j++){
        var id = findNode(str2[j], node2.children);
        arr2.push({x:0,y:0});
        arr2[arr2.length-1].x = node2.children[id].position.x;
        arr2[arr2.length-1].y = node2.children[id].position.y;
        node2 = node2.children[id];
    }
    arr1.reverse();
    arr1.push({x:0,y:0});
    arr1[arr1.length-1].x = node.position.x;
    arr1[arr1.length-1].y = node.position.y;
    var arr = arr1.concat(arr2);
    return arr;
}
function fix(arr){
    var n = arr.length;
    var newArr = [];
    for(var i = 0; i < n; i++){
        newArr.push({x:0,y:0});
        newArr[i].x = (beta*arr[i].x)+(1-beta)*(arr[0].x+(i/(n-1))*(arr[n-1].x-arr[0].x));
        newArr[i].y = (beta*arr[i].y)+(1-beta)*(arr[0].y+(i/(n-1))*(arr[n-1].y-arr[0].y));
    }
    return newArr;
}
function N(i, k, id, t){
    if(k == 1){
        if(id <=t[i+1] && id >=t[i]){
            return 1;
        }
        else{
            return 0;
        }
    }
    else{
        var a = (id - t[i])*N(i,k-1,id,t);
        var b = (t[i+k-1]-t[i]);
        var c = (t[i+k] - id)*N(i+1,k-1,id,t);
        var d = (t[i+k]-t[i+1]);
        if(b == 0){
            b = 1;
        }
        if(d == 0){
            d = 1;
        }
        return (a/b) + (c/d);
    }
}
function genT(k, n){
    var t = [];
    for(var i = 0; i <=n+k; i++){
        if(i < k){
            t.push(0);
        }
        else if(i >=k && i <=n){
            t.push(i-k+1);
        }
        else{
            t.push(n-k+2);
        }
    }
    var len = t[t.length-1] - t[0];
    if(len != 0){
        for(var i = 0; i < t.length; i++){
            t[i] /= len;
        }
    }
    return t;
}
function spline(q, id, k){
    var n = q.length - 1;
    var t = genT(k, n);
    var r = 0;
    for(var i = 0; i <=n; i++){
        //console.log(N(i,k,id,t));
        r += (q[i]*N(i,k,id,t));
    }
    //console.log("----------");
    return r;
}
function drawLine(q){
    var qx = [];
    var qy = [];
    var list = [];
    for(var i = 0; i < q.length; i++){
        qx[i] = q[i].x;
        qy[i] = q[i].y;
    }
    for(var i = 0; i <=1; i+=0.02){
        var x = spline(qx, i, 3);
        var y = spline(qy, i, 3);
        list.push({x:x, y:y});
    }
    var x = spline(qx, 1, 3);
    var y = spline(qy, 1, 3);
    list.push({x:x, y:y});
    var str = "M";
    for(var i = 0 ; i < list.length; i++){
        if(i == 0){
            str += list[i].x + "," + list[i].y;
        }
        else{
            str += "L" + list[i].x + "," + list[i].y;
        }
    }
    return str;
}
function draw(json){
    beta = document.getElementsByTagName("input")[0].value;
    beta /= 100;
    var svg = document.getElementsByTagName("svg")[0];
    var id = 0;
    for(var i = 0; i < json.length; i++) {
        for (var j = 0; j < json[i].imports.length; j++) {
            var _path = fix(links[id]);
            var path = paths[id];
            var str = drawLine(_path);
            path.setAttribute("d", str);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "#1f77b4");
            path.setAttribute("stroke-opacity", 0.4);
            id++;
        }
    }
}
function onChange(){
    draw(data);
}