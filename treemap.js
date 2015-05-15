function squarify(rect, children, row, w){
    if(children.length == 0) { return; }
    var head = children[0];
    var _row = row.slice(0);
    _row.push(head);
    if(worst(row, w) <=worst(_row, w)){
        children.shift();
        squarify(children, _row, w);
    }
    else{
        layoutRow(rect, row);
        squarify(children, [], width(rect));
    }
}
function worst(R, w){
    var rMax = -999999;
    var rMin = 999999;
    var sum = 0;
    for(var i = 0; i < R.length; i++){
        if(rMax < R[i].area) { rMax = R[i].area; }
        if(rMin > R[i].area) { rMin = R[i].area; }
        sum += R[i].area;
    }
    sum = Math.pow(sum,2);
    w = Math.pow(w,2);
    return Math.max(w*rMax/sum, s/(w*rMin));
}
function layoutRow(rect, row){
    var width = rect.style.width;
    var height = rect.style.height;
    if(width < height){
        for(var i = 0; i < row.length; i++){

        }
    }
}
function width(rect){
    var width = rect.style.width;
    var height = rect.style.height;
    return Math.min(width, height);
}
function preProcess(data, area){
    for(var i = 0; i < data.length; i++){
        data[i].area = area * data[i].value;
        preProcess(data.children, data[i].area);
    }
}
