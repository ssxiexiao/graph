var data = [
    { name: "http requests", dates: [] },
    { name: "SQL queries", dates: [] },
    { name: "cache invalidations", dates: [] }
];
var endTime = Date.now();
var month = 30 * 24 * 60 * 60 * 1000;
var startTime = endTime - 6 * month;
for(var i = 0; i < data.length; i++){
	var max = Math.floor(Math.random() * 200)+1;
        for (var j = 0; j < max; j++) {
            var time = (Math.random() * (endTime - startTime)) + startTime;
            data[i].dates.push(new Date(time));
        }
}
window.onload = function(){
	var w = 1000,
		h = 1000;
}
function getColor(){
    var d = Math.floor(Math.random()*3);
    var r = Math.floor(Math.random()*200)+0;
    var g = Math.floor(Math.random()*200)+0;
    var b = Math.floor(Math.random()*200)+0;
    return "rgb("+r+","+g+","+b+")";
}