var Axe = {
    createNew: function(min, max, name) {
        var axe = {};
        axe.min = min.toFixed(2);
        axe.max = max.toFixed(2);
        axe.name = name;
        axe.line = document.createElementNS("http://www.w3.org/2000/svg","line");
        axe.line.setAttribute("stroke", "black");
        axe.text = document.createElementNS("http://www.w3.org/2000/svg","text");
        axe.text.innerHTML = axe.name;
        axe.text.setAttribute("text-anchor", "middle");
        axe.text.setAttribute("dominant-baseline", "end");
        axe.text.setAttribute("font-size", 12);
        axe.point = [];
        axe.x1 = 0;
        axe.x2 = 0;
        axe.y1 = 0;
        axe.y2 = 0;
        axe.display = function() {
            var padding = 10;
            axe.line.setAttribute("x1", axe.x1);
            axe.line.setAttribute("x2", axe.x2);
            axe.line.setAttribute("y1", axe.y1);
            axe.line.setAttribute("y2", axe.y2);
            axe.text.setAttribute("x", axe.x2);
            axe.text.setAttribute("y", axe.y2 - padding);
            scale(axe);
        };
        axe.setAttribute = function(name, value) {
            axe[name] = value;
        };
        axe.addToSvg = function(svg) {
            svg.appendChild(axe.line);
            svg.appendChild(axe.text);
            for(var i = 0; i < axe.point.length; i++)
                svg.appendChild(axe.point[i]);
        };
        axe.getValue = function(value) {
            value = parseFloat(value);
            var Len = parseFloat(axe.max) - parseFloat(axe.min);
            var q = (value-parseFloat(axe.min))/Len;
            return parseFloat(axe.y1) - (parseFloat(axe.y1) - parseFloat(axe.y2))*q;
        };
        return axe;
        function scale(axe) {
            for(var i = 0; i < axe.point.length; i++){
                var parent = axe.point[i].parentNode;
                if(parent != NULL){
                    parent.removeChild(axe.point[i]);
                }
            }
            while(axe.point.length > 0){
                axe.point.pop();
            }
            var Len = parseFloat(axe.max) - parseFloat(axe.min);
            var threshold = 10;
            var padding = 10;
            var interval = Len / threshold;
            if (interval > 1) {
                interval = Math.round(interval);
            }
            else {
                interval = parseFloat(interval.toFixed(2));
            }
            var start = parseFloat(axe.min);
            while (start < parseFloat(axe.max)) {
                var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("text-anchor", "end");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("font-size", 12);
                text.innerHTML = start +" -";
                var y = axe.getValue(start);
                text.setAttribute("x", axe.x1);
                text.setAttribute("y", y);
                axe.point.push(text);
                start += interval;
                start = parseFloat(start.toFixed(2));
            }
        }
    }
};
function dataProcess(data){
    console.log(data);
    var max = {};
    var min = {};
    for(var i in data[0]){
        max[i] = -9999;
        min[i] = 0;
    }
    for(var i = 0; i < data.length; i++){
        for(var j in data[i]){
            if(data[i][j] != null && !isNaN(data[i][j])) {
                max[j] = Math.max(max[j], data[i][j]);
                min[j] = Math.min(min[j], data[i][j]);
            }
        }
    }
    console.log(max);
    console.log(min);
    var count = 0;
    var interval = 100;
    var yStart = 400;
    var yEnd = 100;
    var x = 50;
    var w = 1600,
        h = 1000;
    var axes = {};
    var svg = document.getElementsByTagName("svg")[0];
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    for(var i in max){
        if(max[i] != -9999) {
            var axe = Axe.createNew(min[i], max[i], i);
            axe.setAttribute("x1", x+(interval*count));
            axe.setAttribute("x2", x+(interval*count));
            axe.setAttribute("y1", yStart);
            axe.setAttribute("y2", yEnd);
            axes[i] = axe;
            count++;
        }
    }
    for(var i = 0; i < data.length; i++){
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        var arr = [];
        for(var j in data[i]){
            if(max[j] != -9999){
                if(data[i][j] != null)
                    arr.push({x:axes[j].x1, y:axes[j].getValue(data[i][j])});
                else
                    arr.push({x:axes[j].x1, y:axes[j].getValue(0)});
            }
        }
        var d = "M";
        for(var j = 0; j < arr.length; j++){
            if(j != arr.length - 1){
                var mx = (arr[j].x + arr[j+1].x) / 2;
                var my = (arr[j].y + arr[j+1].y) / 2;
                d += arr[j].x + " " + arr[j].y + "L";
            }
            else{
                d += arr[j].x + " " + arr[j].y;
            }
        }
        //var d = drawLine(arr);
        path.setAttribute("d", d);
        path.setAttribute("stroke", getColor());
        path.setAttribute("stroke-width", 1.5);
        path.setAttribute("stroke-opacity", 0.4);
        path.setAttribute("fill", "none");
        svg.appendChild(path);
    }
    for(var i in axes){
        axes[i].display();
        axes[i].addToSvg(svg);
    }
}
function getColor(){
    var r = Math.floor(Math.random()*155)+100;
    var g = Math.floor(Math.random()*155)+100;
    var b = Math.floor(Math.random()*155)+100;
    return "rgb("+r+","+g+","+b+")";
}
function drawLine(q){
    var qx = [];
    var qy = [];
    var list = [];
    for(var i = 0; i < q.length; i++){
        qx[i] = q[i].x;
        qy[i] = q[i].y;
    }
    for(var i = 0; i <=1; i+=0.005){
        var x = spline(qx, i, 3);
        var y = spline(qy, i, 3);
        list.push({x:x, y:y});
    }
    var x = spline(qx, 1, 3);
    var y = spline(qy, 1, 3);
    list.push({x:x, y:y});
    var str = "M";
    for(var i = 0 ; i < list.length; i++){
        if(i == 0){
            str += list[i].x + "," + list[i].y;
        }
        else{
            str += "L" + list[i].x + "," + list[i].y;
        }
    }
    return str;
    function N(i, k, id, t){
        if(k == 1){
            if(id <=t[i+1] && id >=t[i]){
                return 1;
            }
            else{
                return 0;
            }
        }
        else{
            var a = (id - t[i])*N(i,k-1,id,t);
            var b = (t[i+k-1]-t[i]);
            var c = (t[i+k] - id)*N(i+1,k-1,id,t);
            var d = (t[i+k]-t[i+1]);
            if(b == 0){
                b = 1;
            }
            if(d == 0){
                d = 1;
            }
            return (a/b) + (c/d);
        }
    }
    function genT(k, n){
        var t = [];
        for(var i = 0; i <=n+k; i++){
            if(i < k){
                t.push(0);
            }
            else if(i >=k && i <=n){
                t.push(i-k+1);
            }
            else{
                t.push(n-k+2);
            }
        }
        var len = t[t.length-1] - t[0];
        if(len != 0){
            for(var i = 0; i < t.length; i++){
                t[i] /= len;
            }
        }
        return t;
    }
    function spline(q, id, k){
        var n = q.length - 1;
        var t = genT(k, n);
        var r = 0;
        for(var i = 0; i <=n; i++){
            //console.log(N(i,k,id,t));
            r += (q[i]*N(i,k,id,t));
        }
        //console.log("----------");
        return r;
    }
}
window.onload = function() {
    dataProcess(foods);
}