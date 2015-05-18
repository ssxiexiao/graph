function genLink(a, b){
    var x1 = parseInt(a.getAttribute("cx"))+parseInt(a.getAttribute("r"));
    var x2 = parseInt(b.getAttribute("cx"))-parseInt(b.getAttribute("r"));
    var y1 = parseInt(a.getAttribute("cy"));
    var y2 = parseInt(b.getAttribute("cy"));
    var middle = (x1+x2)/2;
    var d = "M"+x1+" "+y1+"C"+middle+" "+y1+","+middle+" "+y2+","+x2+","+y2;
    return d;
}
function Forward(data){
    var xLen = 200;
    data.oldPosition.x = data.currentPosition.x;
    data.oldPosition.y = data.currentPosition.y;
    if(data.status == "unfold") {
        if (data.children) {
            var len = data.children[0].len / 2 + data.children[data.children.length-1].len / 2;
            len = data.len - len;
            var x = data.newPosition.x;
            var y = data.newPosition.y;
            data.children[0].newPosition.x = x + xLen;
            data.children[0].newPosition.y = y - len / 2;
            for(var i = 1; i < data.children.length; i++){
                x = data.children[i-1].newPosition.x;
                y = data.children[i-1].newPosition.y;
                data.children[i].newPosition.x =  x;
                data.children[i].newPosition.y = y + data.children[i - 1].len / 2 + data.children[i].len / 2;
            }
            for(var i = 0; i < data.children.length; i++){
                Forward(data.children[i]);
            }
        }
    }
    else if(data.status == "fold"){
        Fold(data);
    }
}
function Fold(data){
    if(data.children){
        for(var i = 0; i < data.children.length; i++){
            data.children[i].newPosition.x = data.newPosition.x;
            data.children[i].newPosition.y = data.newPosition.y;
            data.children[i].oldPosition.x = data.children[i].currentPosition.x;
            data.children[i].oldPosition.y = data.children[i].currentPosition.y;
            Fold(data.children[i]);
        }
    }
}
function draw(data, part){
    if(part === 0){
        data.currentPosition.x = data.newPosition.x;
        data.currentPosition.y = data.newPosition.y;
    }
    else{
        data.currentPosition.x = (count/part)*(data.newPosition.x - data.oldPosition.x) + data.oldPosition.x;
        data.currentPosition.y = (count/part)*(data.newPosition.y - data.oldPosition.y) + data.oldPosition.y;
    }
    data.node.setAttribute("cx", data.currentPosition.x);
    data.node.setAttribute("cy", data.currentPosition.y);
    if(data.children){
        for(var i = 0; i < data.children.length; i++){
            draw(data.children[i], part);
        }
        for(var i = 0; i < data.path.length; i++){
            data.path[i].setAttribute("d", genLink(data.node, data.children[i].node));
        }
    }
}
function PreProcess(data){
    var svg = document.getElementsByTagName("svg")[0];
    data.status = "fold";
    var node = document.createElementNS("http://www.w3.org/2000/svg","circle");
    var r = 10;
    node.setAttribute("fill", "red");
    node.setAttribute("r", r);
    data.path = [];
    data.text = document.createElementNS("http://www.w3.org/2000/svg","text");
    data.text.innerHTML = data.name;
    data.oldPosition = {x:0,y:0};
    data.newPosition = {x:0,y:0};
    data.currentPosition = {x:0,y:0};
    if(data.children) {
        data.text.setAttribute("text-anchor", "end");
        node.setAttribute("fill", "blue");
        for(var i = 0; i < data.children.length; i++) {
            PreProcess(data.children[i]);
            data.path.push(document.createElementNS("http://www.w3.org/2000/svg","path"));
            data.path[i].setAttribute("fill", "none");
            data.path[i].setAttribute("stroke", "gray");
            data.path[i].setAttribute("stroke-width", "2");
            svg.appendChild(data.path[i]);
        }
    }
    node.onclick = function(){
        if(data.status == "fold"){
            data.status = "unfold";
        }
        else{
            data.status = "fold";
        }
        Calculate(dataset);
        Forward(dataset);
        var part = 20;
        var period = 10;
        for(var i = 0; i < part; i++){
            setTimeout(function(){
                count++;
                if(count > part){ count = 1; }
                draw(dataset, part);
            }, i*period);
        }
    }
    data.node = node;
    svg.appendChild(data.node);
    //svg.appendChild(data.text);
}
function Calculate(data){
    var minLen = 30;
    if(data.status == "unfold" && data.children){
        var len = 0;
        for(var i = 0; i < data.children.length; i++){
            Calculate(data.children[i]);
            len += data.children[i].len;
            //len += minLen;
        }
        data.len = len;
    }
    else if(data.status == "fold" || !data.children){
        data.len = minLen;
    }
}
var dataset = null;
var count = 0;
window.onload = function(){
    var w = 1600,
        h = 1600;
    var svg = document.getElementsByTagName("svg")[0];
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    d3.json("tree_flare.json", function(json) {
        dataset = json;
        PreProcess(dataset);
        dataset.currentPosition.x = 100;
        dataset.currentPosition.y = h/2;
        dataset.newPosition.x = 100;
        dataset.newPosition.y = h/2;
        Calculate(dataset);
        Forward(dataset);
        draw(dataset, 0);
    })
}