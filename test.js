function N(i, k, x, t){
    if(k == 1){
        if(x <t[i+1] && x >=t[i]){
            return 1;
        }
        else{
            return 0;
        }
    }
    else{
        var a = (x - t[i])*N(i,k-1,x,t);
        var b = (t[i+k-1]-t[i]);
        var c = (t[i+k] - x)*N(i+1,k-1,x,t);
        var d = (t[i+k]-t[i+1]);
        if(b === 0){
            b = 1;
        }
        if(d === 0){
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
        r += (q[i]*N(i,k,id,t));
    }
    return r;
}
function fix(arr){
    var n = arr.length;
    for(var i = 0; i < n; i++){
        arr[i].x = (beta*arr[i].x)+(1-beta)*(arr[0].x+(i/(n-1))*(arr[n-1].x-arr[0].x));
        arr[i].y = (beta*arr[i].y)+(1-beta)*(arr[0].y+(i/(n-1))*(arr[n-1].y-arr[0].y));
    }
}
function getX(q, ratio){
    var xList = [];
    var list = [];
    var len = 0;
    xList.push(q[0].x);
    for(var i = 1; i < q.length; i++){
        if(q[i].x != xList[xList.length-1]){
            list.push(Math.abs(q[i].x - xList[xList.length - 1]));
            xList.push(q[i].x);
        }
    }
    for(var i = 0; i < list.length; i++){
        if(((i+1)/list.length) >=ratio){
            break;
        }
    }
    ratio = (ratio - (i/list.length)) / (1/list.length);
    //console.log(xList);
    return xList[i] + (xList[i+1] - xList[i])*ratio;
}
var beta = 0.8;
window.onload = function(){
    var q = [
        {x:0, y:100},
        {x:100, y:200},
        {x:200, y:100},
        {x:300, y:150},
        {x:400, y:100},
        {x:300, y:0}
    ];
    var qx = [
            0,100,200,300,400,300
        ],
        qy = [
            100,200,100,150,100,0
        ]
    fix(q);
    var list = [];
    for(var i = 0; i <=1; i+=0.01){
        var x = spline(qx, i, 3);
        var y = spline(qy, i, 3);
        list.push({x:x, y:y});
    }
    var x = spline(qx, 1, 3);
    var y = spline(qy, 1, 3);
    list.push({x:x, y:y});
    var path = document.getElementsByTagName("path")[0];
    var str = "M";
    for(var i = 0 ; i < list.length; i++){
        if(i == 0){
            str += list[i].x + "," + list[i].y;
        }
        else{
            str += "L" + list[i].x + "," + list[i].y;
        }
    }
    path.setAttribute("d",str);
}