var n = 20, // number of layers
    m = 200; // number of samples per layer
var arr = [];
for(var i = 0; i < n; i++){
    arr.push(i);
}
var w = 1200, h = 600;
var wunit = w / m;
var rawdata = arr.map(function(){ return bumpLayer(m); });
var dataset = stack(rawdata);
var minvalue = 0 - getMin(dataset[0]);
var maxvalue = getMax(dataset[dataset.length-1]);
var hunit = h / (minvalue+maxvalue);
scale(dataset);
var count = 0;
var svg = null;
window.onload = function(){
    svg = document.getElementById("graph");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    for(var i = 0; i < n; i++){
        var path = document.createElementNS("http://www.w3.org/2000/svg","path");
        var str = genPath(dataset[i],dataset[i+1]);
        var r = Math.floor((i+1)/n*100) + 100;
        var g = Math.floor((i+1)/n*100) + 100;
        var b = Math.floor((i+1)/n*100) + 150;
        path.setAttribute("fill", "rgb(" + r + "," + g + "," + b + ")");
        path.setAttribute("stroke", "gray");
        path.setAttribute("stroke-width", "0px");
        path.setAttribute("d", str);
        svg.appendChild(path);
    }
}
function stack(data){
    var arr = [[]];
    var d = [];
    var buffer_i;
    var buffer_j;
    for(var i = 0; i < data.length; i++){
        d.push([]);
        for(var j = 0; j < data[i].length; j++){
            if(j == 0){
                d[i].push(0);
            }
            else{
                d[i].push(data[i][j].y - data[i][j-1].y);
            }
        }
    }
    for(var i = 0; i < data[0].length; i++){
        arr[0].push({x:data[0][i].x, y:data[0][i].y});
    }
    for(var i = 1; i < data.length; i++){
        for(var j = 0; j < data[i].length; j++){
            arr[0][j].y += data[i][j].y;
        }
    }
    for(var k = 0; k < arr[0].length; k++){
        buffer_i = 0;
        for(var i = 0; i < data.length; i++){
            buffer_j = 0;
            for(var j = 0; j <= i-1; j++){
                buffer_j += d[j][k];
            }
            buffer_i += (buffer_j + d[i][k] * 0.5) * data[i][k].y;
        }
        arr[0][k].y = (-1/arr[0][k].y) * buffer_i;
    }
    for(var k = 0; k < arr[0].length; k++){
        if(k > 0){
            arr[0][k].y += arr[0][k-1].y;
        }
    }
    for(var i = 0; i < data.length; i++){
        arr.push([]);
        for(var j = 0; j < data[i].length-1; j++){
            arr[arr.length - 1].push({x:data[i][j].x, y:data[i][j].y+arr[arr.length - 2][j].y});
        }
    }
    return arr;
}
function scale(data){
    for(var i = 0; i < data.length; i++){
        for(var j = 0; j < data[i].length; j++){
            data[i][j].x *= wunit;
            data[i][j].y = (data[i][j].y + minvalue) * hunit
        }
    }
}
function transition() {
    var newdataset = stack(arr.map(function(){ return bumpLayer(m); }));
    minvalue = 0 - getMin(newdataset[0]);
    maxvalue = getMax(newdataset[newdataset.length-1]);
    hunit = h / (minvalue+maxvalue);
    scale(newdataset);
    //var transition_time = 1000;
    var part = 200;
    var period = 10;
    for(var i = 0; i <= part; i++){
        setTimeout(function(){display(getMiddlePoint(dataset, newdataset, part)); if(count > part){ dataset = newdataset;}}, i*period);
    }
}
function genPath(g0, g1){
    var str = "M" + g1[0].x + "," + g1[0].y;
    for(var i = 1; i < g1.length; i++){
        str += "L" + g1[i].x + "," + g1[i].y;
    }
    for(var i = g0.length - 1; i >= 0; i--){
        str += "L" + g0[i].x + "," + g0[i].y;
    }
    return str;
}
// Inspired by Lee Byron's test data generator.
function bumpLayer(n) {

    function bump(a) {
        var x = 1 / (.1 + Math.random()),
            y = 2 * Math.random() - .5,
            z = 10 / (.1 + Math.random());
        for (var i = 0; i < n; i++) {
            var w = (i / n - y) * z;
            a[i] += x * Math.exp(-w * w);
        }
    }

    var a = [], i;
    for (i = 0; i < n; ++i) a[i] = 0;
    for (i = 0; i < 5; ++i) bump(a);
    return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
}

function getMax(layer){
    var max = -99999;
    for(var i = 0; i < layer.length; i++){
        if(max < layer[i].y){
            max = layer[i].y;
        }
    }
    return max;
}
function getMin(layer){
    var min = 99999;
    for(var i = 0; i < layer.length; i++){
        if(min > layer[i].y){
            min = layer[i].y;
        }
    }
    return min;
}
function display(dataset){
    for(var i = 0; i < n; i++){
        var path = svg.getElementsByTagName("path")[i];
        var str = genPath(dataset[i],dataset[i+1]);
        var r = Math.floor((i+1)/n*100) + 100;
        var g = Math.floor((i+1)/n*100) + 100;
        var b = Math.floor((i+1)/n*100) + 150;
        path.setAttribute("fill", "rgb(" + r + "," + g + "," + b + ")");
        path.setAttribute("d", str);
    }
    count++;
}
function getMiddlePoint(origin, last, part){
    if(count > part) {
        count = 0;
    }
    var middle = [];
    for(var i = 0; i < origin.length; i++){
        middle.push([]);
        for(var j = 0; j < origin[i].length; j++){
            middle[i].push({x:last[i][j].x, y:(origin[i][j].y+(count/part)*(last[i][j].y - origin[i][j].y))});
        }
    }
    return middle;
}