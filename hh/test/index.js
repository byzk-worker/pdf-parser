import SparkMD5 from 'spark-md5';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var lib$1 = {};

var lib = {};

var websocket$2 = {};

var data = {};

var marshal = {};

var types$1 = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SocketDataError = exports.FieldType = void 0;
	(function (FieldType) {
	    FieldType[FieldType["STRING"] = 1] = "STRING";
	    FieldType[FieldType["INTEGER"] = 2] = "INTEGER";
	    FieldType[FieldType["DOUBLE"] = 3] = "DOUBLE";
	    FieldType[FieldType["BOOL"] = 4] = "BOOL";
	    FieldType[FieldType["LIST"] = 5] = "LIST";
	    FieldType[FieldType["STRUCT"] = 6] = "STRUCT";
	    FieldType[FieldType["VOID"] = 7] = "VOID";
	    FieldType[FieldType["ERROR"] = 8] = "ERROR";
	})(exports.FieldType || (exports.FieldType = {}));
	class SocketDataError extends Error {
	    constructor(msg) {
	        super(msg);
	        this.name = "数据序列化错误";
	    }
	}
	exports.SocketDataError = SocketDataError;
} (types$1));

var utils = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.requireFn = exports.getLineContentByFile = exports.getFieldTypeByFieldTypeStr = exports.getLineContent = exports.getListEleFieldType = exports.joinLineStr = exports.getFieldType = exports.ObjectKeys = exports.newLine = void 0;
	const types_1 = types$1;
	exports.newLine = '\n';
	function ObjectKeys(data) {
	    let names = [];
	    for (let d in data) {
	        names.push(d);
	    }
	    return names;
	}
	exports.ObjectKeys = ObjectKeys;
	function getFieldType(data) {
	    if (data instanceof Array) {
	        return types_1.FieldType.LIST;
	    }
	    switch (typeof data) {
	        case "boolean":
	            return types_1.FieldType.BOOL;
	        case "string":
	            return types_1.FieldType.STRING;
	        case "object":
	            return types_1.FieldType.STRUCT;
	        case "number":
	            const numData = data + "";
	            if (numData.includes(".")) {
	                return types_1.FieldType.DOUBLE;
	            }
	            return types_1.FieldType.INTEGER;
	        default:
	            throw new types_1.SocketDataError("获取数据类型失败");
	    }
	}
	exports.getFieldType = getFieldType;
	function joinLineStr(str) {
	    return str + exports.newLine;
	}
	exports.joinLineStr = joinLineStr;
	function getListEleFieldType(data) {
	    if (data.length == 0) {
	        return undefined;
	    }
	    const firstEleFieldType = getFieldType(data[0]);
	    for (let i = 1; i < data.length; i++) {
	        if (getFieldType(data[i]) !== firstEleFieldType) {
	            throw new types_1.SocketDataError("数组内元素必须保持一致");
	        }
	    }
	    return firstEleFieldType;
	}
	exports.getListEleFieldType = getListEleFieldType;
	function getLineContent(data) {
	    const tmpD = data[0];
	    const index = tmpD.indexOf(exports.newLine);
	    if (index < 0) {
	        return "";
	    }
	    const content = tmpD.substring(0, index);
	    data[0] = tmpD.substring(index + 1);
	    return content;
	}
	exports.getLineContent = getLineContent;
	function getFieldTypeByFieldTypeStr(str) {
	    const typeInt = parseInt(str);
	    if (typeInt < types_1.FieldType.STRING || typeInt > types_1.FieldType.ERROR) {
	        throw new types_1.SocketDataError("获取字段类型失败");
	    }
	    return typeInt;
	}
	exports.getFieldTypeByFieldTypeStr = getFieldTypeByFieldTypeStr;
	function getLineContentByFile(fs, fd, Buffer) {
	    const buffer = Buffer.alloc(1);
	    let lineStr = "";
	    while (true) {
	        const num = fs.readSync(fd, buffer, 0, 1, null);
	        if (num == 0) {
	            // throw new SocketDataError("读取文件内容失败");
	            return "";
	        }
	        const bufStr = buffer.toString("utf-8");
	        if (bufStr === exports.newLine) {
	            return lineStr;
	        }
	        lineStr += bufStr;
	    }
	}
	exports.getLineContentByFile = getLineContentByFile;
	exports.requireFn = commonjsRequire || (window && window.require);
} (utils));

var websocketClient = {};

var event$1 = {exports: {}};

var browserCrypto = {};

var hasRequiredBrowserCrypto;

function requireBrowserCrypto () {
	if (hasRequiredBrowserCrypto) return browserCrypto;
	hasRequiredBrowserCrypto = 1;

	if (commonjsGlobal.crypto && commonjsGlobal.crypto.getRandomValues) {
	  browserCrypto.randomBytes = function(length) {
	    var bytes = new Uint8Array(length);
	    commonjsGlobal.crypto.getRandomValues(bytes);
	    return bytes;
	  };
	} else {
	  browserCrypto.randomBytes = function(length) {
	    var bytes = new Array(length);
	    for (var i = 0; i < length; i++) {
	      bytes[i] = Math.floor(Math.random() * 256);
	    }
	    return bytes;
	  };
	}
	return browserCrypto;
}

var random;
var hasRequiredRandom;

function requireRandom () {
	if (hasRequiredRandom) return random;
	hasRequiredRandom = 1;

	var crypto = requireBrowserCrypto();

	// This string has length 32, a power of 2, so the modulus doesn't introduce a
	// bias.
	var _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345';
	random = {
	  string: function(length) {
	    var max = _randomStringChars.length;
	    var bytes = crypto.randomBytes(length);
	    var ret = [];
	    for (var i = 0; i < length; i++) {
	      ret.push(_randomStringChars.substr(bytes[i] % max, 1));
	    }
	    return ret.join('');
	  }

	, number: function(max) {
	    return Math.floor(Math.random() * max);
	  }

	, numberString: function(max) {
	    var t = ('' + (max - 1)).length;
	    var p = new Array(t + 1).join('0');
	    return (p + this.number(max)).slice(-t);
	  }
	};
	return random;
}

var hasRequiredEvent$1;

function requireEvent$1 () {
	if (hasRequiredEvent$1) return event$1.exports;
	hasRequiredEvent$1 = 1;
	(function (module) {

		var random = requireRandom();

		var onUnload = {}
		  , afterUnload = false
		    // detect google chrome packaged apps because they don't allow the 'unload' event
		  , isChromePackagedApp = commonjsGlobal.chrome && commonjsGlobal.chrome.app && commonjsGlobal.chrome.app.runtime
		  ;

		module.exports = {
		  attachEvent: function(event, listener) {
		    if (typeof commonjsGlobal.addEventListener !== 'undefined') {
		      commonjsGlobal.addEventListener(event, listener, false);
		    } else if (commonjsGlobal.document && commonjsGlobal.attachEvent) {
		      // IE quirks.
		      // According to: http://stevesouders.com/misc/test-postmessage.php
		      // the message gets delivered only to 'document', not 'window'.
		      commonjsGlobal.document.attachEvent('on' + event, listener);
		      // I get 'window' for ie8.
		      commonjsGlobal.attachEvent('on' + event, listener);
		    }
		  }

		, detachEvent: function(event, listener) {
		    if (typeof commonjsGlobal.addEventListener !== 'undefined') {
		      commonjsGlobal.removeEventListener(event, listener, false);
		    } else if (commonjsGlobal.document && commonjsGlobal.detachEvent) {
		      commonjsGlobal.document.detachEvent('on' + event, listener);
		      commonjsGlobal.detachEvent('on' + event, listener);
		    }
		  }

		, unloadAdd: function(listener) {
		    if (isChromePackagedApp) {
		      return null;
		    }

		    var ref = random.string(8);
		    onUnload[ref] = listener;
		    if (afterUnload) {
		      setTimeout(this.triggerUnloadCallbacks, 0);
		    }
		    return ref;
		  }

		, unloadDel: function(ref) {
		    if (ref in onUnload) {
		      delete onUnload[ref];
		    }
		  }

		, triggerUnloadCallbacks: function() {
		    for (var ref in onUnload) {
		      onUnload[ref]();
		      delete onUnload[ref];
		    }
		  }
		};

		var unloadTriggered = function() {
		  if (afterUnload) {
		    return;
		  }
		  afterUnload = true;
		  module.exports.triggerUnloadCallbacks();
		};

		// 'unload' alone is not reliable in opera within an iframe, but we
		// can't use `beforeunload` as IE fires it on javascript: links.
		if (!isChromePackagedApp) {
		  module.exports.attachEvent('unload', unloadTriggered);
		}
} (event$1));
	return event$1.exports;
}

var requiresPort;
var hasRequiredRequiresPort;

function requireRequiresPort () {
	if (hasRequiredRequiresPort) return requiresPort;
	hasRequiredRequiresPort = 1;

	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	requiresPort = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;

	  if (!port) return false;

	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;

	    case 'https':
	    case 'wss':
	    return port !== 443;

	    case 'ftp':
	    return port !== 21;

	    case 'gopher':
	    return port !== 70;

	    case 'file':
	    return false;
	  }

	  return port !== 0;
	};
	return requiresPort;
}

var querystringify = {};

var hasRequiredQuerystringify;

function requireQuerystringify () {
	if (hasRequiredQuerystringify) return querystringify;
	hasRequiredQuerystringify = 1;

	var has = Object.prototype.hasOwnProperty
	  , undef;

	/**
	 * Decode a URI encoded string.
	 *
	 * @param {String} input The URI encoded string.
	 * @returns {String|Null} The decoded string.
	 * @api private
	 */
	function decode(input) {
	  try {
	    return decodeURIComponent(input.replace(/\+/g, ' '));
	  } catch (e) {
	    return null;
	  }
	}

	/**
	 * Attempts to encode a given input.
	 *
	 * @param {String} input The string that needs to be encoded.
	 * @returns {String|Null} The encoded string.
	 * @api private
	 */
	function encode(input) {
	  try {
	    return encodeURIComponent(input);
	  } catch (e) {
	    return null;
	  }
	}

	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?#&]+)=?([^&]*)/g
	    , result = {}
	    , part;

	  while (part = parser.exec(query)) {
	    var key = decode(part[1])
	      , value = decode(part[2]);

	    //
	    // Prevent overriding of existing properties. This ensures that build-in
	    // methods like `toString` or __proto__ are not overriden by malicious
	    // querystrings.
	    //
	    // In the case if failed decoding, we want to omit the key/value pairs
	    // from the result.
	    //
	    if (key === null || value === null || key in result) continue;
	    result[key] = value;
	  }

	  return result;
	}

	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify$1(obj, prefix) {
	  prefix = prefix || '';

	  var pairs = []
	    , value
	    , key;

	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';

	  for (key in obj) {
	    if (has.call(obj, key)) {
	      value = obj[key];

	      //
	      // Edge cases where we actually want to encode the value to an empty
	      // string instead of the stringified value.
	      //
	      if (!value && (value === null || value === undef || isNaN(value))) {
	        value = '';
	      }

	      key = encode(key);
	      value = encode(value);

	      //
	      // If we failed to encode the strings, we should bail out as we don't
	      // want to add invalid strings to the query.
	      //
	      if (key === null || value === null) continue;
	      pairs.push(key +'='+ value);
	    }
	  }

	  return pairs.length ? prefix + pairs.join('&') : '';
	}

	//
	// Expose the module.
	//
	querystringify.stringify = querystringify$1;
	querystringify.parse = querystring;
	return querystringify;
}

var urlParse;
var hasRequiredUrlParse;

function requireUrlParse () {
	if (hasRequiredUrlParse) return urlParse;
	hasRequiredUrlParse = 1;

	var required = requireRequiresPort()
	  , qs = requireQuerystringify()
	  , controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/
	  , CRHTLF = /[\n\r\t]/g
	  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
	  , port = /:\d+$/
	  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i
	  , windowsDriveLetter = /^[a-zA-Z]:/;

	/**
	 * Remove control characters and whitespace from the beginning of a string.
	 *
	 * @param {Object|String} str String to trim.
	 * @returns {String} A new string representing `str` stripped of control
	 *     characters and whitespace from its beginning.
	 * @public
	 */
	function trimLeft(str) {
	  return (str ? str : '').toString().replace(controlOrWhitespace, '');
	}

	/**
	 * These are the parse rules for the URL parser, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var rules = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  function sanitize(address, url) {     // Sanitize what is left of the address
	    return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
	  },
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/:(\d*)$/, 'port', undefined, 1],    // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];

	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 };

	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @public
	 */
	function lolcation(loc) {
	  var globalVar;

	  if (typeof window !== 'undefined') globalVar = window;
	  else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
	  else if (typeof self !== 'undefined') globalVar = self;
	  else globalVar = {};

	  var location = globalVar.location || {};
	  loc = loc || location;

	  var finaldestination = {}
	    , type = typeof loc
	    , key;

	  if ('blob:' === loc.protocol) {
	    finaldestination = new Url(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new Url(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) {
	    for (key in loc) {
	      if (key in ignore) continue;
	      finaldestination[key] = loc[key];
	    }

	    if (finaldestination.slashes === undefined) {
	      finaldestination.slashes = slashes.test(loc.href);
	    }
	  }

	  return finaldestination;
	}

	/**
	 * Check whether a protocol scheme is special.
	 *
	 * @param {String} The protocol scheme of the URL
	 * @return {Boolean} `true` if the protocol scheme is special, else `false`
	 * @private
	 */
	function isSpecial(scheme) {
	  return (
	    scheme === 'file:' ||
	    scheme === 'ftp:' ||
	    scheme === 'http:' ||
	    scheme === 'https:' ||
	    scheme === 'ws:' ||
	    scheme === 'wss:'
	  );
	}

	/**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase.
	 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
	 * @property {String} rest Rest of the URL that is not part of the protocol.
	 */

	/**
	 * Extract protocol information from a URL with/without double slash ("//").
	 *
	 * @param {String} address URL we want to extract from.
	 * @param {Object} location
	 * @return {ProtocolExtract} Extracted information.
	 * @private
	 */
	function extractProtocol(address, location) {
	  address = trimLeft(address);
	  address = address.replace(CRHTLF, '');
	  location = location || {};

	  var match = protocolre.exec(address);
	  var protocol = match[1] ? match[1].toLowerCase() : '';
	  var forwardSlashes = !!match[2];
	  var otherSlashes = !!match[3];
	  var slashesCount = 0;
	  var rest;

	  if (forwardSlashes) {
	    if (otherSlashes) {
	      rest = match[2] + match[3] + match[4];
	      slashesCount = match[2].length + match[3].length;
	    } else {
	      rest = match[2] + match[4];
	      slashesCount = match[2].length;
	    }
	  } else {
	    if (otherSlashes) {
	      rest = match[3] + match[4];
	      slashesCount = match[3].length;
	    } else {
	      rest = match[4];
	    }
	  }

	  if (protocol === 'file:') {
	    if (slashesCount >= 2) {
	      rest = rest.slice(2);
	    }
	  } else if (isSpecial(protocol)) {
	    rest = match[4];
	  } else if (protocol) {
	    if (forwardSlashes) {
	      rest = rest.slice(2);
	    }
	  } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
	    rest = match[4];
	  }

	  return {
	    protocol: protocol,
	    slashes: forwardSlashes || isSpecial(protocol),
	    slashesCount: slashesCount,
	    rest: rest
	  };
	}

	/**
	 * Resolve a relative URL pathname against a base URL pathname.
	 *
	 * @param {String} relative Pathname of the relative URL.
	 * @param {String} base Pathname of the base URL.
	 * @return {String} Resolved pathname.
	 * @private
	 */
	function resolve(relative, base) {
	  if (relative === '') return base;

	  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
	    , i = path.length
	    , last = path[i - 1]
	    , unshift = false
	    , up = 0;

	  while (i--) {
	    if (path[i] === '.') {
	      path.splice(i, 1);
	    } else if (path[i] === '..') {
	      path.splice(i, 1);
	      up++;
	    } else if (up) {
	      if (i === 0) unshift = true;
	      path.splice(i, 1);
	      up--;
	    }
	  }

	  if (unshift) path.unshift('');
	  if (last === '.' || last === '..') path.push('');

	  return path.join('/');
	}

	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my OCD.
	 *
	 * It is worth noting that we should not use `URL` as class name to prevent
	 * clashes with the global URL instance that got introduced in browsers.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} [location] Location defaults for relative paths.
	 * @param {Boolean|Function} [parser] Parser for the query string.
	 * @private
	 */
	function Url(address, location, parser) {
	  address = trimLeft(address);
	  address = address.replace(CRHTLF, '');

	  if (!(this instanceof Url)) {
	    return new Url(address, location, parser);
	  }

	  var relative, extracted, parse, instruction, index, key
	    , instructions = rules.slice()
	    , type = typeof location
	    , url = this
	    , i = 0;

	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }

	  if (parser && 'function' !== typeof parser) parser = qs.parse;

	  location = lolcation(location);

	  //
	  // Extract protocol information before running the instructions.
	  //
	  extracted = extractProtocol(address || '', location);
	  relative = !extracted.protocol && !extracted.slashes;
	  url.slashes = extracted.slashes || relative && location.slashes;
	  url.protocol = extracted.protocol || location.protocol || '';
	  address = extracted.rest;

	  //
	  // When the authority component is absent the URL starts with a path
	  // component.
	  //
	  if (
	    extracted.protocol === 'file:' && (
	      extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
	    (!extracted.slashes &&
	      (extracted.protocol ||
	        extracted.slashesCount < 2 ||
	        !isSpecial(url.protocol)))
	  ) {
	    instructions[3] = [/(.*)/, 'pathname'];
	  }

	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];

	    if (typeof instruction === 'function') {
	      address = instruction(address, url);
	      continue;
	    }

	    parse = instruction[0];
	    key = instruction[1];

	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      index = parse === '@'
	        ? address.lastIndexOf(parse)
	        : address.indexOf(parse);

	      if (~index) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if ((index = parse.exec(address))) {
	      url[key] = index[1];
	      address = address.slice(0, index.index);
	    }

	    url[key] = url[key] || (
	      relative && instruction[3] ? location[key] || '' : ''
	    );

	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) url[key] = url[key].toLowerCase();
	  }

	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);

	  //
	  // If the URL is relative, resolve the pathname against the base URL.
	  //
	  if (
	      relative
	    && location.slashes
	    && url.pathname.charAt(0) !== '/'
	    && (url.pathname !== '' || location.pathname !== '')
	  ) {
	    url.pathname = resolve(url.pathname, location.pathname);
	  }

	  //
	  // Default to a / for pathname if none exists. This normalizes the URL
	  // to always have a /
	  //
	  if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
	    url.pathname = '/' + url.pathname;
	  }

	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }

	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';

	  if (url.auth) {
	    index = url.auth.indexOf(':');

	    if (~index) {
	      url.username = url.auth.slice(0, index);
	      url.username = encodeURIComponent(decodeURIComponent(url.username));

	      url.password = url.auth.slice(index + 1);
	      url.password = encodeURIComponent(decodeURIComponent(url.password));
	    } else {
	      url.username = encodeURIComponent(decodeURIComponent(url.auth));
	    }

	    url.auth = url.password ? url.username +':'+ url.password : url.username;
	  }

	  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
	    ? url.protocol +'//'+ url.host
	    : 'null';

	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}

	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} part          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function
	 *                               used to parse the query.
	 *                               When setting the protocol, double slash will be
	 *                               removed from the final url if it is true.
	 * @returns {URL} URL instance for chaining.
	 * @public
	 */
	function set(part, value, fn) {
	  var url = this;

	  switch (part) {
	    case 'query':
	      if ('string' === typeof value && value.length) {
	        value = (fn || qs.parse)(value);
	      }

	      url[part] = value;
	      break;

	    case 'port':
	      url[part] = value;

	      if (!required(value, url.protocol)) {
	        url.host = url.hostname;
	        url[part] = '';
	      } else if (value) {
	        url.host = url.hostname +':'+ value;
	      }

	      break;

	    case 'hostname':
	      url[part] = value;

	      if (url.port) value += ':'+ url.port;
	      url.host = value;
	      break;

	    case 'host':
	      url[part] = value;

	      if (port.test(value)) {
	        value = value.split(':');
	        url.port = value.pop();
	        url.hostname = value.join(':');
	      } else {
	        url.hostname = value;
	        url.port = '';
	      }

	      break;

	    case 'protocol':
	      url.protocol = value.toLowerCase();
	      url.slashes = !fn;
	      break;

	    case 'pathname':
	    case 'hash':
	      if (value) {
	        var char = part === 'pathname' ? '/' : '#';
	        url[part] = value.charAt(0) !== char ? char + value : value;
	      } else {
	        url[part] = value;
	      }
	      break;

	    case 'username':
	    case 'password':
	      url[part] = encodeURIComponent(value);
	      break;

	    case 'auth':
	      var index = value.indexOf(':');

	      if (~index) {
	        url.username = value.slice(0, index);
	        url.username = encodeURIComponent(decodeURIComponent(url.username));

	        url.password = value.slice(index + 1);
	        url.password = encodeURIComponent(decodeURIComponent(url.password));
	      } else {
	        url.username = encodeURIComponent(decodeURIComponent(value));
	      }
	  }

	  for (var i = 0; i < rules.length; i++) {
	    var ins = rules[i];

	    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
	  }

	  url.auth = url.password ? url.username +':'+ url.password : url.username;

	  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
	    ? url.protocol +'//'+ url.host
	    : 'null';

	  url.href = url.toString();

	  return url;
	}

	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String} Compiled version of the URL.
	 * @public
	 */
	function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

	  var query
	    , url = this
	    , host = url.host
	    , protocol = url.protocol;

	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

	  var result =
	    protocol +
	    ((url.protocol && url.slashes) || isSpecial(url.protocol) ? '//' : '');

	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  } else if (url.password) {
	    result += ':'+ url.password;
	    result += '@';
	  } else if (
	    url.protocol !== 'file:' &&
	    isSpecial(url.protocol) &&
	    !host &&
	    url.pathname !== '/'
	  ) {
	    //
	    // Add back the empty userinfo, otherwise the original invalid URL
	    // might be transformed into a valid one with `url.pathname` as host.
	    //
	    result += '@';
	  }

	  //
	  // Trailing colon is removed from `url.host` when it is parsed. If it still
	  // ends with a colon, then add back the trailing colon that was removed. This
	  // prevents an invalid URL from being transformed into a valid one.
	  //
	  if (host[host.length - 1] === ':' || (port.test(url.hostname) && !url.port)) {
	    host += ':';
	  }

	  result += host + url.pathname;

	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

	  if (url.hash) result += url.hash;

	  return result;
	}

	Url.prototype = { set: set, toString: toString };

	//
	// Expose the URL parser and some additional properties that might be useful for
	// others or testing.
	//
	Url.extractProtocol = extractProtocol;
	Url.location = lolcation;
	Url.trimLeft = trimLeft;
	Url.qs = qs;

	urlParse = Url;
	return urlParse;
}

var browser$1 = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;

	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */
	function setup(env) {
	  createDebug.debug = createDebug;
	  createDebug.default = createDebug;
	  createDebug.coerce = coerce;
	  createDebug.disable = disable;
	  createDebug.enable = enable;
	  createDebug.enabled = enabled;
	  createDebug.humanize = requireMs();
	  Object.keys(env).forEach(function (key) {
	    createDebug[key] = env[key];
	  });
	  /**
	  * Active `debug` instances.
	  */

	  createDebug.instances = [];
	  /**
	  * The currently active debug mode names, and names to skip.
	  */

	  createDebug.names = [];
	  createDebug.skips = [];
	  /**
	  * Map of special "%n" handling functions, for the debug "format" argument.
	  *
	  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	  */

	  createDebug.formatters = {};
	  /**
	  * Selects a color for a debug namespace
	  * @param {String} namespace The namespace string for the for the debug instance to be colored
	  * @return {Number|String} An ANSI color code for the given namespace
	  * @api private
	  */

	  function selectColor(namespace) {
	    var hash = 0;

	    for (var i = 0; i < namespace.length; i++) {
	      hash = (hash << 5) - hash + namespace.charCodeAt(i);
	      hash |= 0; // Convert to 32bit integer
	    }

	    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	  }

	  createDebug.selectColor = selectColor;
	  /**
	  * Create a debugger with the given `namespace`.
	  *
	  * @param {String} namespace
	  * @return {Function}
	  * @api public
	  */

	  function createDebug(namespace) {
	    var prevTime;

	    function debug() {
	      // Disabled?
	      if (!debug.enabled) {
	        return;
	      }

	      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      var self = debug; // Set `diff` timestamp

	      var curr = Number(new Date());
	      var ms = curr - (prevTime || curr);
	      self.diff = ms;
	      self.prev = prevTime;
	      self.curr = curr;
	      prevTime = curr;
	      args[0] = createDebug.coerce(args[0]);

	      if (typeof args[0] !== 'string') {
	        // Anything else let's inspect with %O
	        args.unshift('%O');
	      } // Apply any `formatters` transformations


	      var index = 0;
	      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
	        // If we encounter an escaped % then don't increase the array index
	        if (match === '%%') {
	          return match;
	        }

	        index++;
	        var formatter = createDebug.formatters[format];

	        if (typeof formatter === 'function') {
	          var val = args[index];
	          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

	          args.splice(index, 1);
	          index--;
	        }

	        return match;
	      }); // Apply env-specific formatting (colors, etc.)

	      createDebug.formatArgs.call(self, args);
	      var logFn = self.log || createDebug.log;
	      logFn.apply(self, args);
	    }

	    debug.namespace = namespace;
	    debug.enabled = createDebug.enabled(namespace);
	    debug.useColors = createDebug.useColors();
	    debug.color = selectColor(namespace);
	    debug.destroy = destroy;
	    debug.extend = extend; // Debug.formatArgs = formatArgs;
	    // debug.rawLog = rawLog;
	    // env-specific initialization logic for debug instances

	    if (typeof createDebug.init === 'function') {
	      createDebug.init(debug);
	    }

	    createDebug.instances.push(debug);
	    return debug;
	  }

	  function destroy() {
	    var index = createDebug.instances.indexOf(this);

	    if (index !== -1) {
	      createDebug.instances.splice(index, 1);
	      return true;
	    }

	    return false;
	  }

	  function extend(namespace, delimiter) {
	    return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
	  }
	  /**
	  * Enables a debug mode by namespaces. This can include modes
	  * separated by a colon and wildcards.
	  *
	  * @param {String} namespaces
	  * @api public
	  */


	  function enable(namespaces) {
	    createDebug.save(namespaces);
	    createDebug.names = [];
	    createDebug.skips = [];
	    var i;
	    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
	    var len = split.length;

	    for (i = 0; i < len; i++) {
	      if (!split[i]) {
	        // ignore empty strings
	        continue;
	      }

	      namespaces = split[i].replace(/\*/g, '.*?');

	      if (namespaces[0] === '-') {
	        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	      } else {
	        createDebug.names.push(new RegExp('^' + namespaces + '$'));
	      }
	    }

	    for (i = 0; i < createDebug.instances.length; i++) {
	      var instance = createDebug.instances[i];
	      instance.enabled = createDebug.enabled(instance.namespace);
	    }
	  }
	  /**
	  * Disable debug output.
	  *
	  * @api public
	  */


	  function disable() {
	    createDebug.enable('');
	  }
	  /**
	  * Returns true if the given mode name is enabled, false otherwise.
	  *
	  * @param {String} name
	  * @return {Boolean}
	  * @api public
	  */


	  function enabled(name) {
	    if (name[name.length - 1] === '*') {
	      return true;
	    }

	    var i;
	    var len;

	    for (i = 0, len = createDebug.skips.length; i < len; i++) {
	      if (createDebug.skips[i].test(name)) {
	        return false;
	      }
	    }

	    for (i = 0, len = createDebug.names.length; i < len; i++) {
	      if (createDebug.names[i].test(name)) {
	        return true;
	      }
	    }

	    return false;
	  }
	  /**
	  * Coerce `val`.
	  *
	  * @param {Mixed} val
	  * @return {Mixed}
	  * @api private
	  */


	  function coerce(val) {
	    if (val instanceof Error) {
	      return val.stack || val.message;
	    }

	    return val;
	  }

	  createDebug.enable(createDebug.load());
	  return createDebug;
	}

	common = setup;
	return common;
}

var hasRequiredBrowser$1;

function requireBrowser$1 () {
	if (hasRequiredBrowser$1) return browser$1.exports;
	hasRequiredBrowser$1 = 1;
	(function (module, exports) {

		function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

		/* eslint-env browser */

		/**
		 * This is the web browser implementation of `debug()`.
		 */
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		/**
		 * Colors.
		 */

		exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */
		// eslint-disable-next-line complexity

		function useColors() {
		  // NB: In an Electron preload script, document will be defined but not fully
		  // initialized. Since we know we're in Chrome, we'll just detect this case
		  // explicitly
		  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		    return true;
		  } // Internet Explorer and Edge do not support colors.


		  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		    return false;
		  } // Is webkit? http://stackoverflow.com/a/16459606/376773
		  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


		  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
		  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
		  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
		  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
		}
		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */


		function formatArgs(args) {
		  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

		  if (!this.useColors) {
		    return;
		  }

		  var c = 'color: ' + this.color;
		  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
		  // arguments passed either before or after the %c, so we need to
		  // figure out the correct index to insert the CSS into

		  var index = 0;
		  var lastC = 0;
		  args[0].replace(/%[a-zA-Z%]/g, function (match) {
		    if (match === '%%') {
		      return;
		    }

		    index++;

		    if (match === '%c') {
		      // We only are interested in the *last* %c
		      // (the user may have provided their own)
		      lastC = index;
		    }
		  });
		  args.splice(lastC, 0, c);
		}
		/**
		 * Invokes `console.log()` when available.
		 * No-op when `console.log` is not a "function".
		 *
		 * @api public
		 */


		function log() {
		  var _console;

		  // This hackery is required for IE8/9, where
		  // the `console.log` function doesn't have 'apply'
		  return (typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && (_console = console).log.apply(_console, arguments);
		}
		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */


		function save(namespaces) {
		  try {
		    if (namespaces) {
		      exports.storage.setItem('debug', namespaces);
		    } else {
		      exports.storage.removeItem('debug');
		    }
		  } catch (error) {// Swallow
		    // XXX (@Qix-) should we be logging these?
		  }
		}
		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */


		function load() {
		  var r;

		  try {
		    r = exports.storage.getItem('debug');
		  } catch (error) {} // Swallow
		  // XXX (@Qix-) should we be logging these?
		  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


		  if (!r && typeof process !== 'undefined' && 'env' in process) {
		    r = process.env.DEBUG;
		  }

		  return r;
		}
		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */


		function localstorage() {
		  try {
		    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		    // The Browser also has localStorage in the global context.
		    return localStorage;
		  } catch (error) {// Swallow
		    // XXX (@Qix-) should we be logging these?
		  }
		}

		module.exports = requireCommon()(exports);
		var formatters = module.exports.formatters;
		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
		  try {
		    return JSON.stringify(v);
		  } catch (error) {
		    return '[UnexpectedJSONParseError]: ' + error.message;
		  }
		};
} (browser$1, browser$1.exports));
	return browser$1.exports;
}

var url;
var hasRequiredUrl;

function requireUrl () {
	if (hasRequiredUrl) return url;
	hasRequiredUrl = 1;

	var URL = requireUrlParse();

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:utils:url');
	}

	url = {
	  getOrigin: function(url) {
	    if (!url) {
	      return null;
	    }

	    var p = new URL(url);
	    if (p.protocol === 'file:') {
	      return null;
	    }

	    var port = p.port;
	    if (!port) {
	      port = (p.protocol === 'https:') ? '443' : '80';
	    }

	    return p.protocol + '//' + p.hostname + ':' + port;
	  }

	, isOriginEqual: function(a, b) {
	    var res = this.getOrigin(a) === this.getOrigin(b);
	    debug('same', a, b, res);
	    return res;
	  }

	, isSchemeEqual: function(a, b) {
	    return (a.split(':')[0] === b.split(':')[0]);
	  }

	, addPath: function (url, path) {
	    var qs = url.split('?');
	    return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
	  }

	, addQuery: function (url, q) {
	    return url + (url.indexOf('?') === -1 ? ('?' + q) : ('&' + q));
	  }

	, isLoopbackAddr: function (addr) {
	    return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^\[::1\]$/.test(addr);
	  }
	};
	return url;
}

var inherits_browser = {exports: {}};

var hasRequiredInherits_browser;

function requireInherits_browser () {
	if (hasRequiredInherits_browser) return inherits_browser.exports;
	hasRequiredInherits_browser = 1;
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	          value: ctor,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	    }
	  };
	} else {
	  // old school shim for old browsers
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      var TempCtor = function () {};
	      TempCtor.prototype = superCtor.prototype;
	      ctor.prototype = new TempCtor();
	      ctor.prototype.constructor = ctor;
	    }
	  };
	}
	return inherits_browser.exports;
}

var emitter = {};

var eventtarget;
var hasRequiredEventtarget;

function requireEventtarget () {
	if (hasRequiredEventtarget) return eventtarget;
	hasRequiredEventtarget = 1;

	/* Simplified implementation of DOM2 EventTarget.
	 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
	 */

	function EventTarget() {
	  this._listeners = {};
	}

	EventTarget.prototype.addEventListener = function(eventType, listener) {
	  if (!(eventType in this._listeners)) {
	    this._listeners[eventType] = [];
	  }
	  var arr = this._listeners[eventType];
	  // #4
	  if (arr.indexOf(listener) === -1) {
	    // Make a copy so as not to interfere with a current dispatchEvent.
	    arr = arr.concat([listener]);
	  }
	  this._listeners[eventType] = arr;
	};

	EventTarget.prototype.removeEventListener = function(eventType, listener) {
	  var arr = this._listeners[eventType];
	  if (!arr) {
	    return;
	  }
	  var idx = arr.indexOf(listener);
	  if (idx !== -1) {
	    if (arr.length > 1) {
	      // Make a copy so as not to interfere with a current dispatchEvent.
	      this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1));
	    } else {
	      delete this._listeners[eventType];
	    }
	    return;
	  }
	};

	EventTarget.prototype.dispatchEvent = function() {
	  var event = arguments[0];
	  var t = event.type;
	  // equivalent of Array.prototype.slice.call(arguments, 0);
	  var args = arguments.length === 1 ? [event] : Array.apply(null, arguments);
	  // TODO: This doesn't match the real behavior; per spec, onfoo get
	  // their place in line from the /first/ time they're set from
	  // non-null. Although WebKit bumps it to the end every time it's
	  // set.
	  if (this['on' + t]) {
	    this['on' + t].apply(this, args);
	  }
	  if (t in this._listeners) {
	    // Grab a reference to the listeners list. removeEventListener may alter the list.
	    var listeners = this._listeners[t];
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i].apply(this, args);
	    }
	  }
	};

	eventtarget = EventTarget;
	return eventtarget;
}

var hasRequiredEmitter;

function requireEmitter () {
	if (hasRequiredEmitter) return emitter;
	hasRequiredEmitter = 1;

	var inherits = requireInherits_browser()
	  , EventTarget = requireEventtarget()
	  ;

	function EventEmitter() {
	  EventTarget.call(this);
	}

	inherits(EventEmitter, EventTarget);

	EventEmitter.prototype.removeAllListeners = function(type) {
	  if (type) {
	    delete this._listeners[type];
	  } else {
	    this._listeners = {};
	  }
	};

	EventEmitter.prototype.once = function(type, listener) {
	  var self = this
	    , fired = false;

	  function g() {
	    self.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  this.on(type, g);
	};

	EventEmitter.prototype.emit = function() {
	  var type = arguments[0];
	  var listeners = this._listeners[type];
	  if (!listeners) {
	    return;
	  }
	  // equivalent of Array.prototype.slice.call(arguments, 1);
	  var l = arguments.length;
	  var args = new Array(l - 1);
	  for (var ai = 1; ai < l; ai++) {
	    args[ai - 1] = arguments[ai];
	  }
	  for (var i = 0; i < listeners.length; i++) {
	    listeners[i].apply(this, args);
	  }
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener = EventTarget.prototype.addEventListener;
	EventEmitter.prototype.removeListener = EventTarget.prototype.removeEventListener;

	emitter.EventEmitter = EventEmitter;
	return emitter;
}

var websocket$1 = {exports: {}};

var hasRequiredWebsocket$1;

function requireWebsocket$1 () {
	if (hasRequiredWebsocket$1) return websocket$1.exports;
	hasRequiredWebsocket$1 = 1;

	var Driver = commonjsGlobal.WebSocket || commonjsGlobal.MozWebSocket;
	if (Driver) {
		websocket$1.exports = function WebSocketBrowserDriver(url) {
			return new Driver(url);
		};
	} else {
		websocket$1.exports = undefined;
	}
	return websocket$1.exports;
}

var websocket;
var hasRequiredWebsocket;

function requireWebsocket () {
	if (hasRequiredWebsocket) return websocket;
	hasRequiredWebsocket = 1;

	var utils = requireEvent$1()
	  , urlUtils = requireUrl()
	  , inherits = requireInherits_browser()
	  , EventEmitter = requireEmitter().EventEmitter
	  , WebsocketDriver = requireWebsocket$1()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:websocket');
	}

	function WebSocketTransport(transUrl, ignore, options) {
	  if (!WebSocketTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }

	  EventEmitter.call(this);
	  debug('constructor', transUrl);

	  var self = this;
	  var url = urlUtils.addPath(transUrl, '/websocket');
	  if (url.slice(0, 5) === 'https') {
	    url = 'wss' + url.slice(5);
	  } else {
	    url = 'ws' + url.slice(4);
	  }
	  this.url = url;

	  this.ws = new WebsocketDriver(this.url, [], options);
	  this.ws.onmessage = function(e) {
	    debug('message event', e.data);
	    self.emit('message', e.data);
	  };
	  // Firefox has an interesting bug. If a websocket connection is
	  // created after onunload, it stays alive even when user
	  // navigates away from the page. In such situation let's lie -
	  // let's not open the ws connection at all. See:
	  // https://github.com/sockjs/sockjs-client/issues/28
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=696085
	  this.unloadRef = utils.unloadAdd(function() {
	    debug('unload');
	    self.ws.close();
	  });
	  this.ws.onclose = function(e) {
	    debug('close event', e.code, e.reason);
	    self.emit('close', e.code, e.reason);
	    self._cleanup();
	  };
	  this.ws.onerror = function(e) {
	    debug('error event', e);
	    self.emit('close', 1006, 'WebSocket connection broken');
	    self._cleanup();
	  };
	}

	inherits(WebSocketTransport, EventEmitter);

	WebSocketTransport.prototype.send = function(data) {
	  var msg = '[' + data + ']';
	  debug('send', msg);
	  this.ws.send(msg);
	};

	WebSocketTransport.prototype.close = function() {
	  debug('close');
	  var ws = this.ws;
	  this._cleanup();
	  if (ws) {
	    ws.close();
	  }
	};

	WebSocketTransport.prototype._cleanup = function() {
	  debug('_cleanup');
	  var ws = this.ws;
	  if (ws) {
	    ws.onmessage = ws.onclose = ws.onerror = null;
	  }
	  utils.unloadDel(this.unloadRef);
	  this.unloadRef = this.ws = null;
	  this.removeAllListeners();
	};

	WebSocketTransport.enabled = function() {
	  debug('enabled');
	  return !!WebsocketDriver;
	};
	WebSocketTransport.transportName = 'websocket';

	// In theory, ws should require 1 round trip. But in chrome, this is
	// not very stable over SSL. Most likely a ws connection requires a
	// separate SSL connection, in which case 2 round trips are an
	// absolute minumum.
	WebSocketTransport.roundTrips = 2;

	websocket = WebSocketTransport;
	return websocket;
}

var bufferedSender;
var hasRequiredBufferedSender;

function requireBufferedSender () {
	if (hasRequiredBufferedSender) return bufferedSender;
	hasRequiredBufferedSender = 1;

	var inherits = requireInherits_browser()
	  , EventEmitter = requireEmitter().EventEmitter
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:buffered-sender');
	}

	function BufferedSender(url, sender) {
	  debug(url);
	  EventEmitter.call(this);
	  this.sendBuffer = [];
	  this.sender = sender;
	  this.url = url;
	}

	inherits(BufferedSender, EventEmitter);

	BufferedSender.prototype.send = function(message) {
	  debug('send', message);
	  this.sendBuffer.push(message);
	  if (!this.sendStop) {
	    this.sendSchedule();
	  }
	};

	// For polling transports in a situation when in the message callback,
	// new message is being send. If the sending connection was started
	// before receiving one, it is possible to saturate the network and
	// timeout due to the lack of receiving socket. To avoid that we delay
	// sending messages by some small time, in order to let receiving
	// connection be started beforehand. This is only a halfmeasure and
	// does not fix the big problem, but it does make the tests go more
	// stable on slow networks.
	BufferedSender.prototype.sendScheduleWait = function() {
	  debug('sendScheduleWait');
	  var self = this;
	  var tref;
	  this.sendStop = function() {
	    debug('sendStop');
	    self.sendStop = null;
	    clearTimeout(tref);
	  };
	  tref = setTimeout(function() {
	    debug('timeout');
	    self.sendStop = null;
	    self.sendSchedule();
	  }, 25);
	};

	BufferedSender.prototype.sendSchedule = function() {
	  debug('sendSchedule', this.sendBuffer.length);
	  var self = this;
	  if (this.sendBuffer.length > 0) {
	    var payload = '[' + this.sendBuffer.join(',') + ']';
	    this.sendStop = this.sender(this.url, payload, function(err) {
	      self.sendStop = null;
	      if (err) {
	        debug('error', err);
	        self.emit('close', err.code || 1006, 'Sending error: ' + err);
	        self.close();
	      } else {
	        self.sendScheduleWait();
	      }
	    });
	    this.sendBuffer = [];
	  }
	};

	BufferedSender.prototype._cleanup = function() {
	  debug('_cleanup');
	  this.removeAllListeners();
	};

	BufferedSender.prototype.close = function() {
	  debug('close');
	  this._cleanup();
	  if (this.sendStop) {
	    this.sendStop();
	    this.sendStop = null;
	  }
	};

	bufferedSender = BufferedSender;
	return bufferedSender;
}

var polling;
var hasRequiredPolling;

function requirePolling () {
	if (hasRequiredPolling) return polling;
	hasRequiredPolling = 1;

	var inherits = requireInherits_browser()
	  , EventEmitter = requireEmitter().EventEmitter
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:polling');
	}

	function Polling(Receiver, receiveUrl, AjaxObject) {
	  debug(receiveUrl);
	  EventEmitter.call(this);
	  this.Receiver = Receiver;
	  this.receiveUrl = receiveUrl;
	  this.AjaxObject = AjaxObject;
	  this._scheduleReceiver();
	}

	inherits(Polling, EventEmitter);

	Polling.prototype._scheduleReceiver = function() {
	  debug('_scheduleReceiver');
	  var self = this;
	  var poll = this.poll = new this.Receiver(this.receiveUrl, this.AjaxObject);

	  poll.on('message', function(msg) {
	    debug('message', msg);
	    self.emit('message', msg);
	  });

	  poll.once('close', function(code, reason) {
	    debug('close', code, reason, self.pollIsClosing);
	    self.poll = poll = null;

	    if (!self.pollIsClosing) {
	      if (reason === 'network') {
	        self._scheduleReceiver();
	      } else {
	        self.emit('close', code || 1006, reason);
	        self.removeAllListeners();
	      }
	    }
	  });
	};

	Polling.prototype.abort = function() {
	  debug('abort');
	  this.removeAllListeners();
	  this.pollIsClosing = true;
	  if (this.poll) {
	    this.poll.abort();
	  }
	};

	polling = Polling;
	return polling;
}

var senderReceiver;
var hasRequiredSenderReceiver;

function requireSenderReceiver () {
	if (hasRequiredSenderReceiver) return senderReceiver;
	hasRequiredSenderReceiver = 1;

	var inherits = requireInherits_browser()
	  , urlUtils = requireUrl()
	  , BufferedSender = requireBufferedSender()
	  , Polling = requirePolling()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:sender-receiver');
	}

	function SenderReceiver(transUrl, urlSuffix, senderFunc, Receiver, AjaxObject) {
	  var pollUrl = urlUtils.addPath(transUrl, urlSuffix);
	  debug(pollUrl);
	  var self = this;
	  BufferedSender.call(this, transUrl, senderFunc);

	  this.poll = new Polling(Receiver, pollUrl, AjaxObject);
	  this.poll.on('message', function(msg) {
	    debug('poll message', msg);
	    self.emit('message', msg);
	  });
	  this.poll.once('close', function(code, reason) {
	    debug('poll close', code, reason);
	    self.poll = null;
	    self.emit('close', code, reason);
	    self.close();
	  });
	}

	inherits(SenderReceiver, BufferedSender);

	SenderReceiver.prototype.close = function() {
	  BufferedSender.prototype.close.call(this);
	  debug('close');
	  this.removeAllListeners();
	  if (this.poll) {
	    this.poll.abort();
	    this.poll = null;
	  }
	};

	senderReceiver = SenderReceiver;
	return senderReceiver;
}

var ajaxBased;
var hasRequiredAjaxBased;

function requireAjaxBased () {
	if (hasRequiredAjaxBased) return ajaxBased;
	hasRequiredAjaxBased = 1;

	var inherits = requireInherits_browser()
	  , urlUtils = requireUrl()
	  , SenderReceiver = requireSenderReceiver()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:ajax-based');
	}

	function createAjaxSender(AjaxObject) {
	  return function(url, payload, callback) {
	    debug('create ajax sender', url, payload);
	    var opt = {};
	    if (typeof payload === 'string') {
	      opt.headers = {'Content-type': 'text/plain'};
	    }
	    var ajaxUrl = urlUtils.addPath(url, '/xhr_send');
	    var xo = new AjaxObject('POST', ajaxUrl, payload, opt);
	    xo.once('finish', function(status) {
	      debug('finish', status);
	      xo = null;

	      if (status !== 200 && status !== 204) {
	        return callback(new Error('http status ' + status));
	      }
	      callback();
	    });
	    return function() {
	      debug('abort');
	      xo.close();
	      xo = null;

	      var err = new Error('Aborted');
	      err.code = 1000;
	      callback(err);
	    };
	  };
	}

	function AjaxBasedTransport(transUrl, urlSuffix, Receiver, AjaxObject) {
	  SenderReceiver.call(this, transUrl, urlSuffix, createAjaxSender(AjaxObject), Receiver, AjaxObject);
	}

	inherits(AjaxBasedTransport, SenderReceiver);

	ajaxBased = AjaxBasedTransport;
	return ajaxBased;
}

var xhr;
var hasRequiredXhr;

function requireXhr () {
	if (hasRequiredXhr) return xhr;
	hasRequiredXhr = 1;

	var inherits = requireInherits_browser()
	  , EventEmitter = requireEmitter().EventEmitter
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:receiver:xhr');
	}

	function XhrReceiver(url, AjaxObject) {
	  debug(url);
	  EventEmitter.call(this);
	  var self = this;

	  this.bufferPosition = 0;

	  this.xo = new AjaxObject('POST', url, null);
	  this.xo.on('chunk', this._chunkHandler.bind(this));
	  this.xo.once('finish', function(status, text) {
	    debug('finish', status, text);
	    self._chunkHandler(status, text);
	    self.xo = null;
	    var reason = status === 200 ? 'network' : 'permanent';
	    debug('close', reason);
	    self.emit('close', null, reason);
	    self._cleanup();
	  });
	}

	inherits(XhrReceiver, EventEmitter);

	XhrReceiver.prototype._chunkHandler = function(status, text) {
	  debug('_chunkHandler', status);
	  if (status !== 200 || !text) {
	    return;
	  }

	  for (var idx = -1; ; this.bufferPosition += idx + 1) {
	    var buf = text.slice(this.bufferPosition);
	    idx = buf.indexOf('\n');
	    if (idx === -1) {
	      break;
	    }
	    var msg = buf.slice(0, idx);
	    if (msg) {
	      debug('message', msg);
	      this.emit('message', msg);
	    }
	  }
	};

	XhrReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  this.removeAllListeners();
	};

	XhrReceiver.prototype.abort = function() {
	  debug('abort');
	  if (this.xo) {
	    this.xo.close();
	    debug('close');
	    this.emit('close', null, 'user');
	    this.xo = null;
	  }
	  this._cleanup();
	};

	xhr = XhrReceiver;
	return xhr;
}

var abstractXhr;
var hasRequiredAbstractXhr;

function requireAbstractXhr () {
	if (hasRequiredAbstractXhr) return abstractXhr;
	hasRequiredAbstractXhr = 1;

	var EventEmitter = requireEmitter().EventEmitter
	  , inherits = requireInherits_browser()
	  , utils = requireEvent$1()
	  , urlUtils = requireUrl()
	  , XHR = commonjsGlobal.XMLHttpRequest
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:browser:xhr');
	}

	function AbstractXHRObject(method, url, payload, opts) {
	  debug(method, url);
	  var self = this;
	  EventEmitter.call(this);

	  setTimeout(function () {
	    self._start(method, url, payload, opts);
	  }, 0);
	}

	inherits(AbstractXHRObject, EventEmitter);

	AbstractXHRObject.prototype._start = function(method, url, payload, opts) {
	  var self = this;

	  try {
	    this.xhr = new XHR();
	  } catch (x) {
	    // intentionally empty
	  }

	  if (!this.xhr) {
	    debug('no xhr');
	    this.emit('finish', 0, 'no xhr support');
	    this._cleanup();
	    return;
	  }

	  // several browsers cache POSTs
	  url = urlUtils.addQuery(url, 't=' + (+new Date()));

	  // Explorer tends to keep connection open, even after the
	  // tab gets closed: http://bugs.jquery.com/ticket/5280
	  this.unloadRef = utils.unloadAdd(function() {
	    debug('unload cleanup');
	    self._cleanup(true);
	  });
	  try {
	    this.xhr.open(method, url, true);
	    if (this.timeout && 'timeout' in this.xhr) {
	      this.xhr.timeout = this.timeout;
	      this.xhr.ontimeout = function() {
	        debug('xhr timeout');
	        self.emit('finish', 0, '');
	        self._cleanup(false);
	      };
	    }
	  } catch (e) {
	    debug('exception', e);
	    // IE raises an exception on wrong port.
	    this.emit('finish', 0, '');
	    this._cleanup(false);
	    return;
	  }

	  if ((!opts || !opts.noCredentials) && AbstractXHRObject.supportsCORS) {
	    debug('withCredentials');
	    // Mozilla docs says https://developer.mozilla.org/en/XMLHttpRequest :
	    // "This never affects same-site requests."

	    this.xhr.withCredentials = true;
	  }
	  if (opts && opts.headers) {
	    for (var key in opts.headers) {
	      this.xhr.setRequestHeader(key, opts.headers[key]);
	    }
	  }

	  this.xhr.onreadystatechange = function() {
	    if (self.xhr) {
	      var x = self.xhr;
	      var text, status;
	      debug('readyState', x.readyState);
	      switch (x.readyState) {
	      case 3:
	        // IE doesn't like peeking into responseText or status
	        // on Microsoft.XMLHTTP and readystate=3
	        try {
	          status = x.status;
	          text = x.responseText;
	        } catch (e) {
	          // intentionally empty
	        }
	        debug('status', status);
	        // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
	        if (status === 1223) {
	          status = 204;
	        }

	        // IE does return readystate == 3 for 404 answers.
	        if (status === 200 && text && text.length > 0) {
	          debug('chunk');
	          self.emit('chunk', status, text);
	        }
	        break;
	      case 4:
	        status = x.status;
	        debug('status', status);
	        // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
	        if (status === 1223) {
	          status = 204;
	        }
	        // IE returns this for a bad port
	        // http://msdn.microsoft.com/en-us/library/windows/desktop/aa383770(v=vs.85).aspx
	        if (status === 12005 || status === 12029) {
	          status = 0;
	        }

	        debug('finish', status, x.responseText);
	        self.emit('finish', status, x.responseText);
	        self._cleanup(false);
	        break;
	      }
	    }
	  };

	  try {
	    self.xhr.send(payload);
	  } catch (e) {
	    self.emit('finish', 0, '');
	    self._cleanup(false);
	  }
	};

	AbstractXHRObject.prototype._cleanup = function(abort) {
	  debug('cleanup');
	  if (!this.xhr) {
	    return;
	  }
	  this.removeAllListeners();
	  utils.unloadDel(this.unloadRef);

	  // IE needs this field to be a function
	  this.xhr.onreadystatechange = function() {};
	  if (this.xhr.ontimeout) {
	    this.xhr.ontimeout = null;
	  }

	  if (abort) {
	    try {
	      this.xhr.abort();
	    } catch (x) {
	      // intentionally empty
	    }
	  }
	  this.unloadRef = this.xhr = null;
	};

	AbstractXHRObject.prototype.close = function() {
	  debug('close');
	  this._cleanup(true);
	};

	AbstractXHRObject.enabled = !!XHR;
	// override XMLHttpRequest for IE6/7
	// obfuscate to avoid firewalls
	var axo = ['Active'].concat('Object').join('X');
	if (!AbstractXHRObject.enabled && (axo in commonjsGlobal)) {
	  debug('overriding xmlhttprequest');
	  XHR = function() {
	    try {
	      return new commonjsGlobal[axo]('Microsoft.XMLHTTP');
	    } catch (e) {
	      return null;
	    }
	  };
	  AbstractXHRObject.enabled = !!new XHR();
	}

	var cors = false;
	try {
	  cors = 'withCredentials' in new XHR();
	} catch (ignored) {
	  // intentionally empty
	}

	AbstractXHRObject.supportsCORS = cors;

	abstractXhr = AbstractXHRObject;
	return abstractXhr;
}

var xhrCors;
var hasRequiredXhrCors;

function requireXhrCors () {
	if (hasRequiredXhrCors) return xhrCors;
	hasRequiredXhrCors = 1;

	var inherits = requireInherits_browser()
	  , XhrDriver = requireAbstractXhr()
	  ;

	function XHRCorsObject(method, url, payload, opts) {
	  XhrDriver.call(this, method, url, payload, opts);
	}

	inherits(XHRCorsObject, XhrDriver);

	XHRCorsObject.enabled = XhrDriver.enabled && XhrDriver.supportsCORS;

	xhrCors = XHRCorsObject;
	return xhrCors;
}

var xhrLocal;
var hasRequiredXhrLocal;

function requireXhrLocal () {
	if (hasRequiredXhrLocal) return xhrLocal;
	hasRequiredXhrLocal = 1;

	var inherits = requireInherits_browser()
	  , XhrDriver = requireAbstractXhr()
	  ;

	function XHRLocalObject(method, url, payload /*, opts */) {
	  XhrDriver.call(this, method, url, payload, {
	    noCredentials: true
	  });
	}

	inherits(XHRLocalObject, XhrDriver);

	XHRLocalObject.enabled = XhrDriver.enabled;

	xhrLocal = XHRLocalObject;
	return xhrLocal;
}

var browser;
var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser;
	hasRequiredBrowser = 1;

	browser = {
	  isOpera: function() {
	    return commonjsGlobal.navigator &&
	      /opera/i.test(commonjsGlobal.navigator.userAgent);
	  }

	, isKonqueror: function() {
	    return commonjsGlobal.navigator &&
	      /konqueror/i.test(commonjsGlobal.navigator.userAgent);
	  }

	  // #187 wrap document.domain in try/catch because of WP8 from file:///
	, hasDomain: function () {
	    // non-browser client always has a domain
	    if (!commonjsGlobal.document) {
	      return true;
	    }

	    try {
	      return !!commonjsGlobal.document.domain;
	    } catch (e) {
	      return false;
	    }
	  }
	};
	return browser;
}

var xhrStreaming;
var hasRequiredXhrStreaming;

function requireXhrStreaming () {
	if (hasRequiredXhrStreaming) return xhrStreaming;
	hasRequiredXhrStreaming = 1;

	var inherits = requireInherits_browser()
	  , AjaxBasedTransport = requireAjaxBased()
	  , XhrReceiver = requireXhr()
	  , XHRCorsObject = requireXhrCors()
	  , XHRLocalObject = requireXhrLocal()
	  , browser = requireBrowser()
	  ;

	function XhrStreamingTransport(transUrl) {
	  if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr_streaming', XhrReceiver, XHRCorsObject);
	}

	inherits(XhrStreamingTransport, AjaxBasedTransport);

	XhrStreamingTransport.enabled = function(info) {
	  if (info.nullOrigin) {
	    return false;
	  }
	  // Opera doesn't support xhr-streaming #60
	  // But it might be able to #92
	  if (browser.isOpera()) {
	    return false;
	  }

	  return XHRCorsObject.enabled;
	};

	XhrStreamingTransport.transportName = 'xhr-streaming';
	XhrStreamingTransport.roundTrips = 2; // preflight, ajax

	// Safari gets confused when a streaming ajax request is started
	// before onload. This causes the load indicator to spin indefinetely.
	// Only require body when used in a browser
	XhrStreamingTransport.needBody = !!commonjsGlobal.document;

	xhrStreaming = XhrStreamingTransport;
	return xhrStreaming;
}

var xdr;
var hasRequiredXdr;

function requireXdr () {
	if (hasRequiredXdr) return xdr;
	hasRequiredXdr = 1;

	var EventEmitter = requireEmitter().EventEmitter
	  , inherits = requireInherits_browser()
	  , eventUtils = requireEvent$1()
	  , browser = requireBrowser()
	  , urlUtils = requireUrl()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:sender:xdr');
	}

	// References:
	//   http://ajaxian.com/archives/100-line-ajax-wrapper
	//   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx

	function XDRObject(method, url, payload) {
	  debug(method, url);
	  var self = this;
	  EventEmitter.call(this);

	  setTimeout(function() {
	    self._start(method, url, payload);
	  }, 0);
	}

	inherits(XDRObject, EventEmitter);

	XDRObject.prototype._start = function(method, url, payload) {
	  debug('_start');
	  var self = this;
	  var xdr = new commonjsGlobal.XDomainRequest();
	  // IE caches even POSTs
	  url = urlUtils.addQuery(url, 't=' + (+new Date()));

	  xdr.onerror = function() {
	    debug('onerror');
	    self._error();
	  };
	  xdr.ontimeout = function() {
	    debug('ontimeout');
	    self._error();
	  };
	  xdr.onprogress = function() {
	    debug('progress', xdr.responseText);
	    self.emit('chunk', 200, xdr.responseText);
	  };
	  xdr.onload = function() {
	    debug('load');
	    self.emit('finish', 200, xdr.responseText);
	    self._cleanup(false);
	  };
	  this.xdr = xdr;
	  this.unloadRef = eventUtils.unloadAdd(function() {
	    self._cleanup(true);
	  });
	  try {
	    // Fails with AccessDenied if port number is bogus
	    this.xdr.open(method, url);
	    if (this.timeout) {
	      this.xdr.timeout = this.timeout;
	    }
	    this.xdr.send(payload);
	  } catch (x) {
	    this._error();
	  }
	};

	XDRObject.prototype._error = function() {
	  this.emit('finish', 0, '');
	  this._cleanup(false);
	};

	XDRObject.prototype._cleanup = function(abort) {
	  debug('cleanup', abort);
	  if (!this.xdr) {
	    return;
	  }
	  this.removeAllListeners();
	  eventUtils.unloadDel(this.unloadRef);

	  this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null;
	  if (abort) {
	    try {
	      this.xdr.abort();
	    } catch (x) {
	      // intentionally empty
	    }
	  }
	  this.unloadRef = this.xdr = null;
	};

	XDRObject.prototype.close = function() {
	  debug('close');
	  this._cleanup(true);
	};

	// IE 8/9 if the request target uses the same scheme - #79
	XDRObject.enabled = !!(commonjsGlobal.XDomainRequest && browser.hasDomain());

	xdr = XDRObject;
	return xdr;
}

var xdrStreaming;
var hasRequiredXdrStreaming;

function requireXdrStreaming () {
	if (hasRequiredXdrStreaming) return xdrStreaming;
	hasRequiredXdrStreaming = 1;

	var inherits = requireInherits_browser()
	  , AjaxBasedTransport = requireAjaxBased()
	  , XhrReceiver = requireXhr()
	  , XDRObject = requireXdr()
	  ;

	// According to:
	//   http://stackoverflow.com/questions/1641507/detect-browser-support-for-cross-domain-xmlhttprequests
	//   http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/

	function XdrStreamingTransport(transUrl) {
	  if (!XDRObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr_streaming', XhrReceiver, XDRObject);
	}

	inherits(XdrStreamingTransport, AjaxBasedTransport);

	XdrStreamingTransport.enabled = function(info) {
	  if (info.cookie_needed || info.nullOrigin) {
	    return false;
	  }
	  return XDRObject.enabled && info.sameScheme;
	};

	XdrStreamingTransport.transportName = 'xdr-streaming';
	XdrStreamingTransport.roundTrips = 2; // preflight, ajax

	xdrStreaming = XdrStreamingTransport;
	return xdrStreaming;
}

var eventsource$2;
var hasRequiredEventsource$2;

function requireEventsource$2 () {
	if (hasRequiredEventsource$2) return eventsource$2;
	hasRequiredEventsource$2 = 1;
	eventsource$2 = commonjsGlobal.EventSource;
	return eventsource$2;
}

var eventsource$1;
var hasRequiredEventsource$1;

function requireEventsource$1 () {
	if (hasRequiredEventsource$1) return eventsource$1;
	hasRequiredEventsource$1 = 1;

	var inherits = requireInherits_browser()
	  , EventEmitter = requireEmitter().EventEmitter
	  , EventSourceDriver = requireEventsource$2()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:receiver:eventsource');
	}

	function EventSourceReceiver(url) {
	  debug(url);
	  EventEmitter.call(this);

	  var self = this;
	  var es = this.es = new EventSourceDriver(url);
	  es.onmessage = function(e) {
	    debug('message', e.data);
	    self.emit('message', decodeURI(e.data));
	  };
	  es.onerror = function(e) {
	    debug('error', es.readyState, e);
	    // ES on reconnection has readyState = 0 or 1.
	    // on network error it's CLOSED = 2
	    var reason = (es.readyState !== 2 ? 'network' : 'permanent');
	    self._cleanup();
	    self._close(reason);
	  };
	}

	inherits(EventSourceReceiver, EventEmitter);

	EventSourceReceiver.prototype.abort = function() {
	  debug('abort');
	  this._cleanup();
	  this._close('user');
	};

	EventSourceReceiver.prototype._cleanup = function() {
	  debug('cleanup');
	  var es = this.es;
	  if (es) {
	    es.onmessage = es.onerror = null;
	    es.close();
	    this.es = null;
	  }
	};

	EventSourceReceiver.prototype._close = function(reason) {
	  debug('close', reason);
	  var self = this;
	  // Safari and chrome < 15 crash if we close window before
	  // waiting for ES cleanup. See:
	  // https://code.google.com/p/chromium/issues/detail?id=89155
	  setTimeout(function() {
	    self.emit('close', null, reason);
	    self.removeAllListeners();
	  }, 200);
	};

	eventsource$1 = EventSourceReceiver;
	return eventsource$1;
}

var eventsource;
var hasRequiredEventsource;

function requireEventsource () {
	if (hasRequiredEventsource) return eventsource;
	hasRequiredEventsource = 1;

	var inherits = requireInherits_browser()
	  , AjaxBasedTransport = requireAjaxBased()
	  , EventSourceReceiver = requireEventsource$1()
	  , XHRCorsObject = requireXhrCors()
	  , EventSourceDriver = requireEventsource$2()
	  ;

	function EventSourceTransport(transUrl) {
	  if (!EventSourceTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }

	  AjaxBasedTransport.call(this, transUrl, '/eventsource', EventSourceReceiver, XHRCorsObject);
	}

	inherits(EventSourceTransport, AjaxBasedTransport);

	EventSourceTransport.enabled = function() {
	  return !!EventSourceDriver;
	};

	EventSourceTransport.transportName = 'eventsource';
	EventSourceTransport.roundTrips = 2;

	eventsource = EventSourceTransport;
	return eventsource;
}

var version;
var hasRequiredVersion;

function requireVersion () {
	if (hasRequiredVersion) return version;
	hasRequiredVersion = 1;
	version = '1.6.1';
	return version;
}

var iframe$1 = {exports: {}};

var hasRequiredIframe$1;

function requireIframe$1 () {
	if (hasRequiredIframe$1) return iframe$1.exports;
	hasRequiredIframe$1 = 1;
	(function (module) {

		var eventUtils = requireEvent$1()
		  , browser = requireBrowser()
		  ;

		var debug = function() {};
		if (process.env.NODE_ENV !== 'production') {
		  debug = requireBrowser$1()('sockjs-client:utils:iframe');
		}

		module.exports = {
		  WPrefix: '_jp'
		, currentWindowId: null

		, polluteGlobalNamespace: function() {
		    if (!(module.exports.WPrefix in commonjsGlobal)) {
		      commonjsGlobal[module.exports.WPrefix] = {};
		    }
		  }

		, postMessage: function(type, data) {
		    if (commonjsGlobal.parent !== commonjsGlobal) {
		      commonjsGlobal.parent.postMessage(JSON.stringify({
		        windowId: module.exports.currentWindowId
		      , type: type
		      , data: data || ''
		      }), '*');
		    } else {
		      debug('Cannot postMessage, no parent window.', type, data);
		    }
		  }

		, createIframe: function(iframeUrl, errorCallback) {
		    var iframe = commonjsGlobal.document.createElement('iframe');
		    var tref, unloadRef;
		    var unattach = function() {
		      debug('unattach');
		      clearTimeout(tref);
		      // Explorer had problems with that.
		      try {
		        iframe.onload = null;
		      } catch (x) {
		        // intentionally empty
		      }
		      iframe.onerror = null;
		    };
		    var cleanup = function() {
		      debug('cleanup');
		      if (iframe) {
		        unattach();
		        // This timeout makes chrome fire onbeforeunload event
		        // within iframe. Without the timeout it goes straight to
		        // onunload.
		        setTimeout(function() {
		          if (iframe) {
		            iframe.parentNode.removeChild(iframe);
		          }
		          iframe = null;
		        }, 0);
		        eventUtils.unloadDel(unloadRef);
		      }
		    };
		    var onerror = function(err) {
		      debug('onerror', err);
		      if (iframe) {
		        cleanup();
		        errorCallback(err);
		      }
		    };
		    var post = function(msg, origin) {
		      debug('post', msg, origin);
		      setTimeout(function() {
		        try {
		          // When the iframe is not loaded, IE raises an exception
		          // on 'contentWindow'.
		          if (iframe && iframe.contentWindow) {
		            iframe.contentWindow.postMessage(msg, origin);
		          }
		        } catch (x) {
		          // intentionally empty
		        }
		      }, 0);
		    };

		    iframe.src = iframeUrl;
		    iframe.style.display = 'none';
		    iframe.style.position = 'absolute';
		    iframe.onerror = function() {
		      onerror('onerror');
		    };
		    iframe.onload = function() {
		      debug('onload');
		      // `onload` is triggered before scripts on the iframe are
		      // executed. Give it few seconds to actually load stuff.
		      clearTimeout(tref);
		      tref = setTimeout(function() {
		        onerror('onload timeout');
		      }, 2000);
		    };
		    commonjsGlobal.document.body.appendChild(iframe);
		    tref = setTimeout(function() {
		      onerror('timeout');
		    }, 15000);
		    unloadRef = eventUtils.unloadAdd(cleanup);
		    return {
		      post: post
		    , cleanup: cleanup
		    , loaded: unattach
		    };
		  }

		/* eslint no-undef: "off", new-cap: "off" */
		, createHtmlfile: function(iframeUrl, errorCallback) {
		    var axo = ['Active'].concat('Object').join('X');
		    var doc = new commonjsGlobal[axo]('htmlfile');
		    var tref, unloadRef;
		    var iframe;
		    var unattach = function() {
		      clearTimeout(tref);
		      iframe.onerror = null;
		    };
		    var cleanup = function() {
		      if (doc) {
		        unattach();
		        eventUtils.unloadDel(unloadRef);
		        iframe.parentNode.removeChild(iframe);
		        iframe = doc = null;
		        CollectGarbage();
		      }
		    };
		    var onerror = function(r) {
		      debug('onerror', r);
		      if (doc) {
		        cleanup();
		        errorCallback(r);
		      }
		    };
		    var post = function(msg, origin) {
		      try {
		        // When the iframe is not loaded, IE raises an exception
		        // on 'contentWindow'.
		        setTimeout(function() {
		          if (iframe && iframe.contentWindow) {
		              iframe.contentWindow.postMessage(msg, origin);
		          }
		        }, 0);
		      } catch (x) {
		        // intentionally empty
		      }
		    };

		    doc.open();
		    doc.write('<html><s' + 'cript>' +
		              'document.domain="' + commonjsGlobal.document.domain + '";' +
		              '</s' + 'cript></html>');
		    doc.close();
		    doc.parentWindow[module.exports.WPrefix] = commonjsGlobal[module.exports.WPrefix];
		    var c = doc.createElement('div');
		    doc.body.appendChild(c);
		    iframe = doc.createElement('iframe');
		    c.appendChild(iframe);
		    iframe.src = iframeUrl;
		    iframe.onerror = function() {
		      onerror('onerror');
		    };
		    tref = setTimeout(function() {
		      onerror('timeout');
		    }, 15000);
		    unloadRef = eventUtils.unloadAdd(cleanup);
		    return {
		      post: post
		    , cleanup: cleanup
		    , loaded: unattach
		    };
		  }
		};

		module.exports.iframeEnabled = false;
		if (commonjsGlobal.document) {
		  // postMessage misbehaves in konqueror 4.6.5 - the messages are delivered with
		  // huge delay, or not at all.
		  module.exports.iframeEnabled = (typeof commonjsGlobal.postMessage === 'function' ||
		    typeof commonjsGlobal.postMessage === 'object') && (!browser.isKonqueror());
		}
} (iframe$1));
	return iframe$1.exports;
}

var iframe;
var hasRequiredIframe;

function requireIframe () {
	if (hasRequiredIframe) return iframe;
	hasRequiredIframe = 1;

	// Few cool transports do work only for same-origin. In order to make
	// them work cross-domain we shall use iframe, served from the
	// remote domain. New browsers have capabilities to communicate with
	// cross domain iframe using postMessage(). In IE it was implemented
	// from IE 8+, but of course, IE got some details wrong:
	//    http://msdn.microsoft.com/en-us/library/cc197015(v=VS.85).aspx
	//    http://stevesouders.com/misc/test-postmessage.php

	var inherits = requireInherits_browser()
	  , EventEmitter = requireEmitter().EventEmitter
	  , version = requireVersion()
	  , urlUtils = requireUrl()
	  , iframeUtils = requireIframe$1()
	  , eventUtils = requireEvent$1()
	  , random = requireRandom()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:transport:iframe');
	}

	function IframeTransport(transport, transUrl, baseUrl) {
	  if (!IframeTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }
	  EventEmitter.call(this);

	  var self = this;
	  this.origin = urlUtils.getOrigin(baseUrl);
	  this.baseUrl = baseUrl;
	  this.transUrl = transUrl;
	  this.transport = transport;
	  this.windowId = random.string(8);

	  var iframeUrl = urlUtils.addPath(baseUrl, '/iframe.html') + '#' + this.windowId;
	  debug(transport, transUrl, iframeUrl);

	  this.iframeObj = iframeUtils.createIframe(iframeUrl, function(r) {
	    debug('err callback');
	    self.emit('close', 1006, 'Unable to load an iframe (' + r + ')');
	    self.close();
	  });

	  this.onmessageCallback = this._message.bind(this);
	  eventUtils.attachEvent('message', this.onmessageCallback);
	}

	inherits(IframeTransport, EventEmitter);

	IframeTransport.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  if (this.iframeObj) {
	    eventUtils.detachEvent('message', this.onmessageCallback);
	    try {
	      // When the iframe is not loaded, IE raises an exception
	      // on 'contentWindow'.
	      this.postMessage('c');
	    } catch (x) {
	      // intentionally empty
	    }
	    this.iframeObj.cleanup();
	    this.iframeObj = null;
	    this.onmessageCallback = this.iframeObj = null;
	  }
	};

	IframeTransport.prototype._message = function(e) {
	  debug('message', e.data);
	  if (!urlUtils.isOriginEqual(e.origin, this.origin)) {
	    debug('not same origin', e.origin, this.origin);
	    return;
	  }

	  var iframeMessage;
	  try {
	    iframeMessage = JSON.parse(e.data);
	  } catch (ignored) {
	    debug('bad json', e.data);
	    return;
	  }

	  if (iframeMessage.windowId !== this.windowId) {
	    debug('mismatched window id', iframeMessage.windowId, this.windowId);
	    return;
	  }

	  switch (iframeMessage.type) {
	  case 's':
	    this.iframeObj.loaded();
	    // window global dependency
	    this.postMessage('s', JSON.stringify([
	      version
	    , this.transport
	    , this.transUrl
	    , this.baseUrl
	    ]));
	    break;
	  case 't':
	    this.emit('message', iframeMessage.data);
	    break;
	  case 'c':
	    var cdata;
	    try {
	      cdata = JSON.parse(iframeMessage.data);
	    } catch (ignored) {
	      debug('bad json', iframeMessage.data);
	      return;
	    }
	    this.emit('close', cdata[0], cdata[1]);
	    this.close();
	    break;
	  }
	};

	IframeTransport.prototype.postMessage = function(type, data) {
	  debug('postMessage', type, data);
	  this.iframeObj.post(JSON.stringify({
	    windowId: this.windowId
	  , type: type
	  , data: data || ''
	  }), this.origin);
	};

	IframeTransport.prototype.send = function(message) {
	  debug('send', message);
	  this.postMessage('m', message);
	};

	IframeTransport.enabled = function() {
	  return iframeUtils.iframeEnabled;
	};

	IframeTransport.transportName = 'iframe';
	IframeTransport.roundTrips = 2;

	iframe = IframeTransport;
	return iframe;
}

var object;
var hasRequiredObject;

function requireObject () {
	if (hasRequiredObject) return object;
	hasRequiredObject = 1;

	object = {
	  isObject: function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  }

	, extend: function(obj) {
	    if (!this.isObject(obj)) {
	      return obj;
	    }
	    var source, prop;
	    for (var i = 1, length = arguments.length; i < length; i++) {
	      source = arguments[i];
	      for (prop in source) {
	        if (Object.prototype.hasOwnProperty.call(source, prop)) {
	          obj[prop] = source[prop];
	        }
	      }
	    }
	    return obj;
	  }
	};
	return object;
}

var iframeWrap;
var hasRequiredIframeWrap;

function requireIframeWrap () {
	if (hasRequiredIframeWrap) return iframeWrap;
	hasRequiredIframeWrap = 1;

	var inherits = requireInherits_browser()
	  , IframeTransport = requireIframe()
	  , objectUtils = requireObject()
	  ;

	iframeWrap = function(transport) {

	  function IframeWrapTransport(transUrl, baseUrl) {
	    IframeTransport.call(this, transport.transportName, transUrl, baseUrl);
	  }

	  inherits(IframeWrapTransport, IframeTransport);

	  IframeWrapTransport.enabled = function(url, info) {
	    if (!commonjsGlobal.document) {
	      return false;
	    }

	    var iframeInfo = objectUtils.extend({}, info);
	    iframeInfo.sameOrigin = true;
	    return transport.enabled(iframeInfo) && IframeTransport.enabled();
	  };

	  IframeWrapTransport.transportName = 'iframe-' + transport.transportName;
	  IframeWrapTransport.needBody = true;
	  IframeWrapTransport.roundTrips = IframeTransport.roundTrips + transport.roundTrips - 1; // html, javascript (2) + transport - no CORS (1)

	  IframeWrapTransport.facadeTransport = transport;

	  return IframeWrapTransport;
	};
	return iframeWrap;
}

var htmlfile$1;
var hasRequiredHtmlfile$1;

function requireHtmlfile$1 () {
	if (hasRequiredHtmlfile$1) return htmlfile$1;
	hasRequiredHtmlfile$1 = 1;

	var inherits = requireInherits_browser()
	  , iframeUtils = requireIframe$1()
	  , urlUtils = requireUrl()
	  , EventEmitter = requireEmitter().EventEmitter
	  , random = requireRandom()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:receiver:htmlfile');
	}

	function HtmlfileReceiver(url) {
	  debug(url);
	  EventEmitter.call(this);
	  var self = this;
	  iframeUtils.polluteGlobalNamespace();

	  this.id = 'a' + random.string(6);
	  url = urlUtils.addQuery(url, 'c=' + decodeURIComponent(iframeUtils.WPrefix + '.' + this.id));

	  debug('using htmlfile', HtmlfileReceiver.htmlfileEnabled);
	  var constructFunc = HtmlfileReceiver.htmlfileEnabled ?
	      iframeUtils.createHtmlfile : iframeUtils.createIframe;

	  commonjsGlobal[iframeUtils.WPrefix][this.id] = {
	    start: function() {
	      debug('start');
	      self.iframeObj.loaded();
	    }
	  , message: function(data) {
	      debug('message', data);
	      self.emit('message', data);
	    }
	  , stop: function() {
	      debug('stop');
	      self._cleanup();
	      self._close('network');
	    }
	  };
	  this.iframeObj = constructFunc(url, function() {
	    debug('callback');
	    self._cleanup();
	    self._close('permanent');
	  });
	}

	inherits(HtmlfileReceiver, EventEmitter);

	HtmlfileReceiver.prototype.abort = function() {
	  debug('abort');
	  this._cleanup();
	  this._close('user');
	};

	HtmlfileReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  if (this.iframeObj) {
	    this.iframeObj.cleanup();
	    this.iframeObj = null;
	  }
	  delete commonjsGlobal[iframeUtils.WPrefix][this.id];
	};

	HtmlfileReceiver.prototype._close = function(reason) {
	  debug('_close', reason);
	  this.emit('close', null, reason);
	  this.removeAllListeners();
	};

	HtmlfileReceiver.htmlfileEnabled = false;

	// obfuscate to avoid firewalls
	var axo = ['Active'].concat('Object').join('X');
	if (axo in commonjsGlobal) {
	  try {
	    HtmlfileReceiver.htmlfileEnabled = !!new commonjsGlobal[axo]('htmlfile');
	  } catch (x) {
	    // intentionally empty
	  }
	}

	HtmlfileReceiver.enabled = HtmlfileReceiver.htmlfileEnabled || iframeUtils.iframeEnabled;

	htmlfile$1 = HtmlfileReceiver;
	return htmlfile$1;
}

var htmlfile;
var hasRequiredHtmlfile;

function requireHtmlfile () {
	if (hasRequiredHtmlfile) return htmlfile;
	hasRequiredHtmlfile = 1;

	var inherits = requireInherits_browser()
	  , HtmlfileReceiver = requireHtmlfile$1()
	  , XHRLocalObject = requireXhrLocal()
	  , AjaxBasedTransport = requireAjaxBased()
	  ;

	function HtmlFileTransport(transUrl) {
	  if (!HtmlfileReceiver.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/htmlfile', HtmlfileReceiver, XHRLocalObject);
	}

	inherits(HtmlFileTransport, AjaxBasedTransport);

	HtmlFileTransport.enabled = function(info) {
	  return HtmlfileReceiver.enabled && info.sameOrigin;
	};

	HtmlFileTransport.transportName = 'htmlfile';
	HtmlFileTransport.roundTrips = 2;

	htmlfile = HtmlFileTransport;
	return htmlfile;
}

var xhrPolling;
var hasRequiredXhrPolling;

function requireXhrPolling () {
	if (hasRequiredXhrPolling) return xhrPolling;
	hasRequiredXhrPolling = 1;

	var inherits = requireInherits_browser()
	  , AjaxBasedTransport = requireAjaxBased()
	  , XhrReceiver = requireXhr()
	  , XHRCorsObject = requireXhrCors()
	  , XHRLocalObject = requireXhrLocal()
	  ;

	function XhrPollingTransport(transUrl) {
	  if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr', XhrReceiver, XHRCorsObject);
	}

	inherits(XhrPollingTransport, AjaxBasedTransport);

	XhrPollingTransport.enabled = function(info) {
	  if (info.nullOrigin) {
	    return false;
	  }

	  if (XHRLocalObject.enabled && info.sameOrigin) {
	    return true;
	  }
	  return XHRCorsObject.enabled;
	};

	XhrPollingTransport.transportName = 'xhr-polling';
	XhrPollingTransport.roundTrips = 2; // preflight, ajax

	xhrPolling = XhrPollingTransport;
	return xhrPolling;
}

var xdrPolling;
var hasRequiredXdrPolling;

function requireXdrPolling () {
	if (hasRequiredXdrPolling) return xdrPolling;
	hasRequiredXdrPolling = 1;

	var inherits = requireInherits_browser()
	  , AjaxBasedTransport = requireAjaxBased()
	  , XdrStreamingTransport = requireXdrStreaming()
	  , XhrReceiver = requireXhr()
	  , XDRObject = requireXdr()
	  ;

	function XdrPollingTransport(transUrl) {
	  if (!XDRObject.enabled) {
	    throw new Error('Transport created when disabled');
	  }
	  AjaxBasedTransport.call(this, transUrl, '/xhr', XhrReceiver, XDRObject);
	}

	inherits(XdrPollingTransport, AjaxBasedTransport);

	XdrPollingTransport.enabled = XdrStreamingTransport.enabled;
	XdrPollingTransport.transportName = 'xdr-polling';
	XdrPollingTransport.roundTrips = 2; // preflight, ajax

	xdrPolling = XdrPollingTransport;
	return xdrPolling;
}

var jsonp$1;
var hasRequiredJsonp$1;

function requireJsonp$1 () {
	if (hasRequiredJsonp$1) return jsonp$1;
	hasRequiredJsonp$1 = 1;

	var utils = requireIframe$1()
	  , random = requireRandom()
	  , browser = requireBrowser()
	  , urlUtils = requireUrl()
	  , inherits = requireInherits_browser()
	  , EventEmitter = requireEmitter().EventEmitter
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:receiver:jsonp');
	}

	function JsonpReceiver(url) {
	  debug(url);
	  var self = this;
	  EventEmitter.call(this);

	  utils.polluteGlobalNamespace();

	  this.id = 'a' + random.string(6);
	  var urlWithId = urlUtils.addQuery(url, 'c=' + encodeURIComponent(utils.WPrefix + '.' + this.id));

	  commonjsGlobal[utils.WPrefix][this.id] = this._callback.bind(this);
	  this._createScript(urlWithId);

	  // Fallback mostly for Konqueror - stupid timer, 35 seconds shall be plenty.
	  this.timeoutId = setTimeout(function() {
	    debug('timeout');
	    self._abort(new Error('JSONP script loaded abnormally (timeout)'));
	  }, JsonpReceiver.timeout);
	}

	inherits(JsonpReceiver, EventEmitter);

	JsonpReceiver.prototype.abort = function() {
	  debug('abort');
	  if (commonjsGlobal[utils.WPrefix][this.id]) {
	    var err = new Error('JSONP user aborted read');
	    err.code = 1000;
	    this._abort(err);
	  }
	};

	JsonpReceiver.timeout = 35000;
	JsonpReceiver.scriptErrorTimeout = 1000;

	JsonpReceiver.prototype._callback = function(data) {
	  debug('_callback', data);
	  this._cleanup();

	  if (this.aborting) {
	    return;
	  }

	  if (data) {
	    debug('message', data);
	    this.emit('message', data);
	  }
	  this.emit('close', null, 'network');
	  this.removeAllListeners();
	};

	JsonpReceiver.prototype._abort = function(err) {
	  debug('_abort', err);
	  this._cleanup();
	  this.aborting = true;
	  this.emit('close', err.code, err.message);
	  this.removeAllListeners();
	};

	JsonpReceiver.prototype._cleanup = function() {
	  debug('_cleanup');
	  clearTimeout(this.timeoutId);
	  if (this.script2) {
	    this.script2.parentNode.removeChild(this.script2);
	    this.script2 = null;
	  }
	  if (this.script) {
	    var script = this.script;
	    // Unfortunately, you can't really abort script loading of
	    // the script.
	    script.parentNode.removeChild(script);
	    script.onreadystatechange = script.onerror =
	        script.onload = script.onclick = null;
	    this.script = null;
	  }
	  delete commonjsGlobal[utils.WPrefix][this.id];
	};

	JsonpReceiver.prototype._scriptError = function() {
	  debug('_scriptError');
	  var self = this;
	  if (this.errorTimer) {
	    return;
	  }

	  this.errorTimer = setTimeout(function() {
	    if (!self.loadedOkay) {
	      self._abort(new Error('JSONP script loaded abnormally (onerror)'));
	    }
	  }, JsonpReceiver.scriptErrorTimeout);
	};

	JsonpReceiver.prototype._createScript = function(url) {
	  debug('_createScript', url);
	  var self = this;
	  var script = this.script = commonjsGlobal.document.createElement('script');
	  var script2;  // Opera synchronous load trick.

	  script.id = 'a' + random.string(8);
	  script.src = url;
	  script.type = 'text/javascript';
	  script.charset = 'UTF-8';
	  script.onerror = this._scriptError.bind(this);
	  script.onload = function() {
	    debug('onload');
	    self._abort(new Error('JSONP script loaded abnormally (onload)'));
	  };

	  // IE9 fires 'error' event after onreadystatechange or before, in random order.
	  // Use loadedOkay to determine if actually errored
	  script.onreadystatechange = function() {
	    debug('onreadystatechange', script.readyState);
	    if (/loaded|closed/.test(script.readyState)) {
	      if (script && script.htmlFor && script.onclick) {
	        self.loadedOkay = true;
	        try {
	          // In IE, actually execute the script.
	          script.onclick();
	        } catch (x) {
	          // intentionally empty
	        }
	      }
	      if (script) {
	        self._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
	      }
	    }
	  };
	  // IE: event/htmlFor/onclick trick.
	  // One can't rely on proper order for onreadystatechange. In order to
	  // make sure, set a 'htmlFor' and 'event' properties, so that
	  // script code will be installed as 'onclick' handler for the
	  // script object. Later, onreadystatechange, manually execute this
	  // code. FF and Chrome doesn't work with 'event' and 'htmlFor'
	  // set. For reference see:
	  //   http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
	  // Also, read on that about script ordering:
	  //   http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
	  if (typeof script.async === 'undefined' && commonjsGlobal.document.attachEvent) {
	    // According to mozilla docs, in recent browsers script.async defaults
	    // to 'true', so we may use it to detect a good browser:
	    // https://developer.mozilla.org/en/HTML/Element/script
	    if (!browser.isOpera()) {
	      // Naively assume we're in IE
	      try {
	        script.htmlFor = script.id;
	        script.event = 'onclick';
	      } catch (x) {
	        // intentionally empty
	      }
	      script.async = true;
	    } else {
	      // Opera, second sync script hack
	      script2 = this.script2 = commonjsGlobal.document.createElement('script');
	      script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
	      script.async = script2.async = false;
	    }
	  }
	  if (typeof script.async !== 'undefined') {
	    script.async = true;
	  }

	  var head = commonjsGlobal.document.getElementsByTagName('head')[0];
	  head.insertBefore(script, head.firstChild);
	  if (script2) {
	    head.insertBefore(script2, head.firstChild);
	  }
	};

	jsonp$1 = JsonpReceiver;
	return jsonp$1;
}

var jsonp;
var hasRequiredJsonp;

function requireJsonp () {
	if (hasRequiredJsonp) return jsonp;
	hasRequiredJsonp = 1;

	var random = requireRandom()
	  , urlUtils = requireUrl()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:sender:jsonp');
	}

	var form, area;

	function createIframe(id) {
	  debug('createIframe', id);
	  try {
	    // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
	    return commonjsGlobal.document.createElement('<iframe name="' + id + '">');
	  } catch (x) {
	    var iframe = commonjsGlobal.document.createElement('iframe');
	    iframe.name = id;
	    return iframe;
	  }
	}

	function createForm() {
	  debug('createForm');
	  form = commonjsGlobal.document.createElement('form');
	  form.style.display = 'none';
	  form.style.position = 'absolute';
	  form.method = 'POST';
	  form.enctype = 'application/x-www-form-urlencoded';
	  form.acceptCharset = 'UTF-8';

	  area = commonjsGlobal.document.createElement('textarea');
	  area.name = 'd';
	  form.appendChild(area);

	  commonjsGlobal.document.body.appendChild(form);
	}

	jsonp = function(url, payload, callback) {
	  debug(url, payload);
	  if (!form) {
	    createForm();
	  }
	  var id = 'a' + random.string(8);
	  form.target = id;
	  form.action = urlUtils.addQuery(urlUtils.addPath(url, '/jsonp_send'), 'i=' + id);

	  var iframe = createIframe(id);
	  iframe.id = id;
	  iframe.style.display = 'none';
	  form.appendChild(iframe);

	  try {
	    area.value = payload;
	  } catch (e) {
	    // seriously broken browsers get here
	  }
	  form.submit();

	  var completed = function(err) {
	    debug('completed', id, err);
	    if (!iframe.onerror) {
	      return;
	    }
	    iframe.onreadystatechange = iframe.onerror = iframe.onload = null;
	    // Opera mini doesn't like if we GC iframe
	    // immediately, thus this timeout.
	    setTimeout(function() {
	      debug('cleaning up', id);
	      iframe.parentNode.removeChild(iframe);
	      iframe = null;
	    }, 500);
	    area.value = '';
	    // It is not possible to detect if the iframe succeeded or
	    // failed to submit our form.
	    callback(err);
	  };
	  iframe.onerror = function() {
	    debug('onerror', id);
	    completed();
	  };
	  iframe.onload = function() {
	    debug('onload', id);
	    completed();
	  };
	  iframe.onreadystatechange = function(e) {
	    debug('onreadystatechange', id, iframe.readyState, e);
	    if (iframe.readyState === 'complete') {
	      completed();
	    }
	  };
	  return function() {
	    debug('aborted', id);
	    completed(new Error('Aborted'));
	  };
	};
	return jsonp;
}

var jsonpPolling;
var hasRequiredJsonpPolling;

function requireJsonpPolling () {
	if (hasRequiredJsonpPolling) return jsonpPolling;
	hasRequiredJsonpPolling = 1;

	// The simplest and most robust transport, using the well-know cross
	// domain hack - JSONP. This transport is quite inefficient - one
	// message could use up to one http request. But at least it works almost
	// everywhere.
	// Known limitations:
	//   o you will get a spinning cursor
	//   o for Konqueror a dumb timer is needed to detect errors

	var inherits = requireInherits_browser()
	  , SenderReceiver = requireSenderReceiver()
	  , JsonpReceiver = requireJsonp$1()
	  , jsonpSender = requireJsonp()
	  ;

	function JsonPTransport(transUrl) {
	  if (!JsonPTransport.enabled()) {
	    throw new Error('Transport created when disabled');
	  }
	  SenderReceiver.call(this, transUrl, '/jsonp', jsonpSender, JsonpReceiver);
	}

	inherits(JsonPTransport, SenderReceiver);

	JsonPTransport.enabled = function() {
	  return !!commonjsGlobal.document;
	};

	JsonPTransport.transportName = 'jsonp-polling';
	JsonPTransport.roundTrips = 1;
	JsonPTransport.needBody = true;

	jsonpPolling = JsonPTransport;
	return jsonpPolling;
}

var transportList;
var hasRequiredTransportList;

function requireTransportList () {
	if (hasRequiredTransportList) return transportList;
	hasRequiredTransportList = 1;

	transportList = [
	  // streaming transports
	  requireWebsocket()
	, requireXhrStreaming()
	, requireXdrStreaming()
	, requireEventsource()
	, requireIframeWrap()(requireEventsource())

	  // polling transports
	, requireHtmlfile()
	, requireIframeWrap()(requireHtmlfile())
	, requireXhrPolling()
	, requireXdrPolling()
	, requireIframeWrap()(requireXhrPolling())
	, requireJsonpPolling()
	];
	return transportList;
}

var shims = {};

/* eslint-disable */

var hasRequiredShims;

function requireShims () {
	if (hasRequiredShims) return shims;
	hasRequiredShims = 1;

	// pulled specific shims from https://github.com/es-shims/es5-shim

	var ArrayPrototype = Array.prototype;
	var ObjectPrototype = Object.prototype;
	var FunctionPrototype = Function.prototype;
	var StringPrototype = String.prototype;
	var array_slice = ArrayPrototype.slice;

	var _toString = ObjectPrototype.toString;
	var isFunction = function (val) {
	    return ObjectPrototype.toString.call(val) === '[object Function]';
	};
	var isArray = function isArray(obj) {
	    return _toString.call(obj) === '[object Array]';
	};
	var isString = function isString(obj) {
	    return _toString.call(obj) === '[object String]';
	};

	var supportsDescriptors = Object.defineProperty && (function () {
	    try {
	        Object.defineProperty({}, 'x', {});
	        return true;
	    } catch (e) { /* this is ES3 */
	        return false;
	    }
	}());

	// Define configurable, writable and non-enumerable props
	// if they don't exist.
	var defineProperty;
	if (supportsDescriptors) {
	    defineProperty = function (object, name, method, forceAssign) {
	        if (!forceAssign && (name in object)) { return; }
	        Object.defineProperty(object, name, {
	            configurable: true,
	            enumerable: false,
	            writable: true,
	            value: method
	        });
	    };
	} else {
	    defineProperty = function (object, name, method, forceAssign) {
	        if (!forceAssign && (name in object)) { return; }
	        object[name] = method;
	    };
	}
	var defineProperties = function (object, map, forceAssign) {
	    for (var name in map) {
	        if (ObjectPrototype.hasOwnProperty.call(map, name)) {
	          defineProperty(object, name, map[name], forceAssign);
	        }
	    }
	};

	var toObject = function (o) {
	    if (o == null) { // this matches both null and undefined
	        throw new TypeError("can't convert " + o + ' to object');
	    }
	    return Object(o);
	};

	//
	// Util
	// ======
	//

	// ES5 9.4
	// http://es5.github.com/#x9.4
	// http://jsperf.com/to-integer

	function toInteger(num) {
	    var n = +num;
	    if (n !== n) { // isNaN
	        n = 0;
	    } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
	        n = (n > 0 || -1) * Math.floor(Math.abs(n));
	    }
	    return n;
	}

	function ToUint32(x) {
	    return x >>> 0;
	}

	//
	// Function
	// ========
	//

	// ES-5 15.3.4.5
	// http://es5.github.com/#x15.3.4.5

	function Empty() {}

	defineProperties(FunctionPrototype, {
	    bind: function bind(that) { // .length is 1
	        // 1. Let Target be the this value.
	        var target = this;
	        // 2. If IsCallable(Target) is false, throw a TypeError exception.
	        if (!isFunction(target)) {
	            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
	        }
	        // 3. Let A be a new (possibly empty) internal list of all of the
	        //   argument values provided after thisArg (arg1, arg2 etc), in order.
	        // XXX slicedArgs will stand in for "A" if used
	        var args = array_slice.call(arguments, 1); // for normal call
	        // 4. Let F be a new native ECMAScript object.
	        // 11. Set the [[Prototype]] internal property of F to the standard
	        //   built-in Function prototype object as specified in 15.3.3.1.
	        // 12. Set the [[Call]] internal property of F as described in
	        //   15.3.4.5.1.
	        // 13. Set the [[Construct]] internal property of F as described in
	        //   15.3.4.5.2.
	        // 14. Set the [[HasInstance]] internal property of F as described in
	        //   15.3.4.5.3.
	        var binder = function () {

	            if (this instanceof bound) {
	                // 15.3.4.5.2 [[Construct]]
	                // When the [[Construct]] internal method of a function object,
	                // F that was created using the bind function is called with a
	                // list of arguments ExtraArgs, the following steps are taken:
	                // 1. Let target be the value of F's [[TargetFunction]]
	                //   internal property.
	                // 2. If target has no [[Construct]] internal method, a
	                //   TypeError exception is thrown.
	                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
	                //   property.
	                // 4. Let args be a new list containing the same values as the
	                //   list boundArgs in the same order followed by the same
	                //   values as the list ExtraArgs in the same order.
	                // 5. Return the result of calling the [[Construct]] internal
	                //   method of target providing args as the arguments.

	                var result = target.apply(
	                    this,
	                    args.concat(array_slice.call(arguments))
	                );
	                if (Object(result) === result) {
	                    return result;
	                }
	                return this;

	            } else {
	                // 15.3.4.5.1 [[Call]]
	                // When the [[Call]] internal method of a function object, F,
	                // which was created using the bind function is called with a
	                // this value and a list of arguments ExtraArgs, the following
	                // steps are taken:
	                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
	                //   property.
	                // 2. Let boundThis be the value of F's [[BoundThis]] internal
	                //   property.
	                // 3. Let target be the value of F's [[TargetFunction]] internal
	                //   property.
	                // 4. Let args be a new list containing the same values as the
	                //   list boundArgs in the same order followed by the same
	                //   values as the list ExtraArgs in the same order.
	                // 5. Return the result of calling the [[Call]] internal method
	                //   of target providing boundThis as the this value and
	                //   providing args as the arguments.

	                // equiv: target.call(this, ...boundArgs, ...args)
	                return target.apply(
	                    that,
	                    args.concat(array_slice.call(arguments))
	                );

	            }

	        };

	        // 15. If the [[Class]] internal property of Target is "Function", then
	        //     a. Let L be the length property of Target minus the length of A.
	        //     b. Set the length own property of F to either 0 or L, whichever is
	        //       larger.
	        // 16. Else set the length own property of F to 0.

	        var boundLength = Math.max(0, target.length - args.length);

	        // 17. Set the attributes of the length own property of F to the values
	        //   specified in 15.3.5.1.
	        var boundArgs = [];
	        for (var i = 0; i < boundLength; i++) {
	            boundArgs.push('$' + i);
	        }

	        // XXX Build a dynamic function with desired amount of arguments is the only
	        // way to set the length property of a function.
	        // In environments where Content Security Policies enabled (Chrome extensions,
	        // for ex.) all use of eval or Function costructor throws an exception.
	        // However in all of these environments Function.prototype.bind exists
	        // and so this code will never be executed.
	        var bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

	        if (target.prototype) {
	            Empty.prototype = target.prototype;
	            bound.prototype = new Empty();
	            // Clean up dangling references.
	            Empty.prototype = null;
	        }

	        // TODO
	        // 18. Set the [[Extensible]] internal property of F to true.

	        // TODO
	        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
	        // 20. Call the [[DefineOwnProperty]] internal method of F with
	        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
	        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
	        //   false.
	        // 21. Call the [[DefineOwnProperty]] internal method of F with
	        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
	        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
	        //   and false.

	        // TODO
	        // NOTE Function objects created using Function.prototype.bind do not
	        // have a prototype property or the [[Code]], [[FormalParameters]], and
	        // [[Scope]] internal properties.
	        // XXX can't delete prototype in pure-js.

	        // 22. Return F.
	        return bound;
	    }
	});

	//
	// Array
	// =====
	//

	// ES5 15.4.3.2
	// http://es5.github.com/#x15.4.3.2
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
	defineProperties(Array, { isArray: isArray });


	var boxedString = Object('a');
	var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

	var properlyBoxesContext = function properlyBoxed(method) {
	    // Check node 0.6.21 bug where third parameter is not boxed
	    var properlyBoxesNonStrict = true;
	    var properlyBoxesStrict = true;
	    if (method) {
	        method.call('foo', function (_, __, context) {
	            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
	        });

	        method.call([1], function () {
	            properlyBoxesStrict = typeof this === 'string';
	        }, 'x');
	    }
	    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
	};

	defineProperties(ArrayPrototype, {
	    forEach: function forEach(fun /*, thisp*/) {
	        var object = toObject(this),
	            self = splitString && isString(this) ? this.split('') : object,
	            thisp = arguments[1],
	            i = -1,
	            length = self.length >>> 0;

	        // If no callback function or if callback is not a callable function
	        if (!isFunction(fun)) {
	            throw new TypeError(); // TODO message
	        }

	        while (++i < length) {
	            if (i in self) {
	                // Invoke the callback function with call, passing arguments:
	                // context, property value, property key, thisArg object
	                // context
	                fun.call(thisp, self[i], i, object);
	            }
	        }
	    }
	}, !properlyBoxesContext(ArrayPrototype.forEach));

	// ES5 15.4.4.14
	// http://es5.github.com/#x15.4.4.14
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
	defineProperties(ArrayPrototype, {
	    indexOf: function indexOf(sought /*, fromIndex */ ) {
	        var self = splitString && isString(this) ? this.split('') : toObject(this),
	            length = self.length >>> 0;

	        if (!length) {
	            return -1;
	        }

	        var i = 0;
	        if (arguments.length > 1) {
	            i = toInteger(arguments[1]);
	        }

	        // handle negative indices
	        i = i >= 0 ? i : Math.max(0, length + i);
	        for (; i < length; i++) {
	            if (i in self && self[i] === sought) {
	                return i;
	            }
	        }
	        return -1;
	    }
	}, hasFirefox2IndexOfBug);

	//
	// String
	// ======
	//

	// ES5 15.5.4.14
	// http://es5.github.com/#x15.5.4.14

	// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
	// Many browsers do not split properly with regular expressions or they
	// do not perform the split correctly under obscure conditions.
	// See http://blog.stevenlevithan.com/archives/cross-browser-split
	// I've tested in many browsers and this seems to cover the deviant ones:
	//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
	//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
	//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
	//       [undefined, "t", undefined, "e", ...]
	//    ''.split(/.?/) should be [], not [""]
	//    '.'.split(/()()/) should be ["."], not ["", "", "."]

	var string_split = StringPrototype.split;
	if (
	    'ab'.split(/(?:ab)*/).length !== 2 ||
	    '.'.split(/(.?)(.?)/).length !== 4 ||
	    'tesst'.split(/(s)*/)[1] === 't' ||
	    'test'.split(/(?:)/, -1).length !== 4 ||
	    ''.split(/.?/).length ||
	    '.'.split(/()()/).length > 1
	) {
	    (function () {
	        var compliantExecNpcg = /()??/.exec('')[1] === void 0; // NPCG: nonparticipating capturing group

	        StringPrototype.split = function (separator, limit) {
	            var string = this;
	            if (separator === void 0 && limit === 0) {
	                return [];
	            }

	            // If `separator` is not a regex, use native split
	            if (_toString.call(separator) !== '[object RegExp]') {
	                return string_split.call(this, separator, limit);
	            }

	            var output = [],
	                flags = (separator.ignoreCase ? 'i' : '') +
	                        (separator.multiline  ? 'm' : '') +
	                        (separator.extended   ? 'x' : '') + // Proposed for ES6
	                        (separator.sticky     ? 'y' : ''), // Firefox 3+
	                lastLastIndex = 0,
	                // Make `global` and avoid `lastIndex` issues by working with a copy
	                separator2, match, lastIndex, lastLength;
	            separator = new RegExp(separator.source, flags + 'g');
	            string += ''; // Type-convert
	            if (!compliantExecNpcg) {
	                // Doesn't need flags gy, but they don't hurt
	                separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
	            }
	            /* Values for `limit`, per the spec:
	             * If undefined: 4294967295 // Math.pow(2, 32) - 1
	             * If 0, Infinity, or NaN: 0
	             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	             * If other: Type-convert, then use the above rules
	             */
	            limit = limit === void 0 ?
	                -1 >>> 0 : // Math.pow(2, 32) - 1
	                ToUint32(limit);
	            while (match = separator.exec(string)) {
	                // `separator.lastIndex` is not reliable cross-browser
	                lastIndex = match.index + match[0].length;
	                if (lastIndex > lastLastIndex) {
	                    output.push(string.slice(lastLastIndex, match.index));
	                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
	                    // nonparticipating capturing groups
	                    if (!compliantExecNpcg && match.length > 1) {
	                        match[0].replace(separator2, function () {
	                            for (var i = 1; i < arguments.length - 2; i++) {
	                                if (arguments[i] === void 0) {
	                                    match[i] = void 0;
	                                }
	                            }
	                        });
	                    }
	                    if (match.length > 1 && match.index < string.length) {
	                        ArrayPrototype.push.apply(output, match.slice(1));
	                    }
	                    lastLength = match[0].length;
	                    lastLastIndex = lastIndex;
	                    if (output.length >= limit) {
	                        break;
	                    }
	                }
	                if (separator.lastIndex === match.index) {
	                    separator.lastIndex++; // Avoid an infinite loop
	                }
	            }
	            if (lastLastIndex === string.length) {
	                if (lastLength || !separator.test('')) {
	                    output.push('');
	                }
	            } else {
	                output.push(string.slice(lastLastIndex));
	            }
	            return output.length > limit ? output.slice(0, limit) : output;
	        };
	    }());

	// [bugfix, chrome]
	// If separator is undefined, then the result array contains just one String,
	// which is the this value (converted to a String). If limit is not undefined,
	// then the output array is truncated so that it contains no more than limit
	// elements.
	// "0".split(undefined, 0) -> []
	} else if ('0'.split(void 0, 0).length) {
	    StringPrototype.split = function split(separator, limit) {
	        if (separator === void 0 && limit === 0) { return []; }
	        return string_split.call(this, separator, limit);
	    };
	}

	// ECMA-262, 3rd B.2.3
	// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
	// non-normative section suggesting uniform semantics and it should be
	// normalized across all browsers
	// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
	var string_substr = StringPrototype.substr;
	var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
	defineProperties(StringPrototype, {
	    substr: function substr(start, length) {
	        return string_substr.call(
	            this,
	            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
	            length
	        );
	    }
	}, hasNegativeSubstrBug);
	return shims;
}

var _escape;
var hasRequired_escape;

function require_escape () {
	if (hasRequired_escape) return _escape;
	hasRequired_escape = 1;

	// Some extra characters that Chrome gets wrong, and substitutes with
	// something else on the wire.
	// eslint-disable-next-line no-control-regex, no-misleading-character-class
	var extraEscapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g
	  , extraLookup;

	// This may be quite slow, so let's delay until user actually uses bad
	// characters.
	var unrollLookup = function(escapable) {
	  var i;
	  var unrolled = {};
	  var c = [];
	  for (i = 0; i < 65536; i++) {
	    c.push( String.fromCharCode(i) );
	  }
	  escapable.lastIndex = 0;
	  c.join('').replace(escapable, function(a) {
	    unrolled[ a ] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	    return '';
	  });
	  escapable.lastIndex = 0;
	  return unrolled;
	};

	// Quote string, also taking care of unicode characters that browsers
	// often break. Especially, take care of unicode surrogates:
	// http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
	_escape = {
	  quote: function(string) {
	    var quoted = JSON.stringify(string);

	    // In most cases this should be very fast and good enough.
	    extraEscapable.lastIndex = 0;
	    if (!extraEscapable.test(quoted)) {
	      return quoted;
	    }

	    if (!extraLookup) {
	      extraLookup = unrollLookup(extraEscapable);
	    }

	    return quoted.replace(extraEscapable, function(a) {
	      return extraLookup[a];
	    });
	  }
	};
	return _escape;
}

var transport;
var hasRequiredTransport;

function requireTransport () {
	if (hasRequiredTransport) return transport;
	hasRequiredTransport = 1;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:utils:transport');
	}

	transport = function(availableTransports) {
	  return {
	    filterToEnabled: function(transportsWhitelist, info) {
	      var transports = {
	        main: []
	      , facade: []
	      };
	      if (!transportsWhitelist) {
	        transportsWhitelist = [];
	      } else if (typeof transportsWhitelist === 'string') {
	        transportsWhitelist = [transportsWhitelist];
	      }

	      availableTransports.forEach(function(trans) {
	        if (!trans) {
	          return;
	        }

	        if (trans.transportName === 'websocket' && info.websocket === false) {
	          debug('disabled from server', 'websocket');
	          return;
	        }

	        if (transportsWhitelist.length &&
	            transportsWhitelist.indexOf(trans.transportName) === -1) {
	          debug('not in whitelist', trans.transportName);
	          return;
	        }

	        if (trans.enabled(info)) {
	          debug('enabled', trans.transportName);
	          transports.main.push(trans);
	          if (trans.facadeTransport) {
	            transports.facade.push(trans.facadeTransport);
	          }
	        } else {
	          debug('disabled', trans.transportName);
	        }
	      });
	      return transports;
	    }
	  };
	};
	return transport;
}

var log;
var hasRequiredLog;

function requireLog () {
	if (hasRequiredLog) return log;
	hasRequiredLog = 1;

	var logObject = {};
	['log', 'debug', 'warn'].forEach(function (level) {
	  var levelExists;

	  try {
	    levelExists = commonjsGlobal.console && commonjsGlobal.console[level] && commonjsGlobal.console[level].apply;
	  } catch(e) {
	    // do nothing
	  }

	  logObject[level] = levelExists ? function () {
	    return commonjsGlobal.console[level].apply(commonjsGlobal.console, arguments);
	  } : (level === 'log' ? function () {} : logObject.log);
	});

	log = logObject;
	return log;
}

var event;
var hasRequiredEvent;

function requireEvent () {
	if (hasRequiredEvent) return event;
	hasRequiredEvent = 1;

	function Event(eventType) {
	  this.type = eventType;
	}

	Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
	  this.type = eventType;
	  this.bubbles = canBubble;
	  this.cancelable = cancelable;
	  this.timeStamp = +new Date();
	  return this;
	};

	Event.prototype.stopPropagation = function() {};
	Event.prototype.preventDefault = function() {};

	Event.CAPTURING_PHASE = 1;
	Event.AT_TARGET = 2;
	Event.BUBBLING_PHASE = 3;

	event = Event;
	return event;
}

var location;
var hasRequiredLocation;

function requireLocation () {
	if (hasRequiredLocation) return location;
	hasRequiredLocation = 1;

	location = commonjsGlobal.location || {
	  origin: 'http://localhost:80'
	, protocol: 'http:'
	, host: 'localhost'
	, port: 80
	, href: 'http://localhost/'
	, hash: ''
	};
	return location;
}

var close;
var hasRequiredClose;

function requireClose () {
	if (hasRequiredClose) return close;
	hasRequiredClose = 1;

	var inherits = requireInherits_browser()
	  , Event = requireEvent()
	  ;

	function CloseEvent() {
	  Event.call(this);
	  this.initEvent('close', false, false);
	  this.wasClean = false;
	  this.code = 0;
	  this.reason = '';
	}

	inherits(CloseEvent, Event);

	close = CloseEvent;
	return close;
}

var transMessage;
var hasRequiredTransMessage;

function requireTransMessage () {
	if (hasRequiredTransMessage) return transMessage;
	hasRequiredTransMessage = 1;

	var inherits = requireInherits_browser()
	  , Event = requireEvent()
	  ;

	function TransportMessageEvent(data) {
	  Event.call(this);
	  this.initEvent('message', false, false);
	  this.data = data;
	}

	inherits(TransportMessageEvent, Event);

	transMessage = TransportMessageEvent;
	return transMessage;
}

var xhrFake;
var hasRequiredXhrFake;

function requireXhrFake () {
	if (hasRequiredXhrFake) return xhrFake;
	hasRequiredXhrFake = 1;

	var EventEmitter = requireEmitter().EventEmitter
	  , inherits = requireInherits_browser()
	  ;

	function XHRFake(/* method, url, payload, opts */) {
	  var self = this;
	  EventEmitter.call(this);

	  this.to = setTimeout(function() {
	    self.emit('finish', 200, '{}');
	  }, XHRFake.timeout);
	}

	inherits(XHRFake, EventEmitter);

	XHRFake.prototype.close = function() {
	  clearTimeout(this.to);
	};

	XHRFake.timeout = 2000;

	xhrFake = XHRFake;
	return xhrFake;
}

var infoAjax;
var hasRequiredInfoAjax;

function requireInfoAjax () {
	if (hasRequiredInfoAjax) return infoAjax;
	hasRequiredInfoAjax = 1;

	var EventEmitter = requireEmitter().EventEmitter
	  , inherits = requireInherits_browser()
	  , objectUtils = requireObject()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:info-ajax');
	}

	function InfoAjax(url, AjaxObject) {
	  EventEmitter.call(this);

	  var self = this;
	  var t0 = +new Date();
	  this.xo = new AjaxObject('GET', url);

	  this.xo.once('finish', function(status, text) {
	    var info, rtt;
	    if (status === 200) {
	      rtt = (+new Date()) - t0;
	      if (text) {
	        try {
	          info = JSON.parse(text);
	        } catch (e) {
	          debug('bad json', text);
	        }
	      }

	      if (!objectUtils.isObject(info)) {
	        info = {};
	      }
	    }
	    self.emit('finish', info, rtt);
	    self.removeAllListeners();
	  });
	}

	inherits(InfoAjax, EventEmitter);

	InfoAjax.prototype.close = function() {
	  this.removeAllListeners();
	  this.xo.close();
	};

	infoAjax = InfoAjax;
	return infoAjax;
}

var infoIframeReceiver;
var hasRequiredInfoIframeReceiver;

function requireInfoIframeReceiver () {
	if (hasRequiredInfoIframeReceiver) return infoIframeReceiver;
	hasRequiredInfoIframeReceiver = 1;

	var inherits = requireInherits_browser()
	  , EventEmitter = requireEmitter().EventEmitter
	  , XHRLocalObject = requireXhrLocal()
	  , InfoAjax = requireInfoAjax()
	  ;

	function InfoReceiverIframe(transUrl) {
	  var self = this;
	  EventEmitter.call(this);

	  this.ir = new InfoAjax(transUrl, XHRLocalObject);
	  this.ir.once('finish', function(info, rtt) {
	    self.ir = null;
	    self.emit('message', JSON.stringify([info, rtt]));
	  });
	}

	inherits(InfoReceiverIframe, EventEmitter);

	InfoReceiverIframe.transportName = 'iframe-info-receiver';

	InfoReceiverIframe.prototype.close = function() {
	  if (this.ir) {
	    this.ir.close();
	    this.ir = null;
	  }
	  this.removeAllListeners();
	};

	infoIframeReceiver = InfoReceiverIframe;
	return infoIframeReceiver;
}

var infoIframe;
var hasRequiredInfoIframe;

function requireInfoIframe () {
	if (hasRequiredInfoIframe) return infoIframe;
	hasRequiredInfoIframe = 1;

	var EventEmitter = requireEmitter().EventEmitter
	  , inherits = requireInherits_browser()
	  , utils = requireEvent$1()
	  , IframeTransport = requireIframe()
	  , InfoReceiverIframe = requireInfoIframeReceiver()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:info-iframe');
	}

	function InfoIframe(baseUrl, url) {
	  var self = this;
	  EventEmitter.call(this);

	  var go = function() {
	    var ifr = self.ifr = new IframeTransport(InfoReceiverIframe.transportName, url, baseUrl);

	    ifr.once('message', function(msg) {
	      if (msg) {
	        var d;
	        try {
	          d = JSON.parse(msg);
	        } catch (e) {
	          debug('bad json', msg);
	          self.emit('finish');
	          self.close();
	          return;
	        }

	        var info = d[0], rtt = d[1];
	        self.emit('finish', info, rtt);
	      }
	      self.close();
	    });

	    ifr.once('close', function() {
	      self.emit('finish');
	      self.close();
	    });
	  };

	  // TODO this seems the same as the 'needBody' from transports
	  if (!commonjsGlobal.document.body) {
	    utils.attachEvent('load', go);
	  } else {
	    go();
	  }
	}

	inherits(InfoIframe, EventEmitter);

	InfoIframe.enabled = function() {
	  return IframeTransport.enabled();
	};

	InfoIframe.prototype.close = function() {
	  if (this.ifr) {
	    this.ifr.close();
	  }
	  this.removeAllListeners();
	  this.ifr = null;
	};

	infoIframe = InfoIframe;
	return infoIframe;
}

var infoReceiver;
var hasRequiredInfoReceiver;

function requireInfoReceiver () {
	if (hasRequiredInfoReceiver) return infoReceiver;
	hasRequiredInfoReceiver = 1;

	var EventEmitter = requireEmitter().EventEmitter
	  , inherits = requireInherits_browser()
	  , urlUtils = requireUrl()
	  , XDR = requireXdr()
	  , XHRCors = requireXhrCors()
	  , XHRLocal = requireXhrLocal()
	  , XHRFake = requireXhrFake()
	  , InfoIframe = requireInfoIframe()
	  , InfoAjax = requireInfoAjax()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:info-receiver');
	}

	function InfoReceiver(baseUrl, urlInfo) {
	  debug(baseUrl);
	  var self = this;
	  EventEmitter.call(this);

	  setTimeout(function() {
	    self.doXhr(baseUrl, urlInfo);
	  }, 0);
	}

	inherits(InfoReceiver, EventEmitter);

	// TODO this is currently ignoring the list of available transports and the whitelist

	InfoReceiver._getReceiver = function(baseUrl, url, urlInfo) {
	  // determine method of CORS support (if needed)
	  if (urlInfo.sameOrigin) {
	    return new InfoAjax(url, XHRLocal);
	  }
	  if (XHRCors.enabled) {
	    return new InfoAjax(url, XHRCors);
	  }
	  if (XDR.enabled && urlInfo.sameScheme) {
	    return new InfoAjax(url, XDR);
	  }
	  if (InfoIframe.enabled()) {
	    return new InfoIframe(baseUrl, url);
	  }
	  return new InfoAjax(url, XHRFake);
	};

	InfoReceiver.prototype.doXhr = function(baseUrl, urlInfo) {
	  var self = this
	    , url = urlUtils.addPath(baseUrl, '/info')
	    ;
	  debug('doXhr', url);

	  this.xo = InfoReceiver._getReceiver(baseUrl, url, urlInfo);

	  this.timeoutRef = setTimeout(function() {
	    debug('timeout');
	    self._cleanup(false);
	    self.emit('finish');
	  }, InfoReceiver.timeout);

	  this.xo.once('finish', function(info, rtt) {
	    debug('finish', info, rtt);
	    self._cleanup(true);
	    self.emit('finish', info, rtt);
	  });
	};

	InfoReceiver.prototype._cleanup = function(wasClean) {
	  debug('_cleanup');
	  clearTimeout(this.timeoutRef);
	  this.timeoutRef = null;
	  if (!wasClean && this.xo) {
	    this.xo.close();
	  }
	  this.xo = null;
	};

	InfoReceiver.prototype.close = function() {
	  debug('close');
	  this.removeAllListeners();
	  this._cleanup(false);
	};

	InfoReceiver.timeout = 8000;

	infoReceiver = InfoReceiver;
	return infoReceiver;
}

var facade;
var hasRequiredFacade;

function requireFacade () {
	if (hasRequiredFacade) return facade;
	hasRequiredFacade = 1;

	var iframeUtils = requireIframe$1()
	  ;

	function FacadeJS(transport) {
	  this._transport = transport;
	  transport.on('message', this._transportMessage.bind(this));
	  transport.on('close', this._transportClose.bind(this));
	}

	FacadeJS.prototype._transportClose = function(code, reason) {
	  iframeUtils.postMessage('c', JSON.stringify([code, reason]));
	};
	FacadeJS.prototype._transportMessage = function(frame) {
	  iframeUtils.postMessage('t', frame);
	};
	FacadeJS.prototype._send = function(data) {
	  this._transport.send(data);
	};
	FacadeJS.prototype._close = function() {
	  this._transport.close();
	  this._transport.removeAllListeners();
	};

	facade = FacadeJS;
	return facade;
}

var iframeBootstrap;
var hasRequiredIframeBootstrap;

function requireIframeBootstrap () {
	if (hasRequiredIframeBootstrap) return iframeBootstrap;
	hasRequiredIframeBootstrap = 1;

	var urlUtils = requireUrl()
	  , eventUtils = requireEvent$1()
	  , FacadeJS = requireFacade()
	  , InfoIframeReceiver = requireInfoIframeReceiver()
	  , iframeUtils = requireIframe$1()
	  , loc = requireLocation()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:iframe-bootstrap');
	}

	iframeBootstrap = function(SockJS, availableTransports) {
	  var transportMap = {};
	  availableTransports.forEach(function(at) {
	    if (at.facadeTransport) {
	      transportMap[at.facadeTransport.transportName] = at.facadeTransport;
	    }
	  });

	  // hard-coded for the info iframe
	  // TODO see if we can make this more dynamic
	  transportMap[InfoIframeReceiver.transportName] = InfoIframeReceiver;
	  var parentOrigin;

	  /* eslint-disable camelcase */
	  SockJS.bootstrap_iframe = function() {
	    /* eslint-enable camelcase */
	    var facade;
	    iframeUtils.currentWindowId = loc.hash.slice(1);
	    var onMessage = function(e) {
	      if (e.source !== parent) {
	        return;
	      }
	      if (typeof parentOrigin === 'undefined') {
	        parentOrigin = e.origin;
	      }
	      if (e.origin !== parentOrigin) {
	        return;
	      }

	      var iframeMessage;
	      try {
	        iframeMessage = JSON.parse(e.data);
	      } catch (ignored) {
	        debug('bad json', e.data);
	        return;
	      }

	      if (iframeMessage.windowId !== iframeUtils.currentWindowId) {
	        return;
	      }
	      switch (iframeMessage.type) {
	      case 's':
	        var p;
	        try {
	          p = JSON.parse(iframeMessage.data);
	        } catch (ignored) {
	          debug('bad json', iframeMessage.data);
	          break;
	        }
	        var version = p[0];
	        var transport = p[1];
	        var transUrl = p[2];
	        var baseUrl = p[3];
	        debug(version, transport, transUrl, baseUrl);
	        // change this to semver logic
	        if (version !== SockJS.version) {
	          throw new Error('Incompatible SockJS! Main site uses:' +
	                    ' "' + version + '", the iframe:' +
	                    ' "' + SockJS.version + '".');
	        }

	        if (!urlUtils.isOriginEqual(transUrl, loc.href) ||
	            !urlUtils.isOriginEqual(baseUrl, loc.href)) {
	          throw new Error('Can\'t connect to different domain from within an ' +
	                    'iframe. (' + loc.href + ', ' + transUrl + ', ' + baseUrl + ')');
	        }
	        facade = new FacadeJS(new transportMap[transport](transUrl, baseUrl));
	        break;
	      case 'm':
	        facade._send(iframeMessage.data);
	        break;
	      case 'c':
	        if (facade) {
	          facade._close();
	        }
	        facade = null;
	        break;
	      }
	    };

	    eventUtils.attachEvent('message', onMessage);

	    // Start
	    iframeUtils.postMessage('s');
	  };
	};
	return iframeBootstrap;
}

var main;
var hasRequiredMain;

function requireMain () {
	if (hasRequiredMain) return main;
	hasRequiredMain = 1;

	requireShims();

	var URL = requireUrlParse()
	  , inherits = requireInherits_browser()
	  , random = requireRandom()
	  , escape = require_escape()
	  , urlUtils = requireUrl()
	  , eventUtils = requireEvent$1()
	  , transport = requireTransport()
	  , objectUtils = requireObject()
	  , browser = requireBrowser()
	  , log = requireLog()
	  , Event = requireEvent()
	  , EventTarget = requireEventtarget()
	  , loc = requireLocation()
	  , CloseEvent = requireClose()
	  , TransportMessageEvent = requireTransMessage()
	  , InfoReceiver = requireInfoReceiver()
	  ;

	var debug = function() {};
	if (process.env.NODE_ENV !== 'production') {
	  debug = requireBrowser$1()('sockjs-client:main');
	}

	var transports;

	// follow constructor steps defined at http://dev.w3.org/html5/websockets/#the-websocket-interface
	function SockJS(url, protocols, options) {
	  if (!(this instanceof SockJS)) {
	    return new SockJS(url, protocols, options);
	  }
	  if (arguments.length < 1) {
	    throw new TypeError("Failed to construct 'SockJS: 1 argument required, but only 0 present");
	  }
	  EventTarget.call(this);

	  this.readyState = SockJS.CONNECTING;
	  this.extensions = '';
	  this.protocol = '';

	  // non-standard extension
	  options = options || {};
	  if (options.protocols_whitelist) {
	    log.warn("'protocols_whitelist' is DEPRECATED. Use 'transports' instead.");
	  }
	  this._transportsWhitelist = options.transports;
	  this._transportOptions = options.transportOptions || {};
	  this._timeout = options.timeout || 0;

	  var sessionId = options.sessionId || 8;
	  if (typeof sessionId === 'function') {
	    this._generateSessionId = sessionId;
	  } else if (typeof sessionId === 'number') {
	    this._generateSessionId = function() {
	      return random.string(sessionId);
	    };
	  } else {
	    throw new TypeError('If sessionId is used in the options, it needs to be a number or a function.');
	  }

	  this._server = options.server || random.numberString(1000);

	  // Step 1 of WS spec - parse and validate the url. Issue #8
	  var parsedUrl = new URL(url);
	  if (!parsedUrl.host || !parsedUrl.protocol) {
	    throw new SyntaxError("The URL '" + url + "' is invalid");
	  } else if (parsedUrl.hash) {
	    throw new SyntaxError('The URL must not contain a fragment');
	  } else if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
	    throw new SyntaxError("The URL's scheme must be either 'http:' or 'https:'. '" + parsedUrl.protocol + "' is not allowed.");
	  }

	  var secure = parsedUrl.protocol === 'https:';
	  // Step 2 - don't allow secure origin with an insecure protocol
	  if (loc.protocol === 'https:' && !secure) {
	    // exception is 127.0.0.0/8 and ::1 urls
	    if (!urlUtils.isLoopbackAddr(parsedUrl.hostname)) {
	      throw new Error('SecurityError: An insecure SockJS connection may not be initiated from a page loaded over HTTPS');
	    }
	  }

	  // Step 3 - check port access - no need here
	  // Step 4 - parse protocols argument
	  if (!protocols) {
	    protocols = [];
	  } else if (!Array.isArray(protocols)) {
	    protocols = [protocols];
	  }

	  // Step 5 - check protocols argument
	  var sortedProtocols = protocols.sort();
	  sortedProtocols.forEach(function(proto, i) {
	    if (!proto) {
	      throw new SyntaxError("The protocols entry '" + proto + "' is invalid.");
	    }
	    if (i < (sortedProtocols.length - 1) && proto === sortedProtocols[i + 1]) {
	      throw new SyntaxError("The protocols entry '" + proto + "' is duplicated.");
	    }
	  });

	  // Step 6 - convert origin
	  var o = urlUtils.getOrigin(loc.href);
	  this._origin = o ? o.toLowerCase() : null;

	  // remove the trailing slash
	  parsedUrl.set('pathname', parsedUrl.pathname.replace(/\/+$/, ''));

	  // store the sanitized url
	  this.url = parsedUrl.href;
	  debug('using url', this.url);

	  // Step 7 - start connection in background
	  // obtain server info
	  // http://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html#section-26
	  this._urlInfo = {
	    nullOrigin: !browser.hasDomain()
	  , sameOrigin: urlUtils.isOriginEqual(this.url, loc.href)
	  , sameScheme: urlUtils.isSchemeEqual(this.url, loc.href)
	  };

	  this._ir = new InfoReceiver(this.url, this._urlInfo);
	  this._ir.once('finish', this._receiveInfo.bind(this));
	}

	inherits(SockJS, EventTarget);

	function userSetCode(code) {
	  return code === 1000 || (code >= 3000 && code <= 4999);
	}

	SockJS.prototype.close = function(code, reason) {
	  // Step 1
	  if (code && !userSetCode(code)) {
	    throw new Error('InvalidAccessError: Invalid code');
	  }
	  // Step 2.4 states the max is 123 bytes, but we are just checking length
	  if (reason && reason.length > 123) {
	    throw new SyntaxError('reason argument has an invalid length');
	  }

	  // Step 3.1
	  if (this.readyState === SockJS.CLOSING || this.readyState === SockJS.CLOSED) {
	    return;
	  }

	  // TODO look at docs to determine how to set this
	  var wasClean = true;
	  this._close(code || 1000, reason || 'Normal closure', wasClean);
	};

	SockJS.prototype.send = function(data) {
	  // #13 - convert anything non-string to string
	  // TODO this currently turns objects into [object Object]
	  if (typeof data !== 'string') {
	    data = '' + data;
	  }
	  if (this.readyState === SockJS.CONNECTING) {
	    throw new Error('InvalidStateError: The connection has not been established yet');
	  }
	  if (this.readyState !== SockJS.OPEN) {
	    return;
	  }
	  this._transport.send(escape.quote(data));
	};

	SockJS.version = requireVersion();

	SockJS.CONNECTING = 0;
	SockJS.OPEN = 1;
	SockJS.CLOSING = 2;
	SockJS.CLOSED = 3;

	SockJS.prototype._receiveInfo = function(info, rtt) {
	  debug('_receiveInfo', rtt);
	  this._ir = null;
	  if (!info) {
	    this._close(1002, 'Cannot connect to server');
	    return;
	  }

	  // establish a round-trip timeout (RTO) based on the
	  // round-trip time (RTT)
	  this._rto = this.countRTO(rtt);
	  // allow server to override url used for the actual transport
	  this._transUrl = info.base_url ? info.base_url : this.url;
	  info = objectUtils.extend(info, this._urlInfo);
	  debug('info', info);
	  // determine list of desired and supported transports
	  var enabledTransports = transports.filterToEnabled(this._transportsWhitelist, info);
	  this._transports = enabledTransports.main;
	  debug(this._transports.length + ' enabled transports');

	  this._connect();
	};

	SockJS.prototype._connect = function() {
	  for (var Transport = this._transports.shift(); Transport; Transport = this._transports.shift()) {
	    debug('attempt', Transport.transportName);
	    if (Transport.needBody) {
	      if (!commonjsGlobal.document.body ||
	          (typeof commonjsGlobal.document.readyState !== 'undefined' &&
	            commonjsGlobal.document.readyState !== 'complete' &&
	            commonjsGlobal.document.readyState !== 'interactive')) {
	        debug('waiting for body');
	        this._transports.unshift(Transport);
	        eventUtils.attachEvent('load', this._connect.bind(this));
	        return;
	      }
	    }

	    // calculate timeout based on RTO and round trips. Default to 5s
	    var timeoutMs = Math.max(this._timeout, (this._rto * Transport.roundTrips) || 5000);
	    this._transportTimeoutId = setTimeout(this._transportTimeout.bind(this), timeoutMs);
	    debug('using timeout', timeoutMs);

	    var transportUrl = urlUtils.addPath(this._transUrl, '/' + this._server + '/' + this._generateSessionId());
	    var options = this._transportOptions[Transport.transportName];
	    debug('transport url', transportUrl);
	    var transportObj = new Transport(transportUrl, this._transUrl, options);
	    transportObj.on('message', this._transportMessage.bind(this));
	    transportObj.once('close', this._transportClose.bind(this));
	    transportObj.transportName = Transport.transportName;
	    this._transport = transportObj;

	    return;
	  }
	  this._close(2000, 'All transports failed', false);
	};

	SockJS.prototype._transportTimeout = function() {
	  debug('_transportTimeout');
	  if (this.readyState === SockJS.CONNECTING) {
	    if (this._transport) {
	      this._transport.close();
	    }

	    this._transportClose(2007, 'Transport timed out');
	  }
	};

	SockJS.prototype._transportMessage = function(msg) {
	  debug('_transportMessage', msg);
	  var self = this
	    , type = msg.slice(0, 1)
	    , content = msg.slice(1)
	    , payload
	    ;

	  // first check for messages that don't need a payload
	  switch (type) {
	    case 'o':
	      this._open();
	      return;
	    case 'h':
	      this.dispatchEvent(new Event('heartbeat'));
	      debug('heartbeat', this.transport);
	      return;
	  }

	  if (content) {
	    try {
	      payload = JSON.parse(content);
	    } catch (e) {
	      debug('bad json', content);
	    }
	  }

	  if (typeof payload === 'undefined') {
	    debug('empty payload', content);
	    return;
	  }

	  switch (type) {
	    case 'a':
	      if (Array.isArray(payload)) {
	        payload.forEach(function(p) {
	          debug('message', self.transport, p);
	          self.dispatchEvent(new TransportMessageEvent(p));
	        });
	      }
	      break;
	    case 'm':
	      debug('message', this.transport, payload);
	      this.dispatchEvent(new TransportMessageEvent(payload));
	      break;
	    case 'c':
	      if (Array.isArray(payload) && payload.length === 2) {
	        this._close(payload[0], payload[1], true);
	      }
	      break;
	  }
	};

	SockJS.prototype._transportClose = function(code, reason) {
	  debug('_transportClose', this.transport, code, reason);
	  if (this._transport) {
	    this._transport.removeAllListeners();
	    this._transport = null;
	    this.transport = null;
	  }

	  if (!userSetCode(code) && code !== 2000 && this.readyState === SockJS.CONNECTING) {
	    this._connect();
	    return;
	  }

	  this._close(code, reason);
	};

	SockJS.prototype._open = function() {
	  debug('_open', this._transport && this._transport.transportName, this.readyState);
	  if (this.readyState === SockJS.CONNECTING) {
	    if (this._transportTimeoutId) {
	      clearTimeout(this._transportTimeoutId);
	      this._transportTimeoutId = null;
	    }
	    this.readyState = SockJS.OPEN;
	    this.transport = this._transport.transportName;
	    this.dispatchEvent(new Event('open'));
	    debug('connected', this.transport);
	  } else {
	    // The server might have been restarted, and lost track of our
	    // connection.
	    this._close(1006, 'Server lost session');
	  }
	};

	SockJS.prototype._close = function(code, reason, wasClean) {
	  debug('_close', this.transport, code, reason, wasClean, this.readyState);
	  var forceFail = false;

	  if (this._ir) {
	    forceFail = true;
	    this._ir.close();
	    this._ir = null;
	  }
	  if (this._transport) {
	    this._transport.close();
	    this._transport = null;
	    this.transport = null;
	  }

	  if (this.readyState === SockJS.CLOSED) {
	    throw new Error('InvalidStateError: SockJS has already been closed');
	  }

	  this.readyState = SockJS.CLOSING;
	  setTimeout(function() {
	    this.readyState = SockJS.CLOSED;

	    if (forceFail) {
	      this.dispatchEvent(new Event('error'));
	    }

	    var e = new CloseEvent('close');
	    e.wasClean = wasClean || false;
	    e.code = code || 1000;
	    e.reason = reason;

	    this.dispatchEvent(e);
	    this.onmessage = this.onclose = this.onerror = null;
	    debug('disconnected');
	  }.bind(this), 0);
	};

	// See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
	// and RFC 2988.
	SockJS.prototype.countRTO = function(rtt) {
	  // In a local environment, when using IE8/9 and the `jsonp-polling`
	  // transport the time needed to establish a connection (the time that pass
	  // from the opening of the transport to the call of `_dispatchOpen`) is
	  // around 200msec (the lower bound used in the article above) and this
	  // causes spurious timeouts. For this reason we calculate a value slightly
	  // larger than that used in the article.
	  if (rtt > 100) {
	    return 4 * rtt; // rto > 400msec
	  }
	  return 300 + rtt; // 300msec < rto <= 400msec
	};

	main = function(availableTransports) {
	  transports = transport(availableTransports);
	  requireIframeBootstrap()(SockJS, availableTransports);
	  return SockJS;
	};
	return main;
}

var entry;
var hasRequiredEntry;

function requireEntry () {
	if (hasRequiredEntry) return entry;
	hasRequiredEntry = 1;

	var transportList = requireTransportList();

	entry = requireMain()(transportList);

	// TODO can't get rid of this until all servers do
	if ('_sockjs_onload' in commonjsGlobal) {
	  setTimeout(commonjsGlobal._sockjs_onload, 1);
	}
	return entry;
}

var types = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MsgMod = void 0;
	(function (MsgMod) {
	    MsgMod["File"] = "0";
	    MsgMod["Mem"] = "1";
	})(exports.MsgMod || (exports.MsgMod = {}));
} (types));

var socketContext = {};

var hasRequiredSocketContext;

function requireSocketContext () {
	if (hasRequiredSocketContext) return socketContext;
	hasRequiredSocketContext = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.SocketContext = exports.SocketContextError = exports.SocketContextErrorCode = void 0;
		const data_1 = requireData();
		const websocketClient_1 = requireWebsocketClient();
		const types_1 = types;
		var SocketContextErrorCode;
		(function (SocketContextErrorCode) {
		    // 参数转换异常
		    SocketContextErrorCode["CONVERT_PARAM"] = "CONVERT_PARAM";
		    // 操作文件失败
		    SocketContextErrorCode["OPERATION_FILE"] = "OPERATION_FILE";
		    // 异常返回
		    SocketContextErrorCode["NO_REED_RETURN"] = "NO_REED_RETURN";
		    // 已经成功返回
		    SocketContextErrorCode["IS_RETURN_OK"] = "IS_RETURN_OK";
		    // 超时
		    SocketContextErrorCode["TIMEOUT"] = "TIMEOUT";
		    // 消息发送失败
		    SocketContextErrorCode["MSG_SEND"] = "MSG_SEND";
		    // 与服务器建立连接失败
		    SocketContextErrorCode["CONNECTION_SERVER"] = "CONNECTION_SERVER";
		})(SocketContextErrorCode = exports.SocketContextErrorCode || (exports.SocketContextErrorCode = {}));
		class SocketContextError extends Error {
		    constructor(code, msg, err) {
		        super(msg);
		        this.name = "socketContextError";
		        this._srcErr = err;
		        this._code = code;
		    }
		    get srcErr() {
		        return this._srcErr;
		    }
		    get code() {
		        return this._code;
		    }
		}
		exports.SocketContextError = SocketContextError;
		class SocketContext {
		    constructor(cmd, needReturn, msgId, mod, data) {
		        /**
		         * 字段名字.
		         * @private
		         */
		        this._fields = [];
		        /**
		         * 字段位置.
		         * @private
		         */
		        this._fieldsInfoMap = {};
		        /**
		         * 是否被销毁
		         * @private
		         */
		        this._isDestroy = false;
		        /**
		         * 是否为void类型.
		         * @private
		         */
		        this._isVoid = false;
		        /**
		         * 是否已经返回.
		         * @private
		         */
		        this._isReturnOk = false;
		        /**
		         * 是否需要返回.
		         * @private
		         */
		        this._needReturn = false;
		        /**
		         * 子级上下文.
		         * @private
		         */
		        this._childrenContext = [];
		        this._cmd = cmd;
		        this._needReturn = needReturn;
		        this._msgId = msgId;
		        this._mod = mod;
		        this._data = data;
		        if (data.length <= 0) {
		            return;
		        }
		        this.parseFields();
		    }
		    get isReturnOk() {
		        const ok = this._isReturnOk;
		        if (!ok) {
		            this._isReturnOk = true;
		        }
		        return ok;
		    }
		    get needReturn() {
		        const ok = this._needReturn;
		        if (ok) {
		            this._needReturn = false;
		        }
		        return ok;
		    }
		    get sendInfo() {
		        // this._isReturnOk = true;
		        const sendInfo = this._sendInfo;
		        this._sendInfo = undefined;
		        return sendInfo;
		    }
		    get isVoid() {
		        return this._isVoid;
		    }
		    get err() {
		        return this._err;
		    }
		    get fields() {
		        return this._fields;
		    }
		    get data() {
		        return this._data;
		    }
		    get cmd() {
		        return this._cmd;
		    }
		    get msgId() {
		        return this._msgId;
		    }
		    get mod() {
		        return this._mod;
		    }
		    static createSendMsgContext(cmd, options = {}) {
		        // let mod: MsgMod = MsgMod.File;
		        const mod = options.mod === types_1.MsgMod.Mem || options.mod === types_1.MsgMod.File
		            ? options.mod
		            : websocketClient_1.WebsocketClient.requireFn
		                ? types_1.MsgMod.File
		                : types_1.MsgMod.Mem;
		        const needReturn = (options && options.needReturn) || false;
		        let data;
		        // const msgId = `${v4()}${new Date().getTime()}`;
		        const msgId = `${Math.random()}-${new Date().getTime()}`;
		        const context = new SocketContext(cmd, false, msgId, mod, "");
		        try {
		            if (mod === types_1.MsgMod.Mem) {
		                if (options && typeof options.data !== "undefined") {
		                    data = data_1.marshal(options.data);
		                }
		                else {
		                    data = data_1.marshalVoid();
		                }
		            }
		            else {
		                if (options && options.data !== "undefined") {
		                    data = data_1.marshal2FilePath(options.data);
		                }
		                else {
		                    data = data_1.marshalVoid2FilePath();
		                }
		            }
		        }
		        catch (e) {
		            context._err = new SocketContextError(SocketContextErrorCode.CONVERT_PARAM, "参数转换异常", e);
		            return context;
		        }
		        context._sendInfo = {
		            cmd,
		            msgId,
		            mod,
		            data,
		            needReturn,
		            timeout: options && options.timeout,
		        };
		        return context;
		    }
		    parseFields() {
		        if (this._mod === "0") {
		            this.parseFileFields();
		        }
		        else {
		            this.parseMemFields();
		        }
		    }
		    parseFileFields() {
		        try {
		            const fs = websocketClient_1.WebsocketClient.requireFn("fs");
		            const { Buffer } = websocketClient_1.WebsocketClient.requireFn("buffer");
		            this._fd = fs.openSync(this.data, "r");
		            const buffer = Buffer.alloc(1);
		            fs.readSync(this._fd, buffer, 0, 1, 0);
		            const dataHeader = buffer.toString("utf-8");
		            if (data_1.dataIsVoid(dataHeader)) {
		                this._isVoid = true;
		                return;
		            }
		            if (data_1.dataIsError(dataHeader)) {
		                const errData = data_1.unmarshalErrByFile(fs, this._fd, Buffer);
		                this._err = new SocketContextError(errData.code, errData.msg, undefined);
		                return;
		            }
		            this._fieldsInfoMap = data_1.unmarshalFieldInfoByFile(fs, this._fd, Buffer);
		        }
		        catch (e) {
		            this._err = new SocketContextError(SocketContextErrorCode.OPERATION_FILE, "操作文件失败", e);
		        }
		    }
		    parseMemFields() {
		        const header = this._data[0];
		        if (data_1.dataIsVoid(header)) {
		            this._isVoid = true;
		            return;
		        }
		        if (data_1.dataIsError(header)) {
		            const errData = data_1.unmarshalErr(this._data);
		            this._err = new SocketContextError(errData.code, errData.msg, undefined);
		            return;
		        }
		        this._fieldsInfoMap = data_1.unmarshalFieldInfo(this._data);
		    }
		    unmarshal() {
		        if (this.mod === "0") {
		            return data_1.unmarshalByFilePath(this.data);
		        }
		        return data_1.unmarshal(this.data);
		    }
		    settingChildrenContext(context) {
		        this._childrenContext.push(context);
		    }
		    param(key) {
		        return this._fieldsInfoMap[key];
		    }
		    async returnVoid(options = {}) {
		        let data;
		        if (this.mod === types_1.MsgMod.Mem) {
		            data = data_1.marshalVoid();
		        }
		        else {
		            data = data_1.marshalVoid2FilePath();
		        }
		        return this.returnMsg(data, options);
		    }
		    async returnErr(code, msg, options = {}) {
		        let data;
		        if (this.mod === types_1.MsgMod.Mem) {
		            data = data_1.marshalErr(code, msg);
		        }
		        else {
		            data = data_1.marshalErr2FilePath(code, msg);
		        }
		        return this.returnMsg(data, options);
		    }
		    async returnObj(obj, options = {}) {
		        let data;
		        if (this._mod === types_1.MsgMod.Mem) {
		            data = data_1.marshal(obj);
		        }
		        else {
		            data = data_1.marshal2FilePath(obj);
		        }
		        return this.returnMsg(data, options);
		    }
		    async returnMsg(data, options = {}) {
		        if (!this.needReturn) {
		            return Promise.reject(new SocketContextError(SocketContextErrorCode.NO_REED_RETURN, "不需要进行返回"));
		        }
		        if (this.isReturnOk) {
		            return Promise.reject(new SocketContextError(SocketContextErrorCode.IS_RETURN_OK, "已经正常返回过了, 请勿重复返回"));
		        }
		        this._sendInfo = {
		            msgId: this.msgId,
		            mod: this._mod,
		            data,
		            timeout: options.timeout,
		            needReturn: options.needReturn,
		        };
		        return await websocketClient_1.WebsocketClient.getConn().sendMsg(this);
		    }
		    async destroy() {
		        if (this._isDestroy) {
		            return;
		        }
		        websocketClient_1.WebsocketClient.rmWaitMsg(this._msgId);
		        if (!this.isReturnOk && this.needReturn) {
		            try {
		                const data = data_1.marshalVoid();
		                this._sendInfo = {
		                    data,
		                    mod: types_1.MsgMod.Mem,
		                    msgId: this._msgId,
		                };
		                await websocketClient_1.WebsocketClient.getConn().sendMsg(this);
		            }
		            catch (e) {
		            }
		            finally {
		            }
		        }
		        // try {
		        //   await WebsocketClient.getConn().sendMsg(this);
		        // } catch (e) {
		        // } finally {
		        //
		        // }
		        this._cmd = "";
		        this._fields = [];
		        this._err = undefined;
		        this._fieldsInfoMap = {};
		        this._msgId = "";
		        if (this._mod === "0") {
		            try {
		                const fs = websocketClient_1.WebsocketClient.requireFn("fs");
		                fs.unlinkSync(this._data);
		                console.log("删除 => ", this._data, "成功");
		            }
		            catch (e) {
		                console.log("删除文件出错 => ", e.message);
		            }
		        }
		        this._mod = "";
		        this._data = "";
		        if (this._childrenContext.length > 0) {
		            for (let c of this._childrenContext) {
		                c.destroy()
		                    .then((d) => { })
		                    .catch((e) => { });
		            }
		        }
		        this._childrenContext = [];
		        this._isDestroy = true;
		    }
		}
		exports.SocketContext = SocketContext;
		/**
		 * 字段分隔符.
		 * @private
		 */
		SocketContext._fieldSplitChar = ";";
} (socketContext));
	return socketContext;
}

var asyncLock = {};

var hasRequiredAsyncLock;

function requireAsyncLock () {
	if (hasRequiredAsyncLock) return asyncLock;
	hasRequiredAsyncLock = 1;
	Object.defineProperty(asyncLock, "__esModule", { value: true });
	//@ts-nocheck
	function AsyncLock(opts) {
	    opts = opts || {};
	    this.Promise = opts.Promise || Promise;
	    // format: {key : [fn, fn]}
	    // queues[key] = null indicates no job running for key
	    this.queues = Object.create(null);
	    // lock is reentrant for same domain
	    this.domainReentrant = opts.domainReentrant || false;
	    if (this.domainReentrant) {
	        if (typeof process === "undefined" ||
	            typeof process.domain === "undefined") {
	            throw new Error("Domain-reentrant locks require `process.domain` to exist. Please flip `opts.domainReentrant = false`, " +
	                "use a NodeJS version that still implements Domain, or install a browser polyfill.");
	        }
	        // domain of current running func {key : fn}
	        this.domains = Object.create(null);
	    }
	    this.timeout = opts.timeout || AsyncLock.DEFAULT_TIMEOUT;
	    this.maxOccupationTime =
	        opts.maxOccupationTime || AsyncLock.DEFAULT_MAX_OCCUPATION_TIME;
	    if (opts.maxPending === Infinity ||
	        (Number.isInteger(opts.maxPending) && opts.maxPending >= 0)) {
	        this.maxPending = opts.maxPending;
	    }
	    else {
	        this.maxPending = AsyncLock.DEFAULT_MAX_PENDING;
	    }
	}
	asyncLock.default = AsyncLock;
	AsyncLock.DEFAULT_TIMEOUT = 0; //Never
	AsyncLock.DEFAULT_MAX_OCCUPATION_TIME = 0; //Never
	AsyncLock.DEFAULT_MAX_PENDING = 1000;
	/**
	 * Acquire Locks
	 *
	 * @param {String|Array} key 	resource key or keys to lock
	 * @param {function} fn 	async function
	 * @param {function} cb 	callback function, otherwise will return a promise
	 * @param {Object} opts 	options
	 */
	AsyncLock.prototype.acquire = function (key, fn, cb, opts) {
	    if (Array.isArray(key)) {
	        return this._acquireBatch(key, fn, cb, opts);
	    }
	    if (typeof fn !== "function") {
	        throw new Error("You must pass a function to execute");
	    }
	    // faux-deferred promise using new Promise() (as Promise.defer is deprecated)
	    var deferredResolve = null;
	    var deferredReject = null;
	    var deferred = null;
	    if (typeof cb !== "function") {
	        opts = cb;
	        cb = null;
	        // will return a promise
	        deferred = new this.Promise(function (resolve, reject) {
	            deferredResolve = resolve;
	            deferredReject = reject;
	        });
	    }
	    opts = opts || {};
	    var resolved = false;
	    var timer = null;
	    var occupationTimer = null;
	    var self = this;
	    var done = function (locked, err, ret) {
	        if (occupationTimer) {
	            clearTimeout(occupationTimer);
	            occupationTimer = null;
	        }
	        if (locked) {
	            if (!!self.queues[key] && self.queues[key].length === 0) {
	                delete self.queues[key];
	            }
	            if (self.domainReentrant) {
	                delete self.domains[key];
	            }
	        }
	        if (!resolved) {
	            if (!deferred) {
	                if (typeof cb === "function") {
	                    cb(err, ret);
	                }
	            }
	            else {
	                //promise mode
	                if (err) {
	                    deferredReject(err);
	                }
	                else {
	                    deferredResolve(ret);
	                }
	            }
	            resolved = true;
	        }
	        if (locked) {
	            //run next func
	            if (!!self.queues[key] && self.queues[key].length > 0) {
	                self.queues[key].shift()();
	            }
	        }
	    };
	    var exec = function (locked) {
	        if (resolved) {
	            // may due to timed out
	            return done(locked);
	        }
	        if (timer) {
	            clearTimeout(timer);
	            timer = null;
	        }
	        if (self.domainReentrant && locked) {
	            self.domains[key] = process.domain;
	        }
	        // Callback mode
	        if (fn.length === 1) {
	            var called = false;
	            fn(function (err, ret) {
	                if (!called) {
	                    called = true;
	                    done(locked, err, ret);
	                }
	            });
	        }
	        else {
	            // Promise mode
	            self
	                ._promiseTry(function () {
	                return fn();
	            })
	                .then(function (ret) {
	                done(locked, undefined, ret);
	            }, function (error) {
	                done(locked, error);
	            });
	        }
	    };
	    if (self.domainReentrant && !!process.domain) {
	        exec = process.domain.bind(exec);
	    }
	    if (!self.queues[key]) {
	        self.queues[key] = [];
	        exec(true);
	    }
	    else if (self.domainReentrant &&
	        !!process.domain &&
	        process.domain === self.domains[key]) {
	        // If code is in the same domain of current running task, run it directly
	        // Since lock is re-enterable
	        exec(false);
	    }
	    else if (self.queues[key].length >= self.maxPending) {
	        done(false, new Error("Too much pending tasks"));
	    }
	    else {
	        var taskFn = function () {
	            exec(true);
	        };
	        if (opts.skipQueue) {
	            self.queues[key].unshift(taskFn);
	        }
	        else {
	            self.queues[key].push(taskFn);
	        }
	        var timeout = opts.timeout || self.timeout;
	        if (timeout) {
	            timer = setTimeout(function () {
	                timer = null;
	                done(false, new Error("async-lock timed out"));
	            }, timeout);
	        }
	    }
	    var maxOccupationTime = opts.maxOccupationTime || self.maxOccupationTime;
	    if (maxOccupationTime) {
	        occupationTimer = setTimeout(function () {
	            if (!!self.queues[key]) {
	                done(false, new Error("Maximum occupation time is exceeded"));
	            }
	        }, maxOccupationTime);
	    }
	    if (deferred) {
	        return deferred;
	    }
	};
	/*
	 * Below is how this function works:
	 *
	 * Equivalent code:
	 * self.acquire(key1, function(cb){
	 *     self.acquire(key2, function(cb){
	 *         self.acquire(key3, fn, cb);
	 *     }, cb);
	 * }, cb);
	 *
	 * Equivalent code:
	 * var fn3 = getFn(key3, fn);
	 * var fn2 = getFn(key2, fn3);
	 * var fn1 = getFn(key1, fn2);
	 * fn1(cb);
	 */
	AsyncLock.prototype._acquireBatch = function (keys, fn, cb, opts) {
	    if (typeof cb !== "function") {
	        opts = cb;
	        cb = null;
	    }
	    var self = this;
	    var getFn = function (key, fn) {
	        return function (cb) {
	            self.acquire(key, fn, cb, opts);
	        };
	    };
	    var fnx = fn;
	    keys.reverse().forEach(function (key) {
	        fnx = getFn(key, fnx);
	    });
	    if (typeof cb === "function") {
	        fnx(cb);
	    }
	    else {
	        return new this.Promise(function (resolve, reject) {
	            // check for promise mode in case keys is empty array
	            if (fnx.length === 1) {
	                fnx(function (err, ret) {
	                    if (err) {
	                        reject(err);
	                    }
	                    else {
	                        resolve(ret);
	                    }
	                });
	            }
	            else {
	                resolve(fnx());
	            }
	        });
	    }
	};
	/*
	 *	Whether there is any running or pending asyncFunc
	 *
	 *	@param {String} key
	 */
	AsyncLock.prototype.isBusy = function (key) {
	    if (!key) {
	        return Object.keys(this.queues).length > 0;
	    }
	    else {
	        return !!this.queues[key];
	    }
	};
	/**
	 * Promise.try() implementation to become independent of Q-specific methods
	 */
	AsyncLock.prototype._promiseTry = function (fn) {
	    try {
	        return this.Promise.resolve(fn());
	    }
	    catch (e) {
	        return this.Promise.reject(e);
	    }
	};
	return asyncLock;
}

var hasRequiredWebsocketClient;

function requireWebsocketClient () {
	if (hasRequiredWebsocketClient) return websocketClient;
	hasRequiredWebsocketClient = 1;
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(websocketClient, "__esModule", { value: true });
	websocketClient.SocketMsgHandler = websocketClient.WebsocketClient = void 0;
	const sockjs_client_1 = __importDefault(requireEntry());
	const types_1 = types;
	const socketContext_1 = requireSocketContext();
	const types_2 = types$1;
	const data_1 = requireData();
	const asyncLock_1 = __importDefault(requireAsyncLock());
	const lock = new asyncLock_1.default();
	const memDataEndFlag = "\r\n0\r\n";
	let msgBlockSize = 1024 * 1024;
	/**
	 * 客户端.
	 */
	class WebsocketClient {
	    /**
	     * 构造函数.
	     * @param url 连接地址
	     * @private
	     */
	    constructor(url) {
	        /**
	         * 是否关闭.
	         * @private
	         */
	        this.isOpen = false;
	        /**
	         * 消息处理器.
	         * @private
	         */
	        this.msgHandler = new SocketMsgHandler();
	        this.url = url;
	        this.init();
	    }
	    static set requireFn(value) {
	        this._requireFn = value;
	    }
	    static get requireFn() {
	        return this._requireFn;
	    }
	    /**
	     * 初始化.
	     * @private
	     */
	    init() {
	        this.conn = new sockjs_client_1.default(this.url);
	        this.conn.onopen = async () => {
	            this.isOpen = true;
	            this.lastErr = undefined;
	            if (WebsocketClient.hookFn["open"]) {
	                const result = WebsocketClient.hookFn["open"](this);
	                if (result instanceof Promise) {
	                    await result;
	                }
	            }
	        };
	        this.conn.onerror = (err) => {
	            this.lastErr = err;
	        };
	        this.conn.onclose = () => {
	            this.closeConnection();
	        };
	        this.conn.onmessage = async (messages) => {
	            const socketContextList = this.msgHandler.handle(messages.data);
	            if (!socketContextList || socketContextList.length <= 0) {
	                return;
	            }
	            for (let socketContext of socketContextList) {
	                if (!socketContext.cmd) {
	                    const waitInfo = WebsocketClient.socketMsgWaitMap[socketContext.msgId];
	                    if (waitInfo) {
	                        if (waitInfo.timeoutId) {
	                            clearTimeout(waitInfo.timeoutId);
	                        }
	                        waitInfo.context.settingChildrenContext(socketContext);
	                        waitInfo.resolve(socketContext);
	                    }
	                    else {
	                        await socketContext.returnErr("NO_WAIT_MSG", "没有等待的处理器");
	                    }
	                    delete WebsocketClient.socketMsgWaitMap[socketContext.msgId];
	                    continue;
	                }
	                try {
	                    const eventFn = WebsocketClient.socketEventHandleMap[socketContext.cmd];
	                    if (!eventFn) {
	                        await socketContext.returnErr("500", "未知的请求命令");
	                        continue;
	                    }
	                    const eventReturn = eventFn(socketContext);
	                    if (eventReturn instanceof Promise) {
	                        await eventReturn;
	                    }
	                }
	                catch (e) {
	                    try {
	                        await socketContext.returnErr("500", e.message);
	                    }
	                    catch (e) { }
	                }
	                finally {
	                    try {
	                        await socketContext.destroy();
	                    }
	                    catch (e) { }
	                }
	            }
	        };
	    }
	    closeConnection() {
	        if (this.conn) {
	            this.conn.close();
	        }
	        this.isOpen = false;
	        for (let socketWaitMsg in WebsocketClient.socketMsgWaitMap) {
	            const msg = WebsocketClient.socketMsgWaitMap[socketWaitMsg];
	            if (!msg || !msg.context) {
	                continue;
	            }
	            const ctx = new socketContext_1.SocketContext("", false, msg.context.msgId, types_1.MsgMod.Mem, data_1.marshalErr(socketContext_1.SocketContextErrorCode.CONNECTION_SERVER, "服务连接断开"));
	            ctx.settingChildrenContext(ctx);
	            msg.resolve(ctx);
	            msg.context
	                .destroy()
	                .then(() => { })
	                .catch(() => { });
	        }
	        if (WebsocketClient.hookFn["close"]) {
	            WebsocketClient.hookFn["close"](this);
	        }
	        this.msgHandler.clearDataFlag();
	    }
	    reconnection() {
	        if (this.conn) {
	            this.conn.close();
	        }
	        this.init();
	    }
	    _sendMsg(str) {
	        this.conn.send(str);
	    }
	    sendMsg(socketContext) {
	        const sendInfo = socketContext.sendInfo;
	        // return lock.acquire<SocketContext>('key', () => {
	        return new Promise(async (resolve, reject) => {
	            lock.acquire("key", async (done) => {
	                try {
	                    if (!this.isOpen) {
	                        reject(new socketContext_1.SocketContextError(socketContext_1.SocketContextErrorCode.CONNECTION_SERVER, "未与服务器建立连接"));
	                        return;
	                    }
	                    if (sendInfo.needReturn) {
	                        const waitMsgData = {
	                            context: socketContext,
	                            resolve,
	                            reject,
	                        };
	                        if (sendInfo.timeout && sendInfo.timeout > 0) {
	                            waitMsgData.timeoutId = setTimeout(() => {
	                                reject(new socketContext_1.SocketContextError(socketContext_1.SocketContextErrorCode.TIMEOUT, "接收返回值超时"));
	                            }, sendInfo.timeout);
	                        }
	                        WebsocketClient.socketMsgWaitMap[sendInfo.msgId] = waitMsgData;
	                    }
	                    const needReturnStr = sendInfo.needReturn ? "1" : "0";
	                    const msgHeader = `${sendInfo.cmd || ""}\n${needReturnStr}\n${sendInfo.msgId}\n${sendInfo.mod}\n`;
	                    try {
	                        this._sendMsg(msgHeader);
	                        if (sendInfo.mod === types_1.MsgMod.File) {
	                            this._sendMsg(`${sendInfo.data}\n`);
	                        }
	                        else {
	                            const dataLen = sendInfo.data.length;
	                            // await this._sendMsg(`${dataLen}\n`);
	                            if (dataLen <= msgBlockSize) {
	                                this._sendMsg(`${sendInfo.data}`);
	                            }
	                            else {
	                                const blockSize = Math.ceil(dataLen / msgBlockSize);
	                                for (let i = 0; i < blockSize; i++) {
	                                    const startPos = i * msgBlockSize;
	                                    const endPos = (i + 1) * msgBlockSize;
	                                    this._sendMsg(sendInfo.data.substring(startPos, endPos));
	                                }
	                            }
	                            this._sendMsg(memDataEndFlag);
	                            // if (!sendInfo.data.endsWith("\n")) {
	                            //   await this._sendMsg("\n");
	                            // }
	                        }
	                        if (!sendInfo.needReturn) {
	                            resolve(new socketContext_1.SocketContext(socketContext.cmd, socketContext.needReturn, socketContext.msgId, types_1.MsgMod.Mem, types_2.FieldType.VOID + "\n"));
	                        }
	                    }
	                    catch (e) {
	                        try {
	                            if (sendInfo.mod === types_1.MsgMod.File) {
	                                const fs = WebsocketClient.requireFn("fs");
	                                fs.unlinkSync(sendInfo.data);
	                            }
	                        }
	                        catch (e) { }
	                        reject(e);
	                    }
	                }
	                finally {
	                    done();
	                }
	            });
	        });
	        // });
	    }
	    /**
	     * 注册事件处理器.
	     * @param cmdStr 命令码
	     * @param eventFn 处理函数
	     */
	    static registryEventHandle(cmdStr, eventFn) {
	        WebsocketClient.socketEventHandleMap[cmdStr] = eventFn;
	    }
	    static registryWebsocketHook(hookName, callBack) {
	        WebsocketClient.hookFn[hookName] = callBack;
	    }
	    static rmWaitMsg(msgId) {
	        delete WebsocketClient.socketMsgWaitMap[msgId];
	    }
	    static clearWaitMsgMap() {
	        WebsocketClient.socketMsgWaitMap = {};
	    }
	    static init(options) {
	        if (!options) {
	            options = {};
	        }
	        WebsocketClient._requireFn = options.requireFn;
	        if (!WebsocketClient.instance) {
	            if (!options.url) {
	                options.url = "https://127.0.0.1:65528/dev";
	            }
	            WebsocketClient.instance = new WebsocketClient(options.url);
	            return;
	        }
	        if (WebsocketClient.instance.lastErr) {
	            WebsocketClient.instance.reconnection();
	        }
	        if (!options.maxMsgBlockSize) {
	            options.maxMsgBlockSize = 1024 * 1024;
	        }
	        msgBlockSize = options.maxMsgBlockSize;
	    }
	    static getConn(options) {
	        if (!WebsocketClient.instance) {
	            WebsocketClient.init(options);
	            return WebsocketClient.instance;
	        }
	        if (WebsocketClient.instance.lastErr) {
	            WebsocketClient.instance.reconnection();
	        }
	        return WebsocketClient.instance;
	    }
	}
	websocketClient.WebsocketClient = WebsocketClient;
	WebsocketClient.hookFn = {};
	/**
	 * socket处理Mapper.
	 * @private
	 */
	WebsocketClient.socketEventHandleMap = {};
	/**
	 * socket消息等待map.
	 * @private
	 */
	WebsocketClient.socketMsgWaitMap = {};
	class SocketMsgHandler {
	    constructor() {
	        this.newLine = "\n";
	        /**
	         * 临时消息.
	         * @private
	         */
	        this.tmpMsg = "";
	        /**
	         * 是否为第一次.
	         * @private
	         */
	        this.isFirst = true;
	    }
	    /**
	     * 消息处理返回上下文.
	     * @param data
	     */
	    handle(data) {
	        const socketContextList = [];
	        data = this.tmpMsg + data;
	        this.tmpMsg = "";
	        while (true) {
	            const socketContext = this.handleMsg(data);
	            if (!socketContext) {
	                break;
	            }
	            socketContextList.push(socketContext);
	            data = this.tmpMsg;
	        }
	        return socketContextList;
	    }
	    /**
	     * 处理消息转换为上下文
	     * @param data 待处理消息
	     * @private
	     */
	    handleMsg(data) {
	        if (data.length === 0) {
	            return;
	        }
	        // 字符串为值传递, 函数内部修改上层无法感知, 转换为arr, 好做感知判断^_^
	        const tmpD = [data];
	        if (!this.cmd && this.isFirst && data[0] !== this.newLine) {
	            const resData = this.readLineContent(tmpD);
	            if (!resData.canNext) {
	                return;
	            }
	            this.cmd = resData.content;
	        }
	        else if (!this.cmd && this.isFirst && data[0] === this.newLine) {
	            this.readLineContent(tmpD);
	        }
	        this.isFirst = false;
	        if (typeof this.needReturn === "undefined") {
	            const resData = this.readLineContent(tmpD);
	            if (!resData.canNext) {
	                return;
	            }
	            this.needReturn = resData.content === "1";
	        }
	        if (!this.msgId) {
	            const resData = this.readLineContent(tmpD);
	            if (!resData.canNext) {
	                return;
	            }
	            this.msgId = resData.content;
	        }
	        if (typeof this.mod === "undefined") {
	            const resData = this.readLineContent(tmpD);
	            if (!resData.canNext) {
	                return;
	            }
	            this.mod = resData.content;
	        }
	        if (this.mod === "0") {
	            const resData = this.readLineContent(tmpD);
	            if (!resData.canNext) {
	                return;
	            }
	            const result = new socketContext_1.SocketContext(this.cmd, this.needReturn, this.msgId, this.mod, resData.content);
	            this.clearDataFlag();
	            return result;
	        }
	        // if (typeof this.dataLen === "undefined") {
	        //   const resData = this.readLineContent(tmpD);
	        //   if (!resData.canNext) {
	        //     return;
	        //   }
	        //   this.dataLen = parseInt(resData.content!);
	        // }
	        // if (this.dataLen > tmpD[0].length) {
	        //   this.tmpMsg = tmpD[0];
	        //   return;
	        // }
	        if (data === memDataEndFlag) {
	            const result = new socketContext_1.SocketContext(this.cmd, this.needReturn, this.msgId, this.mod, this.data || "");
	            this.data = undefined;
	            this.clearDataFlag();
	            return result;
	        }
	        if (tmpD[0] === "") {
	            return;
	        }
	        if (!this.data) {
	            this.data = data;
	            return;
	        }
	        this.data += data;
	        this.tmpMsg = "";
	    }
	    clearDataFlag() {
	        this.cmd = undefined;
	        this.msgId = undefined;
	        this.mod = undefined;
	        this.isFirst = true;
	        this.needReturn = undefined;
	        this.tmpMsg = "";
	    }
	    readLineContent(data) {
	        const tmpD = data[0];
	        if (tmpD.length === 0) {
	            return { content: undefined, canNext: false };
	        }
	        const contentIndex = tmpD.indexOf(this.newLine);
	        if (contentIndex < 0) {
	            this.tmpMsg += data;
	            return { content: undefined, canNext: false };
	        }
	        const content = tmpD.substring(0, contentIndex);
	        data[0] = tmpD.substring(contentIndex + 1);
	        return { content, canNext: true };
	    }
	}
	websocketClient.SocketMsgHandler = SocketMsgHandler;
	return websocketClient;
}

var hasRequiredMarshal;

function requireMarshal () {
	if (hasRequiredMarshal) return marshal;
	hasRequiredMarshal = 1;
	Object.defineProperty(marshal, "__esModule", { value: true });
	marshal.marshal = marshal.marshal2FilePath = marshal.marshalErr2FilePath = marshal.marshalErr = marshal.marshalVoid = marshal.marshalVoid2FilePath = void 0;
	const types_1 = types$1;
	const utils_1 = utils;
	// import {v4} from "uuid";
	const websocketClient_1 = requireWebsocketClient();
	function createTmpFile() {
	    if (!websocketClient_1.WebsocketClient.requireFn) {
	        throw new types_1.SocketDataError("未在本地环境中运行");
	    }
	    const fs = websocketClient_1.WebsocketClient.requireFn("fs");
	    const os = websocketClient_1.WebsocketClient.requireFn("os");
	    const filepath = websocketClient_1.WebsocketClient.requireFn("path");
	    const tmpDir = filepath.join(os.tmpdir(), "devPlatform_w");
	    fs.mkdirSync(tmpDir, {
	        recursive: true,
	    });
	    // const tmpFilePath = filepath.join(tmpDir, `${v4()}${new Date().getTime()}`);
	    const tmpFilePath = filepath.join(tmpDir, `${Math.random()}-${new Date().getTime()}`);
	    const dataFile = fs.openSync(tmpFilePath, "w");
	    return { fs, fd: dataFile, filePath: tmpFilePath };
	}
	function marshalVoid2FilePath() {
	    const { fs, fd, filePath } = createTmpFile();
	    try {
	        fs.writeSync(fd, utils_1.joinLineStr(types_1.FieldType.VOID));
	    }
	    catch (e) {
	        fs.unlinkSync(filePath);
	        throw e;
	    }
	    finally {
	        fs.closeSync(fd);
	    }
	    return filePath;
	}
	marshal.marshalVoid2FilePath = marshalVoid2FilePath;
	function marshalVoid() {
	    return utils_1.joinLineStr(types_1.FieldType.VOID);
	}
	marshal.marshalVoid = marshalVoid;
	function marshalErr(code, msg) {
	    return (utils_1.joinLineStr(types_1.FieldType.ERROR) +
	        utils_1.joinLineStr(code) +
	        utils_1.joinLineStr(Array.from(msg).length) +
	        msg);
	}
	marshal.marshalErr = marshalErr;
	function marshalErr2FilePath(code, msg) {
	    const { fs, fd, filePath } = createTmpFile();
	    try {
	        fs.writeSync(fd, utils_1.joinLineStr(types_1.FieldType.ERROR) +
	            utils_1.joinLineStr(code) +
	            utils_1.joinLineStr(Array.from(msg).length) +
	            msg);
	    }
	    catch (e) {
	        fs.unlinkSync(filePath);
	        throw e;
	    }
	    finally {
	        fs.closeSync(fd);
	    }
	    return filePath;
	}
	marshal.marshalErr2FilePath = marshalErr2FilePath;
	/**
	 * 序列化到文件.
	 * @param data 数据
	 */
	function marshal2FilePath(data) {
	    const { fs, fd, filePath } = createTmpFile();
	    try {
	        marshal2File(fs, fd, data);
	    }
	    catch (e) {
	        fs.unlinkSync(filePath);
	        throw e;
	    }
	    finally {
	        fs.closeSync(fd);
	    }
	    return filePath;
	}
	marshal.marshal2FilePath = marshal2FilePath;
	function marshal2File(fs, fd, data) {
	    const fieldType = utils_1.getFieldType(data);
	    if (fieldType === types_1.FieldType.STRING ||
	        fieldType === types_1.FieldType.BOOL ||
	        fieldType === types_1.FieldType.DOUBLE ||
	        fieldType === types_1.FieldType.INTEGER) {
	        fs.writeSync(fd, utils_1.joinLineStr(fieldType));
	        if (fieldType === types_1.FieldType.STRING) {
	            fs.writeSync(fd, utils_1.joinLineStr(Array.from(data).length));
	            fs.writeSync(fd, data);
	            return;
	        }
	        if (fieldType === types_1.FieldType.BOOL) {
	            fs.writeSync(fd, utils_1.joinLineStr(data ? "1" : "0"));
	            return;
	        }
	        fs.writeSync(fd, utils_1.joinLineStr(data));
	        return;
	    }
	    if (data instanceof Array) {
	        fs.writeSync(fd, utils_1.joinLineStr(types_1.FieldType.LIST));
	        fs.writeSync(fd, utils_1.joinLineStr(data.length));
	        if (data.length === 0) {
	            return;
	        }
	        const eleFieldType = utils_1.getListEleFieldType(data);
	        if (!eleFieldType) {
	            throw new types_1.SocketDataError("获取数组内元素类型失败");
	        }
	        fs.writeSync(fd, utils_1.joinLineStr(eleFieldType));
	        if (eleFieldType === types_1.FieldType.STRUCT || eleFieldType === types_1.FieldType.LIST) {
	            for (let d of data) {
	                marshalObj2File(fs, fd, d, false);
	            }
	        }
	        else {
	            for (let d of data) {
	                if (eleFieldType === types_1.FieldType.STRING) {
	                    fs.writeSync(fd, utils_1.joinLineStr(Array.from(d).length) + d);
	                    continue;
	                }
	                if (eleFieldType === types_1.FieldType.BOOL) {
	                    fs.writeSync(fd, utils_1.joinLineStr(d ? "1" : "0"));
	                }
	                fs.writeSync(fd, utils_1.joinLineStr(d));
	            }
	        }
	        return;
	    }
	    marshalObj2File(fs, fd, data, true);
	}
	function marshalObj2File(fs, fd, data, writeType) {
	    if (data instanceof Array) {
	        return marshal2File(fs, fd, data);
	    }
	    if (typeof data !== "object") {
	        throw new types_1.SocketDataError("不支持非Obj或Array的顶层结构");
	    }
	    const keyLen = utils_1.ObjectKeys(data).length;
	    if (writeType) {
	        fs.writeSync(fd, utils_1.joinLineStr(types_1.FieldType.STRUCT));
	    }
	    fs.writeSync(fd, utils_1.joinLineStr(keyLen));
	    if (keyLen === 0) {
	        return;
	    }
	    for (let n in data) {
	        const v = data[n];
	        fs.writeSync(fd, utils_1.joinLineStr(n));
	        const fieldType = utils_1.getFieldType(v);
	        if (fieldType === types_1.FieldType.LIST || fieldType === types_1.FieldType.STRUCT) {
	            marshal2File(fs, fd, v);
	            continue;
	        }
	        fs.writeSync(fd, utils_1.joinLineStr(fieldType));
	        if (fieldType === types_1.FieldType.STRING) {
	            fs.writeSync(fd, utils_1.joinLineStr(Array.from(v).length));
	            fs.writeSync(fd, v + "");
	            continue;
	        }
	        if (fieldType === types_1.FieldType.BOOL) {
	            fs.writeSync(fd, utils_1.joinLineStr(v ? "1" : "0"));
	            continue;
	        }
	        fs.writeSync(fd, utils_1.joinLineStr(v));
	    }
	}
	/**
	 * 序列化.
	 * @param data 数据
	 */
	function marshal$1(data) {
	    const fieldType = utils_1.getFieldType(data);
	    if (fieldType === types_1.FieldType.STRING ||
	        fieldType === types_1.FieldType.BOOL ||
	        fieldType === types_1.FieldType.DOUBLE ||
	        fieldType === types_1.FieldType.INTEGER) {
	        let str = utils_1.joinLineStr(fieldType);
	        if (fieldType === types_1.FieldType.STRING) {
	            str += utils_1.joinLineStr(Array.from(data).length);
	            str += data;
	            return str;
	        }
	        if (fieldType === types_1.FieldType.BOOL) {
	            str += utils_1.joinLineStr(data ? "1" : "0");
	            return str;
	        }
	        str += utils_1.joinLineStr(data);
	        return str;
	    }
	    if (data instanceof Array) {
	        let endStr = utils_1.joinLineStr(types_1.FieldType.LIST) + utils_1.joinLineStr(data.length);
	        if (data.length === 0) {
	            return endStr;
	        }
	        const eleFieldType = utils_1.getListEleFieldType(data);
	        if (!eleFieldType) {
	            throw new types_1.SocketDataError("获取数组内元素类型失败");
	        }
	        endStr += utils_1.joinLineStr(eleFieldType);
	        if (eleFieldType === types_1.FieldType.STRUCT || eleFieldType === types_1.FieldType.LIST) {
	            for (let d of data) {
	                endStr += marshalObj(d, false);
	            }
	        }
	        else {
	            for (let d of data) {
	                if (eleFieldType === types_1.FieldType.STRING) {
	                    endStr += utils_1.joinLineStr(Array.from(d).length) + d;
	                    continue;
	                }
	                if (eleFieldType === types_1.FieldType.BOOL) {
	                    endStr += utils_1.joinLineStr(d ? "1" : "0");
	                    continue;
	                }
	                endStr += utils_1.joinLineStr(d);
	            }
	        }
	        return endStr;
	    }
	    return marshalObj(data, true);
	}
	marshal.marshal = marshal$1;
	/**
	 * 序列化对象.
	 * @param data 数据
	 * @param writeType 是否写出类别
	 */
	function marshalObj(data, writeType) {
	    if (data instanceof Array) {
	        return marshal$1(data);
	    }
	    if (typeof data !== "object") {
	        throw new types_1.SocketDataError("不支持非Obj或Array的顶层结构");
	    }
	    const keyLen = utils_1.ObjectKeys(data).length;
	    let endStr = "";
	    if (writeType) {
	        endStr = utils_1.joinLineStr(types_1.FieldType.STRUCT);
	    }
	    endStr += utils_1.joinLineStr(keyLen);
	    for (let n in data) {
	        const v = data[n];
	        endStr += utils_1.joinLineStr(n);
	        const fieldType = utils_1.getFieldType(v);
	        if (fieldType === types_1.FieldType.LIST || fieldType === types_1.FieldType.STRUCT) {
	            endStr += marshal$1(v);
	            continue;
	        }
	        endStr += utils_1.joinLineStr(fieldType);
	        if (fieldType === types_1.FieldType.STRING) {
	            endStr += utils_1.joinLineStr(Array.from(v).length) + v;
	            continue;
	        }
	        if (fieldType === types_1.FieldType.BOOL) {
	            endStr += utils_1.joinLineStr(v ? "1" : "0");
	            continue;
	        }
	        endStr += utils_1.joinLineStr(v);
	    }
	    return endStr;
	}
	return marshal;
}

var unmarshal = {};

var socketFieldInfo = {};

var hasRequiredSocketFieldInfo;

function requireSocketFieldInfo () {
	if (hasRequiredSocketFieldInfo) return socketFieldInfo;
	hasRequiredSocketFieldInfo = 1;
	Object.defineProperty(socketFieldInfo, "__esModule", { value: true });
	socketFieldInfo.SocketFieldInfo = void 0;
	const types_1 = types$1;
	const data_1 = requireData();
	class SocketFieldInfo {
	    constructor(name, fieldType, startPos, endPos, isFile, fd, children) {
	        /**
	         * 索引.
	         * @private
	         */
	        this._index = 0;
	        this._name = name;
	        this._fieldType = fieldType;
	        this._startPos = startPos;
	        this._endPos = endPos;
	        this._children = children;
	        this._isFile = isFile;
	        this._length = endPos - startPos;
	        try {
	            if (this._isFile) {
	                this._fd = fd;
	                const requireFn = commonjsRequire || (window && window.require);
	                this._fs = requireFn("fs");
	                const { Buffer } = requireFn("buffer");
	                this._Buffer = Buffer;
	            }
	            else {
	                this._data = fd;
	            }
	        }
	        catch (e) {
	            this._err = new types_1.SocketDataError("转换字段流失败 => " + e.message);
	        }
	    }
	    get err() {
	        return this._err;
	    }
	    get name() {
	        return this._name;
	    }
	    get length() {
	        return this._length;
	    }
	    get children() {
	        return this._children;
	    }
	    read(len) {
	        if (this._err) {
	            return "";
	        }
	        const startPos = this._index;
	        this._index += len;
	        if (this._index > this._length) {
	            this._index += this._length - this._index;
	        }
	        return this._read(startPos, this._index);
	    }
	    readByPos(start, end) {
	        if (this._err) {
	            return "";
	        }
	        return this._read(start, end);
	    }
	    readAll() {
	        if (this._err) {
	            return "";
	        }
	        return this._read(0, this._length);
	    }
	    read2Object() {
	        if (this._err) {
	            return undefined;
	        }
	        return data_1.unmarshal(this.readAll());
	    }
	    _read(startPos, endPos) {
	        if (this._err) {
	            return "";
	        }
	        if (endPos > this._length) {
	            endPos = this._length;
	        }
	        const readLen = endPos - startPos;
	        if (readLen <= 0) {
	            return "";
	        }
	        try {
	            if (this._isFile) {
	                const buf = Buffer.alloc(readLen);
	                this._fs.readSync(this._fd, buf, 0, readLen, this._startPos);
	                return buf.toString("utf-8");
	            }
	            else {
	                return this._data.substring(startPos, endPos);
	            }
	        }
	        catch (e) {
	            this._err = new types_1.SocketDataError("获取流中内容失败");
	            return "";
	        }
	    }
	}
	socketFieldInfo.SocketFieldInfo = SocketFieldInfo;
	return socketFieldInfo;
}

var hasRequiredUnmarshal;

function requireUnmarshal () {
	if (hasRequiredUnmarshal) return unmarshal;
	hasRequiredUnmarshal = 1;
	Object.defineProperty(unmarshal, "__esModule", { value: true });
	unmarshal.unmarshalFieldInfo = unmarshal.unmarshalFieldInfoByFile = unmarshal.unmarshalErrByFile = unmarshal.unmarshalErr = unmarshal.dataIsVoid = unmarshal.dataIsError = unmarshal.unmarshalByFilePath = unmarshal.unmarshal = void 0;
	const utils_1 = utils;
	const types_1 = types$1;
	const socketFieldInfo_1 = requireSocketFieldInfo();
	const websocketClient_1 = requireWebsocketClient();
	function unmarshal$1(data) {
	    const tmpD = [data];
	    const t = utils_1.getLineContent(tmpD);
	    const fieldType = utils_1.getFieldTypeByFieldTypeStr(t);
	    return unmarshalCore(fieldType, {
	        lineContent: () => {
	            return utils_1.getLineContent(tmpD);
	        },
	        lineLenContent: (len) => {
	            const tmpArr = Array.from(tmpD[0]);
	            // const d = tmpD[0];
	            const result = tmpArr.splice(0, len).join("");
	            // const result = d.substring(0, len);
	            // tmpD[0] = d.substring(len);
	            tmpD[0] = tmpArr.join("");
	            return result;
	        }
	    });
	}
	unmarshal.unmarshal = unmarshal$1;
	function unmarshalByFilePath(f) {
	    if (!websocketClient_1.WebsocketClient.requireFn) {
	        throw new types_1.SocketDataError("未在本地环境中运行");
	    }
	    const fs = websocketClient_1.WebsocketClient.requireFn("fs");
	    const fd = fs.openSync(f, 'r');
	    const { Buffer } = websocketClient_1.WebsocketClient.requireFn("buffer");
	    try {
	        const fieldType = utils_1.getFieldTypeByFieldTypeStr(utils_1.getLineContentByFile(fs, fd, Buffer));
	        return unmarshalCore(fieldType, {
	            lineContent: () => {
	                return utils_1.getLineContentByFile(fs, fd, Buffer);
	            },
	            lineLenContent: len => {
	                const buffer = Buffer.alloc(len);
	                fs.readSync(fd, buffer, 0, len, null);
	                return buffer.toString("utf-8");
	            }
	        });
	    }
	    finally {
	        fs.close(fd);
	    }
	}
	unmarshal.unmarshalByFilePath = unmarshalByFilePath;
	function unmarshalCore(fieldType, fns) {
	    switch (fieldType) {
	        case types_1.FieldType.LIST:
	            let endData = [];
	            const listLen = parseInt(fns.lineContent());
	            const eleType = utils_1.getFieldTypeByFieldTypeStr(fns.lineContent());
	            for (let i = 0; i < listLen; i++) {
	                if (eleType === types_1.FieldType.LIST || eleType === types_1.FieldType.STRUCT) {
	                    endData.push(unmarshalCore(eleType, fns));
	                    continue;
	                }
	                if (eleType === types_1.FieldType.STRING) {
	                    const strLen = parseInt(fns.lineContent());
	                    endData.push(fns.lineLenContent(strLen));
	                    continue;
	                }
	                const lineContent = fns.lineContent();
	                let settingData;
	                if (eleType === types_1.FieldType.DOUBLE) {
	                    settingData = parseFloat(lineContent);
	                }
	                else if (eleType === types_1.FieldType.INTEGER) {
	                    settingData = parseInt(lineContent);
	                }
	                else if (eleType === types_1.FieldType.BOOL) {
	                    settingData = lineContent !== "0";
	                }
	                else {
	                    throw new types_1.SocketDataError("错误的数据类型 => " + eleType);
	                }
	                endData.push(settingData);
	            }
	            return endData;
	        case types_1.FieldType.STRING:
	            const strLen = parseInt(fns.lineContent());
	            return fns.lineLenContent(strLen);
	        case types_1.FieldType.DOUBLE:
	            return parseFloat(fns.lineContent());
	        case types_1.FieldType.BOOL:
	            //@ts-ignore
	            return fns.lineContent() !== "0";
	        case types_1.FieldType.INTEGER:
	            return parseInt(fns.lineContent());
	    }
	    return unmarshalObjectCore(fieldType, fns);
	}
	function unmarshalObjectCore(fieldType, fns) {
	    if (fieldType === types_1.FieldType.LIST) {
	        return unmarshalCore(fieldType, fns);
	    }
	    if (fieldType !== types_1.FieldType.STRUCT) {
	        throw new types_1.SocketDataError("不支持非Obj或Array的顶层结构");
	    }
	    const filedNum = parseInt(fns.lineContent());
	    let endData = {};
	    for (let i = 0; i < filedNum; i++) {
	        const name = fns.lineContent();
	        if (name == "") {
	            i = i - 1;
	            continue;
	        }
	        const eleType = utils_1.getFieldTypeByFieldTypeStr(fns.lineContent());
	        if (eleType === types_1.FieldType.LIST || eleType === types_1.FieldType.STRUCT) {
	            endData[name] = unmarshalCore(eleType, fns);
	            continue;
	        }
	        if (eleType === types_1.FieldType.STRING) {
	            const strLen = parseInt(fns.lineContent());
	            endData[name] = fns.lineLenContent(strLen);
	            continue;
	        }
	        const lineContent = fns.lineContent();
	        let settingData;
	        if (eleType === types_1.FieldType.DOUBLE) {
	            settingData = parseFloat(lineContent);
	        }
	        else if (eleType === types_1.FieldType.INTEGER) {
	            settingData = parseInt(lineContent);
	        }
	        else if (eleType === types_1.FieldType.BOOL) {
	            settingData = lineContent !== "0";
	        }
	        else {
	            throw new types_1.SocketDataError("错误的数据类型 => " + eleType);
	        }
	        endData[name] = settingData;
	    }
	    return endData;
	}
	function dataIsError(data) {
	    return utils_1.getFieldTypeByFieldTypeStr(data) === types_1.FieldType.ERROR;
	}
	unmarshal.dataIsError = dataIsError;
	function dataIsVoid(data) {
	    return utils_1.getFieldTypeByFieldTypeStr(data) === types_1.FieldType.VOID;
	}
	unmarshal.dataIsVoid = dataIsVoid;
	function unmarshalErr(data) {
	    const tmpD = [data];
	    const fieldType = utils_1.getLineContent(tmpD);
	    if (!dataIsError(fieldType)) {
	        throw new types_1.SocketDataError("错误的字段类型");
	    }
	    const code = utils_1.getLineContent(tmpD);
	    const msgLen = parseInt(utils_1.getLineContent(tmpD));
	    const msg = tmpD[0].substring(0, msgLen);
	    return { code, msg };
	}
	unmarshal.unmarshalErr = unmarshalErr;
	function unmarshalErrByFile(fs, fd, Buffer) {
	    const header = utils_1.getLineContentByFile(fs, fd, Buffer);
	    if (!dataIsError(header)) {
	        throw new types_1.SocketDataError("错误的字段类型");
	    }
	    const code = utils_1.getLineContentByFile(fs, fd, Buffer);
	    const msgLen = parseInt(utils_1.getLineContentByFile(fs, fd, Buffer));
	    const msgBuf = Buffer.alloc(msgLen);
	    fs.readSync(fd, msgBuf, 0, msgLen, null);
	    return { code, msg: msgBuf.toString("utf-8") };
	}
	unmarshal.unmarshalErrByFile = unmarshalErrByFile;
	function unmarshalFieldInfoByFile(fs, fd, Buffer) {
	    const fieldTypeStr = utils_1.getLineContentByFile(fs, fd, Buffer);
	    const index = [];
	    index[0] = fieldTypeStr.length + 1;
	    const fieldType = utils_1.getFieldTypeByFieldTypeStr(fieldTypeStr);
	    const result = {};
	    unmarshalFieldInfoCore(fieldType, result, {
	        lineContent: () => {
	            const content = utils_1.getLineContentByFile(fs, fd, Buffer);
	            index[0] += content.length + 1;
	            return content;
	        },
	        lineLenContent: (len) => {
	            index[0] += len;
	            const buffer = Buffer.alloc(len);
	            fs.readSync(fd, buffer, 0, len, null);
	            return buffer.toString("utf-8");
	        },
	        breakLen: (breakLen) => {
	            const readBlock = 1024 * 128;
	            let readNum = 0;
	            while (readNum < breakLen) {
	                let bufLen = readBlock;
	                const nextReadNum = readNum + readBlock;
	                if (nextReadNum > breakLen) {
	                    bufLen = breakLen - readNum;
	                }
	                const buf = Buffer.alloc(bufLen);
	                const len = fs.readSync(fd, buf, 0, bufLen, null);
	                readNum += len;
	            }
	            index[0] += breakLen;
	        },
	        nowIndex: () => {
	            return index[0];
	        },
	        createFieldInfo: (name, fieldType, startPos, children) => {
	            return new socketFieldInfo_1.SocketFieldInfo(name, fieldType, startPos, index[0], true, fd, children);
	        }
	    });
	    return result;
	}
	unmarshal.unmarshalFieldInfoByFile = unmarshalFieldInfoByFile;
	function unmarshalFieldInfo(data) {
	    const tmpD = [data];
	    const t = utils_1.getLineContent(tmpD);
	    const index = [];
	    index[0] = t.length + 1;
	    const fieldType = utils_1.getFieldTypeByFieldTypeStr(t);
	    const result = {};
	    unmarshalFieldInfoCore(fieldType, result, {
	        lineContent: () => {
	            const content = utils_1.getLineContent(tmpD);
	            index[0] += content.length + 1;
	            return content;
	        },
	        lineLenContent: (len) => {
	            const tmpArr = Array.from(tmpD[0]);
	            const d = tmpArr.slice(0, len).join("");
	            // const d = tmpD[0].substring(0, len);
	            tmpD[0] = tmpArr.join("");
	            index[0] += len;
	            return d;
	        },
	        breakLen: (breakLen) => {
	            index[0] += breakLen;
	            tmpD[0] = tmpD[0].substring(breakLen);
	        },
	        nowIndex: () => {
	            return index[0];
	        },
	        createFieldInfo: (name, fieldType, startPos, children) => {
	            return new socketFieldInfo_1.SocketFieldInfo(name, fieldType, startPos, index[0], false, data, children);
	        }
	    });
	    return result;
	}
	unmarshal.unmarshalFieldInfo = unmarshalFieldInfo;
	function unmarshalFieldInfoCore(fieldType, fieldInfoMapList, fns) {
	    const nowIndex = fns.nowIndex();
	    let isTop = false;
	    switch (fieldType) {
	        case types_1.FieldType.LIST:
	            const listLen = parseInt(fns.lineContent());
	            if (listLen == 0) {
	                return;
	            }
	            const eleType = utils_1.getFieldTypeByFieldTypeStr(fns.lineContent());
	            for (let i = 0; i < listLen; i++) {
	                const startPos = fns.nowIndex();
	                if (eleType === types_1.FieldType.LIST || eleType === types_1.FieldType.STRUCT) {
	                    const children = {};
	                    unmarshalFieldInfoCore(eleType, children, fns);
	                    fieldInfoMapList[i + ""] = fns.createFieldInfo(i + "", eleType, startPos, children);
	                    continue;
	                }
	                if (eleType === types_1.FieldType.STRING) {
	                    const strLen = parseInt(fns.lineContent());
	                    fns.breakLen(strLen);
	                }
	                else {
	                    fns.lineContent();
	                }
	                fieldInfoMapList[i + ""] = fns.createFieldInfo(i + "", eleType, startPos);
	            }
	            return;
	        case types_1.FieldType.STRING:
	            const strLen = parseInt(fns.lineContent());
	            fns.breakLen(strLen);
	            isTop = true;
	            break;
	        case types_1.FieldType.BOOL:
	        case types_1.FieldType.DOUBLE:
	        case types_1.FieldType.INTEGER:
	            fns.lineContent();
	            isTop = true;
	            break;
	    }
	    if (isTop) {
	        fieldInfoMapList["0"] = fns.createFieldInfo("0", fieldType, nowIndex);
	        return;
	    }
	    unmarshalObjFieldInfoCore(fieldType, fieldInfoMapList, fns);
	}
	function unmarshalObjFieldInfoCore(fieldType, fieldInfoMap, fns) {
	    if (fieldType === types_1.FieldType.LIST) {
	        unmarshalFieldInfoCore(fieldType, fieldInfoMap, fns);
	        return;
	    }
	    if (fieldType !== types_1.FieldType.STRUCT) {
	        throw new types_1.SocketDataError("不支持非Obj或Array的顶层结构");
	    }
	    const fieldNum = parseInt(fns.lineContent());
	    for (let i = 0; i < fieldNum; i++) {
	        const startPos = fns.nowIndex();
	        const name = fns.lineContent();
	        const eleType = utils_1.getFieldTypeByFieldTypeStr(fns.lineContent());
	        if (eleType === types_1.FieldType.LIST || eleType === types_1.FieldType.STRUCT) {
	            const children = {};
	            unmarshalFieldInfoCore(eleType, children, fns);
	            fieldInfoMap[name] = fns.createFieldInfo(name, eleType, startPos, children);
	            continue;
	        }
	        if (eleType === types_1.FieldType.STRING) {
	            const strLen = parseInt(fns.lineContent());
	            fns.breakLen(strLen);
	        }
	        else {
	            fns.lineContent();
	        }
	        fieldInfoMap[name] = fns.createFieldInfo(name, eleType, startPos);
	    }
	}
	return unmarshal;
}

var hasRequiredData;

function requireData () {
	if (hasRequiredData) return data;
	hasRequiredData = 1;
	(function (exports) {
		var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		__exportStar(requireMarshal(), exports);
		__exportStar(requireUnmarshal(), exports);
} (data));
	return data;
}

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(requireData(), exports);
	__exportStar(requireSocketContext(), exports);
	__exportStar(requireSocketFieldInfo(), exports);
	__exportStar(requireWebsocketClient(), exports);
} (websocket$2));

var logs = {};

Object.defineProperty(logs, "__esModule", { value: true });
logs.GetLogInterface = logs.EnabledLog = void 0;
let defaultLogsInterface = {
    log: (message, ...optionalParams) => {
        console.log(message, ...optionalParams);
    },
};
logs.EnabledLog = () => (true);
logs.GetLogInterface = () => defaultLogsInterface;

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(websocket$2, exports);
	__exportStar(requireData(), exports);
	__exportStar(logs, exports);
} (lib));

var consts = {};

var SocketCmd = {};

/**
 * 打开链接命令.
 */
Object.defineProperty(SocketCmd, "__esModule", { value: true });
SocketCmd.eSignSplitDetailItems = SocketCmd.eSealSplitFiveData = SocketCmd.eSealSplitDetailItems = SocketCmd.eSealSplitFourData = SocketCmd.getKeyCert = SocketCmd.p7Sign = SocketCmd.createClientAuthProof = SocketCmd.createClientAuthRequest = SocketCmd.getKeyCertType = SocketCmd.setCertEquipFilter = SocketCmd.getESealData = SocketCmd.writeESealData = SocketCmd.importElecSymmKey = SocketCmd.formatKey = SocketCmd.importCert = SocketCmd.createKeyPair = SocketCmd.awaitAuthData = SocketCmd.getKeyNum = SocketCmd.filterKey = SocketCmd.releaseKey = SocketCmd.initKey = SocketCmd.Open = void 0;
SocketCmd.Open = "open";
/**
 * 初始化Key.
 */
SocketCmd.initKey = "init/key";
/**
 * 动态库释放.
 */
SocketCmd.releaseKey = "";
/**
 * 设置设备过滤
 */
SocketCmd.filterKey = "";
/**
 * 获取USBKey设备号.
 */
SocketCmd.getKeyNum = "";
/**
 * 获取待认证数据.
 */
SocketCmd.awaitAuthData = "";
/**
 * 生成密钥对.
 */
SocketCmd.createKeyPair = "";
/**
 * 导入证书.
 */
SocketCmd.importCert = "";
/**
 * 格式化USBKey.
 */
SocketCmd.formatKey = "";
/**
 * 导入电子印章对称密钥.
 */
SocketCmd.importElecSymmKey = "";
/**
 * 写入公安印章信息数据.
 */
SocketCmd.writeESealData = "";
/**
 * 获取公安印章信息数据.
 */
SocketCmd.getESealData = "";
/**
 * 设置证书应用接口设备过滤.
 */
SocketCmd.setCertEquipFilter = "";
/**
 * 获取USBKey证书类型.
 */
SocketCmd.getKeyCertType = "";
/**
 * 生成客户端认证请求.
 */
SocketCmd.createClientAuthRequest = "";
/**
 * 生成客户端认证凭据.
 */
SocketCmd.createClientAuthProof = "";
/**
 * P7签名.
 */
SocketCmd.p7Sign = "";
/**
 * 获取USBKey证书.
 */
SocketCmd.getKeyCert = "";
/**
 * 电子印章拆分为四部分数据.
 */
SocketCmd.eSealSplitFourData = "";
/**
 * 电子印章拆分为详细项.
 */
SocketCmd.eSealSplitDetailItems = "";
/**
 * 电子签章拆分为五部分数据.
 */
SocketCmd.eSealSplitFiveData = "";
/**
 * 电子签章拆分为详细项.
 */
SocketCmd.eSignSplitDetailItems = "";

var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(consts, "__esModule", { value: true });
consts.SocketCmd = __importStar(SocketCmd);

var usbkey = {};

var initkey = {};

Object.defineProperty(initkey, "__esModule", { value: true });
initkey.eSignSplitDetailItems = initkey.eSealSplitFiveData = initkey.eSealSplitDetailItems = initkey.eSealSplitFourData = initkey.getKeyCert = initkey.p7Sign = initkey.createClientAuthProof = initkey.createClientAuthRequest = initkey.getKeyCertType = initkey.setCertEquipFilter = initkey.getESealData = initkey.writeESealData = initkey.importElecSymmKey = initkey.formatKey = initkey.importCert = initkey.createKeyPair = initkey.awaitAuthData = initkey.getKeyNum = initkey.filterKey = initkey.releaseKey = initkey.initKey = void 0;
const consts_1$1 = consts;
const sockjs_util_lib_1$1 = lib;
/**
 * 初始化key.
 */
async function initKey(authCode, dllList, devAuthItems) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            authCode,
            dllList,
            devAuthItems,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        if (resCtx.err) {
            throw resCtx.err;
        }
    }
    finally {
        await ctx.destroy();
    }
}
initkey.initKey = initKey;
/**
 * 动态库释放.
 */
async function releaseKey() {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.releaseKey, {
        needReturn: true,
        data: {},
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        throw resCtx.err;
    }
    finally {
        await ctx.destroy();
    }
}
initkey.releaseKey = releaseKey;
/**
 * 设置设备过滤
 */
async function filterKey(flag, filterValue) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            flag,
            filterValue,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.filterKey = filterKey;
/**
 * 获取USBKey设备号.
 */
async function getKeyNum() {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {},
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.getKeyNum = getKeyNum;
/**
 * 获取待认证数据.
 */
async function awaitAuthData(param) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            param,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.awaitAuthData = awaitAuthData;
/**
 * 生成密钥对.
 */
async function createKeyPair(password, strAppDevAuthEnvData) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            password,
            strAppDevAuthEnvData,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.createKeyPair = createKeyPair;
/**
 * 导入证书.
 */
async function importCert(param) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            param,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.importCert = importCert;
/**
 * 格式化USBKey.
 */
async function formatKey(enSoPin) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            enSoPin,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.formatKey = formatKey;
/**
 * 导入电子印章对称密钥.
 */
async function importElecSymmKey(SymmAMKEncData, SymmEDKEncData, password) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            SymmAMKEncData,
            SymmEDKEncData,
            password
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.importElecSymmKey = importElecSymmKey;
/**
 * 写入公安印章信息数据.
 */
async function writeESealData(ESealData, password) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            ESealData,
            password,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        throw resCtx.err;
    }
    finally {
        await ctx.destroy();
    }
}
initkey.writeESealData = writeESealData;
/**
 * 获取公安印章信息数据.
 */
async function getESealData(password, KeyIndex, KeyAlgId) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            password,
            KeyIndex,
            KeyAlgId
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.getESealData = getESealData;
/**
 * 设置证书应用接口设备过滤.
 */
async function setCertEquipFilter(options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.setCertEquipFilter = setCertEquipFilter;
/**
 * 获取USBKey证书类型.
 */
async function getKeyCertType(flag, filterValue, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            flag,
            filterValue,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.getKeyCertType = getKeyCertType;
/**
 * 生成客户端认证请求.
 */
async function createClientAuthRequest(param, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            param,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.createClientAuthRequest = createClientAuthRequest;
/**
 * 生成客户端认证凭据.
 */
async function createClientAuthProof(param, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            param,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.createClientAuthProof = createClientAuthProof;
/**
 * P7签名.
 */
async function p7Sign(param, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            param,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.p7Sign = p7Sign;
/**
 * 获取USBKey证书.
 */
async function getKeyCert(keyType, dwCertNum, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            keyType,
            dwCertNum,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.getKeyCert = getKeyCert;
/**
 * 电子印章拆分为四部分数据.
 */
async function eSealSplitFourData(flag, dzyz, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            flag,
            dzyz,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.eSealSplitFourData = eSealSplitFourData;
/**
 * 电子印章拆分为详细项.
 */
async function eSealSplitDetailItems(flag, dzyz, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            flag,
            dzyz,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.eSealSplitDetailItems = eSealSplitDetailItems;
/**
 * 电子签章拆分为五部分数据.
 */
async function eSealSplitFiveData(flag, dzyz, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            flag,
            dzyz,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.eSealSplitFiveData = eSealSplitFiveData;
/**
 * 电子签章拆分为详细项.
 */
async function eSignSplitDetailItems(flag, dzyz, options = {}) {
    const ctx = sockjs_util_lib_1$1.SocketContext.createSendMsgContext(consts_1$1.SocketCmd.initKey, {
        needReturn: true,
        data: {
            flag,
            dzyz,
            options,
        },
    });
    try {
        const resCtx = await sockjs_util_lib_1$1.WebsocketClient.getConn().sendMsg(ctx);
        console.log(resCtx);
    }
    catch (e) {
        console.log(e);
    }
    finally {
        await ctx.destroy();
    }
}
initkey.eSignSplitDetailItems = eSignSplitDetailItems;

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(initkey, exports);
} (usbkey));

Object.defineProperty(lib$1, "__esModule", { value: true });
lib$1.usbKey = lib$1.EndAndClose = Begin = lib$1.Begin = void 0;
const sockjs_util_lib_1 = lib;
const consts_1 = consts;
const usbkey_1 = usbkey;
class UsbKeyOperation {
    constructor() {
        /**
         * 获取userAgent.
         * @private
         */
        this.userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "server-client";
        /**
         * 应用名称.
         * @private
         */
        this.appName = "UsbKey默认应用";
        /**
         * 是否开始工作.
         * @private
         */
        this.isBegin = false;
        /**
         * 网络是否可以使用
         * @private
         */
        this.canUse = false;
        /**
         * 监听连接
         * @private
         */
        this.connListener = undefined;
        /**
         * 打开（接收处理).
         * @private
         */
        this.open = async (event) => {
            const ctx = await event.returnObj({
                appName: this.appName,
                userAgent: this.userAgent
            }, {
                needReturn: true,
            });
            if (ctx.isVoid) {
                this.openResolve && this.openResolve();
                this.connListener && this.connListener("open");
            }
            else {
                this.openError && this.openError(ctx.err);
            }
        };
        this.InitKey = this.sockjsPromiseFnConvert(usbkey_1.initKey);
        this.ReleaseKey = this.sockjsPromiseFnConvert(usbkey_1.releaseKey);
        this.FilterKey = this.sockjsPromiseFnConvert(usbkey_1.filterKey);
        this.GetKeyNum = this.sockjsPromiseFnConvert(usbkey_1.getKeyNum);
        this.AwaitAuthData = this.sockjsPromiseFnConvert(usbkey_1.awaitAuthData);
        this.CreateKeyPair = this.sockjsPromiseFnConvert(usbkey_1.createKeyPair);
        this.ImportCert = this.sockjsPromiseFnConvert(usbkey_1.importCert);
        this.FormatKey = this.sockjsPromiseFnConvert(usbkey_1.formatKey);
        this.ImportElecSymmKey = this.sockjsPromiseFnConvert(usbkey_1.importElecSymmKey);
        this.WriteESealData = this.sockjsPromiseFnConvert(usbkey_1.writeESealData);
        this.GetESealData = this.sockjsPromiseFnConvert(usbkey_1.getESealData);
        this.SetCertEquipFilter = this.sockjsPromiseFnConvert(usbkey_1.setCertEquipFilter);
        this.GetKeyCertType = this.sockjsPromiseFnConvert(usbkey_1.getKeyCertType);
        this.CreateClientAuthRequest = this.sockjsPromiseFnConvert(usbkey_1.createClientAuthRequest);
        this.CreateClientAuthProof = this.sockjsPromiseFnConvert(usbkey_1.createClientAuthProof);
        this.P7Sign = this.sockjsPromiseFnConvert(usbkey_1.p7Sign);
        this.GetKeyCert = this.sockjsPromiseFnConvert(usbkey_1.getKeyCert);
        this.ESealSplitFourData = this.sockjsPromiseFnConvert(usbkey_1.eSealSplitFourData);
        this.ESealSplitDetailItems = this.sockjsPromiseFnConvert(usbkey_1.eSealSplitDetailItems);
        this.ESealSplitFiveData = this.sockjsPromiseFnConvert(usbkey_1.eSealSplitFiveData);
        this.ESignSplitDetailItems = this.sockjsPromiseFnConvert(usbkey_1.eSignSplitDetailItems);
        //初始化
        this.init();
    }
    /**
     * 当前状态
     * @constructor
     */
    static Current() {
        return UsbKeyOperation.INSTANCE;
    }
    /**
     * 初始化
     * @private
     */
    init() {
        sockjs_util_lib_1.WebsocketClient.registryWebsocketHook("close", (websocketClient) => {
            this.canUse = false;
            if (!this.isBegin) {
                return;
            }
            if (this.connListener) {
                this.connListener("close");
            }
            if (this.reconnectionTimeOutId) {
                clearTimeout(this.reconnectionTimeOutId);
                this.reconnectionTimeOutId = undefined;
            }
            this.reconnectionTimeOutId = setTimeout(() => {
                websocketClient.reconnection();
            }, 3000);
        });
        sockjs_util_lib_1.WebsocketClient.registryWebsocketHook("open", async (ctx) => {
            this.canUse = true;
            // if (this.openResolve) {
            //     this.openResolve();
            // }
            //
            // if (this.connListener) {
            //     this.connListener("open");
            // }
        });
        sockjs_util_lib_1.WebsocketClient.registryEventHandle(consts_1.SocketCmd.Open, this.open);
    }
    /**
     * 获取实例.
     * @param param
     */
    begin(param) {
        return new Promise((resolve, reject) => {
            if (UsbKeyOperation.INSTANCE.initParam || param.url === UsbKeyOperation.INSTANCE.initParam) {
                if (param.connectionListener) {
                    UsbKeyOperation.INSTANCE.connListener = param.connectionListener;
                }
                if (!param.url) {
                    UsbKeyOperation.INSTANCE.initParam = param;
                    resolve();
                    return;
                }
            }
            UsbKeyOperation.INSTANCE.initParam = param;
            if (UsbKeyOperation.INSTANCE.conn) {
                this.endAndClose();
            }
            const data = {
                url: param.url,
                maxMsgBlockSize: param.maxMsgBlockSize,
                timeout: param.timeout,
            };
            if (param.disableAutoRequireFn) {
                data.requireFn = param.requireFn;
            }
            else if ((typeof window !== "undefined" && window.require)) {
                data.requireFn = window.require;
            }
            else if (typeof commonjsRequire !== "undefined") {
                data.requireFn = commonjsRequire;
            }
            if (param.appName) {
                this.appName = param.appName;
            }
            if (!param.timeout) {
                param.timeout = 1000 * 30;
            }
            UsbKeyOperation.INSTANCE.isBegin = true;
            UsbKeyOperation.INSTANCE.openResolve = resolve;
            UsbKeyOperation.INSTANCE.openError = reject;
            if (param.connectionListener) {
                UsbKeyOperation.INSTANCE.connListener = param.connectionListener;
            }
            sockjs_util_lib_1.WebsocketClient.init(data);
        });
    }
    /**
     * 结束并关闭.
     */
    endAndClose() {
        this.initParam = undefined;
        this.isBegin = false;
        this.canUse = false;
        if (this.reconnectionTimeOutId) {
            clearTimeout(this.reconnectionTimeOutId);
            this.reconnectionTimeOutId = undefined;
        }
        if (!this.conn) {
            return;
        }
        this.conn.closeConnection();
        this.conn = undefined;
    }
    /**
     * 判断网络是否连通
     * @param fn
     * @private
     */
    sockjsPromiseFnConvert(fn) {
        return ((...args) => {
            if (!this.isBegin) {
                return Promise.reject("还没开始工作");
            }
            if (!this.canUse) {
                return Promise.reject("网络不可用");
            }
            return fn(...args, this.initParam);
        });
    }
}
/**
 * 实列.
 * @private
 */
UsbKeyOperation.INSTANCE = new UsbKeyOperation();
var Begin = lib$1.Begin = UsbKeyOperation.Current().begin;
lib$1.EndAndClose = UsbKeyOperation.Current().endAndClose;
lib$1.usbKey = UsbKeyOperation.Current();

/**
 * 检测对象是否为空
 * @param {*} e 入参
 * @returns 如果对象为空，返回true
 */
const isNull = (e) => e === null || e === undefined || e === '';
/**
 * 要检测的数组对象
 * @param e 入参
 * @returns 如果数组为空或者长度小于等于0，返回true
 */
const arrayIsNull = (e) => isNull(e) || e.length <= 0;
/**
 * 生成GUID
 */
const newGuid = () => {
    var curguid = "";
    for (var i = 1; i <= 32; i++) {
        var id = Math.floor(Math.random() * 16.0).toString(16);
        curguid += id;
        if (i === 8 || i === 12 || i === 16 || i === 20)
            curguid += "";
    }
    return curguid;
};
/**
 * 是否是对象
 */
const isObject = (e) => {
    if (isNull(e)) {
        return false;
    }
    return e.toString() === "[object Object]";
};

const apiReq = {
    post: {
        formData: (req) => {
            return new Promise((resovle, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', req.url);
                // xhr.responseType = 'json'; //返回方式待定
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            if (isNull(xhr.responseText)) {
                                reject("后台返回空响应");
                                return;
                            }
                            let rsp;
                            try {
                                rsp = JSON.parse(xhr.responseText);
                            }
                            catch (error) {
                                reject("解析响应结果失败");
                                return;
                            }
                            const { code, msg } = rsp;
                            if (code !== "0") {
                                reject(msg);
                                return;
                            }
                            resovle(true);
                        }
                        else {
                            reject(`${req.url} 请求异常，状态码 ${xhr.status}`);
                        }
                    }
                };
                xhr.send(req.data);
            });
        }
    }
};
const socketReq = async (params) => {
    try {
        var payload = {
            mod: "1",
            needReturn: true,
            data: !isNull(params.data) ? isObject(params.data) ? JSON.stringify(params.data) : params.data : undefined,
        };
        const reqCxt = lib.SocketContext.createSendMsgContext(params.cmd, payload);
        if (reqCxt.err) {
            params.onError?.(reqCxt.err);
            return Promise.reject(reqCxt.err);
        }
        const res = await lib.WebsocketClient.getConn().sendMsg(reqCxt);
        if (res.err) {
            params.onError?.(res.err);
            return Promise.reject(res.err);
        }
        if (res.isVoid) {
            return Promise.resolve();
        }
        let resData = res.unmarshal();
        if (typeof resData === "string") {
            try {
                resData = JSON.parse(resData);
            }
            catch (e) { }
            finally {
                return Promise.resolve(resData);
            }
        }
    }
    catch (error) {
        params.onError?.(error);
        return Promise.reject(error);
    }
    finally {
        params.finally?.();
    }
};

const beginUpload = async (payload) => socketReq({ cmd: '/startBigFileUpload', data: payload });
const sliceUpload = async (payload) => {
    var url = "http://192.168.100.151:28006/bigFileUpload";
    if (payload.url) {
        url = payload.url;
    }
    var data = new FormData();
    data.append("fileId", payload.fileId);
    data.append("index", payload.index);
    data.append("sliceId", payload.sliceId);
    data.append("buffer", new Blob([payload.buffer]));
    return apiReq.post.formData({ url, data });
};
const endUpload = async (id) => socketReq({ cmd: '/getBigFileUploadResult', data: id });
const verifySeal = async (id) => socketReq({ cmd: '/seal/verify', data: id });

const sealVerify = async (fileId) => {
    const rst = await verifySeal(fileId);
    return rst;
};

const splitFile = (file, shardSize) => {
    return new Promise((resovle, reject) => {
        if (isNull(file)) {
            reject('获取文件失败, 文件不能为空');
            return;
        }
        const fileSize = file.size; //文件大小
        const sliceNum = Math.ceil(fileSize / shardSize); //分片数量
        var fileReader = new FileReader();
        fileReader.onload = (ev) => {
            const blob = ev.target.result;
            var md5Reader = new SparkMD5.ArrayBuffer();
            var blobArray = [];
            for (let index = 0; index < sliceNum; index++) {
                var start = index * shardSize;
                var end = Math.min(fileSize, start + shardSize);
                var sliceBlob = blob.slice(start, end);
                md5Reader.append(sliceBlob);
                blobArray.push({
                    index,
                    sliceId: newGuid(),
                    buffer: sliceBlob
                });
            }
            var rsp = {
                md5: md5Reader.end(),
                fileSize,
                array: blobArray
            };
            md5Reader.destroy(); //销毁
            resovle(rsp);
        };
        fileReader.readAsArrayBuffer(file); //以二进制的形式加载
    });
};
/**
 * 上传文件接口
 */
const openFile = async (req) => {
    const { name, rawHtmlEle } = req;
    if (isNull(rawHtmlEle) || isNull(rawHtmlEle.files) || rawHtmlEle.files.length <= 0) {
        return Promise.reject('检测到文件为空, 文件不能为空');
    }
    const fileGuid = newGuid();
    let sliceRsp;
    const shardSize = 5 * 1024 * 1024;
    try {
        sliceRsp = await splitFile(rawHtmlEle.files[0], shardSize);
    }
    catch (error) {
        return Promise.reject(error);
    }
    if (isNull(sliceRsp) || isNull(sliceRsp.md5) || arrayIsNull(sliceRsp.array)) {
        return Promise.reject('分片异常');
    }
    const { md5, array, fileSize } = sliceRsp;
    try {
        //第一步，调用接口，标志着分片上传开始
        await beginUpload({
            name,
            id: fileGuid,
            md5,
            sliceNumber: array.length.toString(),
            size: fileSize.toString(),
        });
    }
    catch (error) {
        return Promise.reject(`开始上传异常 ${error}`);
    }
    //第二部，开始分片上传
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        try {
            await sliceUpload({
                url: req.slicingPath,
                fileId: fileGuid,
                index: element.index.toString(),
                sliceId: element.sliceId.toString(),
                buffer: element.buffer
            });
        }
        catch (error) {
            return Promise.reject(`分片上传失败 ${error}`);
        }
    }
    //第三步，分片上传结束
    try {
        await endUpload(fileGuid);
    }
    catch (error) {
        return Promise.reject(`结束上传失败 ${error}`);
    }
    return Promise.resolve(fileGuid);
};

//连接本地服务
Begin({
    url: 'http://192.168.100.151:28006/dev',
    connectionListener: (t) => {
        var isOpen = t === "open";
        console.info(`客户端服务连接状态：${isOpen ? '已连接' : '已断开'}`);
    },
    disableAutoRequireFn: true
});

export { openFile, sealVerify };
