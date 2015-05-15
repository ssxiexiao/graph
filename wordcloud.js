window.onload = function(){
    initial();
}
function initial(){
    var w = 1000;
    var h = 1000;
    var _w = 500;
    var _h = 500;
    var canvas1 = document.getElementsByTagName("canvas")[0];
    var canvas2 = document.getElementsByTagName("canvas")[1];
    var cxt1 = canvas1.getContext("2d");
    var cxt2 = canvas2.getContext("2d");
    canvas1.setAttribute("width", w);
    canvas1.setAttribute("height", h);
    canvas2.setAttribute("width", _w);
    canvas2.setAttribute("height", _h);
    cxt1.textAlign = "center";
    cxt1.textBaseline = "middle";
    cxt1.fillStyle = "black";
    cxt2.textAlign = "center";
    cxt2.textBaseline = "middle";
    cxt2.fillStyle = "black";
}
function hasProperty(arr, name){
    for(var i = 0; i < arr.length; i++){
        if(arr[i].text === name)
            return i;
    }
    return -1;
}
function text2Words(str){
    var words =  str.replace(/[\s|\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\¡°|\,|\¡±|¡®\<|\.|\>|\/|\¡ª|\?|\t|\n]+/g, " ").split(" ");
    if(words[0] == "")
        words.shift();
    if(words[words.length - 1] == "")
        words.pop();
    var res = [];
    for(var i = 0; i < words.length; i++){
        var id = hasProperty(res, words[i]);
        if(id >= 0){
            res[id].value++;
        }
        else{
            res.push({text:words[i], value:1});
        }
    }
    return res.sort(function(a,b){ return b.value - a.value; });
}
function draw(data){
    var offset = 5;
    var scale = 4;
    var minSize = 6;
    var canvas1 = document.getElementsByTagName("canvas")[0];
    var canvas2 = document.getElementsByTagName("canvas")[1];
    var cxt1 = canvas1.getContext("2d");
    var cxt2 = canvas2.getContext("2d");
    var square = document.getElementsByName("Layout")[0];
    cxt1.clearRect(0,0,canvas1.width,canvas1.height);
    var fix = {x:canvas1.width/2,y:canvas1.height/2};
    var position = {x:canvas1.width/2, y:canvas1.height/2 - offset};
    var id = 0;
    if(square.checked === true) {
        var getPosition = getNextPosition2;
    }
    else{
        var getPosition = getNextPosition;
    }
    for(var i = 0; i < data.length; i++) {
        var fontSize = data[i].value*scale + minSize;
        cxt1.font = fontSize + "px Impact";
        cxt2.font = fontSize + "px Impact";
        if(i === 0){
            cxt1.fillText(data[i].text, fix.x, fix.y);
            var oldData = cxt1.getImageData(0, 0, canvas1.width, canvas1.height);
        }
        else {
            position = {x: canvas1.width / 2, y: canvas1.height / 2 - offset};
            var width = cxt1.measureText(data[i].text).width;
            id = 0;
            if(Math.round(width)%2 != 0){
                var _width = Math.round(width) + 1;
            }
            else{
                var _width = Math.round(width);
            }
            if(Math.round(fontSize)%2 != 0){
                var _height = Math.round(fontSize) + 1;
            }
            else{
                var _height = Math.round(fontSize);
            }
            cxt2.fillText(data[i].text, _width/2, _height/2);
            var newData =  cxt2.getImageData(0, 0, _width, _height);
            while (isOverLap(position, oldData, newData)) {
                position = getPosition(fix, position, offset);
                id++;
            }
            cxt1.fillText(data[i].text, position.x, position.y);
            cxt2.clearRect(0,0,canvas2.width,canvas2.height);
            console.log(i);
        }
    }
}
function update(position, oldData, newData){
    var size = 4;
    var offset = 3;
    for(var i = 0; i < newData.data.length/size; i++){
        var x = i%newData.width + position.x - newData.width/2;
        var y = Math.floor(i/newData.width) + position.y - newData.height/2;
        var id = y*oldData.height+x;
        oldData.data[id*size+offset] += newData.data[i*size+offset];
    }
}
function isOverLap(position, oldData, newData){
    var oldPix = oldData.data;
    var newPix = newData.data;
    var size = 4;
    var offset = 3;
    for(var i = 0; i < newPix.length/size; i++){
        var x = i%newData.width + position.x - newData.width/2;
        var y = Math.floor(i/newData.width) + position.y - newData.height/2;
        var id = y*oldData.height+x;
        if((oldPix[id*size+offset]&newPix[i*size+offset]) != 0) { return true; }
    }
    update(position, oldData, newData);
    return false;
}
function getNextPosition(fix, position, addAngle){
    var len = 0;
    var r = Math.sqrt(Math.pow(position.x - fix.x, 2) + Math.pow(position.y - fix.y, 2));
    addAngle = (addAngle / 360) * 2 * Math.PI;
    var currentAngle = Math.atan2(-position.y + fix.y, position.x - fix.x);
    var newAngle = currentAngle - addAngle;
    if(newAngle < -1 * Math.PI){
        newAngle += 2 * Math.PI;
        len = 1;
    }
    if((currentAngle >=Math.PI * 0.5 && newAngle < Math.PI * 0.5)
        ||(currentAngle >=0 && newAngle < 0)
        ||(currentAngle >=Math.PI * -0.5 && newAngle < Math.PI * -0.5)){
        len = 1;
    }
    var dx = Math.cos(newAngle)*(r+len), dy = Math.sin(newAngle)*(r+len);
    return {x:Math.floor(fix.x+dx),y:Math.floor(fix.y-dy)};
}
function getNextPosition2(fix, position, len){
    var dx = position.x - fix.x;
    var dy = -position.y + fix.y;
    if(Math.abs(dx) < Math.abs(dy)){
        dx += (dy/Math.abs(dy)) * len;
    }
    else if(Math.abs(dx) === Math.abs(dy)){
        if(dx < 0 && dy > 0){
            dy += len;
        }
        else if(dx > 0 && dy > 0){
            dy -= len;
        }
        else if(dx > 0 && dy < 0){
            dx -= len;
        }
        else{
            dy += len;
        }
    }
    else{
        dy += -(dx/Math.abs(dx)) * len;
    }
    return {x:fix.x + dx, y:fix.y - dy};
}
function transition(){
    var canvas = document.getElementsByTagName("canvas")[0];
    var text = document.getElementsByTagName("textarea")[0].value;
    var data = text2Words(text);
    //console.log(data);
    draw(data);
}
function sample(){
    d3.json("word.json", function(json) {
        if(json != null) {
            draw(json);
        }
    });
}