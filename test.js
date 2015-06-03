window.onload = function(){
    d3.json("test.json", function(json){
        var dataSet = json.data;
        d3.select('body').selectAll('p')
            .data(dataSet)
            .enter()
            .append('p')
            .text(function(d){
                return d.text;
            });
    })
}