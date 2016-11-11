// -----------------------------------------------------------------------------
// Part I: Rule.prototype.makeCopyWithFreshVarNames() and
//         {Clause, Var}.prototype.rewrite(subst)
// -----------------------------------------------------------------------------

copyNumber = 0;

Rule.prototype.makeCopyWithFreshVarNames = function() {
	var clauseArray = [];
	for(var i = 0; i < this.body.length; i++){
		clauseArray.push(this.body[i].makeCopyWithFreshVarNames());
	}
	var retRule = new Rule(this.head.makeCopyWithFreshVarNames(), clauseArray);
	return retRule;
};

Clause.prototype.makeCopyWithFreshVarNames = function() {
	var tArray = [];
	for(var i = 0; i < this.args.length; i++){
		tArray.push(this.args[i].makeCopyWithFreshVarNames());
	}
	return new Clause(this.name, tArray);
}

Var.prototype.makeCopyWithFreshVarNames = function(){
	return new Var(this.name + copyNumber);
}

Clause.prototype.rewrite = function(subst) {
	subst.solve();
	var tArray = [];
	for(var i = 0; i < this.args.length; i++){
		tArray.push(this.args[i].rewrite(subst));
	}
	return new Clause(this.name, tArray);
};

Var.prototype.rewrite = function(subst) {
	subst.solve();
	var lookup = subst.lookup(this.name);
	if(lookup){
		return lookup;
	}
  	return this;
};

Subst.prototype.checkBind = function(key, value){
	var look = this.lookup(key);
	if(look){
		this.bind(value, look);
	}
	this.bind(key,value);
}

Subst.prototype.solve = function(){
	var keyArr = Object.keys(this.bindings);
	var done = false;
	while(!done){
		done = true;
		for(var i = 0; i < keyArr.length; i++){
			var term = this.lookup(keyArr[i]);
			var solved = term.solve(keyArr[i], this);
			if(solved){
				this.bind(keyArr[i], solved);
				done = false;
			}
		}
	}
}

Var.prototype.solve = function(binding, sub){
	var lookup = sub.lookup(this.name);
	if(lookup){
		return lookup;
	}
	else
		return false;
}

Clause.prototype.solve = function(binding, sub){
	var tArray = [];
	var change = false;
	for(var i = 0; i < this.args.length; i++){
		var solved = this.args[i].solve(this.args[i], sub)
		if(solved){
			change = true;
			tArray.push(solved);
		}
		else
			tArray.push(this.args[i]);
	}
	if(change)
		return new Clause(this.name, tArray);
	else
		return false;
}

// -----------------------------------------------------------------------------
// Part II: Subst.prototype.unify(term1, term2)
// -----------------------------------------------------------------------------

Subst.prototype.unify = function(term1, term2) {
  try{
  	var useterm1 = term1.rewrite(this);
  	var useterm2 = term2.rewrite(this);
  	var subclone = this.clone();
  	useterm1.unify(subclone, useterm2);
	subclone.solve();
	this.bindings = subclone.bindings;
  	return this;
  }
  catch(e){
  	throw new Error("unification failed")
  }
};

Var.prototype.unify = function(sub, term){
	if(term.classType() === "Clause"){
		sub.checkBind(this.name, term);
	  	return sub;
  	}
  	else{
  		sub.checkBind(this.name, term);
  		return sub;
  	}
}

Clause.prototype.unify = function(sub, term){

	if(term.classType() === "Var"){
		sub.checkBind(term.name, this);
	  	return sub;
  	}
  	else{
  		if(this.args.length !== term.args.length){
  			throw new Error("unification failed");
  		}
  		if(this.name !== term.name){
  			throw new Error("unification failed");
  		}
  		var cursub = sub;
  		for(var i = 0; i < this.args.length; i++){
  			cursub = this.args[i].rewrite(cursub).unify(cursub, term.args[i].rewrite(cursub));
  		}
  		return cursub;
  	}
}

Var.prototype.classType = function(){
	return "Var";
}

Clause.prototype.classType = function(){
	return "Clause";
}

// -----------------------------------------------------------------------------
// Part III: Program.prototype.solve()
// -----------------------------------------------------------------------------

function IterativeSolver(inquery, inrules, curRule, curSub){
	this.rules = inrules;
	this.query = inquery;
	this.curRule = curRule;
	this.curSub = curSub;
	this.solver = null;
	this.done = false;
	this.solve = function() {
		copyNumber++;
		if(!this.solver || this.solver.done){
			for(this.curRule; this.curRule < this.rules.length; this.curRule++){
				try{
					var tempSub = this.curSub.clone();
					var ruleHead = this.rules[this.curRule].head.makeCopyWithFreshVarNames();
					var query = this.query[0].rewrite(tempSub);
					tempSub.unify(ruleHead, query);
					this.curRule++;
					if(this.rules[this.curRule - 1].body.length !== 0){
						var tempBody = [];
						for(var i = 0; i < this.rules[this.curRule - 1].body.length; i++){
							tempBody.push(this.rules[this.curRule - 1].body[i].makeCopyWithFreshVarNames());//.rewrite(tempSub)
						}
						var intoIterate = new IterativeSolver(tempBody.concat(this.query.slice(1)), this.rules, 0, tempSub);
						this.solver = intoIterate;
						var sol = intoIterate.solve()
						if(sol){
							return sol;
						}
						else
							return this.solve();
					}
					if(this.query.length === 1){
						// this.done = true;
						return tempSub;
					}
					else{
						var tempBody = [];
						for(var i = 0; i < this.rules[this.curRule - 1].body.length; i++){
							tempBody.push(this.rules[this.curRule - 1].body[i].makeCopyWithFreshVarNames());
						}
						var intoIterate = new IterativeSolver(tempBody.concat(this.query.slice(1)), this.rules, 0, tempSub);
						this.solver = intoIterate;
						var sol = intoIterate.solve()
						if(sol)
							return sol;
						else
							return this.solve();
					}
				}
				catch(e){}
			}
			this.done = true;
			return null;
		}
		else{
			var sol = this.solver.solve();
			if(sol)
				return sol;
			else
				return this.solve();
		}
	}
}

function Iterator(inquery, inrules, inCurRule, inCurSub){
	this.query = inquery;
	this.rules = inrules;
	this.cur = 0;
	this.curSolver = null;

	this.next = function(){
		return this.solve(inCurRule, inCurSub);
	}
	this.solve = function(curRule, curSub){
		if(!this.curSolver){
			this.curSolver = new IterativeSolver(this.query, this.rules, curRule, curSub);
			var solved = this.curSolver.solve();
			if(solved)
				solved.solve();
			return solved;
		}
		else{
			var subRet = this.curSolver.solve();
			if(subRet)
				subRet.solve();
			// this.curSolver = iterativeSolver;
			return subRet;
		}
		// else{
		// 	var subRet = iter.solve(0,new Subst());
		// 	this.curSolver = iter;
		// 	return subRet;
		// }
	}
}

Program.prototype.solve = function() {
	return new Iterator(this.query, this.rules, 0, new Subst());
}

Program.prototype.solveFrom = function(ruleIndex, curRule, sub) {
	for(var i = curRule; i < this.rules.length; i++){
		if(sub.unify(this.query(ruleIndex), this.rules(i))){
			return curRule;
		}
	}
}

