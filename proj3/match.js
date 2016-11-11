try{ 
	global._ = "unique";
} 
catch(e) {	
	window._ = "unique";
}

function when(test){
	return ["when", test];
}

function many(type){
	return ["many", type];
}

function match(value /* , pat1, fun1, pat2, fun2, ... */) {
  	var numPatterns = (arguments.length - 1) / 2;

  	for(var i = 1; i <= numPatterns; i++){
  		var param = matchOne(value, arguments[2*i - 1])
  		if(param !== null)
  			return arguments[2*i].apply(this, param);
  	}

  	throw new Error("Match not found.");
}

function matchOne(value, pattern){
	var parameters = [];

	if(pattern === "unique"){
		parameters.push(value);
		return parameters;
	}

	if(value === pattern){
		return parameters;
	}

	if(typeof pattern === "object" && pattern[0] === "when"){
		if(pattern[1].call(this, value)){
			parameters.push(value);
			return parameters;
		}
	}

	if(typeof pattern === "object" && pattern[0] === "many"){
		throw new Error("Many must be defined inside of an array.");
	}

	if(typeof pattern === "object" && typeof value === "object"){
		parameters = matchArray(value, pattern);
		if(parameters !== null)
			return parameters;
	}

	return null;
}

function matchMany(value, test, curVal){
	var parameters = [];
	var valLength = value.length;
	var x = true;
	while(x){
		x = false;
		if(test === "unique"){
			parameters.push(value[curVal]);
			if(curVal >= valLength)
				return null;
			curVal++;
			x = true;
		}

		if(value[curVal] === test){
			if(curVal >= valLength)
				return null;
			curVal++;
			x = true;
		}

		if(typeof test === "object" && test[0] === "when"){
			if(test[1].call(this, value[curVal])){
				parameters.push(value[curVal]);
				if(curVal >= valLength)
					return null;
				curVal++;
				x = true;
			}
		}

		if(typeof test === "object" && typeof value[curVal] === "object"){
			var arrayParam = matchArray(value[curVal], test);

			if(arrayParam === null)
				return null;

			parameters = parameters.concat(arrayParam);

			if(curVal >= valLength)
				return null;
			curVal++;
			x = true;
		}

		if(curVal === valLength)
			return [curVal, parameters];
	}

	return [curVal, parameters];
}

function matchArray(value, pattern){
	var curVal = 0;
	var valLength = value.length;
	var parameters = [];

	for(var i = 0; i < pattern.length; i++){
		if(pattern[i] === "unique"){
			parameters.push(value[curVal]);
			if(curVal >= valLength)
				return null;
			if(curVal >= valLength)
				return null;
			curVal++;
		}

		//will switch statement instead of else if work?
		else if(typeof pattern[i] === "object" && pattern[i][0] === "many"){
			var manyPar = matchMany(value, pattern[i][1], curVal); 
			if(manyPar === null)
				return null;
			else{
				parameters.push(manyPar[1]);
				curVal = manyPar[0];
			}
		}
		else if(typeof pattern[i] === "object" && pattern[i][0] === "when"){
			if(test[i][1].call(this, value[curVal])){
				parameters.push(value[curVal]);
				if(curVal >= valLength)
					return null;
				curVal++;
			}
			else
				return null;
			//throw new Error("when cannot be used inside of an array")
		}
		else if(typeof pattern[i] === "object" && typeof value[curVal] === "object"){
			var innerArrayPar = matchArray(value[curVal], pattern[i]);
			if(innerArrayPar === null)
				return null;
			else
				parameters = parameters.concat(innerArrayPar);

			if(curVal >= valLength)
				return null;
			curVal++;
		}
		else if(pattern[i] === value[curVal]){
			if(curVal >= valLength)
				return null;
			curVal++;
		}
		else
			return null;
	}

	if(curVal === valLength)
		return parameters;
	else
		return null;
}

/*
	many must be directly inside of an array
		i.e. [1,2,many(_)], doesn't make sense outside of an array

	match([[1,2],[3,4]], 

	[_, _, many(_)], function (a,b,cs){})
	a = [1,2]
	b = [3,4]
	cs = []

	many([_,_]), function(ps){})
	ps = [1,2,3,4]

	[many(_)], function(xs) {})
	xs = [[1,2],[3,4]]

	[many([many(_)])], function(xs)
	xs = [[1,2],[3,4]]
*/

/*
Embedded Languages

"internal" languages

properties of a library as a language
	_, when, many -> feel like keywords
	composable abstractions
	
	generality

	our pattern language
		p :: = _ | [p1,...,pn] | when(f) | many(p)

library vs. language
	fluid API

annotations
	Guice
*/