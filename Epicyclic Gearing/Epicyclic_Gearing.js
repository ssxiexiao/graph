var Gearing = {
    a: 10,
    b: 10,
    rr:13,
    createNew: function(x, y, r) {
        var gearing = {};
        gearing.x = x;
        gearing.y = y;
        var u = Math.floor(2*Math.PI*r/Gearing.b);
        if(u % 2 == 1){
            u+=1;
        }
        gearing.r = u*Gearing.b/(2*Math.PI);
        gearing.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        gearing.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gearing.g.appendChild(gearing.path);
        gearing.centerRotate = function(len){
            var angle = Len2Angle(gearing.r, len);
            var p = {x:gearing.x, y:gearing.y};
            gearing.path.setAttribute("transform", "rotate("+angle+","+ p.x+","+ p.y+")");
        };
        gearing.fix = function(){
            gearing.path.setAttribute("transform", "translate(0,0)");
        }
        gearing.rotate = function(len, p){
            var angle = Len2Angle(gearing.r, len);
            gearing.g.setAttribute("transform", "rotate("+angle+","+ p.x+","+ p.y+")");
        };
        gearing.getCenter = function(){
            return {x:gearing.x, y:gearing.y};
        };
        initial();
        return gearing;
        function initial(){
            var p = {x:gearing.x, y:gearing.y-gearing.r};
            var q = {x:gearing.x, y:gearing.y-gearing.r-(Gearing.a/2)};
            var z = {x:gearing.x, y:gearing.y-gearing.r-Gearing.a};
            var center = {x:gearing.x, y:gearing.y};
            var interval = Len2Angle(gearing.r, Gearing.b);
            var d = "M";
            var count = 0;
            for(var i = 0; i < 2*Math.PI; i+=interval){
                var p1 = getNextPosition(p, center, i);
                var p2 = getNextPosition(p, center, i+interval);
                var q1 = getNextPosition(q, center, i);
                var q2 = getNextPosition(q, center, i+interval);
                var z1 = getNextPosition(z, center, i+(interval/4));
                var z2 = getNextPosition(z, center, i+(interval*3/4));
                if(count % 2 == 0){
                    if(i != 0) {
                        d += "L";
                    }
                    d += p1.x + " " + p1.y + "L" + q1.x + " " + q1.y + "L" + z1.x + " " + z1.y + "L" + z2.x + " " + z2.y + "L" + q2.x + " " + q2.y + "L" + p2.x + " " + p2.y;
                }
                else{
                    d += "L"+p1.x+" "+p1.y+"L"+p2.x+" "+p2.y;
                }
                count++;
            }
            d+="ZM";
            var t = {x:gearing.x, y:gearing.y-Gearing.rr};
            for(var i = 0; i <=360; i++){
                var _t = getNextPosition(t, center, (i/360)*(2*Math.PI));
                if(i == 0){
                    d += _t.x+" "+_t.y;
                }
                else{
                    d += "L"+_t.x+" "+_t.y;
                }
            }
            gearing.path.setAttribute("d", d);
            gearing.path.setAttribute("fill", "#9ecae1");
            gearing.path.setAttribute("fill-rule", "evenodd");
            gearing.path.setAttribute("stroke", 'black');
        }
        function getNextPosition(cur, center, angle){
            var r = Math.sqrt(Math.pow(cur.x-center.x, 2)+Math.pow(cur.y-center.y, 2));
            var curAngle = getAngle(cur, center);
            var newAngle = curAngle - angle;
            var dx = r * Math.cos(newAngle);
            var dy = r * Math.sin(newAngle);
            return {x:center.x + dx, y:center.y - dy};
        }
        function Len2Angle(r, len){
            return len/r;
        }
        function getAngle(cur, center){
            var curAngle = Math.atan2(-cur.y + center.y, cur.x - center.x);
            return curAngle;
        }
    }
};
window.onload = function() {
    var w = 1000;
    var h = 1000;
    var svg = document.getElementsByTagName("svg")[0];
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    var r1 = 80,
        r2 = 100;
    var x = 400,
        y = 300,
        padding = (r1+r2+Gearing.a);
    var gearing = Gearing.createNew(x, y, r1);
    var gearing1 = Gearing.createNew(x-padding, y-Gearing.a, r2);
    var gearing2 = Gearing.createNew(x+padding, y-Gearing.a, r2);
    var gearing3 = Gearing.createNew(x+Gearing.a, y+padding, r2);
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.appendChild(gearing.g);
    g.appendChild(gearing1.g);
    g.appendChild(gearing2.g);
    g.appendChild(gearing3.g);
    svg.appendChild(g);
    var len = 0;
    var mode = 1;
    if(mode == 0) {
        setInterval(function () {
            g.setAttribute("transform", "rotate(" + (len / (r1+r2)) + "," + gearing.getCenter().x + "," + gearing.getCenter().y + ")");
            gearing.centerRotate(len);
            gearing1.centerRotate(-len);
            gearing2.centerRotate(-len);
            gearing3.centerRotate(-len);
            len += 30;
        }, 10);
    }
    else if(mode == 1){
        setInterval(function () {
            gearing.centerRotate(len);
            gearing1.centerRotate(-len);
            gearing2.centerRotate(-len);
            gearing3.centerRotate(-len);
            len += 20;
        }, 10);
    }
    else if(mode == 2){
        setInterval(function () {
            g.setAttribute("transform", "rotate(" + (len / (r1+r2)) + "," + gearing.getCenter().x + "," + gearing.getCenter().y + ")");
            gearing.centerRotate((-len / (r1+r2))*gearing.r);
            gearing1.centerRotate((len / (r1+r2))*gearing.r);
            gearing2.centerRotate((len / (r1+r2))*gearing.r);
            gearing3.centerRotate((len / (r1+r2))*gearing.r);
            len += 100;
        }, 10);
    }
}