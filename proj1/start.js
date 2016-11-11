function Env(name, value, parent) {
  this.name = name;
  this.value = value;
  this.parent = parent;
}

function Env(name, value, parent) {
  this.name = name;
  this.value = value;
  this.parent = parent;
}
	    

Env.prototype.eval = function(ast) {
  if (isPrim(ast)) {
    return term;
  } else {
    var tag = term[0];
    var args = term.slice(1);
    return this[tag].apply(this, args);
  }
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