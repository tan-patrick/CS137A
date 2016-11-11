function Env(name, value, parent) {
  this.name = name;
  this.value = value;
  this.parent = parent;
}	    

this.emptyEnv = new Env(undefined, undefined, undefined);

Env.prototype.lookup = function(name){
	if(this.name === name)
		return this.value;
	else if(this.parent)
		return this.parent.lookup(name);
	else
		throw new Error('unbound identifier: ' + name);
}

F.evalAST = function(ast) {
 	return ev(ast, emptyEnv);
};

function ev(ast, env) {
	if (isPrim(ast)) {
	return ast;
	} else {
	var tag = ast[0];
	var args = ast.slice(1);
	args.push(env);
	return impls[tag].apply(undefined, args);
	}
}

function isPrim(ast){
	if(typeof ast === "boolean" || typeof ast === "number" || ast === null)
		return true;
}

// Env.prototype.eval = function(ast) {
//   if (typeof ast === "number") {
//     return ast;
//   } else {
//     var tag = ast[0];
//     var args = ast.slice(1);
//     return this[tag].apply(this, args);
//   }
// }


var impls = {
	"+": function(x, y, env) {
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "number" || typeof yval !== "number")
			throw new Error("Both values must be numerical values.");
		return xval + yval;
	},
	"-": function(x, y, env) {
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "number" || typeof yval !== "number")
			throw new Error("Both values must be numerical values.");
		return xval - yval;
	},
	"*": function(x, y, env) {
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "number" || typeof yval !== "number")
			throw new Error("Both values must be numerical values.");
		return xval * yval;
	},
	"/": function(x, y, env) {
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "number" || typeof yval !== "number")
			throw new Error("Both values must be numerical values.");
		return xval / yval;
	},
	"%": function(x, y, env) {
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "number" || typeof yval !== "number")
			throw new Error("Both values must be numerical values.");
		return xval % yval;
	},
	"=": function(x, y, env){
		if(ev(x,env) === ev(y,env))
			return true;
		else
			return false;
	},
	"!=": function(x, y, env){
		if(ev(x, env) !== ev(y, env))
			return true;
		else
			return false;
	},
	"<": function(x, y, env){
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "number" || typeof yval !== "number")
			throw new Error("Both identifiers must be number values.");
		if(xval < yval)
			return true;
		else
			return false;
	},
	">": function(x, y, env){
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "number" || typeof yval !== "number")
			throw new Error("Both identifiers must be number values.");
		if(xval > yval)
			return true;
		else
			return false;
	},
	"and": function(x, y, env){
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "boolean" || typeof yval !== "boolean")
			throw new Error("Both identifiers must be booleans.");
		if(ev(x, env) && yval)
			return true;
		else
			return false;
	},
	"or": function(x, y, env){
		var xval = ev(x,env);
		var yval = ev(y,env);
		if(typeof xval !== "boolean" || typeof yval !== "boolean")
			throw new Error("Both identifiers must be booleans.");
		if(xval || yval)
			return true;
		else
			return false;
	},
	"id": function(x, env){
		return env.lookup(x);
	},
	"fun": function(x, y, env){ // x is array of variables that we should store? ; e is the function call
		return ['closure', x, y, env];
	},
	"call": function(){ //variable number of arguments, so we use arguments variable
		var curEnv = arguments[arguments.length - 1];
		var closure = ev(arguments[0], curEnv);
		var functionArguments = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
		var parameters = closure[1];
		var body = closure[2];
		var functionEnv = closure[3];

		if(functionArguments.length !== parameters.length)
			throw new Error("Invalid amount of arguments.");

		for(var i = 0; i < parameters.length; i++){
			var newEnv = new Env(parameters[i], ev(functionArguments[i], curEnv), functionEnv);
			functionEnv = newEnv;
		}

		return ev(body, functionEnv);
	},
	"let": function(x, y, z, env){
		if(typeof x !== "string")
			throw new Error("The variable identifier must be a string.")
		var newEnvironment = new Env(x, ev(y, env), env);
		return ev(z, newEnvironment);
	},
	"if": function(x, y, z, env){
		var conditionResult = ev(x, env);
		if(typeof conditionResult !== "boolean")
			throw new Error("Conditional must result in a boolean.");
		if(conditionResult)
			return ev(y, env);
		else
			return ev(z, env);
	}
};