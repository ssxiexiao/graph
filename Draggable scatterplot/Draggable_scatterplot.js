var Coordinate = {
    createNew: function(x, y, width, height){
        var coordinate = {};
        coordinate.x = x;
        coordinate.y = y;
        coordinate.width = width;
        coordinate.height = height;
        coordinate.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        coordinate.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        coordinate.rect.setAttribute('width', coordinate.width);
        coordinate.rect.setAttribute('height', coordinate.height);
        coordinate.rect.setAttribute('x', coordinate.x);
        coordinate.rect.setAttribute('y', coordinate.y);
        coordinate.rect.setAttribute('fill', 'none');
        //coordinate.rect.setAttribute('stroke', 'black');
        coordinate.g.appendChild(coordinate.rect);
        coordinate.points = {};
        coordinate.xRange = function(min, max){
            coordinate.xMin = Math.floor(min);
            coordinate.xMax = Math.floor(max)+1;
        };
        coordinate.yRange = function(min, max){
            coordinate.yMin = Math.floor(min);
            coordinate.yMax = Math.floor(max)+1;
        };
        coordinate.zRange = function(min, max){
            coordinate.zMin = Math.floor(min);
            coordinate.zMax = Math.floor(max)+1;
        }
        coordinate.zScale = function(minSize, maxSize){
            coordinate.minSize = minSize;
            coordinate.maxSize = maxSize;
        }
        coordinate.addPoint = function(obj){
            if(obj.x && obj.y && obj.z) {
                if(!coordinate.points[obj.name]) {
                    var point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    coordinate.g.appendChild(point);
                    coordinate.points[obj.name] = point;
                }
                else{
                    var point = coordinate.points[obj.name];
                }
                var px = (obj.x - coordinate.xMin) / (coordinate.xMax - coordinate.xMin),
                    py = (obj.y - coordinate.yMin) / (coordinate.yMax - coordinate.yMin),
                    pz = (obj.z - coordinate.zMin) / (coordinate.zMax - coordinate.zMin);
                var cx = coordinate.x + (coordinate.width * Math.pow(px, 0.3)),
                    cy = coordinate.y + (coordinate.height * (1-py)),
                    r = coordinate.minSize + ((coordinate.maxSize - coordinate.minSize) * Math.sqrt(pz));
                point.setAttribute('cx', cx);
                point.setAttribute('cy', cy);
                point.setAttribute('r', r);
                point.setAttribute('fill', color[dict[obj.region]]);
                point.setAttribute('stroke', 'black');
                point.setAttribute('name', obj.name);
                onmousemove(point, coordinate.points);
                onmouseout(point, coordinate.points);
            }
        };
        return coordinate;
    }
};
function onmousemove(point, arr){
    point.onmousemove = function(){
        var normal = 0.2, highlight = 1;
        nameText.innerHTML = point.getAttribute('name');
        for(var i in arr){
            arr[i].setAttribute('fill-opacity', normal);
        }
        point.setAttribute('fill-opacity', highlight);
    }
}
function onmouseout(point, arr){
    point.onmouseout = function(){
        var normal = 1;
        //nameText.innerHTML = '';
        for(var i in arr){
            arr[i].setAttribute('fill-opacity', normal);
        }
    }
}
var axes = {x:'income', y:'lifeExpectancy', z:'population'};
var yearText = document.createElementNS("http://www.w3.org/2000/svg", "text");
var nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
yearText.setAttribute('font-size', 100);
yearText.setAttribute('font-family', 'Arial');
yearText.setAttribute('fill', '#ddd');
nameText.setAttribute('font-size', 100);
nameText.setAttribute('font-family', 'Arial');
nameText.setAttribute('fill', '#ddd');
window.onload = function(){
    var w = 1000,
        h = 750;
    var svg = document.getElementsByTagName('svg')[0];
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.appendChild(yearText);
    svg.appendChild(nameText);
    var rMin = 2,
        rMax = 60;
    d3.json('nations.json', function(json){
        var data = preProcess(json);
        var range = data.range,
            region = data.region;
        genColor(region.length);
        dict = {};
        for(var i = 0; i < region.length; i++){
            dict[region[i]] = i;
        }
        var coordinate = Coordinate.createNew(0, 200, 900, 500);
        yearText.setAttribute('x', coordinate.x+coordinate.width-200);
        yearText.setAttribute('y', coordinate.y+coordinate.height);
        nameText.setAttribute('x', coordinate.x);
        nameText.setAttribute('y', coordinate.y);
        setInterval(function(){
            var year = parseInt(document.getElementsByTagName("input")[0].value);
            draw(year);
        }, 10);
        function draw(year){
            yearText.innerHTML = year;
            var list = [];
            coordinate.xRange(range.x.min, range.x.max);
            coordinate.yRange(range.y.min, range.y.max);
            coordinate.zRange(range.z.min, range.z.max);
            coordinate.zScale(rMin, rMax);
            svg.appendChild(coordinate.g);
            for(var i = 0; i < json.length; i++){
                var obj = {x:null, y:null, z:null, region:json[i].region, name:json[i].name};
                for(var j in axes){
                    for(var k = 0; k < json[i][axes[j]].length; k++){
                        if(json[i][axes[j]][k][0] == year){
                            obj[j] = json[i][axes[j]][k][1];
                            break;
                        }
                    }
                }
                if(obj.x&&obj.y&&obj.z)
                    list.push(obj);
            }
            list.sort(function(a, b){ return b.z - a.z; });
            for(var i = 0; i < list.length; i++){
                coordinate.addPoint(list[i]);
            }
            var count = 0;
            for(var i in coordinate.points){
                count++;
            }
        }
    });
}
function preProcess(obj){
    var region = [];
    var range = {};
    for(var i = 0; i < obj.length; i++){
        insert(obj[i].region);
        for(var j = 0; j < obj[i].income.length; j++){
            if(i == 0 && j == 0){
                range.x = {min:obj[i].income[j][1], max:obj[i].income[j][1]};
                range.year = {min:obj[i].income[j][0], max:obj[i].income[j][0]};
            }
            else{
                range.x.min = Math.min(range.x.min, obj[i].income[j][1]);
                range.x.max = Math.max(range.x.max, obj[i].income[j][1]);
                range.year.min = Math.min(range.year.min, obj[i].income[j][0]);
                range.year.max = Math.max(range.year.max, obj[i].income[j][0]);
            }
        }
        for(var j = 0; j < obj[i].lifeExpectancy.length; j++){
            if(i == 0 && j == 0){
                range.y = {min:obj[i].lifeExpectancy[j][1], max:obj[i].lifeExpectancy[j][1]};
            }
            else{
                range.y.min = Math.min(range.y.min, obj[i].lifeExpectancy[j][1]);
                range.y.max = Math.max(range.y.max, obj[i].lifeExpectancy[j][1]);
                range.year.min = Math.min(range.year.min, obj[i].lifeExpectancy[j][0]);
                range.year.max = Math.max(range.year.max, obj[i].lifeExpectancy[j][0]);
            }
        }
        for(var j = 0; j < obj[i].population.length; j++){
            if(i == 0 && j == 0){
                range.z = {min:obj[i].population[j][1], max:obj[i].population[j][1]};
            }
            else{
                range.z.min = Math.min(range.z.min, obj[i].population[j][1]);
                range.z.max = Math.max(range.z.max, obj[i].population[j][1]);
                range.year.min = Math.min(range.year.min, obj[i].population[j][0]);
                range.year.max = Math.max(range.year.max, obj[i].population[j][0]);
            }
        }
    }
    return {region:region, range:range};
    function insert(str){
        for(var i = 0; i < region.length; i++){
            if(region[i] == str)
                return;
        }
        region.push(str);
    }
}
function getColor(){
    var d = Math.floor(Math.random()*3);
    var r = Math.floor(Math.random()*200)+0;
    var g = Math.floor(Math.random()*200)+0;
    var b = Math.floor(Math.random()*200)+0;
    return "rgb("+r+","+g+","+b+")";
}
function genColor(n){
    color = [];
    for(var i = 0; i < n; i++){
        color.push(getColor());
    }
}