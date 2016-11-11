tests(
  JS,
  {
    name: 'unify(Var, Clause)',
    code: 'new Subst().unify(new Var("X"),\n' +
          '                  new Clause("foo"));',
    expected: new Subst().bind("X", new Clause("foo"))
  },
  {
    name: 'unify(Clause, Var)',
    code: 'new Subst().unify(new Clause("foo"),\n' +
          '                  new Var("X"));',
    expected: new Subst().bind("X", new Clause("foo"))
  },
  {
    name: 'unify(Var, Var)',
    code: 'var s = new Subst().unify(new Var("X"),\n' +
          '                          new Var("Y"));\n' +
          'var ans1 = new Subst().bind("X", new Var("Y"));\n' +
          'var ans2 = new Subst().bind("Y", new Var("X"));\n' +
          'equals(s, ans1) || equals(s, ans2);',
    expected: true
  },
  {
    name: 'unify(Clause, Clause) (1/6)',
    code: 'new Subst().unify(new Clause("foo"),\n' +
          '                  new Clause("foo"));',
    expected: new Subst()
  },
  {
    name: 'unify(Clause, Clause) (2/6)',
    code: 'new Subst().unify(new Clause("foo"),\n' +
          '                  new Clause("bar"));',
    shouldThrow: true
  },
  {
    name: 'unify(Clause, Clause) (3/6)',
    code: 'new Subst().unify(new Clause("foo", [new Var("X")]),\n' +
          '                  new Clause("foo", [new Clause("bar", [new Clause("baz")])]));',
    expected: new Subst().bind("X", new Clause("bar", [new Clause("baz")]))
  },
  {
    name: 'unify(Clause, Clause) (4/6)',
    code: 'new Subst().unify(new Clause("foo", [new Var("X"), new Clause("baz")]),\n' +
          '                  new Clause("foo", [new Clause("bar"), new Var("Y")]));',
    expected: new Subst().bind("X", new Clause("bar"))
                         .bind("Y", new Clause("baz"))
  },
  {
    name: 'unify(Clause, Clause) (5/6)',
    code: 'new Subst().unify(new Clause("f", [new Var("X"), new Var("Y")]),\n' +
          '                  new Clause("f", [new Clause("a"), new Var("X")]));',
    expected: new Subst().bind("X", new Clause("a"))
                         .bind("Y", new Clause("a"))
  },
  {
    name: 'unify(Clause, Clause) (6/6)',
    code: 'new Subst().unify(new Clause("f", [new Var("Y"), new Var("X")]),\n' +
          '                  new Clause("f", [new Var("X"), new Clause("a")]));',
    expected: new Subst().bind("Y", new Clause("a"))
                          .bind("X", new Clause("a"))
  },
  {
    name: 'check update in place',
    code: 'var subst = new Subst(); subst.unify(new Var("X"), new Clause("foo")); subst.lookup("X");',
    expected: new Clause("foo")
  }
);

