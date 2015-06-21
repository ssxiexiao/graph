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
        };
        scale.scale = function(value){
            var p = (value-scale.xMin)/(scale.xMax - scale.xMin);
            return (p*(scale.yMax-scale.yMin)) + scale.yMin;
        };
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
        series.color = getColor();
        var _data = [];
        var _fullData = [];
        var _scale;
        series.setScale = function(scale){
            _scale = scale;
            return series;
        }
        series.resetScaleDomain = function(min, max){
            _scale.domain(min, max);
            return series;
        }
        series.data = function(data){
            _fullData = data;
            var r = 5;
            while(series.g.childNodes.length){
                series.g.removeChild(series.g.childNodes[0]);
            }
            var color = getColor();
            for(var i = 0; i < _fullData.length; i++){
                var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute('fill', series.color);
                circle.setAttribute('r', r);
                series.g.appendChild(circle);
            }
            return series;
        }
        series.setAttribute = function(name, value){
            if(series[name])
                series[name] = value;
            return series;
        }
        series.bindData = function(mode){
            if(mode){
                var startPosition = [], endPosition = [];
                for(var i = 0; i < _fullData.length; i++){
                    var circle = series.g.getElementsByTagName('circle')[i];
                    var x = parseFloat(circle.getAttribute('cx')),
                        y = parseFloat(circle.getAttribute('cy'));
                    var time = _fullData[i].value;
                    startPosition.push({x:x, y:y});
                    if(time < _scale.xMin){
                        endPosition.push({x:_scale.yMin, y:y})
                    }
                    else if(time > _scale.xMax){
                        endPosition.push({x:_scale.yMax, y:y});
                    }
                    else{
                        endPosition.push({x:_scale.scale(time), y:y});
                    }
                }
                series.animate(series.g.getElementsByTagName('circle'), startPosition, endPosition);
            }
            for(var i = 0; i < _fullData.length; i++){
                var circle = series.g.getElementsByTagName('circle')[i];
                circle.style.visibility = 'hidden';
            }
            for(var i = 0; i < _data.length; i++){
                var circle = series.g.getElementsByTagName('circle')[_data[i]];
                circle.style.visibility = 'visible';
                var time = _fullData[_data[i]].value;
                circle.setAttribute('cy', series.y);
                circle.setAttribute('cx', _scale.scale(time));
                onClick(Series, circle, time);
            }
            return series;
        }
        series.animate = function(objArr, startPosition, endPosition){
            var period = 500;
            var interval = 10;
            console.log(objArr);
            for(var i = 0; i <= period; i+= interval){
                for(var j = 0; j < objArr.length; j++){
                    var obj = objArr[j];
                    var x = (endPosition[j].x-startPosition[j].x)*(i/period) + startPosition[j].x,
                        y = (endPosition[j].y-startPosition[j].y)*(i/period) + startPosition[j].y;
                    _setTimeOut(i, obj, x, y);
                }
            }
            function _setTimeOut(i, obj, x, y){
                setTimeout(function(){
                    obj.setAttribute('cx', x);
                    obj.setAttribute('cy', y);
                }, i);
            }
        };
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
                if(count == 0){
                    _data.push(i);
                }
            }
            return series;
        }
        series.getMax = function(){
            if(_data.length){
                var max = _fullData[_data[0]].value;
                for(var i = 1; i < _data.length; i++){
                    max = Math.max(_fullData[_data[i]].value, max);
                }
                return max;
            }
            return null;
        };
        series.getMin = function(){
            if(_data.length){
                var min = _fullData[_data[0]].value;
                for(var i = 1; i < _data.length; i++){
                    min = Math.min(_fullData[_data[i]].value, min);
                }
                return min;
            }
            return null;
        };
        Series.arr.push(series);
        return series;
    }
};
function onClick(Series, circle, time){
    circle.onclick = function(){
        Series.count++;
        Series.count%=4;
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
            series.filter(func, value);
            if(i == 0){
                var max = series.getMax();
                var min = series.getMin();
            }
            else{
                max = Math.max(series.getMax(), max);
                min = Math.min(series.getMin(), min);
            }
        }
        for(var i = 0; i < Series.arr.length; i++){
            var series = Series.arr[i];
            series.resetScaleDomain(min, max).bindData(1);
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