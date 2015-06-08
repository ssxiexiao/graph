var Node = {
    setosa: "red",
    versicolor: "green",
    vriginica: "blue",
    createNew: function(obj){
        var node = {};
        node.species = obj['species'];
        node.sepal_width = obj['sepal width'];
        node.sepal_length = obj['sepal length'];
        node.petal_width = obj['petal width'];
        node.petal_length = obj['petal length'];
        return node;
    }
};
window.onload = function(){
    d3.csv("iris.csv", function(csv){
        console.log(csv);
    });
}