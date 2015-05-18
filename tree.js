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
    var yLen = 30;
    data.oldPosition.x = data.currentPosition.x;
    data.oldPosition.y = data.currentPosition.y;
    if(data.status == "unfold") {
        if (data.children) {
            data.children[0].newPosition.x = data.newPosition.x + xLen;
            data.children[0].newPosition.y = data.newPosition.y - yLen*(data.children.length-1)/2;
            for(var i = 1; i < data.children.length; i++){
                data.children[i].newPosition.x = data.newPosition.x + xLen;
                data.children[i].newPosition.y = data.children[i-1].newPosition.y + yLen;
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
function BackForWard(data){
    var minLen = 30;
    var id = GetLayerNum(data);
    for(var i = id; i > 1; i--){
        var layer = GetLayer(data, i);
        for(var j = 1; j < layer.length; j++){
            if(layer[j].data.newPosition.y < layer[j-1].data.newPosition.y + minLen){
                var dy = layer[j-1].data.newPosition.y + minLen - layer[j].data.newPosition.y;
                shift(layer[j].data, dy);
            }
            var head = layer[j].parent.children[0].newPosition,
                end = layer[j].parent.children[layer[j].parent.children.length-1].newPosition;
            layer[j].parent.newPosition.y = (head.y+end.y)/2;
        }
    }
}
function End(data){
    if(data.status == "unfold") {
        if (data.children) {
            for(var i = 0; i < data.children.length; i++){
                End(data.children[i]);
            }
        }
    }
    else if(data.status == "fold"){
        Fold(data);
    }
}
function shift(data, len){
    data.newPosition.y += len;
    if(data.children){
        for(var i = 0; i < data.children.length; i++){
            shift(data.children[i], len);
        }
    }
}
function GetLayerNum(data){
    var i = 1;
    while(GetLayer(data, i).length){
        i++;
    }
    return i-1;
}
function GetLayer(data, id){
    var layer = [];
    var queue = [];
    var count = 0;
    queue.push({id:1, data:data});
    while(queue.length){
        var q = queue.shift();
        if(q.id == id){
            layer.push({data:q.data, parent: q.parent, num: q.num});
        }
        if(q.id > id){
            break;
        }
        if(q.data.status =="unfold" && q.data.children){
            for(var i = 0; i < q.data.children.length; i++){
                queue.push({id: q.id+1, data: q.data.children[i], parent: q.data, num: i});
            }
        }
    }
    return layer;
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
        data.oldPosition.x = data.currentPosition.x;
        data.oldPosition.y = data.currentPosition.y;
    }
    else{
        data.currentPosition.x = (count/part)*(data.newPosition.x - data.oldPosition.x) + data.oldPosition.x;
        data.currentPosition.y = (count/part)*(data.newPosition.y - data.oldPosition.y) + data.oldPosition.y;
        if(count == part){
            data.oldPosition.x = data.currentPosition.x;
            data.oldPosition.y = data.currentPosition.y;
        }
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
            Forward(data);
        }
        else{
            data.status = "fold";
            Forward(dataset);
        }
        BackForWard(dataset);
        End(dataset);
        var dy = dataset.oldPosition.y - dataset.newPosition.y;
        shift(dataset, dy);
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
var dataset = null;
var count = 0;
window.onload = function(){
    var w = 1600,
        h = 3000;
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
        Forward(dataset);
        BackForWard(dataset);
        End(dataset);
        draw(dataset, 0);
    })
}