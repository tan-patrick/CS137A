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

function newEnv(env){
	if(env.parent && env.parent.parent){
		return new Env(env.name, env.value, newEnv(env.parent));
	}
	else{
		return new Env(env.name, env.value, new Env(undefined, undefined, undefined));
	}
}

Env.prototype.attach = function(env2){
	if(this.parent && this.parent.parent){
		this.parent.attach(env2);
	}
	else{
		this.parent = newEnv(env2);
	}
}

Env.prototype.replace = function(name, value){
	if(this.name === name){
		this.value = value;
		return true;
	}
	else if(this.parent){
		return this.parent.replace(name, value);
	}
	else{
		this.name = name;
		this.value = value;
		this.parent = new Env(undefined, undefined, undefined);
		return true;
	}
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
		
		if(functionArguments.length > parameters.length)
			throw new Error("Invalid amount of arguments.");

		for(var i = 0; i < functionArguments.length; i++){
			var newEnv = new Env(parameters[i], ev(functionArguments[i], curEnv), functionEnv);
			functionEnv = newEnv;
		}

		if(functionArguments.length < parameters.length){
			var excessParameters = Array.prototype.slice.call(parameters, functionArguments.length, parameters.length);
			return ["closure", excessParameters, body, functionEnv];
		}

		// var newFunctionEnv = attach(functionEnv, curEnv);
		functionEnv.attach(curEnv);
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
	},
	"cons": function(x, y, env){
		var left = ev(x, env);
		var right = ev(y, env);
		return ["cons", left, right];
	},
	"match": function() {//variable number of arguments, use argument variable
		var curEnv = arguments[arguments.length - 1];
		var len = arguments.length - 2;
		var len = len / 2; //there are (length - 2) / 2 pairs to match to

		var matchEvaluated = ev(arguments[0], curEnv);
		for (var i = 1; i <= len; i++){
			// var matchTo = ev(arguments[2i - 1], curEnv);
			var matchTo = arguments[2*i - 1];
			if(matchTo === null){
				if(matchEvaluated === null)
					return ev(arguments[2*i], curEnv);
			}
			else if(typeof matchTo === "object" && matchTo[0] === "_")
				return ev(arguments[2*i], curEnv);

			else if(typeof matchTo === "object" && matchTo[0] === "cons"){
				var oldEnv = curEnv;
				curEnv = matchingArrays(matchEvaluated, matchTo, curEnv);

				if(curEnv !== null)
					return ev(arguments[2*i], curEnv);

				curEnv = oldEnv;
			}

			else if(typeof matchTo === "object" && matchTo[0] === "id"){
				var newEnv = new Env(matchTo[1], matchEvaluated, curEnv);
				return ev(arguments[2*i], newEnv);
			}

			else if(typeof matchTo === typeof matchEvaluated){
				if(matchTo === matchEvaluated)
					return ev(arguments[2*i], curEnv);
			}
		}
		throw new Error("Match not found.");
	},
	"set": function(x, y, env){
		var eval = ev(y, env);
		env.replace(x, eval);
		return eval;
	},
	"seq": function(x, y, env){
		ev(x, env);
		return ev(y, env);
	},
	"listComp": function(){
		var expression = arguments[0];
		var variable = arguments[1];
		var list = arguments[2];
		var curEnv;
		var predicate;

		if(arguments.length === 5){
			predicate = arguments[3];
			curEnv = arguments[4];
			list = ev(list, curEnv);
			return listPredCompHelper(expression, variable, list, predicate, curEnv);
		}
		else{
			curEnv = arguments[3];
			list = ev(list, curEnv);
			return listCompHelper(expression, variable, list, curEnv);
		}
	},
	"delay": function (x, env){
		return ['delay_closure', x, env];
	},
	"force": function (x, env){
		var closure = ev(x, env);
		var exp = closure[1];
		var delayEnv = closure[2];

		delayEnv.attach(env); //for recursion

		return ev(exp, delayEnv);
	}
};

//helper function for match
function matchingArrays(matchEvaluated, matchTo, curEnv){
	var arrLen = matchTo.length;

	if(matchEvaluated === null)
		return null;

	if(typeof matchEvaluated !== "object" || matchEvaluated[0] !== "cons")
		return null;

	for(var j = 1; j < arrLen; j++){
		if(matchTo[j] === null && matchEvaluated[j] === null){
			//end of list!
		}
		else if(typeof matchTo[j] === "object" && matchTo[j][0] === "cons"){
			var oldEnv = curEnv;
			curEnv = matchingArrays(matchTo[j], matchEvaluated[j], oldEnv);
			if(curEnv === null){
				return null;
			}
		}

		else if(typeof matchTo[j] === "object" && matchTo[j][0] === "_"){
			//continue;
		}

		else {
			if(typeof matchTo[j] === "object" && matchTo[j][0] === "id"){
				var oldEnv = curEnv;
				curEnv = new Env(matchTo[j][1], matchEvaluated[j], oldEnv);
			}
			else if(matchTo[j] === matchEvaluated[j]){
				//continue;
			}
			else
				return null;
		}
	}
	return curEnv;
}

function listCompHelper(expression, variable, list, env){
	var left = list[1];
	var newEnv = new Env(variable, left, env);
	var consLeft = ev(expression, newEnv);

	if(list[2] === null)
		return ["cons", consLeft, null];
	
	var consRight = listCompHelper(expression, variable, list[2], env);
	return ["cons", consLeft, consRight];
}

function listPredCompHelper(expression, variable, list, predicate, env){
	var left = list[1];
	var newEnv = new Env(variable, left, env);

	if(ev(predicate, newEnv) === true){
		var consLeft = ev(expression, newEnv);

		if(list[2] === null)
			return ["cons", consLeft, null];
		
		var consRight = listPredCompHelper(expression, variable, list[2], predicate, env);
		return ["cons", consLeft, consRight];
	}
	else{
		if(list[2] === null)
			return null;
		return listPredCompHelper(expression, variable, list[2], predicate, env);
	}
}

/*
	let f = fun xs -> match xs with
		::as -> (f as)::a
	   |null -> null
	in f [1;2;3]

	let f = fun xs x i -> match xs with
		a::as -> if a=x then i else f as x (i+1)
	   |null -> -1
	in f [1;5;4;2] 1 0

	let f2 = fun xs x ->
		f xs x 0
	in f2 [1;5;4;2] 2
*/

/*

	
	listcomprehension
	let map = 
		fun f -> fun l->
			...
	in
		map (fun x-> x*2) [1;2;3]
	===
	[x * 2 | x <- [1;2;3]]
	into optional
	[x * 2 | x <- [1;2;3], x%2=1]
	
	set x:=e
	"overwrites" the previous version of x in the environment

	seq e1; e2
	evaluate e1 (i.e. assignments)
	evaluate e2 and return (note: value of e2 is the value of the entire thing)

	delay 5
	use it as a "recipe" that you can use to get 5 later
	
	force will evaluate a delay

	force ([1;2;3; delay 4; 5])

	let head = fun s ->
		match s with
			x::_ -> x
	in
	let tail = fun s ->
		match s with
			_::dxs -> force dxs
	in
	let take = fun n s ->
		match n with
			0 -> null
		   |_ -> (head s)::take(n-1)(tail s)
	in 
	let ones = 1:: delay ones //infinite list of 1s
	in
		take 5 ones

	result: ["cons", 1, ["cons", 1 ... null]]]]]

	in let sum = fun s1 s2 -> (head s1) + (head s2)::delay(sum(tail s1)(tail s2))
	in take 5 (sum ones ones)
	result: ["cons", 2, ["cons", 2 ... null]]]]]

	in let fib = 1::delay(1::delay(sum fib (tail fib)))
	in
	take 15 fib
	[1,1,2,3,5...]

	in
	let filterMultiples = fun n s->
		if head s % n = 0
		then filterMultiples n (tail s)
		else (head s)::delay (filterMultiples n (tail s))
	in
	let sieve = fun s ->
		(head s)::(delay(sieve(filterMultiples (head s) (tail s)))
	in
	let intsFrom = fun n -> n::delay (intsFrom(n+1))
	in
	let primes = sieve (intsFrom 2)
	in 
	take 5 primes 

	[2,3,7,11,13]

	in let first = fun p s ->
		if p (head s)
		then head s
		else first p (tail s)
	in
	first (fun x -> x > 105) primes
	107

	delay e -> recipe (e, env)
	force e -> e()

	lazy evaluation?
		delay all argumetns/operands in a function call to a cons

		delay: argments, operands to cons, defs in lets
		repeatadly force: operands to +, -, *, /, ...; condition of "if"; function in a call

	leaky abstractions
		the way Alan said to implement delay and Force is a "Macro"
			delay e ==> fun -> e
			force e => e()
		someone pointed out you could call delayed expr	
			this si b/c repr(delayed expr) = function
			but delayed expr != function
		types could have helped here !!!
		separate what something is from its representation
		problems w/ macros:
			this one
			variable capture
			control capture
	Using types '
		i.e. let x = delay (1 + 2) <- type recipe that evaluates to number
			in force ( force x ) will not work <- forcing a number
			in x () <- recipes can't be called

	let x = 5 in
	let x = 0 in 
		let v = (x + x) in
		v + 1
	results in v = 0 + 0
	macro (variable capture)

*/

/*

	cons is right associative
	no lists build in (use pairs/tuples)
	1::2::3::null same thing as [1;2;3]
	can also do [1+2; 2+3; 3+4] -> [3;5;7]
	spits out answers in the format: ["cons", 1, ["cons", 2, ["cons", 6, null]]]


	
	only way to get access to elements of a "list/pair" will be pattern matching
	match l with null -> 0|x::xs -> x+(sumList xs) in
		sumList[1;2;3]
	x::xs matches a cons list, and binds x and xs in the environment for use in the body
	allow multiple uses of a pattern
*/