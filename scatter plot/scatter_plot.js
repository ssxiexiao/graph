var Node = {
    setosa: "#800",
    versicolor: "#080",
    virginica: "#008",
    createNew: function(obj){
        var node = {};
        node.species = obj['species'];
        node.sepal_width = obj['sepal width'];
        node.sepal_length = obj['sepal length'];
        node.petal_width = obj['petal width'];
        node.petal_length = obj['petal length'];
        return node;
    }
};
var Axe = {
    createNew: function(){
        var axe = {};
        axe.range = function(min, max){
            axe.min = Math.floor(min);
            axe.max = Math.floor(max)+1;
        };
        axe.setPosition = function(p, len, direction){

        };
        axe.getPercent = function(value){
            return (value-axe.min) / (axe.max-axe.min);
        };
        return axe;
    }
};
var Cell = {
  createNew: function(len, x, y){
      var cell = {};
      cell.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      cell.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      cell.g.appendChild(cell.rect);
      cell.rect.setAttribute("width", len);
      cell.rect.setAttribute("height", len);
      cell.rect.setAttribute("x", x);
      cell.rect.setAttribute("y", y);
      cell.rect.setAttribute("stroke", "black");
      cell.rect.setAttribute("fill", "white");
      cell.rect.setAttribute("fill-opacity", 0);
      cell.rect.style.cursor = 'crosshair';
      cell.points = [];
      cell.addPoint = function(range, value, color){
          var r = 3;
          var w = parseFloat(cell.rect.getAttribute("width")),
              h = parseFloat(cell.rect.getAttribute("height"));
          var x = parseFloat(cell.rect.getAttribute("x")),
              y = parseFloat(cell.rect.getAttribute("y"));
          var p1 = (value.x-range.x.min)/(range.x.max-range.x.min),
              p2 = (value.y-range.y.min)/(range.y.max-range.y.min);
          var x1 = p1*w+x,
              y1 = y+(1-p2)*h;
          var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("r", r);
          circle.setAttribute("cx", x1);
          circle.setAttribute("cy", y1);
          circle.setAttribute("fill", color);
          circle.setAttribute("fill-opacity", 0.2);
          cell.g.appendChild(circle);
          cell.points.push(circle);
          return circle;
      }
      return cell;
  }
};
function setOnMouseDown(cell){
    cell.rect.onmousedown = function (){
        console.log(cell);
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
        obj = cell;
        mouseX = parseFloat(e.pageX);
        mouseY = parseFloat(e.pageY);
        rect.style.visibility = "visible";
        rect.setAttribute("x", mouseX);
        rect.setAttribute("y", mouseY);
        rect.setAttribute("width", 0);
        rect.setAttribute("height", 0);
    };
}
var rect;
var dragging;
var obj;
var cells;
window.onload = function(){
    var w = 1000,
        h = 1000;
    var svg = document.getElementsByTagName('svg')[0];
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    dragging = false;
    obj = null;
    cells = [];
    rect.setAttribute('stroke', 'black');
    rect.setAttribute("fill", "none");
    rect.setAttribute("fill-opacity", 0.3);
    svg.appendChild(rect);
    rect.style.visibility = "hidden";
    document.onmouseup = mouseUp;
    document.onmousemove = mouseMove;
    d3.csv("iris.csv", function(csv){
        var len = 130;
        var interval = 150;
        var startX = 100,
            startY = 100;
        var range = getRange(csv);
        var countX = 0,
            countY = 0;
        for(var j in range.max){
            for(var k in range.max){
                var cell = Cell.createNew(len, startX+(interval*countX), startY+(interval*countY));
                cell.g.setAttribute('id', countX+(countY*4));
                setOnMouseDown(cell);
                var x = k;
                var y = j;
                for(var i = 0; i < csv.length; i++) {
                    cell.addPoint({
                        x: {max: range.max[x], min: range.min[x]},
                        y: {max: range.max[y], min: range.min[y]}
                    }, {x: csv[i][x], y: csv[i][y]}, Node[csv[i]["species"]]);
                }
                cells.push(cell);
                svg.appendChild(cell.g);
                countX++;
            }
            countX = 0;
            countY++;
        }
    });
    function mouseMove(e){
        if (!e){
            var e = window.event;
        }
        if(dragging == true){
            var _w, _h,
                objX = parseFloat(obj.rect.getAttribute('x')),
                objY = parseFloat(obj.rect.getAttribute('y')),
                objW = parseFloat(obj.rect.getAttribute('width')),
                objH = parseFloat(obj.rect.getAttribute('height'));
            _h = e.pageY - mouseY;
            _w = e.pageX - mouseX;
            if(_w < 0 && e.pageX < objX){
                _w = objX - mouseX;
            }
            else if(_w > 0 && e.pageX > objX+objW){
                _w = objX+objW-mouseX;
            }
            if(_h < 0 && e.pageY < objY){
                _h = objY - mouseY;
            }
            else if(_h > 0 && e.pageY > objY+objH){
                _h = objY+objH-mouseY;
            }
            if(_w < 0){
                rect.setAttribute('x', _w+mouseX);
            }
            else{
                rect.setAttribute('x', mouseX);
            }
            if(_h < 0){
                rect.setAttribute('y', _h+mouseY);
            }
            else{
                rect.setAttribute('y', mouseY);
            }
            rect.setAttribute('width', Math.abs(_w));
            rect.setAttribute('height', Math.abs(_h));
            var highlight = 1;
            var normal = 0.2;
            var list = [];
            var xMin = parseFloat(rect.getAttribute('x')),
                yMin = parseFloat(rect.getAttribute('y')),
                xMax = xMin+parseFloat(rect.getAttribute('width')),
                yMax = yMin+parseFloat(rect.getAttribute('height'));
            if(obj) {
                for (var i = 0; i < obj.points.length; i++) {
                    var x = parseFloat(obj.points[i].getAttribute('cx')),
                        y = parseFloat(obj.points[i].getAttribute('cy'));
                    if ((x <= xMax) && (x >= xMin) && (y <= yMax) && (y >= yMin)) {
                        list.push(i);
                    }
                }
            }
            for(var i = 0; i < cells.length; i++){
                for(var j = 0; j < cells[i].points.length; j++){
                    cells[i].points[j].setAttribute("fill-opacity", normal);
                }
                for(var j = 0; j < list.length; j++){
                    cells[i].points[list[j]].setAttribute("fill-opacity", highlight);
                }
            }
        }
    }
    function mouseUp(){
        var highlight = 1;
        var normal = 0.2;
        dragging = false;
        var list = [];
        var xMin = parseFloat(rect.getAttribute('x')),
            yMin = parseFloat(rect.getAttribute('y')),
            xMax = xMin+parseFloat(rect.getAttribute('width')),
            yMax = yMin+parseFloat(rect.getAttribute('height'));
        if(obj) {
            for (var i = 0; i < obj.points.length; i++) {
                var x = parseFloat(obj.points[i].getAttribute('cx')),
                    y = parseFloat(obj.points[i].getAttribute('cy'));
                if ((x <= xMax) && (x >= xMin) && (y <= yMax) && (y >= yMin)) {
                    list.push(i);
                }
            }
        }
        for(var i = 0; i < cells.length; i++){
            for(var j = 0; j < cells[i].points.length; j++){
                cells[i].points[j].setAttribute("fill-opacity", normal);
            }
            for(var j = 0; j < list.length; j++){
                cells[i].points[list[j]].setAttribute("fill-opacity", highlight);
            }
        }
        //rect.style.visibility = "hidden";
    }
}
function getRange(data){
    var max = {},
        min = {};
    for(var i = 0; i < data.length; i++){
        for(var j in data[i]){
            if(i == 0 && !isNaN(data[i][j])) {
                max[j] = data[i][j];
                min[j] = data[i][j];
            }
            else if(!isNaN(data[i][j])){
                max[j] = Math.max(max[j], data[i][j]);
                min[j] = Math.min(min[j], data[i][j]);
            }
        }
    }
    return {max:max, min:min};
}