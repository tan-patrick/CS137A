C.vars = {};

C.evalAST = function(ast) {
	C.vars = {};
 	return ev(ast);
};

function ev(ast) {
	if (typeof ast === "number") {
	return ast;
	} else {
	var tag = ast[0];
	var args = ast.slice(1);
	return impls[tag].apply(undefined, args);
	}
}

var impls = {
	"+": function(x, y) {
		return ev(x) + ev(y);
	},
	"-": function(x, y) {
		return ev(x) - ev(y);
	},
	"*": function(x, y) {
		return ev(x) * ev(y);
	},
	"/": function(x, y) {
		return ev(x) / ev(y);
	},
	"id": function(x) {
		return C.vars.hasOwnProperty(x) ? C.vars[x] : 0;
	},
	"set": function(x,e){
		var ans = ev(e);
		C.vars[x] = ans;
		return ans;
	},
	"seq": function (e1,e2){
			ev(e1);
		return ev(e2);
	},
	"^": function(x,y){
		return Math.pow(ev(x), ev(y));
	}
};