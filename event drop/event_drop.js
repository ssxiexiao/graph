var data = [
    { name: "http requests", dates: [] },
    { name: "SQL queries", dates: [] },
    { name: "cache invalidations", dates: [] }
];
var endTime = Date.now();
var month = 30 * 24 * 60 * 60 * 1000;
var startTime = endTime - 6 * month;
var maxNum = 200;
for(var i = 0; i < data.length; i++){
	var max = Math.floor(Math.random() * maxNum)+1;
        for (var j = 0; j < max; j++) {
            var time = (Math.random() * (endTime - startTime)) + startTime;
            data[i].dates.push(new Date(time));
        }
}
var Scale = {
    createNew: function(){
        var scale = {};
        scale.range = function(min, max){
            scale.yMin = min;
            scale.yMax = max;
            return scale;
        };
        scale.domain = function(min, max){
            scale.xMin = min;
            scale.xMax = max;
            return scale;
        }
        scale.scale = function(value){
            var p = (value-scale.xMin)/(scale.xMax - scale.xMin);
            return p*(scale.yMax-scale.yMin) + scale.yMin;
        }
        return scale;
    }
};
var Series = {
    count: 0,
    scalebility: 1.2,
    arr: [],
    createNew: function(){
        var series = {};
        series.y = 1;
        series.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        var _data = [];
        var _fullData = [];
        var _scale;
        series.setScale = function(scale){
            _scale = scale;
            return series;
        }
        series.data = function(data){
            _fullData = data;
            return series;
        }
        series.setAttribute = function(name, value){
            if(series[name])
                series[name] = value;
            return series;
        }
        series.bindData = function(){
            var r = 5;
            while(series.g.childNodes.length){
                series.g.removeChild(series.g.childNodes[0]);
            }
            var color = getColor();
            for(var i = 0; i < _data.length; i++){
                var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                var time = _fullData[_data[i]].value;
                circle.setAttribute('fill', color);
                circle.setAttribute('cx', _scale.scale(time));
                circle.setAttribute('cy', series.y);
                circle.setAttribute('r', r);
                onClick(Series, circle, time);
                series.g.appendChild(circle);
            }
            return series;
        }
        series.filter = function(func, value){
            _data = [];
            var count;
            for(var i = 0; i < _fullData.length; i++){
                count = 0;
                var date = new Date(_fullData[i].value);
                for(var j = 0; j < func.length; j++){
                    if(date[func[j]]() != value[j]){
                        count++;
                        break;
                    }
                }
                if(!count){
                    _data.push(i);
                }
            }
            return series;
        }
        Series.arr.push(series);
        return series;
    }
};
function onClick(Series, circle, time){
    circle.onclick = function(){
        Series.count++;
        Series.count%=4;
        console.log(Series.count);
        var date = new Date(time);
        if(Series.count == 0){
            var func = [];
        }
        else if(Series.count == 1){
            var func = ['getFullYear'];
        }
        else if(Series.count == 2){
            var func = ['getFullYear','getMonth'];
        }
        else{
            var func = ['getFullYear','getMonth','getDay'];
        }
        var value = [];
        for(var i = 0; i < func.length; i++){
            value.push(date[func[i]]());
        }
        for(var i = 0; i < Series.arr.length; i++){
            var series = Series.arr[i];
            series.filter(func, value).bindData();
        }
    }
}
window.onload = function(){
	var w = 1000,
		h = 1000;
	var svg = document.getElementsByTagName('svg')[0];
	svg.setAttribute('width', w);
	svg.setAttribute('height', h);
    var x = 150,
        y = 100;
    var len = 600;
    var interval = 50;
    var _range = getRange(data);
    for(var i = 0; i < data.length; i++){
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.innerHTML = data[i].name;
        text.setAttribute('x', x);
        text.setAttribute('y', y+i*interval);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('font-family', 'Arial');
        svg.appendChild(text);
        var _data = [];
        for(var j = 0; j < data[i].dates.length; j++){
            _data.push({value:data[i].dates[j].getTime()});
        }
        var scale = Scale.createNew().domain(_range.min, _range.max).range(x+10, x+10+len);
        console.log(scale);
        var series = Series.createNew().data(_data).setScale(scale).setAttribute('y', y+i*interval).filter([]).bindData();
        series.g.style.cursor = 'pointer';
        svg.appendChild(series.g);
    }
}
function getRange(data){
    var range = {};
    for(var i = 0; i < data.length; i++){
        for(var j = 0; j < data[i].dates.length; j++){
            if(i == 0 && j == 0){
                range.min = data[i].dates[j].getTime();
                range.max = data[i].dates[j].getTime();
            }
            else{
                range.min = Math.min(range.min, data[i].dates[j].getTime());
                range.max = Math.max(range.max, data[i].dates[j].getTime());
            }
        }
    }
    return range;
}
function getColor(){
    var d = Math.floor(Math.random()*3);
    var r = Math.floor(Math.random()*200)+0;
    var g = Math.floor(Math.random()*200)+0;
    var b = Math.floor(Math.random()*200)+0;
    return "rgb("+r+","+g+","+b+")";
}