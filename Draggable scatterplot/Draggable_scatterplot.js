var Axe = {
    createNew: function(){
        var axe = {};
        var cursorNum = 10;
        axe.cursor = [];
        axe.cursorText = [];
        axe.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        axe.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        axe.g.appendChild(axe.line);
        for(var i = 0; i <= cursorNum; i++){
            axe.cursor.push(document.createElementNS("http://www.w3.org/2000/svg", "line"));
            axe.cursorText.push(document.createElementNS("http://www.w3.org/2000/svg", "text"));
            axe.g.appendChild(axe.cursor[i]);
            axe.g.appendChild(axe.cursorText[i]);
        }
        axe.range = function(min, max){
            axe.min = Math.floor(min);
            axe.max = Math.floor(max)+1;
        };
        axe.setLength = function(len){
            axe.len = len;
        };
        axe.setDirection = function(direction){
            axe.direction = direction%2;
        };
        axe.setPosition = function(x, y){
            axe.x = x;
            axe.y = y;
        }
        axe.setMap = function(map){
            axe.map = map;
        };
        axe.bindData = function(){
            var xArr = [1, 0];
            var yArr = [0, 1];
            var cursorLen = 20;
            axe.line.setAttribute('x1', axe.x);
            axe.line.setAttribute('y1', axe.y);
            axe.line.setAttribute('x2', axe.x+(xArr[axe.direction]*axe.len));
            axe.line.setAttribute('y2', axe.y-(yArr[axe.direction]*axe.len));
            axe.line.setAttribute('stroke', 'black');
            var x1 = parseFloat(axe.line.getAttribute('x1')),
                x2 = parseFloat(axe.line.getAttribute('x2')),
                y1 = parseFloat(axe.line.getAttribute('y1')),
                y2 = parseFloat(axe.line.getAttribute('y2'));
            for(var i = 0; i <= cursorNum; i++){
                var p = i/cursorNum;
                var value = axe.map(axe.min, axe.max, p);
                axe.cursorText[i].innerHTML = Math.floor(value);
                var x = p*(-x1+x2)+x1,
                    y = p*(-y1+y2)+y1;
                axe.cursor[i].setAttribute('x1', x);
                axe.cursor[i].setAttribute('y1', y);
                axe.cursor[i].setAttribute('x2', x+(yArr[axe.direction]*(cursorLen/2)));
                axe.cursor[i].setAttribute('y2', y+(xArr[axe.direction]*(cursorLen/2)));
                axe.cursor[i].setAttribute('stroke', 'black');
                axe.cursorText[i].setAttribute('x', x+(yArr[axe.direction]*cursorLen));
                axe.cursorText[i].setAttribute('y', y+(xArr[axe.direction]*cursorLen));
                axe.cursorText[i].setAttribute('text-anchor', 'middle');
            }
        }
        return axe;
    }
};

var MovePath = {
    createNew: function(obj){
        var path = {};
        path._path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        path.g.appendChild(path._path);
        path.count = 0;
        var dict = {};
        for(var i in axes){
            for(var j = 0; j < obj[axes[i]].length; j++){
                var year = obj[axes[i]][j][0];
                if(!dict[year])
                    dict[year] = {};
                dict[year][i] = obj[axes[i]][j][1];
            }
        }
        path.points = [];
        for(var i in dict){
            var _obj = {'year':i, 'x':dict[i]['x'], 'y':dict[i]['y'], 'z':dict[i]['z']};
            if(_obj.x!=undefined && _obj.y!=undefined){
                path.points.push(_obj);
            }
        }
        path.points.sort(function(a, b){ return parseInt(a.year) - parseInt(b.year); });
        path.setPath = function(coordinate){
            if(path.count == 0){
                var str = 'M';
                for(var i = 0; i < path.points.length; i++){
                    if(i != 0){
                        str+='L';
                    }
                    var p = coordinate.getPosition(path.points[i]);
                    path.points[i].x = p.cx;
                    path.points[i].y = p.cy;
                    str += p.cx + ','+p.cy;
                }
                path._path.setAttribute('d', str);
                path._path.setAttribute('stroke', 'black');
                path._path.setAttribute('fill', 'none');
                path.count++;
            }
        }
        path.findPoint = function(p){
            var minId = 0;
            var min = 0;
            for(var i = 0; i < path.points.length; i++){
                var dx = parseFloat(path.points[i].x) - parseFloat(p.x);
                var dy = parseFloat(path.points[i].y) - parseFloat(p.y);
                var d = Math.sqrt(Math.pow(dx, 2)+ Math.pow(dy, 2));
                //console.log(p.x);
                //console.log({dx:dx, dy:dy});
                if(i == 0){
                    min = d;
                }
                else{
                    if(min > d){
                        min = d;
                        minId = i;
                    }
                }
            }
            return path.points[minId];
        }
        return path;
    }
};

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
        coordinate.g.appendChild(coordinate.rect);
        coordinate.points = {};
        coordinate.paths = {};
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
                    point.style.cursor = 'move';
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
                onmousemove(point, coordinate.points, coordinate.paths);
                onmouseout(point, coordinate.points, coordinate.paths);
                onMouseDown(point, coordinate.points, coordinate.paths);
                return point;
            }
        };
        coordinate.getPosition = function(obj){
            var px = (obj.x - coordinate.xMin) / (coordinate.xMax - coordinate.xMin),
                py = (obj.y - coordinate.yMin) / (coordinate.yMax - coordinate.yMin),
                pz = (obj.z - coordinate.zMin) / (coordinate.zMax - coordinate.zMin);
            var cx = coordinate.x + (coordinate.width * Math.pow(px, 0.3)),
                cy = coordinate.y + (coordinate.height * (1-py)),
                r = coordinate.minSize + ((coordinate.maxSize - coordinate.minSize) * Math.sqrt(pz)); 
            return {'cx':cx, 'cy':cy, 'r':r};           
        };
        return coordinate;
    }
};
var OBJ;
var OBJname;
var mouseX,
    mouseY,
    objX,
    objY;
function onmousemove(point, arr, paths){
    var name = point.getAttribute('name');
    point.onmousemove = function(e){
        if(!dragging){
        var normal = 0.2, highlight = 1;
        for(var i in arr){
            arr[i].setAttribute('fill-opacity', normal);
        }
        point.setAttribute('fill-opacity', highlight);
        paths[name]._path.style.visibility = 'visible';
        nameText.innerHTML = name;
    }
    }
}
function onmouseout(point, arr, paths){
    var name = point.getAttribute('name');
    point.onmouseout = function(){
        if(!dragging){
        var normal = 1;
        //nameText.innerHTML = '';
        for(var i in arr){
            arr[i].setAttribute('fill-opacity', normal);
        }
        if(!dragging || OBJname != point.getAttribute('name'))
            paths[name]._path.style.visibility = 'hidden';
    }
    }
}
function onMouseDown(point, arr, paths){
    point.onmousedown = function(e){
        if(!dragging){
            dragging = true;
            OBJname = point.getAttribute('name');
            OBJ = paths[point.getAttribute('name')];
            objX = parseFloat(point.getAttribute('cx'));
            objY = parseFloat(point.getAttribute('cy'));
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    }
}
document.onmouseup = function(){
    if(dragging)
        OBJ._path.style.visibility = 'hidden';
    dragging = false;
    console.log(dragging);
}
document.onmousemove = function(e){
    if(dragging){
        var cur = {x:e.clientX-mouseX+objX, y:e.clientY-mouseY+objY};
        var p = OBJ.findPoint({x:cur.x, y:cur.y});
        var year = p.year;
        document.getElementsByTagName('input')[0].value = parseInt(year);
    }
}
document.onselectstart = function(){
    return false;
};
var dragging = false;
var axes = {x:'income', y:'lifeExpectancy', z:'population'};
var yearText = document.createElementNS("http://www.w3.org/2000/svg", "text");
var nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
yearText.setAttribute('font-size', 100);
yearText.setAttribute('font-family', 'Arial');
yearText.setAttribute('fill', '#ddd');
nameText.setAttribute('font-size', 100);
nameText.setAttribute('font-family', 'Arial');
nameText.setAttribute('fill', '#ddd');
var coordinate;
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

        coordinate = Coordinate.createNew(50, 200, 900, 500);

        yearText.setAttribute('x', coordinate.x+coordinate.width-200);
        yearText.setAttribute('y', coordinate.y+coordinate.height);
        nameText.setAttribute('x', coordinate.x);
        nameText.setAttribute('y', coordinate.y);

        var xAxe = Axe.createNew();
        xAxe.setMap(xMap);
        xAxe.setPosition(coordinate.x, coordinate.y+coordinate.height);
        xAxe.setLength(coordinate.width);
        xAxe.setDirection(0);
        xAxe.range(range.x.min, range.x.max);
        xAxe.bindData();
        svg.appendChild(xAxe.g);
        var yAxe = Axe.createNew();
        yAxe.setMap(yMap);
        yAxe.setPosition(coordinate.x, coordinate.y+coordinate.height);
        yAxe.setLength(coordinate.height);
        yAxe.setDirection(1);
        yAxe.range(range.y.min, range.y.max);
        yAxe.bindData();
        svg.appendChild(yAxe.g);

        for(var i = 0; i < json.length; i++){
            var obj = json[i];
            var path = MovePath.createNew(obj);
            svg.appendChild(path.g);
            path._path.style.visibility = 'hidden';
            coordinate.paths[obj.name] = path;
        }

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
                var p = coordinate.addPoint(list[i]);
                coordinate.paths[p.getAttribute('name')].setPath(coordinate);
            }
            var count = 0;
            for(var i in coordinate.points){
                count++;
            }
        }
        function xMap(min, max, p){
            return (Math.pow(p, 10/3)*(max - min))+min;
        }
        function yMap(min, max, p){
            return p*(max-min) + min;
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