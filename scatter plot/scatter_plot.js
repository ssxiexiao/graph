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
      cell.rect.setAttribute("fill", "none");
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
          circle.setAttribute("fill-opacity", 0.5);
          cell.g.appendChild(circle);
          return circle;
      }
      return cell;
  }
};
window.onload = function(){
    var w = 1000,
        h = 1000;
    var svg = document.getElementsByTagName('svg')[0];
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
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
                var x = k;
                var y = j;
                for(var i = 0; i < csv.length; i++) {
                    cell.addPoint({
                        x: {max: range.max[x], min: range.min[x]},
                        y: {max: range.max[y], min: range.min[y]}
                    }, {x: csv[i][x], y: csv[i][y]}, Node[csv[i]["species"]]);
                }
                svg.appendChild(cell.g);
                countX++;
            }
            countX = 0;
            countY++;
        }
    });
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