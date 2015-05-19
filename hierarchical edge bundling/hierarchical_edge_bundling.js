window.onload = function(){
    var w = 1000;
    var h = 1000;
    var padding = 130;
    var svg = document.getElementsByTagName("svg")[0];
    svg.setAttribute("width", w);
    svg.setAttribute("height", h)
    var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx",w/2);
    circle.setAttribute("cy", h/2);
    circle.setAttribute("r", Math.min(w/2, h/2) - padding);
    //circle.setAttribute("stroke", "blue");
    //circle.setAttribute("stroke-width", "2");
    circle.setAttribute("fill", "white");
    svg.appendChild(circle);
    var package = [];
    var interval_class = 0;
    var fontSize = 10;
    d3.json("flare-import.json", function(json){
        for(var i = 0; i < json.length; i++){
            package[hasPackage(package, getPackage(json[i].name))].classes.push(getClass(json[i].name));
            var text = document.createElementNS("http://www.w3.org/2000/svg","text");
            text.innerHTML = getClass(json[i].name);
            text.setAttribute("font-size", fontSize+"px");
            text.setAttribute("font-family", "Arial");
            package[hasPackage(package, getPackage(json[i].name))].texts.push(text);
            svg.appendChild(text);
        }
        var fontSum = 0;
        for(var i = 0; i < package.length; i++){
            fontSum += package[i].classes.length;
        }
        var r = parseInt(circle.getAttribute("r"));
        interval_class = (2 * Math.PI) / (fontSum + package.length);
        setText(circle, package, interval_class);
    });
}
function getPackage(str){
    str = str.split(".");
    return str[str.length-2];
}
function getClass(str){
    str = str.split(".");
    return str[str.length-1];
}
function hasPackage(arr, name){
    for(var i = 0; i < arr.length; i++){
        if(arr[i].name == name){
            return i;
        }
    }
    arr.push({name:name, classes:[], texts:[]});
    return arr.length - 1;
}
function setText(circle, package, interval_class){
    var cx = parseInt(circle.getAttribute("cx"));
    var cy = parseInt(circle.getAttribute("cy"));
    var r = parseInt(circle.getAttribute("r"));
    var currentPosition = {x:cx - r, y:cy, angle:180};
    for(var i = 0; i < package.length; i++){
        for(var j = 0; j < package[i].classes.length; j++){
            package[i].texts[j].setAttribute("x", currentPosition.x);
            package[i].texts[j].setAttribute("y", currentPosition.y);
            var angle = currentPosition.angle;
            if(angle < 0){
                angle = 360 + angle;
            }
            console.log(angle);
            if(angle < 90 || angle > 270) {
                angle = 360 - angle;
                package[i].texts[j].setAttribute("text-anchor", "start");
            }
            else{
                package[i].texts[j].setAttribute("text-anchor", "end");
                angle = 360 - angle + 180;
            }
            package[i].texts[j].setAttribute("transform","rotate("+angle+" "+currentPosition.x+" "+currentPosition.y+")");
            if(j < (package[i].classes.length-1)){
                currentPosition = getNextPosition({x:cx, y:cy}, currentPosition, interval_class, r);
            }
        }
        currentPosition = getNextPosition({x:cx, y:cy}, currentPosition, interval_class*2, r);
    }
}
function getNextPosition(fix, position, addAngle, r){
    var currentAngle = Math.atan2(-position.y + fix.y, position.x - fix.x);
    var newAngle = currentAngle - addAngle;
    if(newAngle < -Math.PI){
        newAngle = 2*Math.PI + newAngle;
    }
    var dx = r * Math.cos(newAngle);
    var dy = r * Math.sin(newAngle);
    return {x:fix.x + dx, y:fix.y - dy, angle:(newAngle/(2*Math.PI))*360};
}