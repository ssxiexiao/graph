function A(){
	this.a = 'a';
}
function B(){
	this.b = 'b';
}
B.prototype = A.prototype;
var b = new B();
A.prototype._a = 10;
console.log(b.b);
console.log(b.a);
console.log(b._a);
var a = new A();
console.log(a._a);