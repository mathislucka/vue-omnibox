var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global_1 =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var descriptors = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;

var objectPropertyIsEnumerable = {
	f: f
};

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var toString = {}.toString;

var classofRaw = function (it) {
  return toString.call(it).slice(8, -1);
};

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) { throw TypeError("Can't call method on " + it); }
  return it;
};

// toObject with fallback for non-array-like ES3 strings



var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

var isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var toPrimitive = function (input, PREFERRED_STRING) {
  if (!isObject(input)) { return input; }
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) { return val; }
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) { return val; }
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) { return val; }
  throw TypeError("Can't convert object to primitive value");
};

var hasOwnProperty = {}.hasOwnProperty;

var has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var document$1 = global_1.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document$1) && isObject(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

// Thank's IE8 for his funny defineProperty
var ie8DomDefine = !descriptors && !fails(function () {
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (ie8DomDefine) { try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ } }
  if (has(O, P)) { return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]); }
};

var objectGetOwnPropertyDescriptor = {
	f: f$1
};

var anObject = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (ie8DomDefine) { try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ } }
  if ('get' in Attributes || 'set' in Attributes) { throw TypeError('Accessors not supported'); }
  if ('value' in Attributes) { O[P] = Attributes.value; }
  return O;
};

var objectDefineProperty = {
	f: f$2
};

var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var setGlobal = function (key, value) {
  try {
    createNonEnumerableProperty(global_1, key, value);
  } catch (error) {
    global_1[key] = value;
  } return value;
};

var SHARED = '__core-js_shared__';
var store = global_1[SHARED] || setGlobal(SHARED, {});

var sharedStore = store;

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof sharedStore.inspectSource != 'function') {
  sharedStore.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource = sharedStore.inspectSource;

var WeakMap = global_1.WeakMap;

var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

var shared = createCommonjsModule(function (module) {
(module.exports = function (key, value) {
  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.6.5',
  mode:  'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});
});

var id = 0;
var postfix = Math.random();

var uid = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

var keys = shared('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys = {};

var WeakMap$1 = global_1.WeakMap;
var set, get, has$1;

var enforce = function (it) {
  return has$1(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (nativeWeakMap) {
  var store$1 = new WeakMap$1();
  var wmget = store$1.get;
  var wmhas = store$1.has;
  var wmset = store$1.set;
  set = function (it, metadata) {
    wmset.call(store$1, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store$1, it) || {};
  };
  has$1 = function (it) {
    return wmhas.call(store$1, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return has(it, STATE) ? it[STATE] : {};
  };
  has$1 = function (it) {
    return has(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has$1,
  enforce: enforce,
  getterFor: getterFor
};

var redefine = createCommonjsModule(function (module) {
var getInternalState = internalState.get;
var enforceInternalState = internalState.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) { createNonEnumerableProperty(value, 'name', key); }
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global_1) {
    if (simple) { O[key] = value; }
    else { setGlobal(key, value); }
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) { O[key] = value; }
  else { createNonEnumerableProperty(O, key, value); }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
});
});

var path = global_1;

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
};

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
var toInteger = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
var toLength = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
};

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) { while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) { return true; }
    // Array#indexOf ignores holes, Array#includes - not
    } } else { for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) { return IS_INCLUDES || index || 0; }
    } } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

var indexOf = arrayIncludes.indexOf;


var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) { !has(hiddenKeys, key) && has(O, key) && result.push(key); }
  // Don't enum bug & hidden keys
  while (names.length > i) { if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  } }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys$1);
};

var objectGetOwnPropertyNames = {
	f: f$3
};

var f$4 = Object.getOwnPropertySymbols;

var objectGetOwnPropertySymbols = {
	f: f$4
};

// all object keys, includes non-enumerable and symbols
var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = objectGetOwnPropertyNames.f(anObject(it));
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var copyConstructorProperties = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = objectDefineProperty.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) { defineProperty(target, key, getOwnPropertyDescriptor(source, key)); }
  }
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

var isForced_1 = isForced;

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global_1;
  } else if (STATIC) {
    target = global_1[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global_1[TARGET] || {}).prototype;
  }
  if (target) { for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else { targetProperty = target[key]; }
    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) { continue; }
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  } }
};

var aFunction$1 = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};

// optional / simple context binding
var functionBindContext = function (fn, that, length) {
  aFunction$1(fn);
  if (that === undefined) { return fn; }
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
var toObject = function (argument) {
  return Object(requireObjectCoercible(argument));
};

// `IsArray` abstract operation
// https://tc39.github.io/ecma262/#sec-isarray
var isArray = Array.isArray || function isArray(arg) {
  return classofRaw(arg) == 'Array';
};

var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});

var useSymbolAsUid = nativeSymbol
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';

var WellKnownSymbolsStore = shared('wks');
var Symbol$1 = global_1.Symbol;
var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

var wellKnownSymbol = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (nativeSymbol && has(Symbol$1, name)) { WellKnownSymbolsStore[name] = Symbol$1[name]; }
    else { WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name); }
  } return WellKnownSymbolsStore[name];
};

var SPECIES = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) { C = undefined; }
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) { C = undefined; }
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
var createMethod$1 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = indexedObject(O);
    var boundFunction = functionBindContext(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) { if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) { target[index] = result; } // map
        else if (result) { switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push.call(target, value); // filter
        } } else if (IS_EVERY) { return false; }  // every
      }
    } }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$1(0),
  // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  map: createMethod$1(1),
  // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  filter: createMethod$1(2),
  // `Array.prototype.some` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.some
  some: createMethod$1(3),
  // `Array.prototype.every` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.every
  every: createMethod$1(4),
  // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  find: createMethod$1(5),
  // `Array.prototype.findIndex` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$1(6)
};

var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

var process = global_1.process;
var versions = process && process.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (engineUserAgent) {
  match = engineUserAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = engineUserAgent.match(/Chrome\/(\d+)/);
    if (match) { version = match[1]; }
  }
}

var engineV8Version = version && +version;

var SPECIES$1 = wellKnownSymbol('species');

var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return engineV8Version >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$1] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var defineProperty = Object.defineProperty;
var cache = {};

var thrower = function (it) { throw it; };

var arrayMethodUsesToLength = function (METHOD_NAME, options) {
  if (has(cache, METHOD_NAME)) { return cache[METHOD_NAME]; }
  if (!options) { options = {}; }
  var method = [][METHOD_NAME];
  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has(options, 0) ? options[0] : thrower;
  var argument1 = has(options, 1) ? options[1] : undefined;

  return cache[METHOD_NAME] = !!method && !fails(function () {
    if (ACCESSORS && !descriptors) { return true; }
    var O = { length: -1 };

    if (ACCESSORS) { defineProperty(O, 1, { enumerable: true, get: thrower }); }
    else { O[1] = 1; }

    method.call(O, argument0, argument1);
  });
};

var $filter = arrayIteration.filter;



var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');
// Edge 14- issue
var USES_TO_LENGTH = arrayMethodUsesToLength('filter');

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var arrayMethodIsStrict = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

var $forEach = arrayIteration.forEach;



var STRICT_METHOD = arrayMethodIsStrict('forEach');
var USES_TO_LENGTH$1 = arrayMethodUsesToLength('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
var arrayForEach = (!STRICT_METHOD || !USES_TO_LENGTH$1) ? function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
} : [].forEach;

// `Array.prototype.forEach` method
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
  forEach: arrayForEach
});

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$2 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aFunction$1(callbackfn);
    var O = toObject(that);
    var self = indexedObject(O);
    var length = toLength(O.length);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) { while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw TypeError('Reduce of empty array with no initial value');
      }
    } }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) { if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    } }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
  left: createMethod$2(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
  right: createMethod$2(true)
};

var $reduce = arrayReduce.left;



var STRICT_METHOD$1 = arrayMethodIsStrict('reduce');
var USES_TO_LENGTH$2 = arrayMethodUsesToLength('reduce', { 1: 0 });

// `Array.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 || !USES_TO_LENGTH$2 }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var createProperty = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) { objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value)); }
  else { object[propertyKey] = value; }
};

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('slice');
var USES_TO_LENGTH$3 = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });

var SPECIES$2 = wellKnownSymbol('species');
var nativeSlice = [].slice;
var max$1 = Math.max;

// `Array.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$3 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES$2];
        if (Constructor === null) { Constructor = undefined; }
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
    for (n = 0; k < fin; k++, n++) { if (k in O) { createProperty(result, n, O[k]); } }
    result.length = n;
    return result;
  }
});

var aPossiblePrototype = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) { setter.call(O, proto); }
    else { O.__proto__ = proto; }
    return O;
  };
}() : undefined);

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    objectSetPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) { objectSetPrototypeOf($this, NewTargetPrototype); }
  return $this;
};

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
var objectKeys = Object.keys || function keys(O) {
  return objectKeysInternal(O, enumBugKeys);
};

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) { objectDefineProperty.f(O, key = keys[index++], Properties[key]); }
  return O;
};

var html = getBuiltIn('document', 'documentElement');

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) { delete NullProtoObject[PROTOTYPE][enumBugKeys[length]]; }
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else { result = NullProtoObject(); }
  return Properties === undefined ? result : objectDefineProperties(result, Properties);
};

// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var whitespace = '[' + whitespaces + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$3 = function (TYPE) {
  return function ($this) {
    var string = String(requireObjectCoercible($this));
    if (TYPE & 1) { string = string.replace(ltrim, ''); }
    if (TYPE & 2) { string = string.replace(rtrim, ''); }
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
  start: createMethod$3(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
  end: createMethod$3(2),
  // `String.prototype.trim` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
  trim: createMethod$3(3)
};

var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
var defineProperty$1 = objectDefineProperty.f;
var trim = stringTrim.trim;

var NUMBER = 'Number';
var NativeNumber = global_1[NUMBER];
var NumberPrototype = NativeNumber.prototype;

// Opera ~12 has broken Object#toString
var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER;

// `ToNumber` abstract operation
// https://tc39.github.io/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive(argument, false);
  var first, third, radix, maxCode, digits, length, index, code;
  if (typeof it == 'string' && it.length > 2) {
    it = trim(it);
    first = it.charCodeAt(0);
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) { return NaN; } // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
        default: return +it;
      }
      digits = it.slice(2);
      length = digits.length;
      for (index = 0; index < length; index++) {
        code = digits.charCodeAt(index);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) { return NaN; }
      } return parseInt(digits, radix);
    }
  } return +it;
};

// `Number` constructor
// https://tc39.github.io/ecma262/#sec-number-constructor
if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
  var NumberWrapper = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var dummy = this;
    return dummy instanceof NumberWrapper
      // check on 1..constructor(foo) case
      && (BROKEN_CLASSOF ? fails(function () { NumberPrototype.valueOf.call(dummy); }) : classofRaw(dummy) != NUMBER)
        ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
  };
  for (var keys$1 = descriptors ? getOwnPropertyNames(NativeNumber) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys$1.length > j; j++) {
    if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
      defineProperty$1(NumberWrapper, key, getOwnPropertyDescriptor$2(NativeNumber, key));
    }
  }
  NumberWrapper.prototype = NumberPrototype;
  NumberPrototype.constructor = NumberWrapper;
  redefine(global_1, NUMBER, NumberWrapper);
}

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.github.io/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
};

// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) { result += 'g'; }
  if (that.ignoreCase) { result += 'i'; }
  if (that.multiline) { result += 'm'; }
  if (that.dotAll) { result += 's'; }
  if (that.unicode) { result += 'u'; }
  if (that.sticky) { result += 'y'; }
  return result;
};

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

var UNSUPPORTED_Y = fails(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

var BROKEN_CARET = fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

var regexpStickyHelpers = {
	UNSUPPORTED_Y: UNSUPPORTED_Y,
	BROKEN_CARET: BROKEN_CARET
};

var SPECIES$3 = wellKnownSymbol('species');

var setSpecies = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = objectDefineProperty.f;

  if (descriptors && Constructor && !Constructor[SPECIES$3]) {
    defineProperty(Constructor, SPECIES$3, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var defineProperty$2 = objectDefineProperty.f;
var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;





var setInternalState = internalState.set;



var MATCH$1 = wellKnownSymbol('match');
var NativeRegExp = global_1.RegExp;
var RegExpPrototype = NativeRegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y;

var FORCED = descriptors && isForced_1('RegExp', (!CORRECT_NEW || UNSUPPORTED_Y$1 || fails(function () {
  re2[MATCH$1] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
})));

// `RegExp` constructor
// https://tc39.github.io/ecma262/#sec-regexp-constructor
if (FORCED) {
  var RegExpWrapper = function RegExp(pattern, flags) {
    var thisIsRegExp = this instanceof RegExpWrapper;
    var patternIsRegExp = isRegexp(pattern);
    var flagsAreUndefined = flags === undefined;
    var sticky;

    if (!thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined) {
      return pattern;
    }

    if (CORRECT_NEW) {
      if (patternIsRegExp && !flagsAreUndefined) { pattern = pattern.source; }
    } else if (pattern instanceof RegExpWrapper) {
      if (flagsAreUndefined) { flags = regexpFlags.call(pattern); }
      pattern = pattern.source;
    }

    if (UNSUPPORTED_Y$1) {
      sticky = !!flags && flags.indexOf('y') > -1;
      if (sticky) { flags = flags.replace(/y/g, ''); }
    }

    var result = inheritIfRequired(
      CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
      thisIsRegExp ? this : RegExpPrototype,
      RegExpWrapper
    );

    if (UNSUPPORTED_Y$1 && sticky) { setInternalState(result, { sticky: sticky }); }

    return result;
  };
  var proxy = function (key) {
    key in RegExpWrapper || defineProperty$2(RegExpWrapper, key, {
      configurable: true,
      get: function () { return NativeRegExp[key]; },
      set: function (it) { NativeRegExp[key] = it; }
    });
  };
  var keys$2 = getOwnPropertyNames$1(NativeRegExp);
  var index = 0;
  while (keys$2.length > index) { proxy(keys$2[index++]); }
  RegExpPrototype.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype;
  redefine(global_1, 'RegExp', RegExpWrapper);
}

// https://tc39.github.io/ecma262/#sec-get-regexp-@@species
setSpecies('RegExp');

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;
    var sticky = UNSUPPORTED_Y$2 && re.sticky;
    var flags = regexpFlags.call(re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = flags.replace('y', '');
      if (flags.indexOf('g') === -1) {
        flags += 'g';
      }

      strCopy = String(str).slice(re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) { lastIndex = re.lastIndex; }

    match = nativeExec.call(sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = match.input.slice(charsAdded);
        match[0] = match[0].slice(charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else { re.lastIndex = 0; }
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        var arguments$1 = arguments;

        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments$1[i] === undefined) { match[i] = undefined; }
        }
      });
    }

    return match;
  };
}

var regexpExec = patchedExec;

_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
  exec: regexpExec
});

var TO_STRING = 'toString';
var RegExpPrototype$1 = RegExp.prototype;
var nativeToString = RegExpPrototype$1[TO_STRING];

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject(this);
    var p = String(R.source);
    var rf = R.flags;
    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$1) ? regexpFlags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

// TODO: Remove from `core-js@4` since it's moved to entry points







var SPECIES$4 = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  return 'a'.replace(/./, '$0') === '$0';
})();

var REPLACE = wellKnownSymbol('replace');
// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES$4] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () { execCalled = true; return null; };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !(
      REPLACE_SUPPORTS_NAMED_GROUPS &&
      REPLACE_KEEPS_$0 &&
      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    )) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    }, {
      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
  }

  if (sham) { createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true); }
};

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod$4 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) { return CONVERT_TO_STRING ? '' : undefined; }
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$4(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$4(true)
};

var charAt = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
var advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classofRaw(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};

// @@match logic
fixRegexpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible(this);
      var matcher = regexp == undefined ? undefined : regexp[MATCH];
      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative(nativeMatch, regexp, this);
      if (res.done) { return res.value; }

      var rx = anObject(regexp);
      var S = String(this);

      if (!rx.global) { return regexpExecAbstract(rx, S); }

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regexpExecAbstract(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') { rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode); }
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

for (var COLLECTION_NAME in domIterables) {
  var Collection = global_1[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) { try {
    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
  } catch (error) {
    CollectionPrototype.forEach = arrayForEach;
  } }
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script = {
  props: {
    borderColor: {
      type: String,
      required: false,
      "default": function _default() {
        return 'lightgray';
      }
    },
    boxLineHeight: {
      type: String,
      required: false,
      "default": function _default() {
        return '28px';
      }
    },
    closeOnSelect: {
      type: Boolean,
      required: false,
      "default": function _default() {
        return true;
      }
    },
    disableSearch: {
      type: Boolean,
      required: false,
      "default": function _default() {
        return false;
      }
    },
    focusColor: {
      type: String,
      required: false,
      "default": function _default() {
        return 'navy';
      }
    },
    label: {
      type: String,
      required: false,
      "default": function _default() {
        return 'label';
      }
    },
    minChars: {
      type: Number,
      required: false,
      "default": function _default() {
        return 3;
      }
    },
    options: {
      type: Array,
      required: false,
      "default": function _default() {
        return [];
      }
    },
    placeholder: {
      type: String,
      required: false,
      "default": function _default() {
        return 'Search...';
      }
    },
    showList: {
      type: Boolean,
      required: false,
      "default": function _default() {
        return true;
      }
    },
    tabCompletion: {
      type: Boolean,
      required: false,
      "default": function _default() {
        return true;
      }
    },
    value: {
      type: String,
      required: false,
      "default": function _default() {
        return '';
      }
    }
  },
  data: function data() {
    return {
      currentSearch: this.value,
      listPosition: -1,
      isOpenList: true,
      isInputFocused: false
    };
  },
  computed: {
    borderColorStyle: function borderColorStyle() {
      return "border-color: ".concat(this.isInputFocused ? this.focusColor : this.borderColor, ";");
    },
    boxHeightStyle: function boxHeightStyle() {
      return "line-height: ".concat(this.boxLineHeight, ";");
    },
    completion: function completion() {
      var _this = this;

      var reg = new RegExp("^(".concat(this.currentSearch, ")(.+)"), 'i');
      return this.options.reduce(function (acc, val) {
        var isMatching = val[_this.label].match(reg);

        if (_this.currentSearch === '') { return ''; }
        if (acc == '' && isMatching) { return isMatching[2]; }
        if (isMatching && val.length < acc.length) { return isMatching[2]; }
        return acc;
      }, '');
    },
    filteredOptions: function filteredOptions() {
      var _this2 = this;

      var reg = new RegExp("^".concat(this.currentSearch), 'i');
      var filtered = this.options.filter(function (o) {
        return o[_this2.label].match(reg);
      });
      return this.disableSearch ? this.options : filtered;
    },
    isOptionsListVisible: function isOptionsListVisible() {
      return this.currentSearch.length >= this.minChars && this.showList && this.isOpenList && this.filteredOptions.length > 0 && this.isInputFocused;
    },
    isPlaceholderVisible: function isPlaceholderVisible() {
      return !this.isInputFocused && this.currentSearch.length === 0;
    }
  },
  watch: {
    value: function value() {
      this.currentSearch = this.value;
      this.setTextContent(this.value);
    }
  },
  methods: {
    focusInput: function focusInput() {
      var el = this.$refs.input;

      if (this.currentSearch !== '') {
        var range = document.createRange();
        var sel = window.getSelection();
        var node = el.childNodes[0];
        range.setStart(node, node.textContent.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      el.focus();
    },
    getTextContent: function getTextContent() {
      var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.$refs.input;
      return el.textContent;
    },
    runSpecialKeys: function runSpecialKeys(e) {
      var key = e.key;

      if (key === 'Tab' && this.tabCompletion && this.completion !== '') {
        e.preventDefault();
        this.currentSearch += this.completion;
        this.setTextContent(this.currentSearch);
        this.focusInput();
      } else if (key === 'ArrowDown' || key === 'Down') {
        e.preventDefault();

        if (this.listPosition < this.filteredOptions.length - 1) {
          this.listPosition += 1;
        }
      } else if (key === "ArrowUp" || key === 'Up') {
        e.preventDefault();

        if (this.listPosition > -1) {
          this.listPosition -= 1;
        }
      } else if (key === 'Enter') {
        e.preventDefault();

        if (this.listPosition > -1) {
          this.selectCurrentOption();
        } else {
          this.triggerSearch();
        }
      }
    },
    selectCurrentOption: function selectCurrentOption() {
      var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.filteredOptions[this.listPosition];
      this.currentSearch = option[this.label];
      this.setTextContent(this.currentSearch);
      this.listPosition = -1;
      this.$emit('selected', option);
      this.isOpenList = !this.closeOnSelect;
      this.focusInput();
    },
    setTextContent: function setTextContent(value) {
      var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.$refs.input;
      el.textContent = value;
    },
    triggerSearch: function triggerSearch() {
      this.$emit('searched', this.currentSearch);
      this.isOpenList = !this.closeOnSelect;
    },
    updateValue: function updateValue(e) {
      var content = this.getTextContent();

      if (content !== this.currentSearch) {
        this.currentSearch = content;
        this.isOpenList = true;
        this.$emit('input', this.currentSearch);
      }
    }
  },
  mounted: function mounted() {
    var _this3 = this;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var onlyTextAdded = Array.prototype.slice.call(mutation.addedNodes).filter(function (n) {
          return n.nodeType !== 3;
        }).length === 0;
        var onlyTextRemoved = Array.prototype.slice.call(mutation.removedNodes).filter(function (n) {
          return n.nodeType !== 3;
        }).length === 0;
        var isTextInput = mutation.type === 'characterData' || onlyTextAdded && onlyTextRemoved;

        if (isTextInput) {
          _this3.updateValue();
        }
      });
    });
    observer.observe(this.$refs.input, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c("div", {
    staticClass: "om-root"
  }, [_c("div", {
    staticClass: "om-search-container",
    "class": {
      "om-has-focus": _vm.isInputFocused
    },
    style: _vm.borderColorStyle
  }, [_c("button", {
    staticClass: "om-search",
    attrs: {
      type: "button"
    },
    on: {
      click: function click($event) {
        $event.preventDefault();
        return _vm.triggerSearch($event);
      }
    }
  }, [_vm._t("icon", [_c("svg", {
    attrs: {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 16 16",
      width: "16",
      height: "16"
    }
  }, [_c("path", {
    attrs: {
      "fill-rule": "evenodd",
      d: "M15.7 13.3l-3.81-3.83A5.93 5.93 0 0013 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 000-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z"
    }
  })])])], 2), _vm._v(" "), _c("div", {
    ref: "input",
    staticClass: "om-input single-line",
    "class": {
      "om-visually-hidden": _vm.isPlaceholderVisible,
      "om-width--auto": _vm.isInputFocused,
      "om-width--full": !_vm.isInputFocused
    },
    style: _vm.boxHeightStyle,
    attrs: {
      role: "textbox",
      contenteditable: "true"
    },
    on: {
      keydown: function keydown($event) {
        $event.stopPropagation();
        return _vm.runSpecialKeys($event);
      },
      focusin: function focusin($event) {
        _vm.isInputFocused = true;
      },
      focusout: function focusout($event) {
        _vm.isInputFocused = false;
      }
    }
  }), _vm._v(" "), _vm.isPlaceholderVisible ? _c("span", {
    staticClass: "om-placeholder",
    style: _vm.boxHeightStyle,
    attrs: {
      "aria-hidden": "true"
    },
    on: {
      click: function click($event) {
        $event.stopPropagation();
        $event.preventDefault();
        return _vm.focusInput($event);
      }
    }
  }, [_vm._v(_vm._s(_vm.placeholder))]) : _vm._e(), _vm._v(" "), _c("div", {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.isInputFocused,
      expression: "isInputFocused"
    }],
    staticClass: "om-completion",
    on: {
      click: function click($event) {
        $event.stopPropagation();
        $event.preventDefault();
        return _vm.focusInput($event);
      }
    }
  }, [_vm._v(_vm._s(_vm.completion))])]), _vm._v(" "), _c("div", {
    staticClass: "om-list-container"
  }, [_vm.isOptionsListVisible ? _c("div", {
    staticClass: "om-list",
    style: "border-color: " + _vm.borderColor + ";"
  }, _vm._l(_vm.filteredOptions, function (option, idx) {
    return _c("div", {
      key: option[_vm.label] + idx,
      staticClass: "om-list-item",
      "class": {
        "om-highlight": idx === _vm.listPosition
      },
      on: {
        mousedown: function mousedown($event) {
          $event.stopPropagation();
          $event.preventDefault();
          return _vm.selectCurrentOption(option);
        }
      }
    }, [_vm._t("option", [_vm._v("\n          " + _vm._s(option[_vm.label]) + "\n        ")], {
      option: option
    })], 2);
  }), 0) : _vm._e()])]);
};

var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;
/* style */

var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
  if (!inject) { return; }
  inject("data-v-4a540f18_0", {
    source: "\n*[data-v-4a540f18] {\n  box-sizing: border-box;\n}\n.om-root[data-v-4a540f18] {\n  position: relative;\n}\n.om-input[data-v-4a540f18]:focus {\n  border: none;\n  outline: none;\n}\n.om-completion[data-v-4a540f18] {\n  height: 100%;\n  width: auto;\n  max-width: 100%;\n  color: lightgray;\n  overflow: hidden;\n  white-space: pre;\n  display: flex;\n  align-items: center;\n}\n[contenteditable=\"true\"].single-line[data-v-4a540f18] {\n  white-space: pre;\n  overflow: hidden;\n}\n[contenteditable=\"true\"].single-line br[data-v-4a540f18] {\n  display:none;\n}\n[contenteditable=\"true\"].single-line *[data-v-4a540f18] {\n  display:inline;\n  white-space:nowrap;\n}\n.om-width--auto[data-v-4a540f18] {\n  width: auto;\n  float: left;\n  min-width: 10px;\n}\n.om-width--full[data-v-4a540f18] {\n  float: left;\n  width: 100%;\n}\n.om-placeholder[data-v-4a540f18] {\n  display: block;\n  height: 100%;\n  width: 100%;\n  float: left;\n  color: darkgray;\n}\n.om-list-container[data-v-4a540f18] {\n  position: relative;\n}\n.om-list[data-v-4a540f18] {\n  position: absolute;\n  width: 100%;\n  border-left: 1px solid lightgray;\n  border-right: 1px solid lightgray;\n  border-bottom: 1px solid lightgray;\n  padding: 4px 8px;\n  background-color: white;\n  z-index: 1001;\n}\n.om-highlight[data-v-4a540f18] {\n  background-color: lightgrey;\n}\n.om-list-item[data-v-4a540f18] {\n  font-weight: 500;\n  cursor: pointer;\n}\n.om-list-item[data-v-4a540f18]:hover {\n  background-color: lightgray;\n}\n.om-search[data-v-4a540f18] {\n  vertical-align: middle;\n  background-color: transparent;\n  border: none;\n  overflow: hidden;\n}\n.om-search-container[data-v-4a540f18] {\n  border: 1px solid lightgray;\n  display: flex;\n  padding: 4px 8px;\n  border-radius: 3px;\n}\n.om-has-focus[data-v-4a540f18] {\n  border: 2px solid navy;\n  padding: 3px 7px;\n}\n.om-visually-hidden[data-v-4a540f18]:not(:focus):not(:active) { \n  position: absolute !important;\n  height: 1px; \n  width: 1px;\n  overflow: hidden;\n  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */\n  clip: rect(1px, 1px, 1px, 1px);\n  white-space: nowrap; /* added line */\n}\n",
    map: {
      "version": 3,
      "sources": ["/home/mathis/Development/vue-omnibox/src/Omnibox.vue"],
      "names": [],
      "mappings": ";AAsPA;EACA,sBAAA;AACA;AACA;EACA,kBAAA;AACA;AACA;EACA,YAAA;EACA,aAAA;AACA;AACA;EACA,YAAA;EACA,WAAA;EACA,eAAA;EACA,gBAAA;EACA,gBAAA;EACA,gBAAA;EACA,aAAA;EACA,mBAAA;AACA;AACA;EACA,gBAAA;EACA,gBAAA;AACA;AACA;EACA,YAAA;AAEA;AACA;EACA,cAAA;EACA,kBAAA;AACA;AAEA;EACA,WAAA;EACA,WAAA;EACA,eAAA;AACA;AAEA;EACA,WAAA;EACA,WAAA;AACA;AAEA;EACA,cAAA;EACA,YAAA;EACA,WAAA;EACA,WAAA;EACA,eAAA;AACA;AACA;EACA,kBAAA;AACA;AACA;EACA,kBAAA;EACA,WAAA;EACA,gCAAA;EACA,iCAAA;EACA,kCAAA;EACA,gBAAA;EACA,uBAAA;EACA,aAAA;AACA;AACA;EACA,2BAAA;AACA;AACA;EACA,gBAAA;EACA,eAAA;AACA;AAEA;EACA,2BAAA;AACA;AAEA;EACA,sBAAA;EACA,6BAAA;EACA,YAAA;EACA,gBAAA;AACA;AAEA;EACA,2BAAA;EACA,aAAA;EACA,gBAAA;EACA,kBAAA;AACA;AAEA;EACA,sBAAA;EACA,gBAAA;AACA;AAEA;EACA,6BAAA;EACA,WAAA;EACA,UAAA;EACA,gBAAA;EACA,2BAAA,EAAA,aAAA;EACA,8BAAA;EACA,mBAAA,EAAA,eAAA;AACA",
      "file": "Omnibox.vue",
      "sourcesContent": ["<template>\n  <div class=\"om-root\">\n    <div\n      class=\"om-search-container\"\n      :class=\"{ 'om-has-focus': isInputFocused }\"\n      :style=\"borderColorStyle\">\n      <button type=\"button\" class=\"om-search\" @click.prevent=\"triggerSearch\">\n        <slot name=\"icon\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" width=\"16\" height=\"16\"><path fill-rule=\"evenodd\" d=\"M15.7 13.3l-3.81-3.83A5.93 5.93 0 0013 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 000-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z\"></path></svg>\n        </slot>\n      </button>\n      <div\n        role=\"textbox\"\n        ref=\"input\"\n        class=\"om-input single-line\"\n        :class=\"{\n          'om-visually-hidden': isPlaceholderVisible,\n          'om-width--auto': isInputFocused,\n          'om-width--full': !isInputFocused }\"\n        :style=\"boxHeightStyle\"\n        contenteditable=\"true\"\n        @keydown.stop=\"runSpecialKeys\"\n        @focusin=\"isInputFocused = true\"\n        @focusout=\"isInputFocused = false\">\n      </div>\n      <span\n        v-if=\"isPlaceholderVisible\"\n        @click.stop.prevent=\"focusInput\"\n        class=\"om-placeholder\"\n        :style=\"boxHeightStyle\"\n        aria-hidden=\"true\">{{ placeholder }}</span>\n      <div\n        v-show=\"isInputFocused\"\n        class=\"om-completion\"\n        @click.stop.prevent=\"focusInput\">{{ completion }}</div>\n    </div>\n    <div class=\"om-list-container\">\n      <div\n        class=\"om-list\"\n        :style=\"`border-color: ${borderColor};`\"\n        v-if=\"isOptionsListVisible\">\n        <div\n          v-for=\"(option, idx) in filteredOptions\"\n          class=\"om-list-item\"\n          :class=\"{ 'om-highlight': idx === listPosition }\"\n          :key=\"option[label] + idx\"\n          @mousedown.stop.prevent=\"selectCurrentOption(option)\">\n          <slot name=\"option\" v-bind:option=\"option\">\n            {{ option[label] }}\n          </slot>\n        </div>\n    </div>\n    </div>\n  </div>\n</template>\n<script>\nexport default {\n  props: {\n    borderColor: {\n      type: String,\n      required: false,\n      default: () => 'lightgray'\n    },\n    boxLineHeight: {\n      type: String,\n      required: false,\n      default: () => '28px'\n    },\n    closeOnSelect: {\n      type: Boolean,\n      required: false,\n      default: () => true\n    },\n    disableSearch: {\n      type: Boolean,\n      required: false,\n      default: () => false\n    },\n    focusColor: {\n      type: String,\n      required: false,\n      default: () => 'navy'\n    },\n    label: {\n      type: String,\n      required: false,\n      default: () => 'label'\n    },\n    minChars: {\n      type: Number,\n      required: false,\n      default: () => 3\n    },\n    options: {\n      type: Array,\n      required: false,\n      default: () => ([])\n    },\n    placeholder: {\n      type: String,\n      required: false,\n      default: () => 'Search...'\n    },\n    showList: {\n      type: Boolean,\n      required: false,\n      default: () => true\n    },\n    tabCompletion: {\n      type: Boolean,\n      required: false,\n      default: () => true\n    },\n    value: {\n      type: String,\n      required: false,\n      default: () => ''\n    }\n  },\n  data () {\n    return {\n      currentSearch: this.value,\n      listPosition: -1,\n      isOpenList: true,\n      isInputFocused: false\n    }\n  },\n  computed: {\n    borderColorStyle () {\n      return `border-color: ${this.isInputFocused ? this.focusColor : this.borderColor};`\n    },\n    boxHeightStyle () {\n      return `line-height: ${this.boxLineHeight};`\n    },\n    completion () {\n      const reg = new RegExp(`^(${this.currentSearch})(.+)`, 'i')\n      return this.options.reduce((acc, val) => {\n        const isMatching = val[this.label].match(reg)\n        if (this.currentSearch === '') return ''\n        if (acc == '' && isMatching) return isMatching[2]\n        if (isMatching && val.length < acc.length) return isMatching[2]\n        return acc\n      }, '')\n    },\n    filteredOptions () {\n      const reg = new RegExp(`^${this.currentSearch}`, 'i')\n      const filtered = this.options.filter(o => o[this.label].match(reg))\n      return this.disableSearch ? this.options : filtered\n    },\n    isOptionsListVisible () {\n      return this.currentSearch.length >= this.minChars && this.showList && this.isOpenList && this.filteredOptions.length > 0 && this.isInputFocused\n    },\n    isPlaceholderVisible () {\n      return (!this.isInputFocused && this.currentSearch.length === 0)\n    }\n  },\n  watch: {\n    value () {\n      this.currentSearch = this.value\n      this.setTextContent(this.value)\n    }\n  },\n  methods: {\n    focusInput () {\n      const el = this.$refs.input\n      if (this.currentSearch !== '') {\n        let range = document.createRange()\n        let sel = window.getSelection()\n        let node = el.childNodes[0]\n        range.setStart(node, node.textContent.length)\n        range.collapse(true)\n        sel.removeAllRanges()\n        sel.addRange(range)\n      }\n      el.focus()\n    },\n    getTextContent (el = this.$refs.input) {\n      return el.textContent\n    },\n    runSpecialKeys (e) {\n      const key = e.key\n      if (key === 'Tab' && this.tabCompletion && this.completion !== '') {\n        e.preventDefault()\n        this.currentSearch += this.completion\n        this.setTextContent(this.currentSearch)\n        this.focusInput()\n      } else if (key === 'ArrowDown' || key === 'Down') {\n        e.preventDefault()\n        if (this.listPosition < this.filteredOptions.length - 1) {\n          this.listPosition += 1\n        }\n      } else if (key === \"ArrowUp\" || key === 'Up') {\n          e.preventDefault()\n          if (this.listPosition > -1) {\n            this.listPosition -= 1\n          }\n      } else if (key === 'Enter') {\n        e.preventDefault()\n        if (this.listPosition > -1) {\n          this.selectCurrentOption()\n        } else {\n          this.triggerSearch()\n        }\n      }\n    },\n    selectCurrentOption (option = this.filteredOptions[this.listPosition]) {\n      this.currentSearch = option[this.label]\n      this.setTextContent(this.currentSearch)\n      this.listPosition = -1\n      this.$emit('selected', option)\n      this.isOpenList = !this.closeOnSelect\n      this.focusInput()\n    },\n    setTextContent (value, el = this.$refs.input) {\n      el.textContent = value\n    },\n    triggerSearch () {\n      this.$emit('searched', this.currentSearch)\n      this.isOpenList = !this.closeOnSelect\n    },\n    updateValue (e) {\n      const content = this.getTextContent()\n      if (content !== this.currentSearch) {\n        this.currentSearch = content\n        this.isOpenList = true\n        this.$emit('input', this.currentSearch)\n      }\n    }\n  },\n  mounted () {\n    const observer = new MutationObserver((mutations) => {\n      mutations.forEach((mutation) => {\n        const onlyTextAdded = Array.prototype.slice.call(mutation.addedNodes).filter(n => n.nodeType !== 3).length === 0\n        const onlyTextRemoved = Array.prototype.slice.call(mutation.removedNodes).filter(n => n.nodeType !== 3).length === 0\n        const isTextInput = mutation.type === 'characterData' || (onlyTextAdded && onlyTextRemoved)\n        if (isTextInput) {\n          this.updateValue()\n        }\n      });\n    });\n\n    observer.observe(this.$refs.input, { childList: true, characterData: true, subtree: true })\n  }\n}\n</script>\n<style scoped>\n  * {\n    box-sizing: border-box;\n  }\n  .om-root {\n    position: relative;\n  }\n  .om-input:focus {\n    border: none;\n    outline: none;\n  }\n  .om-completion {\n    height: 100%;\n    width: auto;\n    max-width: 100%;\n    color: lightgray;\n    overflow: hidden;\n    white-space: pre;\n    display: flex;\n    align-items: center;\n  }\n  [contenteditable=\"true\"].single-line {\n    white-space: pre;\n    overflow: hidden;\n  } \n  [contenteditable=\"true\"].single-line br {\n    display:none;\n\n  }\n  [contenteditable=\"true\"].single-line * {\n    display:inline;\n    white-space:nowrap;\n  }\n\n  .om-width--auto {\n    width: auto;\n    float: left;\n    min-width: 10px;\n  }\n\n  .om-width--full {\n    float: left;\n    width: 100%;\n  }\n\n  .om-placeholder {\n    display: block;\n    height: 100%;\n    width: 100%;\n    float: left;\n    color: darkgray;\n  }\n  .om-list-container {\n    position: relative;\n  }\n  .om-list {\n    position: absolute;\n    width: 100%;\n    border-left: 1px solid lightgray;\n    border-right: 1px solid lightgray;\n    border-bottom: 1px solid lightgray;\n    padding: 4px 8px;\n    background-color: white;\n    z-index: 1001;\n  }\n  .om-highlight {\n    background-color: lightgrey;\n  }\n  .om-list-item {\n    font-weight: 500;\n    cursor: pointer;\n  }\n\n  .om-list-item:hover {\n    background-color: lightgray;\n  }\n\n  .om-search {\n    vertical-align: middle;\n    background-color: transparent;\n    border: none;\n    overflow: hidden;\n  }\n\n  .om-search-container {\n    border: 1px solid lightgray;\n    display: flex;\n    padding: 4px 8px;\n    border-radius: 3px;\n  }\n\n  .om-has-focus {\n    border: 2px solid navy;\n    padding: 3px 7px;\n  }\n\n  .om-visually-hidden:not(:focus):not(:active) { \n    position: absolute !important;\n    height: 1px; \n    width: 1px;\n    overflow: hidden;\n    clip: rect(1px 1px 1px 1px); /* IE6, IE7 */\n    clip: rect(1px, 1px, 1px, 1px);\n    white-space: nowrap; /* added line */\n  }\n</style>\n"]
    },
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__ = "data-v-4a540f18";
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, createInjector, undefined, undefined);

function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component('Omnibox', component);
} // Create module definition for Vue.use()

var plugin = {
  install: install
}; // Auto-install when vue is found (eg. in browser via <script> tag)

var GlobalVue = null;

if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin);
} // To allow use as module (npm/webpack/etc.) export component

export default __vue_component__;
export { install };
