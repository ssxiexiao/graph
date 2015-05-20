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
        r += (q[i].y*N(i,k,id,t));
    }
    return r;
}
window.onload = function(){
    var q = [
        {x:0, y:0},
        {x:100, y:100},
        {x:200, y:200},
        {x:300, y:100},
        {x:400, y:0}
    ]
    var list = [];
    for(var i = 0; i <=1; i+=0.01){
        var r = spline(q, i, 3);
        console.log(i + "," + r);
        list.push({x:i*400, y:500-r});
    }
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