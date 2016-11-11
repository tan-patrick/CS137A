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

//initialize the class table with Object and Number classes
//object is created manually instead of using declareClass to allow for a null superclass
OO.initializeCT = function() {

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
	for(var i = 0; i < superClass.methods.length; i++){
		var methodName = superClass.methods[i][0];
		var imp = superClass.methods[i][1];
		methods.push([methodName,imp]);
	}

	//creates instance variable array from super class and given instance variable names
	var instanceVars = [];
	for(var i = 0; i < superClass.instanceVars.length; i++){
		var instanceName = superClass.instanceVars[i][0];
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
	return true;
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
	//otherwise, continue and call the method
	else{
		for(var i = 0; i < classObj.methods.length; i++){
			if(classObj.methods[i][0] === methodName){
				return classObj.methods[i][1].apply(this, passArgs);
			}
		}
	}

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
function getClass(name){
	for(var i = 0; i < this.classes.length; i++){
		if(this.classes[i][0] === className){
			return this.classes[i][1];
		}
	}

	throw new Error("Undeclared Class.");
}