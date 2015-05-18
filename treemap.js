function squarify(rect, children, row, w, id){
    if(id == children.length) {
        layoutRow(rect, row);
        return;
    }
    var head = children[id];
    var _row = row.slice(0);
    _row.push(head);
    if(row.length == 0 || worst(row, w) >=worst(_row, w)){
        squarify(rect, children, _row, w, id+1);
    }
    else{
        var newRect = layoutRow(rect, row);
        squarify(newRect, children, [], width(newRect), id);
    }
}
function worst(R, w){
    var sum = 0;
    var _max = 999999999;
    var ratio = [];
    for(var i = 0; i < R.length; i++){
        sum += R[i].size;
    }
    var len = sum / w;
    for(var i = 0; i < R.length; i++){
        var l = R[i].size / len;
        if(l < len){
            ratio.push(len/l);
        }
        else{
            ratio.push(l/len);
        }
    }
    _max = ratio[0];
    for(var i = 1; i < ratio.length; i++){
        _max = Math.max(ratio[i], _max);
    }
    return _max;
}
function layoutRow(rect, row){
    var parent = document.getElementsByClassName("box")[0];
    var size = 0;
    var newRect = [];
    var subRect = null;
    for(var i = 0; i < row.length; i++){
        size += row[i].size;
    }
    if(rect.w < rect.h){
        var len = size / rect.w;
        for(var i = 0; i < row.length; i++){
            var _w = row[i].size / len;
            newRect.push({w:_w,h:len});
        }
        newRect[0].x = rect.x;
        newRect[0].y = rect.y;
        for(var i = 1; i < newRect.length; i++){
            newRect[i].x = newRect[i-1].x + newRect[i-1].w;
            newRect[i].y = newRect[i-1].y;
        }
        subRect = {x:rect.x,y:rect.y+len,w:rect.w,h:rect.h-len};
    }
    else{
        var len = size / rect.h;
        for(var i = 0; i < row.length; i++){
            var _w = row[i].size / len;
            newRect.push({w:len,h:_w});
        }
        newRect[0].x = rect.x;
        newRect[0].y = rect.y;
        for(var i = 1; i < newRect.length; i++){
            newRect[i].x = newRect[i-1].x;
            newRect[i].y = newRect[i-1].y + newRect[i-1].h;
        }
        subRect = {x:rect.x+len,y:rect.y,w:rect.w-len,h:rect.h};
    }
    for(var i = 0; i < newRect.length; i++){
        row[i].div.style.left = newRect[i].x + "px";
        row[i].div.style.top = newRect[i].y  + "px";
        row[i].div.style.width = newRect[i].w + "px";
        row[i].div.style.height = newRect[i].h + "px";
        parent.appendChild(row[i].div);
        if(row[i].children) {
            squarify(newRect[i], row[i].children, [], width(newRect[i]), 0);
        }
    }
    return subRect;
}
function width(rect){
    var width = rect.w;
    var height = rect.h;
    return Math.min(width, height);
}
function preProcess(data){
    var sum = 0;
    var color = genColor();
    var children = data.children;
    for(var i = 0; i < children.length; i++){
        children[i].div = document.createElement("div");
        children[i].div.style.backgroundColor = color;
        //children[i].div.style.border = "1px solid white";
        //children[i].div.style.position = "absolute";
        children[i].div.className = "node";
        if(children[i].children != null) {
            var size = preProcess(children[i]);
        }
        else{
            var size = children[i].size;
            children[i].div.innerText = children[i].name;
        }
        sum += size;
    }
    data.size = sum;
    if(data.children){
        data.children.sort(function(a,b){ return b.size - a.size; });
    }
    return sum;
}
function preProcess2(data, factor){
    var sum = 0;
    var children = data.children;
    if(children) {
        for (var i = 0; i < children.length; i++) {
            var size = preProcess2(children[i], factor);
            sum += size;
        }
        data.size = sum;
        return sum;
    }
    else{
        data.size *= factor;
        return data.size;
    }
}
function genColor(){
    var r = Math.floor(Math.random()*100)+100;
    var g = Math.floor(Math.random()*100)+100;
    var b = Math.floor(Math.random()*100)+100;
    return "rgb("+r+","+g+","+b+")";
}
window.onload = function(){
    var w = 1366;
    var h = 768;
    var div0 = document.createElement("div");
    div0.style.position = "relative";
    div0.className = "box";
    document.getElementsByTagName("body")[0].appendChild(div0);
    d3.json("treemap_flare.json", function(json) {
        if(json != null) {
            preProcess(json);
            console.log(json);
            preProcess2(json, w*h/json.size);
            console.log(json);
            var div = document.createElement("div");
            div.className = "node";
            div.style.backgroundColor = genColor();
            div.style.width = w + "px";
            div.style.height = h + "px";
            div.style.left = "0px";
            div.style.top = "0px";
            json.div = div;
            div0.appendChild(json.div);
            var rect = {x:0,y:0,w:w,h:h};
            squarify(rect, json.children, [], width(rect), 0);
            //postProcess(json);
        }
    });
}
