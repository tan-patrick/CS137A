//object created to stand for a class

function ClassObj (methods, superName, instance){
	this.superClass = superName;
	this.methods = methods;
	this.instanceVars = instance;
};

//used for instantiating an object (don't want to change class declaration)
function CopyClassObj (copyObj){
	var newMethods = [];
	for(var i = 0; i < copyObj.methods.length; i++){
		var name = copyObj.methods[i][0];
		var imp = copyObj.methods[i][1];
		newMethods.push([name,imp]);
	}
	var newInst = [];
	for(var i = 0; i < copyObj.instanceVars.length; i++){
		var name = copyObj.instanceVars[i][0];
		var val = copyObj.instanceVars[i][1];
		newInst.push([name,val]);
	}
	return new ClassObj(newMethods, copyObj.superClass, newInst);
}

//decided to use array to make it easier to search
//can also use different properties for each class
var OO = {
	classes: []
};

finalRet = null;
//initialize the class table with Object and Number classes
//object is created manually instead of using declareClass to allow for a null superclass
OO.initializeCT = function() {

	finalRet = null;
	//resets classes table
	this.classes = [];

	//create Object class
	var methods = [
	["initialize",
		function(_this){}
	],
	["===", 
		function(_this, x) {
		    return _this === x;
  		}
  	],
  	["!==", 
		function(_this, x) {
		    return _this !== x;
  		}
  	],
  	["isNumber", function(_this){return false;}
  	],
  	]
	var obj = new ClassObj(methods, "", []);
	this.classes.push(["Object", obj]);

	//create Number class
	this.declareClass("Number", "Object", []);
	this.declareMethod("Number", "initialize", function(_this){});
	this.declareMethod("Number", "isNumber", function(_this){return true;});

	this.declareMethod("Number", "+", function(_this, anotherNumber){return _this + anotherNumber;});
	this.declareMethod("Number", "-", function(_this, anotherNumber){return _this - anotherNumber;});
	this.declareMethod("Number", "*", function(_this, anotherNumber){return _this * anotherNumber;});
	this.declareMethod("Number", "/", function(_this, anotherNumber){return _this / anotherNumber;});
	this.declareMethod("Number", "%", function(_this, anotherNumber){return _this % anotherNumber;});
	this.declareMethod("Number", ">", function(_this, anotherNumber){return _this > anotherNumber;});
	this.declareMethod("Number", ">=", function(_this, anotherNumber){return _this >= anotherNumber;});
	this.declareMethod("Number", "<", function(_this, anotherNumber){return _this < anotherNumber;});
	this.declareMethod("Number", "<=", function(_this, anotherNumber){return _this <= anotherNumber;});

	this.declareClass("Null", "Object", []);
	this.declareClass("Boolean", "Object", []);
	this.declareClass("True", "Boolean", []);
	this.declareClass("False", "Boolean", []);

	this.declareClass("Block", "Object", ["variables", "statements"]);
	this.declareMethod("Block", "initialize", function(_this, varArgs, stateArgs){
		OO.setInstVar(_this, "variables", varArgs);
		OO.setInstVar(_this, "statements", stateArgs);
	});
	this.declareMethod("Block", "call", function(){ //(_this, args)
		var retString = "";
		var classObj = arguments[0];
		for(var i = 0; i < classObj.instanceVars[0][1].length; i++){
			retString += "var " + classObj.instanceVars[0][1][i] + ' = ' + arguments[i+1] + ';';
		}

		var ret = classObj.instanceVars[1][1][classObj.instanceVars[1][1].length - 1];
		for(var i = 0; i < classObj.instanceVars[1][1].length - 1; i++){
			if(i === ret)
				retString += "return " + classObj.instanceVars[1][1][i];
			else
				retString += classObj.instanceVars[1][1][i];
		}
		var callFunc = new Function(retString);
		if(finalRet === null)
			finalRet = callFunc();
		return finalRet;
	});
};

//declare a new class with a superclass and instance variables
OO.declareClass = function(name, superClassName, instVarNames){
	//check if superclass is there and checks for duplicate classes
	var superClass = null;
	for(var i = 0; i < this.classes.length; i++){
		if(this.classes[i][0] === name)
			throw new Error("Duplicate Class Declaration.");
		if(this.classes[i][0] === superClassName){
			superClass = new CopyClassObj(this.classes[i][1]);
		}
	}

	if(!superClass){
		throw new Error("Undeclared Class.");
	}

	//creates method array from super class
	var methods = [];
	// for(var i = 0; i < superClass.methods.length; i++){
	// 	var methodName = superClass.methods[i][0];
	// 	var imp = superClass.methods[i][1];
	// 	methods.push([methodName,imp]);
	// }

	//creates instance variable array from super class and given instance variable names
	var instanceVars = [];
	for(var i = 0; i < superClass.instanceVars.length; i++){
		var instanceName = superClass.instanceVars[i][0];
		//TODO
		var val = superClass.instanceVars[i][1];
		instanceVars.push([instanceName,val]);
	}
	for(var i = 0; i < instVarNames.length; i++){
		if(!checkInstanceVars(instanceVars, instVarNames[i]))
			throw new Error("Duplicate Instance Variable Declaration.");
		instanceVars.push([instVarNames[i], null]);
	}

	//add new class to classes table
	var newClass = new ClassObj(methods, superClassName, instanceVars);
	this.classes.push([name, newClass]);
}

//used to check if an instance variable is already in the array
function checkInstanceVars(curArr, name){
	for(var i = 0; i < curArr.length; i++){
		if(curArr[i][0] === name)
			return false;
	}
	return true;throw new Error("Duplicate Class Declaration.");
}

//add a method name and implementation to a class
OO.declareMethod = function(className, selector, implFn){
	for(var i = 0; i < this.classes.length; i++){
		if(this.classes[i][0] === className){ //find the class in the table
			for(var j = 0; j < this.classes[i][1].methods.length; j++){
				if(this.classes[i][1].methods[j][0] === selector){ //checks if method is already there. if so, overwrite
					this.classes[i][1].methods[j][1] = implFn;
					return true;
				}
			}
			//otherwise, add method to method array
			this.classes[i][1].methods.push([selector, implFn]);
			return true;
		}
	}

	throw new Error("Undeclared Class.");
}

//create a new object using a defined class
OO.instantiate = function (){ //unknown number of variables (className, arg1, arg2, …)
	//get arguments out of agruments array
	var className = arguments[0];
	var initArgs = [];
	if(arguments.length > 1)
		initArgs = Array.prototype.slice.call(arguments, 1);

	//create base instance of class with class from classes table
	var retClass = null;
	for(var i = 0; i < this.classes.length; i++){
		if(this.classes[i][0] === className){
			retClass = new CopyClassObj(this.classes[i][1]);
			break;
		}
	}

	if(!retClass){
		throw new Error("Undeclared Class.");
	}

	//set instance variables by calling initialize 
	var classObjArr = [retClass];
	var passArgs = classObjArr.concat(initArgs);
	for(var i = 0; i < retClass.methods.length; i++){
		if(retClass.methods[i][0] === "initialize"){
			retClass.methods[i][1].apply(this, passArgs);
			break;
		}
	}

	return retClass;
}

//acts as a function call for a given class
OO.send = function(){ //unknown number of variables (recv, selector, arg1, arg2, …)
	//get arguments out of agruments array

	if(finalRet !== null)
		return finalRet;
	var classObj = arguments[0];
	var classObjArr = [classObj];
	var methodName = arguments[1];

	var methodArgs = [];
	if(arguments.length > 2)
		methodArgs = Array.prototype.slice.call(arguments, 2);

	var passArgs = classObjArr.concat(methodArgs);

	//if the recv if a Javascript number, call the selector with class Number instead
	if(typeof classObj === "number"){
		var numbers = [classObj];
		numbers = numbers.concat(methodArgs);
		for(var i = 0; i < this.classes.length; i++){
			if(this.classes[i][0] === "Number"){
				for(var j = 0; j < this.classes[i][1].methods.length; j++){
					if(this.classes[i][1].methods[j][0] === methodName)
						return this.classes[i][1].methods[j][1].apply(this, numbers);
				}
			}
		}
	}
	else if(classObj === null){
		var sendArgs = [classObj];
		sendArgs = sendArgs.concat(methodArgs);
		for(var i = 0; i < this.classes.length; i++){
			if(this.classes[i][0] === "Null"){
				for(var j = 0; j < this.classes[i][1].methods.length; j++){
					if(this.classes[i][1].methods[j][0] === methodName)
						return this.classes[i][1].methods[j][1].apply(this, sendArgs);
				}
			}
		}
	}
	else if(typeof classObj === "boolean"){
		var sendArgs = [classObj];
		sendArgs = sendArgs.concat(methodArgs);
		if(classObj){
			for(var i = 0; i < this.classes.length; i++){
				if(this.classes[i][0] === "True"){
					for(var j = 0; j < this.classes[i][1].methods.length; j++){
						if(this.classes[i][1].methods[j][0] === methodName)
							return this.classes[i][1].methods[j][1].apply(this, sendArgs);
					}
				}
			}
		}
		else{
			for(var i = 0; i < this.classes.length; i++){
				if(this.classes[i][0] === "False"){
					for(var j = 0; j < this.classes[i][1].methods.length; j++){
						if(this.classes[i][1].methods[j][0] === methodName)
							return this.classes[i][1].methods[j][1].apply(this, sendArgs);
					}
				}
			}
		}
	}
	//otherwise, continue and call the method
	else{
		for(var i = 0; i < classObj.methods.length; i++){
			if(classObj.methods[i][0] === methodName){
				return classObj.methods[i][1].apply(this, passArgs);
			}
		}
	}

	if(classObj.superClass !== null){
		var passArr = [OO.getSuperClass(classObj), classObj, methodName];
		passArr = passArr.concat(methodArgs);
		return OO.superSend.apply(this, passArr);
	}
	else
		throw new Error("Message Not Understood.");
}

//send call to a super function
OO.superSend = function(){ //unknown number of variables (superClassName, recv, selector, arg1, arg2, …)
	//get arguments out of agruments array
	var superName = arguments[0];
	var origObj = arguments[1];
	var methodName = arguments[2];
	var methodArgs = [];
	if(arguments.length > 3)
		methodArgs = Array.prototype.slice.call(arguments, 3);

	//finds superclass
	var superClass = null;
	for(var i = 0; i < this.classes.length; i++){
		if(this.classes[i][0] === superName){
			superClass = this.classes[i][1];
			break;
		}
	}

	if(!superClass){
		throw new Error("Undeclared Class.");
	}

	//calls method in the superclass
	var passArgs = [origObj];
	passArgs = passArgs.concat(methodArgs);

	for(var i = 0; i < superClass.methods.length; i++){
		if(superClass.methods[i][0] === methodName){
			return superClass.methods[i][1].apply(this, passArgs);
		}
	}

	if(superClass.superClass !== null){
		var passArr = [OO.getSuperClass(superClass), origObj, methodName];
		passArr = passArr.concat(methodArgs);
		return OO.superSend.apply(this, passArr);
	}
	else
		throw new Error("Message Not Understood.");

	throw new Error("Message Not Understood.");
}

//get the value of an instance variable
OO.getInstVar = function(recv, instVarName){
	for(var i = 0; i < recv.instanceVars.length; i++){
		if(recv.instanceVars[i][0] === instVarName){
			return recv.instanceVars[i][1];
		}
	}

	throw new Error("Undeclared Instance Variable.");
}

//sets the value of an instance variable
OO.setInstVar = function(recv, instVarName, value){
	for(var i = 0; i < recv.instanceVars.length; i++){
		if(recv.instanceVars[i][0] === instVarName){
			recv.instanceVars[i][1] = value;
			return true;
		}
	}

	throw new Error("Undeclared Instance Variable.");
}

//helper function to show a class given its name
OO.getClass = function(name){
	if(typeof name === "number"){
		name = "Number";
	}
	else if(name === null){
		name = "Null";
	}
	else if(typeof name === "boolean"){
		if(name)
			name = "True";
		else
			name = "False";
	}
	for(var i = 0; i < this.classes.length; i++){
		if(this.classes[i][0] === name){
			return this.classes[i][1];
		}
	}

	throw new Error("Undeclared Class.");
}

OO.getSuperClass = function(child){
	var superClassName = null;
	if(typeof child === "number"){
		superClassName = "Object";
	}
	else if(child === null){
		superClassName = "Object";
	}
	else if(typeof child === "boolean"){
		superClassName = "Boolean";
	}
	else{
		superClassName = child.superClass;
	}

	return superClassName;
}

O.transAST = function(ast) {
	return matchInput(ast);
};

passInto = null;

function ev(ast) {
	return matchInput(ast);
}

function matchInput(ast){
	return match(ast,
		["program", many(_)], 
		function(){
			OO.initializeCT();
			var finalString = '';
			for(var i = 0; i < arguments.length; i++){
				finalString += matchInput(arguments[i]) + ';';
			}
			return finalString;
		},
		["classDecl", _, _, _],
		function(name, superClass, instVars){
			var retString = '';
			var first = true;
			retString += 'OO.declareClass("' + name + '", "' + superClass + '", [';
			for(var i = 0; i < instVars.length; i++){
				if(first)
					retString += '"' + instVars[i] + '"';
				else
					retString += ',"' + instVars[i] + '"';
				first = false;
			}
			retString += '])';
			return retString;
		},
		["methodDecl", _, _, _, _],
		function(className, methodName, methodArgs, statements){
			passInto = className;
			var retString = '';
			retString += 'OO.declareMethod("' + className + '", "' + methodName + '", ' + 'function(_this';

			for(var i = 0; i < methodArgs.length; i++){
				retString += ', ' + methodArgs[i];
			}
			retString += ') {';
			
			var classArr = [className];
			for(var i = 0; i < statements.length; i++){
				retString += matchInput(statements[i]) + ';';
			}
			retString += '})';
			return retString;
		},
		["varDecls", many(_)],
		function(){ //["varDecls", [x1, e1], [x2, e2]…]
			var retString = '';

			for(var i = 0; i < arguments.length; i++){
				if(arguments.length - 1 === i)
					retString += 'var ' + arguments[i][0] + ' = ' + matchInput(arguments[i][1]);
				else
					retString += 'var ' + arguments[i][0] + ' = ' + matchInput(arguments[i][1]) + ';';
			}

			return retString;
		},
		["return", _],
		function(returnExp){
			return "return " + matchInput(returnExp);
		},
		["setVar", _, _],
		function(setVariable, toExpression){
			return "var " + setVariable + ' = ' + matchInput(toExpression);
		},
		["setInstVar", _, _],
		function(setVariable, toExpression){
			return 'OO.setInstVar(_this, "' + setVariable + '", ' + matchInput(toExpression) + ')'; 
		},
		["exprStmt", _],
		function(expression){
			return matchInput(expression);
		},
		["null"],
		function(){
			return 'null';
		},
		["true"],
		function(){
			return 'true';
		},
		["false"],
		function(){
			return 'false';
		},
		["number", _],
		function(num){
			return num;
		},
		["getVar", _],
		function(varToGet){
			return varToGet;
		},
		["getInstVar", _],
		function(varToGet){
			return 'OO.getInstVar(_this, "' + varToGet + '")';
		},
		["new", many(_)],
		function(){ //["new", C, e1, e2, …]
			var retString = '';

			var className = arguments[0];
			var passArgs = [];
			if(arguments.length > 1)
				passArgs = Array.prototype.slice.call(arguments, 1);

			retString += 'OO.instantiate("' + className + '"';
			for(var i = 0; i < passArgs.length; i++){
				retString += ', ' + matchInput(passArgs[i]);
			}
			retString += ')';
			return retString;


			return null;
		},
		["send", many(_)],
		function(){ //["send", erecv, m, e1, e2, …]
			var retString = '';
			var erec = ev(arguments[0]);
			if(inBlock === true)
				erec = "' + _this + '";
			var methodName = arguments[1];
			var passArgs = [];
			if(arguments.length > 2)
				passArgs = Array.prototype.slice.call(arguments, 2);
			
			retString += 'OO.send(' + erec + ', "' + methodName + '"';
			for(var i = 0; i < passArgs.length; i++){
				retString += ', ' + ev(passArgs[i]);
			}
			retString += ')';
			return retString;

		},
		["super", many(_)],
		function(){ //["superSend", m, e1, e2, …]
			var retString = '';
			var passArgs = [];
			if(arguments.length > 1)
				passArgs = Array.prototype.slice.call(arguments, 1);
			retString += 'OO.superSend(OO.getSuperClass(OO.getClass("' + passInto + '")), _this, "' + arguments[0] + '"';
			for(var i = 0; i < passArgs.length; i++){
				retString += ', ' + matchInput(passArgs[i]);
			}

			retString += ')';
			return retString;
		},
		["block", many(_)],
		function(variables, statements){
			inBlock = true;
			var first = true;
			retString = 'OO.instantiate("Block", ' + '[';
			for(var i = 0; i < variables.length; i++){
				if(first)
					retString += '"' + variables[i] + '"';
				else
					retString += ', "' + variables[i] + '"';
				first = false;
			}


			first = true;
			retString += '], ['
			for(var i = 0; i < statements.length; i++){
				if(first)
					retString += "'" + ev(statements[i]) + ";'";
				else
					retString += ", '" + ev(statements[i]) + ";'";
				first = false;

			}

			var last = -1;
			for(var i = statements.length - 1; i >= 0; i--){
				if(statements[i][0] === "exprStmt"){
					last = i;
					break;
				}
			}

			retString += ', ' + last + '])';
			inBlock = false;
			return retString;
		},
		["this"],
		function(){
			return '_this';
		}
		);
}

inBlock = false;


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
				parameters = parameters.concat(manyPar[1]);
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