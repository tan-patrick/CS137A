// This function is used by the test harness to pretty-print values.
// Right now it doesn't handle undefined, functions, NaN, Number.POSITIVE_INFINITY, etc.
// Feel free to modify / extend it as you see fit.
// (FYI, pretty-printing is not used by our grading scripts.)

function prettyPrintValue(value) {
  return JSON.stringify(value);
}

// Helper functions used in the tests

function greaterThan(n) {
  return function(x) { return x > n; };
}

function isNumber(x) {
  return typeof x === 'number';
}

function isOne(x) {
  return x === 1;
}

// Tests!

tests(
  {
    name: 'wildcard',
    code: 'match(123,\n' +
          '  _, function(x) { return x + 2; }\n' +
          ')',
    expected: 125
  },
  {
    name: 'literal pattern',
    code: 'match(123,\n' +
          '  42,  function() { return "aaa"; },\n' +
          '  123, function() { return "bbb"; },\n' +
          '  444, function() { return "ccc"; }\n' +
          ')',
    expected: "bbb"
  },
  {
    name: 'array pattern',
    code: 'match(["+", 5, 7],\n' +
          '  ["+", _, _], function(x, y) { return x + y; }\n' +
          ')',
    expected: 12
  },
  {
    name: 'many',
    code: 'match(["sum", 1, 2, 3, 4],\n' +
          '  ["sum", many(when(isNumber))], function(ns) {\n' +
          '                                   return ns.reduce(function(x, y) { return x + y; });\n' +
          '                                 }\n' +
          ')',
    expected: 10
  },
  {
    name: 'many pairs',
    code: 'match([[1, 2], [3, 4], [5, 6]],\n' +
          '  [many([_, _])], function(pts) { return JSON.stringify(pts); }\n' +
          ')',
    expected: "[1,2,3,4,5,6]"
  },
  {
    name: 'when',
    code: 'match(5,\n' +
          '  when(greaterThan(8)), function(x) { return x + " is greater than 8"; },\n' +
          '  when(greaterThan(2)), function(x) { return x + " is greater than 2"; }\n' +
          ')',
    expected: "5 is greater than 2"
  },
  {
    name: 'first match wins',
    code: 'match(123,\n' +
          '  _,   function(x) { return x; },\n' +
          '  123, function()  { return 4; }\n' +
          ')',
    expected: 123
  },
  {
    name: 'match failed',
    code: 'match(3,\n' +
          '  1,   function() { return 1; },\n' +
          '  2,   function() { return 2; },\n' +
          '  [3], function() { return 3; }\n' +
          ')',
    shouldThrow: true
  },
  {
    name: 'match1',
    code: 'match([1,2,3], [many(_)], function() { return JSON.stringify(arguments); })',
    expected:'{"0":[1,2,3]}'
  },
  {
    name: 'match2',
    code: 'match([1,2,3], [many(when(isOne)),many(_)], function() { return JSON.stringify(arguments); })',
    expected:'{"0":[1],"1":[2,3]}'
  },
  {
    name: 'match3',
    code: 'match([2,2,3], [many(when(isOne)),many(_)], function() { return JSON.stringify(arguments); })',
    expected:'{"0":[],"1":[2,2,3]}'
  },
  {
    name: 'match4',
    code: 'match([1,2,3], [many(when(isOne)),2,many(_)], function() { return JSON.stringify(arguments); })',
    expected:'{"0":[1],"1":[3]}'
  },
  {
    name: 'match5',
    code: 'match([[1,2],[3,4]], [many([many(_)])], function() { return JSON.stringify(arguments); })',
    expected:'{"0":[[1,2],[3,4]]}'
  },
  {
    name: 'match6',
    code: 'match([[1,2],[3,4]], [many([_,_])], function() { return JSON.stringify(arguments); })',
    expected:'{"0":[1,2,3,4]}'
  },
  {
    name: 'match7',
    code: 'match([[1,2],[3,4]], many([_,_]), function() { return JSON.stringify(arguments); })',
    shouldThrow: true
  },
  {
    name: 'match7',
    code: 'match([[1,2],[3,4]], [many(_)], function() { return JSON.stringify(arguments); })',
    expected:'{"0":[[1,2],[3,4]]}'
  },
  {
    name: 'match8',
    code: 'match([[1,2],[3,4]], [many([many(_)])], function() { return JSON.stringify(arguments); })',
    expected:'{"0":[[1,2],[3,4]]}'
  },
  {
    name: 'match9',
    code: 'match([1,1,1,1], [many(1)], function(a){return a.length;});',
    expected:0
  },
  {
    name: 'match10',
    code: 'match([1,2,3], [many(when(isNumber)), many(when(isOne))], function(){ return JSON.stringify(arguments); })',
    expected: '{"0":[1,2,3],"1":[]}'
  }
);

