d3.csv("debt.csv", function(csv){
    function getCountry(){
        var country = [];
        for(var i = 0; i < csv.length; i++){
            insert(csv[i].creditor);
            insert(csv[i].debtor);
        }
        function insert(str){
            for(var i = 0; i < country.length; i++){
                if(country[i] === str){
                    return;
                }
            }
            country.push(str);
        }
        return country;
    }
    function getCreditor(){
        var country = getCountry();
        var creditor = [];
        for(var i = 0; i < country.length; i++){
            creditor.push({name:country[i], list:[], size:0});
        }
        for(var i = 0; i < csv.length; i++){
            insert(csv[i]);
        }
        creditor.sort(function(a, b){ return b.size - a.size; });
        for(var i = 0; i < creditor.length; i++){
            creditor[i].list.sort(function(a, b){ return parseFloat(b.amount)- parseFloat(a.amount); });
        }
        return creditor;
        function insert(l){
            for(var i = 0; i < creditor.length; i++){
                if(creditor[i].name === l.creditor){
                    creditor[i].list.push(l);
                    creditor[i].size += parseFloat(l.amount);
                }
            }
        }
    }
    function getDebtor(){
        var country = getCountry();
        var creditor = [];
        var newCsv = csv.concat();
        for(var i = 0; i < newCsv.length; i++){
            var j = newCsv[i].creditor;
            newCsv[i].creditor = newCsv[i].debtor;
            newCsv[i].debtor = j;
        }
        for(var i = 0; i < country.length; i++){
            creditor.push({name:country[i], list:[], size:0});
        }
        for(var i = 0; i < newCsv.length; i++){
            insert(newCsv[i]);
        }
        creditor.sort(function(a, b){ return b.size - a.size; });
        for(var i = 0; i < creditor.length; i++){
            creditor[i].list.sort(function(a, b){ return parseFloat(b.amount)- parseFloat(a.amount); });
        }
        return creditor;
        function insert(l){
            for(var i = 0; i < creditor.length; i++){
                if(creditor[i].name === l.creditor){
                    creditor[i].list.push(l);
                    creditor[i].size += parseFloat(l.amount);
                }
            }
        }
    }
    function getDict(arr){
        var dict = {};
        for(var i = 0; i < arr.length; i++){
            dict[arr[i].name] = i;
        }
        return dict;
    }
    function getNextPosition(cur, angle){
        var r = Math.sqrt(Math.pow(cur.x-center.x, 2)+Math.pow(cur.y-center.y, 2));
        var curAngle = Math.atan2(-cur.y + center.y, cur.x - center.x);
        var newAngle = curAngle - angle;
        var dx = r * Math.cos(newAngle);
        var dy = r * Math.sin(newAngle);
        return {x:center.x + dx, y:center.y - dy};
    }
    function drawArea(path, p1, p2, p3, p4, angle, text){
        var d = "M"+p1.x+" "+p1.y+"A"+r1+" "+r1+" "+0+" "+0+" "+1+" "+p2.x+" "+p2.y+"L"+p4.x+" "+p4.y+"A"+r2+" "+r2+" "+0+" "+0+" "+0+" "+p3.x+" "+p3.y+"L"+p1.x+" "+p1.y;
        path.setAttribute("d", d);
        path.setAttribute("fill", "orange");
        path.setAttribute("stroke", "black");
        path.setAttribute("fill-opacity", 0.4);

        var pIn = getNextPosition(p1, angle/2);
        var pOut = getNextPosition(p3, angle/2);
        var pMiddle = {x:(pIn.x+pOut.x)/2, y:(pIn.y+pOut.y)/2};
        text.setAttribute("x", pMiddle.x);
        text.setAttribute("y", pMiddle.y);
    }
    function drawArea1(path, p1, p2, p4, angle){
        var d ="M"+p1.x+" "+p1.y+"A"+r1+" "+r1+" "+0+" "+0+" "+1+" "+p2.x+" "+p2.y;
        var interval = (1/180)*Math.PI;
        var p3 = getNextPosition(p4, -interval);
        d += " Q" + center.x + "," + center.y + " " + p3.x + "," + p3.y;
        d += "L"+p4.x+" "+p4.y;
        d += " Q" + center.x + "," + center.y + " " + p1.x + "," + p1.y;
        path.setAttribute("d", d);
        path.setAttribute("fill-opacity", 0.75);
        path.setAttribute("stroke-width", 0.75);
    }
    var w = 800;
    var h = 800;
    var r1 = 300;
    var r2 = 350;
    var flag = false;
    var center = {x:w/2, y:h/2};
    if(flag) {
        var creditor = getCreditor();
    }
    else {
        var creditor = getDebtor();
    }
    var dict = getDict(creditor);
    var padding = (80/180)*Math.PI;
    var minAngle = (2/180)*Math.PI;
    var totalAngle = 2*Math.PI;
    var interval = padding / creditor.length;
    var p1 = {x:center.x, y:center.y-r1};
    var p3 = {x:center.x, y:center.y-r2};
    var svg = document.getElementsByTagName("svg")[0];
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    var size = 0;
    for(var i = 0; i < creditor.length; i++){
        size += creditor[i].size;
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.innerHTML = creditor[i].name;
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("font-family", "Arial");
        creditor[i].text = text;
        svg.appendChild(text);
    }
    for(var i = 0; i < creditor.length; i++){
        var addingAngle = minAngle + (creditor[i].size / size) * (totalAngle - padding - minAngle*creditor.length);
        var p2 = getNextPosition(p1, addingAngle);
        var p4 = getNextPosition(p3, addingAngle);
        var _path = document.createElementNS("http://www.w3.org/2000/svg","path");
        _path.setAttribute("id", i);
        function onMouseOver(e){
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
            var i = parseInt(targ.getAttribute("id"));
            for(var j = 0; j < creditor.length; j++){
                if(j !=i) {
                    for (var k = 0; k < creditor[j].path.length; k++) {
                        creditor[j].path[k].setAttribute("style", "visibility:hidden");
                    }
                }
            }
        }
        function onMouseOut(){
            for(var j = 0; j < creditor.length; j++){
                for(var k = 0; k < creditor[j].path.length; k++){
                    creditor[j].path[k].setAttribute("style", "visibility:visible");
                }
            }
        }
        _path.onmouseover = onMouseOver;
        _path.onmouseout = onMouseOut;
        drawArea(_path, p1, p2, p3, p4, addingAngle, creditor[i].text);
        svg.appendChild(_path);
        creditor[i].totalPath = _path;
        creditor[i].totalArea = {p1:p1, p2:p2, p3:p3, p4:p4};
        creditor[i].totalAngle = addingAngle;
        creditor[i].path = [];
        p1 = getNextPosition(p1, addingAngle+interval);
        p3 = getNextPosition(p3, addingAngle+interval);
    }
    for(var i = 0; i < creditor.length; i++){
        for(var j = 0; j < creditor[i].list.length; j++){
            creditor[i].path.push(document.createElementNS("http://www.w3.org/2000/svg","path"));
            var angle = (creditor[i].list[j].amount / creditor[i].size) * creditor[i].totalAngle;
            if(j == 0){
                var _p1 = creditor[i].totalArea.p1;
            }
            var _p2 = getNextPosition(_p1, angle);
            var endPoint = creditor[dict[creditor[i].list[j].debtor]].totalArea.p2;
            drawArea1(creditor[i].path[j], _p1, _p2, endPoint, angle);
            if(creditor[i].list[j].risk === "0"){
                creditor[i].path[j].setAttribute("fill", "rgb(219,112,77)");
            }
            else if(creditor[i].list[j].risk === "1"){
                creditor[i].path[j].setAttribute("fill", "rgb(210,208,198)");
            }
            else if(creditor[i].list[j].risk === "2"){
                creditor[i].path[j].setAttribute("fill", "rgb(200,240,201)");
            }
            else if(creditor[i].list[j].risk === "3"){
                creditor[i].path[j].setAttribute("fill", "rgb(248,237,211)");
            }
            svg.appendChild(creditor[i].path[j]);
            _p1 = getNextPosition(_p1, angle);
        }
    }
});