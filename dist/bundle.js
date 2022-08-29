(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;

    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }

    g.snap = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }

          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }

        return n[i].exports;
      }

      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);

      return o;
    }

    return r;
  }()({
    1: [function (require, module, exports) {
      'use strict';

      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;

      function getLens(b64) {
        var len = b64.length;

        if (len % 4 > 0) {
          throw new Error('Invalid string. Length must be a multiple of 4');
        }

        var validLen = b64.indexOf('=');
        if (validLen === -1) validLen = len;
        var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }

      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }

      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }

      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i;

        for (i = 0; i < len; i += 4) {
          tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
          arr[curByte++] = tmp >> 16 & 0xFF;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }

        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
          arr[curByte++] = tmp & 0xFF;
        }

        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }

        return arr;
      }

      function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
      }

      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];

        for (var i = start; i < end; i += 3) {
          tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
          output.push(tripletToBase64(tmp));
        }

        return output.join('');
      }

      function fromByteArray(uint8) {
        var tmp;
        var len = uint8.length;
        var extraBytes = len % 3;
        var parts = [];
        var maxChunkLength = 16383;

        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
          parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
        }

        if (extraBytes === 1) {
          tmp = uint8[len - 1];
          parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
        } else if (extraBytes === 2) {
          tmp = (uint8[len - 2] << 8) + uint8[len - 1];
          parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
        }

        return parts.join('');
      }
    }, {}],
    2: [function (require, module, exports) {}, {}],
    3: [function (require, module, exports) {
      (function () {
        (function () {
          'use strict';

          var base64 = require('base64-js');

          var ieee754 = require('ieee754');

          exports.Buffer = Buffer;
          exports.SlowBuffer = SlowBuffer;
          exports.INSPECT_MAX_BYTES = 50;
          var K_MAX_LENGTH = 0x7fffffff;
          exports.kMaxLength = K_MAX_LENGTH;
          Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

          if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
            console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
          }

          function typedArraySupport() {
            try {
              var arr = new Uint8Array(1);
              arr.__proto__ = {
                __proto__: Uint8Array.prototype,
                foo: function () {
                  return 42;
                }
              };
              return arr.foo() === 42;
            } catch (e) {
              return false;
            }
          }

          Object.defineProperty(Buffer.prototype, 'parent', {
            enumerable: true,
            get: function () {
              if (!Buffer.isBuffer(this)) return undefined;
              return this.buffer;
            }
          });
          Object.defineProperty(Buffer.prototype, 'offset', {
            enumerable: true,
            get: function () {
              if (!Buffer.isBuffer(this)) return undefined;
              return this.byteOffset;
            }
          });

          function createBuffer(length) {
            if (length > K_MAX_LENGTH) {
              throw new RangeError('The value "' + length + '" is invalid for option "size"');
            }

            var buf = new Uint8Array(length);
            buf.__proto__ = Buffer.prototype;
            return buf;
          }

          function Buffer(arg, encodingOrOffset, length) {
            if (typeof arg === 'number') {
              if (typeof encodingOrOffset === 'string') {
                throw new TypeError('The "string" argument must be of type string. Received type number');
              }

              return allocUnsafe(arg);
            }

            return from(arg, encodingOrOffset, length);
          }

          if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
            Object.defineProperty(Buffer, Symbol.species, {
              value: null,
              configurable: true,
              enumerable: false,
              writable: false
            });
          }

          Buffer.poolSize = 8192;

          function from(value, encodingOrOffset, length) {
            if (typeof value === 'string') {
              return fromString(value, encodingOrOffset);
            }

            if (ArrayBuffer.isView(value)) {
              return fromArrayLike(value);
            }

            if (value == null) {
              throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
            }

            if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
              return fromArrayBuffer(value, encodingOrOffset, length);
            }

            if (typeof value === 'number') {
              throw new TypeError('The "value" argument must not be of type number. Received type number');
            }

            var valueOf = value.valueOf && value.valueOf();

            if (valueOf != null && valueOf !== value) {
              return Buffer.from(valueOf, encodingOrOffset, length);
            }

            var b = fromObject(value);
            if (b) return b;

            if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
              return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
            }

            throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
          }

          Buffer.from = function (value, encodingOrOffset, length) {
            return from(value, encodingOrOffset, length);
          };

          Buffer.prototype.__proto__ = Uint8Array.prototype;
          Buffer.__proto__ = Uint8Array;

          function assertSize(size) {
            if (typeof size !== 'number') {
              throw new TypeError('"size" argument must be of type number');
            } else if (size < 0) {
              throw new RangeError('The value "' + size + '" is invalid for option "size"');
            }
          }

          function alloc(size, fill, encoding) {
            assertSize(size);

            if (size <= 0) {
              return createBuffer(size);
            }

            if (fill !== undefined) {
              return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
            }

            return createBuffer(size);
          }

          Buffer.alloc = function (size, fill, encoding) {
            return alloc(size, fill, encoding);
          };

          function allocUnsafe(size) {
            assertSize(size);
            return createBuffer(size < 0 ? 0 : checked(size) | 0);
          }

          Buffer.allocUnsafe = function (size) {
            return allocUnsafe(size);
          };

          Buffer.allocUnsafeSlow = function (size) {
            return allocUnsafe(size);
          };

          function fromString(string, encoding) {
            if (typeof encoding !== 'string' || encoding === '') {
              encoding = 'utf8';
            }

            if (!Buffer.isEncoding(encoding)) {
              throw new TypeError('Unknown encoding: ' + encoding);
            }

            var length = byteLength(string, encoding) | 0;
            var buf = createBuffer(length);
            var actual = buf.write(string, encoding);

            if (actual !== length) {
              buf = buf.slice(0, actual);
            }

            return buf;
          }

          function fromArrayLike(array) {
            var length = array.length < 0 ? 0 : checked(array.length) | 0;
            var buf = createBuffer(length);

            for (var i = 0; i < length; i += 1) {
              buf[i] = array[i] & 255;
            }

            return buf;
          }

          function fromArrayBuffer(array, byteOffset, length) {
            if (byteOffset < 0 || array.byteLength < byteOffset) {
              throw new RangeError('"offset" is outside of buffer bounds');
            }

            if (array.byteLength < byteOffset + (length || 0)) {
              throw new RangeError('"length" is outside of buffer bounds');
            }

            var buf;

            if (byteOffset === undefined && length === undefined) {
              buf = new Uint8Array(array);
            } else if (length === undefined) {
              buf = new Uint8Array(array, byteOffset);
            } else {
              buf = new Uint8Array(array, byteOffset, length);
            }

            buf.__proto__ = Buffer.prototype;
            return buf;
          }

          function fromObject(obj) {
            if (Buffer.isBuffer(obj)) {
              var len = checked(obj.length) | 0;
              var buf = createBuffer(len);

              if (buf.length === 0) {
                return buf;
              }

              obj.copy(buf, 0, 0, len);
              return buf;
            }

            if (obj.length !== undefined) {
              if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
                return createBuffer(0);
              }

              return fromArrayLike(obj);
            }

            if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
              return fromArrayLike(obj.data);
            }
          }

          function checked(length) {
            if (length >= K_MAX_LENGTH) {
              throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
            }

            return length | 0;
          }

          function SlowBuffer(length) {
            if (+length != length) {
              length = 0;
            }

            return Buffer.alloc(+length);
          }

          Buffer.isBuffer = function isBuffer(b) {
            return b != null && b._isBuffer === true && b !== Buffer.prototype;
          };

          Buffer.compare = function compare(a, b) {
            if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
            if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);

            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
              throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
            }

            if (a === b) return 0;
            var x = a.length;
            var y = b.length;

            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
              if (a[i] !== b[i]) {
                x = a[i];
                y = b[i];
                break;
              }
            }

            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };

          Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
              case 'hex':
              case 'utf8':
              case 'utf-8':
              case 'ascii':
              case 'latin1':
              case 'binary':
              case 'base64':
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return true;

              default:
                return false;
            }
          };

          Buffer.concat = function concat(list, length) {
            if (!Array.isArray(list)) {
              throw new TypeError('"list" argument must be an Array of Buffers');
            }

            if (list.length === 0) {
              return Buffer.alloc(0);
            }

            var i;

            if (length === undefined) {
              length = 0;

              for (i = 0; i < list.length; ++i) {
                length += list[i].length;
              }
            }

            var buffer = Buffer.allocUnsafe(length);
            var pos = 0;

            for (i = 0; i < list.length; ++i) {
              var buf = list[i];

              if (isInstance(buf, Uint8Array)) {
                buf = Buffer.from(buf);
              }

              if (!Buffer.isBuffer(buf)) {
                throw new TypeError('"list" argument must be an Array of Buffers');
              }

              buf.copy(buffer, pos);
              pos += buf.length;
            }

            return buffer;
          };

          function byteLength(string, encoding) {
            if (Buffer.isBuffer(string)) {
              return string.length;
            }

            if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
              return string.byteLength;
            }

            if (typeof string !== 'string') {
              throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + typeof string);
            }

            var len = string.length;
            var mustMatch = arguments.length > 2 && arguments[2] === true;
            if (!mustMatch && len === 0) return 0;
            var loweredCase = false;

            for (;;) {
              switch (encoding) {
                case 'ascii':
                case 'latin1':
                case 'binary':
                  return len;

                case 'utf8':
                case 'utf-8':
                  return utf8ToBytes(string).length;

                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return len * 2;

                case 'hex':
                  return len >>> 1;

                case 'base64':
                  return base64ToBytes(string).length;

                default:
                  if (loweredCase) {
                    return mustMatch ? -1 : utf8ToBytes(string).length;
                  }

                  encoding = ('' + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          }

          Buffer.byteLength = byteLength;

          function slowToString(encoding, start, end) {
            var loweredCase = false;

            if (start === undefined || start < 0) {
              start = 0;
            }

            if (start > this.length) {
              return '';
            }

            if (end === undefined || end > this.length) {
              end = this.length;
            }

            if (end <= 0) {
              return '';
            }

            end >>>= 0;
            start >>>= 0;

            if (end <= start) {
              return '';
            }

            if (!encoding) encoding = 'utf8';

            while (true) {
              switch (encoding) {
                case 'hex':
                  return hexSlice(this, start, end);

                case 'utf8':
                case 'utf-8':
                  return utf8Slice(this, start, end);

                case 'ascii':
                  return asciiSlice(this, start, end);

                case 'latin1':
                case 'binary':
                  return latin1Slice(this, start, end);

                case 'base64':
                  return base64Slice(this, start, end);

                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return utf16leSlice(this, start, end);

                default:
                  if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                  encoding = (encoding + '').toLowerCase();
                  loweredCase = true;
              }
            }
          }

          Buffer.prototype._isBuffer = true;

          function swap(b, n, m) {
            var i = b[n];
            b[n] = b[m];
            b[m] = i;
          }

          Buffer.prototype.swap16 = function swap16() {
            var len = this.length;

            if (len % 2 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 16-bits');
            }

            for (var i = 0; i < len; i += 2) {
              swap(this, i, i + 1);
            }

            return this;
          };

          Buffer.prototype.swap32 = function swap32() {
            var len = this.length;

            if (len % 4 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 32-bits');
            }

            for (var i = 0; i < len; i += 4) {
              swap(this, i, i + 3);
              swap(this, i + 1, i + 2);
            }

            return this;
          };

          Buffer.prototype.swap64 = function swap64() {
            var len = this.length;

            if (len % 8 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 64-bits');
            }

            for (var i = 0; i < len; i += 8) {
              swap(this, i, i + 7);
              swap(this, i + 1, i + 6);
              swap(this, i + 2, i + 5);
              swap(this, i + 3, i + 4);
            }

            return this;
          };

          Buffer.prototype.toString = function toString() {
            var length = this.length;
            if (length === 0) return '';
            if (arguments.length === 0) return utf8Slice(this, 0, length);
            return slowToString.apply(this, arguments);
          };

          Buffer.prototype.toLocaleString = Buffer.prototype.toString;

          Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
            if (this === b) return true;
            return Buffer.compare(this, b) === 0;
          };

          Buffer.prototype.inspect = function inspect() {
            var str = '';
            var max = exports.INSPECT_MAX_BYTES;
            str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
            if (this.length > max) str += ' ... ';
            return '<Buffer ' + str + '>';
          };

          Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
            if (isInstance(target, Uint8Array)) {
              target = Buffer.from(target, target.offset, target.byteLength);
            }

            if (!Buffer.isBuffer(target)) {
              throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + typeof target);
            }

            if (start === undefined) {
              start = 0;
            }

            if (end === undefined) {
              end = target ? target.length : 0;
            }

            if (thisStart === undefined) {
              thisStart = 0;
            }

            if (thisEnd === undefined) {
              thisEnd = this.length;
            }

            if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
              throw new RangeError('out of range index');
            }

            if (thisStart >= thisEnd && start >= end) {
              return 0;
            }

            if (thisStart >= thisEnd) {
              return -1;
            }

            if (start >= end) {
              return 1;
            }

            start >>>= 0;
            end >>>= 0;
            thisStart >>>= 0;
            thisEnd >>>= 0;
            if (this === target) return 0;
            var x = thisEnd - thisStart;
            var y = end - start;
            var len = Math.min(x, y);
            var thisCopy = this.slice(thisStart, thisEnd);
            var targetCopy = target.slice(start, end);

            for (var i = 0; i < len; ++i) {
              if (thisCopy[i] !== targetCopy[i]) {
                x = thisCopy[i];
                y = targetCopy[i];
                break;
              }
            }

            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };

          function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
            if (buffer.length === 0) return -1;

            if (typeof byteOffset === 'string') {
              encoding = byteOffset;
              byteOffset = 0;
            } else if (byteOffset > 0x7fffffff) {
              byteOffset = 0x7fffffff;
            } else if (byteOffset < -0x80000000) {
              byteOffset = -0x80000000;
            }

            byteOffset = +byteOffset;

            if (numberIsNaN(byteOffset)) {
              byteOffset = dir ? 0 : buffer.length - 1;
            }

            if (byteOffset < 0) byteOffset = buffer.length + byteOffset;

            if (byteOffset >= buffer.length) {
              if (dir) return -1;else byteOffset = buffer.length - 1;
            } else if (byteOffset < 0) {
              if (dir) byteOffset = 0;else return -1;
            }

            if (typeof val === 'string') {
              val = Buffer.from(val, encoding);
            }

            if (Buffer.isBuffer(val)) {
              if (val.length === 0) {
                return -1;
              }

              return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
            } else if (typeof val === 'number') {
              val = val & 0xFF;

              if (typeof Uint8Array.prototype.indexOf === 'function') {
                if (dir) {
                  return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                } else {
                  return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                }
              }

              return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
            }

            throw new TypeError('val must be string, number or Buffer');
          }

          function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
            var indexSize = 1;
            var arrLength = arr.length;
            var valLength = val.length;

            if (encoding !== undefined) {
              encoding = String(encoding).toLowerCase();

              if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
                if (arr.length < 2 || val.length < 2) {
                  return -1;
                }

                indexSize = 2;
                arrLength /= 2;
                valLength /= 2;
                byteOffset /= 2;
              }
            }

            function read(buf, i) {
              if (indexSize === 1) {
                return buf[i];
              } else {
                return buf.readUInt16BE(i * indexSize);
              }
            }

            var i;

            if (dir) {
              var foundIndex = -1;

              for (i = byteOffset; i < arrLength; i++) {
                if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                  if (foundIndex === -1) foundIndex = i;
                  if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                } else {
                  if (foundIndex !== -1) i -= i - foundIndex;
                  foundIndex = -1;
                }
              }
            } else {
              if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;

              for (i = byteOffset; i >= 0; i--) {
                var found = true;

                for (var j = 0; j < valLength; j++) {
                  if (read(arr, i + j) !== read(val, j)) {
                    found = false;
                    break;
                  }
                }

                if (found) return i;
              }
            }

            return -1;
          }

          Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
            return this.indexOf(val, byteOffset, encoding) !== -1;
          };

          Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
          };

          Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
          };

          function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0;
            var remaining = buf.length - offset;

            if (!length) {
              length = remaining;
            } else {
              length = Number(length);

              if (length > remaining) {
                length = remaining;
              }
            }

            var strLen = string.length;

            if (length > strLen / 2) {
              length = strLen / 2;
            }

            for (var i = 0; i < length; ++i) {
              var parsed = parseInt(string.substr(i * 2, 2), 16);
              if (numberIsNaN(parsed)) return i;
              buf[offset + i] = parsed;
            }

            return i;
          }

          function utf8Write(buf, string, offset, length) {
            return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
          }

          function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length);
          }

          function latin1Write(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length);
          }

          function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length);
          }

          function ucs2Write(buf, string, offset, length) {
            return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
          }

          Buffer.prototype.write = function write(string, offset, length, encoding) {
            if (offset === undefined) {
              encoding = 'utf8';
              length = this.length;
              offset = 0;
            } else if (length === undefined && typeof offset === 'string') {
              encoding = offset;
              length = this.length;
              offset = 0;
            } else if (isFinite(offset)) {
              offset = offset >>> 0;

              if (isFinite(length)) {
                length = length >>> 0;
                if (encoding === undefined) encoding = 'utf8';
              } else {
                encoding = length;
                length = undefined;
              }
            } else {
              throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
            }

            var remaining = this.length - offset;
            if (length === undefined || length > remaining) length = remaining;

            if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
              throw new RangeError('Attempt to write outside buffer bounds');
            }

            if (!encoding) encoding = 'utf8';
            var loweredCase = false;

            for (;;) {
              switch (encoding) {
                case 'hex':
                  return hexWrite(this, string, offset, length);

                case 'utf8':
                case 'utf-8':
                  return utf8Write(this, string, offset, length);

                case 'ascii':
                  return asciiWrite(this, string, offset, length);

                case 'latin1':
                case 'binary':
                  return latin1Write(this, string, offset, length);

                case 'base64':
                  return base64Write(this, string, offset, length);

                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return ucs2Write(this, string, offset, length);

                default:
                  if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                  encoding = ('' + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          };

          Buffer.prototype.toJSON = function toJSON() {
            return {
              type: 'Buffer',
              data: Array.prototype.slice.call(this._arr || this, 0)
            };
          };

          function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
              return base64.fromByteArray(buf);
            } else {
              return base64.fromByteArray(buf.slice(start, end));
            }
          }

          function utf8Slice(buf, start, end) {
            end = Math.min(buf.length, end);
            var res = [];
            var i = start;

            while (i < end) {
              var firstByte = buf[i];
              var codePoint = null;
              var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

              if (i + bytesPerSequence <= end) {
                var secondByte, thirdByte, fourthByte, tempCodePoint;

                switch (bytesPerSequence) {
                  case 1:
                    if (firstByte < 0x80) {
                      codePoint = firstByte;
                    }

                    break;

                  case 2:
                    secondByte = buf[i + 1];

                    if ((secondByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

                      if (tempCodePoint > 0x7F) {
                        codePoint = tempCodePoint;
                      }
                    }

                    break;

                  case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];

                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

                      if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                        codePoint = tempCodePoint;
                      }
                    }

                    break;

                  case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];

                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

                      if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                        codePoint = tempCodePoint;
                      }
                    }

                }
              }

              if (codePoint === null) {
                codePoint = 0xFFFD;
                bytesPerSequence = 1;
              } else if (codePoint > 0xFFFF) {
                codePoint -= 0x10000;
                res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                codePoint = 0xDC00 | codePoint & 0x3FF;
              }

              res.push(codePoint);
              i += bytesPerSequence;
            }

            return decodeCodePointsArray(res);
          }

          var MAX_ARGUMENTS_LENGTH = 0x1000;

          function decodeCodePointsArray(codePoints) {
            var len = codePoints.length;

            if (len <= MAX_ARGUMENTS_LENGTH) {
              return String.fromCharCode.apply(String, codePoints);
            }

            var res = '';
            var i = 0;

            while (i < len) {
              res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
            }

            return res;
          }

          function asciiSlice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);

            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i] & 0x7F);
            }

            return ret;
          }

          function latin1Slice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);

            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i]);
            }

            return ret;
          }

          function hexSlice(buf, start, end) {
            var len = buf.length;
            if (!start || start < 0) start = 0;
            if (!end || end < 0 || end > len) end = len;
            var out = '';

            for (var i = start; i < end; ++i) {
              out += toHex(buf[i]);
            }

            return out;
          }

          function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end);
            var res = '';

            for (var i = 0; i < bytes.length; i += 2) {
              res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
            }

            return res;
          }

          Buffer.prototype.slice = function slice(start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;

            if (start < 0) {
              start += len;
              if (start < 0) start = 0;
            } else if (start > len) {
              start = len;
            }

            if (end < 0) {
              end += len;
              if (end < 0) end = 0;
            } else if (end > len) {
              end = len;
            }

            if (end < start) end = start;
            var newBuf = this.subarray(start, end);
            newBuf.__proto__ = Buffer.prototype;
            return newBuf;
          };

          function checkOffset(offset, ext, length) {
            if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
            if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
          }

          Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;

            while (++i < byteLength && (mul *= 0x100)) {
              val += this[offset + i] * mul;
            }

            return val;
          };

          Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;

            if (!noAssert) {
              checkOffset(offset, byteLength, this.length);
            }

            var val = this[offset + --byteLength];
            var mul = 1;

            while (byteLength > 0 && (mul *= 0x100)) {
              val += this[offset + --byteLength] * mul;
            }

            return val;
          };

          Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            return this[offset];
          };

          Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] | this[offset + 1] << 8;
          };

          Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] << 8 | this[offset + 1];
          };

          Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
          };

          Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
          };

          Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;

            while (++i < byteLength && (mul *= 0x100)) {
              val += this[offset + i] * mul;
            }

            mul *= 0x80;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
          };

          Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var i = byteLength;
            var mul = 1;
            var val = this[offset + --i];

            while (i > 0 && (mul *= 0x100)) {
              val += this[offset + --i] * mul;
            }

            mul *= 0x80;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
          };

          Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            if (!(this[offset] & 0x80)) return this[offset];
            return (0xff - this[offset] + 1) * -1;
          };

          Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset] | this[offset + 1] << 8;
            return val & 0x8000 ? val | 0xFFFF0000 : val;
          };

          Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset + 1] | this[offset] << 8;
            return val & 0x8000 ? val | 0xFFFF0000 : val;
          };

          Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
          };

          Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
          };

          Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, true, 23, 4);
          };

          Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, false, 23, 4);
          };

          Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, true, 52, 8);
          };

          Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, false, 52, 8);
          };

          function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
            if (offset + ext > buf.length) throw new RangeError('Index out of range');
          }

          Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;

            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }

            var mul = 1;
            var i = 0;
            this[offset] = value & 0xFF;

            while (++i < byteLength && (mul *= 0x100)) {
              this[offset + i] = value / mul & 0xFF;
            }

            return offset + byteLength;
          };

          Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;

            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }

            var i = byteLength - 1;
            var mul = 1;
            this[offset + i] = value & 0xFF;

            while (--i >= 0 && (mul *= 0x100)) {
              this[offset + i] = value / mul & 0xFF;
            }

            return offset + byteLength;
          };

          Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
            this[offset] = value & 0xff;
            return offset + 1;
          };

          Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            return offset + 2;
          };

          Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 0xff;
            return offset + 2;
          };

          Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            this[offset + 3] = value >>> 24;
            this[offset + 2] = value >>> 16;
            this[offset + 1] = value >>> 8;
            this[offset] = value & 0xff;
            return offset + 4;
          };

          Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 0xff;
            return offset + 4;
          };

          Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;

            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);
              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }

            var i = 0;
            var mul = 1;
            var sub = 0;
            this[offset] = value & 0xFF;

            while (++i < byteLength && (mul *= 0x100)) {
              if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                sub = 1;
              }

              this[offset + i] = (value / mul >> 0) - sub & 0xFF;
            }

            return offset + byteLength;
          };

          Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;

            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);
              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }

            var i = byteLength - 1;
            var mul = 1;
            var sub = 0;
            this[offset + i] = value & 0xFF;

            while (--i >= 0 && (mul *= 0x100)) {
              if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                sub = 1;
              }

              this[offset + i] = (value / mul >> 0) - sub & 0xFF;
            }

            return offset + byteLength;
          };

          Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
            if (value < 0) value = 0xff + value + 1;
            this[offset] = value & 0xff;
            return offset + 1;
          };

          Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            return offset + 2;
          };

          Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 0xff;
            return offset + 2;
          };

          Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            this[offset + 2] = value >>> 16;
            this[offset + 3] = value >>> 24;
            return offset + 4;
          };

          Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            if (value < 0) value = 0xffffffff + value + 1;
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 0xff;
            return offset + 4;
          };

          function checkIEEE754(buf, value, offset, ext, max, min) {
            if (offset + ext > buf.length) throw new RangeError('Index out of range');
            if (offset < 0) throw new RangeError('Index out of range');
          }

          function writeFloat(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;

            if (!noAssert) {
              checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
            }

            ieee754.write(buf, value, offset, littleEndian, 23, 4);
            return offset + 4;
          }

          Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
            return writeFloat(this, value, offset, true, noAssert);
          };

          Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
            return writeFloat(this, value, offset, false, noAssert);
          };

          function writeDouble(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;

            if (!noAssert) {
              checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
            }

            ieee754.write(buf, value, offset, littleEndian, 52, 8);
            return offset + 8;
          }

          Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
            return writeDouble(this, value, offset, true, noAssert);
          };

          Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
            return writeDouble(this, value, offset, false, noAssert);
          };

          Buffer.prototype.copy = function copy(target, targetStart, start, end) {
            if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;

            if (targetStart < 0) {
              throw new RangeError('targetStart out of bounds');
            }

            if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
            if (end < 0) throw new RangeError('sourceEnd out of bounds');
            if (end > this.length) end = this.length;

            if (target.length - targetStart < end - start) {
              end = target.length - targetStart + start;
            }

            var len = end - start;

            if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
              this.copyWithin(targetStart, start, end);
            } else if (this === target && start < targetStart && targetStart < end) {
              for (var i = len - 1; i >= 0; --i) {
                target[i + targetStart] = this[i + start];
              }
            } else {
              Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
            }

            return len;
          };

          Buffer.prototype.fill = function fill(val, start, end, encoding) {
            if (typeof val === 'string') {
              if (typeof start === 'string') {
                encoding = start;
                start = 0;
                end = this.length;
              } else if (typeof end === 'string') {
                encoding = end;
                end = this.length;
              }

              if (encoding !== undefined && typeof encoding !== 'string') {
                throw new TypeError('encoding must be a string');
              }

              if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                throw new TypeError('Unknown encoding: ' + encoding);
              }

              if (val.length === 1) {
                var code = val.charCodeAt(0);

                if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
                  val = code;
                }
              }
            } else if (typeof val === 'number') {
              val = val & 255;
            }

            if (start < 0 || this.length < start || this.length < end) {
              throw new RangeError('Out of range index');
            }

            if (end <= start) {
              return this;
            }

            start = start >>> 0;
            end = end === undefined ? this.length : end >>> 0;
            if (!val) val = 0;
            var i;

            if (typeof val === 'number') {
              for (i = start; i < end; ++i) {
                this[i] = val;
              }
            } else {
              var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
              var len = bytes.length;

              if (len === 0) {
                throw new TypeError('The value "' + val + '" is invalid for argument "value"');
              }

              for (i = 0; i < end - start; ++i) {
                this[i + start] = bytes[i % len];
              }
            }

            return this;
          };

          var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

          function base64clean(str) {
            str = str.split('=')[0];
            str = str.trim().replace(INVALID_BASE64_RE, '');
            if (str.length < 2) return '';

            while (str.length % 4 !== 0) {
              str = str + '=';
            }

            return str;
          }

          function toHex(n) {
            if (n < 16) return '0' + n.toString(16);
            return n.toString(16);
          }

          function utf8ToBytes(string, units) {
            units = units || Infinity;
            var codePoint;
            var length = string.length;
            var leadSurrogate = null;
            var bytes = [];

            for (var i = 0; i < length; ++i) {
              codePoint = string.charCodeAt(i);

              if (codePoint > 0xD7FF && codePoint < 0xE000) {
                if (!leadSurrogate) {
                  if (codePoint > 0xDBFF) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                  } else if (i + 1 === length) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                  }

                  leadSurrogate = codePoint;
                  continue;
                }

                if (codePoint < 0xDC00) {
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  leadSurrogate = codePoint;
                  continue;
                }

                codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
              } else if (leadSurrogate) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              }

              leadSurrogate = null;

              if (codePoint < 0x80) {
                if ((units -= 1) < 0) break;
                bytes.push(codePoint);
              } else if (codePoint < 0x800) {
                if ((units -= 2) < 0) break;
                bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
              } else if (codePoint < 0x10000) {
                if ((units -= 3) < 0) break;
                bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
              } else if (codePoint < 0x110000) {
                if ((units -= 4) < 0) break;
                bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
              } else {
                throw new Error('Invalid code point');
              }
            }

            return bytes;
          }

          function asciiToBytes(str) {
            var byteArray = [];

            for (var i = 0; i < str.length; ++i) {
              byteArray.push(str.charCodeAt(i) & 0xFF);
            }

            return byteArray;
          }

          function utf16leToBytes(str, units) {
            var c, hi, lo;
            var byteArray = [];

            for (var i = 0; i < str.length; ++i) {
              if ((units -= 2) < 0) break;
              c = str.charCodeAt(i);
              hi = c >> 8;
              lo = c % 256;
              byteArray.push(lo);
              byteArray.push(hi);
            }

            return byteArray;
          }

          function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str));
          }

          function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; ++i) {
              if (i + offset >= dst.length || i >= src.length) break;
              dst[i + offset] = src[i];
            }

            return i;
          }

          function isInstance(obj, type) {
            return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
          }

          function numberIsNaN(obj) {
            return obj !== obj;
          }
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "base64-js": 1,
      "buffer": 3,
      "ieee754": 4
    }],
    4: [function (require, module, exports) {
      exports.read = function (buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;

        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;

        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }

        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };

      exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);

        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);

          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }

          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }

          if (value * c >= 2) {
            e++;
            c /= 2;
          }

          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }

        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

        e = e << mLen | m;
        eLen += mLen;

        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

        buffer[offset + i - d] |= s * 128;
      };
    }, {}],
    5: [function (require, module, exports) {
      var process = module.exports = {};
      var cachedSetTimeout;
      var cachedClearTimeout;

      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }

      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }

      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }

        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();

      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          return setTimeout(fun, 0);
        }

        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }

        try {
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }

      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          return clearTimeout(marker);
        }

        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }

        try {
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            return cachedClearTimeout.call(this, marker);
          }
        }
      }

      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;

      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }

        draining = false;

        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }

        if (queue.length) {
          drainQueue();
        }
      }

      function drainQueue() {
        if (draining) {
          return;
        }

        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
        var len = queue.length;

        while (len) {
          currentQueue = queue;
          queue = [];

          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }

          queueIndex = -1;
          len = queue.length;
        }

        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }

      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);

        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }

        queue.push(new Item(fun, args));

        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };

      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }

      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };

      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = '';
      process.versions = {};

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;

      process.listeners = function (name) {
        return [];
      };

      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };

      process.cwd = function () {
        return '/';
      };

      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };

      process.umask = function () {
        return 0;
      };
    }, {}],
    6: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.utils = exports.curve25519 = exports.getSharedSecret = exports.sync = exports.verify = exports.sign = exports.getPublicKey = exports.Signature = exports.Point = exports.RistrettoPoint = exports.ExtendedPoint = exports.CURVE = void 0;

      const nodeCrypto = require("crypto");

      const _0n = BigInt(0);

      const _1n = BigInt(1);

      const _2n = BigInt(2);

      const _255n = BigInt(255);

      const CURVE_ORDER = _2n ** BigInt(252) + BigInt('27742317777372353535851937790883648493');
      const CURVE = Object.freeze({
        a: BigInt(-1),
        d: BigInt('37095705934669439343138083508754565189542113879843219016388785533085940283555'),
        P: _2n ** _255n - BigInt(19),
        l: CURVE_ORDER,
        n: CURVE_ORDER,
        h: BigInt(8),
        Gx: BigInt('15112221349535400772501151409588531511454012693041857206046113283949847762202'),
        Gy: BigInt('46316835694926478169428394003475163141307993866256225615783033603165251855960')
      });
      exports.CURVE = CURVE;

      const MAX_256B = _2n ** BigInt(256);

      const SQRT_M1 = BigInt('19681161376707505956807079304988542015446066515923890162744021073123829784752');
      const SQRT_D = BigInt('6853475219497561581579357271197624642482790079785650197046958215289687604742');
      const SQRT_AD_MINUS_ONE = BigInt('25063068953384623474111414158702152701244531502492656460079210482610430750235');
      const INVSQRT_A_MINUS_D = BigInt('54469307008909316920995813868745141605393597292927456921205312896311721017578');
      const ONE_MINUS_D_SQ = BigInt('1159843021668779879193775521855586647937357759715417654439879720876111806838');
      const D_MINUS_ONE_SQ = BigInt('40440834346308536858101042469323190826248399146238708352240133220865137265952');

      class ExtendedPoint {
        constructor(x, y, z, t) {
          this.x = x;
          this.y = y;
          this.z = z;
          this.t = t;
        }

        static fromAffine(p) {
          if (!(p instanceof Point)) {
            throw new TypeError('ExtendedPoint#fromAffine: expected Point');
          }

          if (p.equals(Point.ZERO)) return ExtendedPoint.ZERO;
          return new ExtendedPoint(p.x, p.y, _1n, mod(p.x * p.y));
        }

        static toAffineBatch(points) {
          const toInv = invertBatch(points.map(p => p.z));
          return points.map((p, i) => p.toAffine(toInv[i]));
        }

        static normalizeZ(points) {
          return this.toAffineBatch(points).map(this.fromAffine);
        }

        equals(other) {
          assertExtPoint(other);
          const {
            x: X1,
            y: Y1,
            z: Z1
          } = this;
          const {
            x: X2,
            y: Y2,
            z: Z2
          } = other;
          const X1Z2 = mod(X1 * Z2);
          const X2Z1 = mod(X2 * Z1);
          const Y1Z2 = mod(Y1 * Z2);
          const Y2Z1 = mod(Y2 * Z1);
          return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
        }

        negate() {
          return new ExtendedPoint(mod(-this.x), this.y, this.z, mod(-this.t));
        }

        double() {
          const {
            x: X1,
            y: Y1,
            z: Z1
          } = this;
          const {
            a
          } = CURVE;
          const A = mod(X1 ** _2n);
          const B = mod(Y1 ** _2n);
          const C = mod(_2n * mod(Z1 ** _2n));
          const D = mod(a * A);
          const E = mod(mod((X1 + Y1) ** _2n) - A - B);
          const G = D + B;
          const F = G - C;
          const H = D - B;
          const X3 = mod(E * F);
          const Y3 = mod(G * H);
          const T3 = mod(E * H);
          const Z3 = mod(F * G);
          return new ExtendedPoint(X3, Y3, Z3, T3);
        }

        add(other) {
          assertExtPoint(other);
          const {
            x: X1,
            y: Y1,
            z: Z1,
            t: T1
          } = this;
          const {
            x: X2,
            y: Y2,
            z: Z2,
            t: T2
          } = other;
          const A = mod((Y1 - X1) * (Y2 + X2));
          const B = mod((Y1 + X1) * (Y2 - X2));
          const F = mod(B - A);
          if (F === _0n) return this.double();
          const C = mod(Z1 * _2n * T2);
          const D = mod(T1 * _2n * Z2);
          const E = D + C;
          const G = B + A;
          const H = D - C;
          const X3 = mod(E * F);
          const Y3 = mod(G * H);
          const T3 = mod(E * H);
          const Z3 = mod(F * G);
          return new ExtendedPoint(X3, Y3, Z3, T3);
        }

        subtract(other) {
          return this.add(other.negate());
        }

        precomputeWindow(W) {
          const windows = 1 + 256 / W;
          const points = [];
          let p = this;
          let base = p;

          for (let window = 0; window < windows; window++) {
            base = p;
            points.push(base);

            for (let i = 1; i < 2 ** (W - 1); i++) {
              base = base.add(p);
              points.push(base);
            }

            p = base.double();
          }

          return points;
        }

        wNAF(n, affinePoint) {
          if (!affinePoint && this.equals(ExtendedPoint.BASE)) affinePoint = Point.BASE;
          const W = affinePoint && affinePoint._WINDOW_SIZE || 1;

          if (256 % W) {
            throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
          }

          let precomputes = affinePoint && pointPrecomputes.get(affinePoint);

          if (!precomputes) {
            precomputes = this.precomputeWindow(W);

            if (affinePoint && W !== 1) {
              precomputes = ExtendedPoint.normalizeZ(precomputes);
              pointPrecomputes.set(affinePoint, precomputes);
            }
          }

          let p = ExtendedPoint.ZERO;
          let f = ExtendedPoint.ZERO;
          const windows = 1 + 256 / W;
          const windowSize = 2 ** (W - 1);
          const mask = BigInt(2 ** W - 1);
          const maxNumber = 2 ** W;
          const shiftBy = BigInt(W);

          for (let window = 0; window < windows; window++) {
            const offset = window * windowSize;
            let wbits = Number(n & mask);
            n >>= shiftBy;

            if (wbits > windowSize) {
              wbits -= maxNumber;
              n += _1n;
            }

            if (wbits === 0) {
              let pr = precomputes[offset];
              if (window % 2) pr = pr.negate();
              f = f.add(pr);
            } else {
              let cached = precomputes[offset + Math.abs(wbits) - 1];
              if (wbits < 0) cached = cached.negate();
              p = p.add(cached);
            }
          }

          return ExtendedPoint.normalizeZ([p, f])[0];
        }

        multiply(scalar, affinePoint) {
          return this.wNAF(normalizeScalar(scalar, CURVE.l), affinePoint);
        }

        multiplyUnsafe(scalar) {
          let n = normalizeScalar(scalar, CURVE.l, false);
          const G = ExtendedPoint.BASE;
          const P0 = ExtendedPoint.ZERO;
          if (n === _0n) return P0;
          if (this.equals(P0) || n === _1n) return this;
          if (this.equals(G)) return this.wNAF(n);
          let p = P0;
          let d = this;

          while (n > _0n) {
            if (n & _1n) p = p.add(d);
            d = d.double();
            n >>= _1n;
          }

          return p;
        }

        isSmallOrder() {
          return this.multiplyUnsafe(CURVE.h).equals(ExtendedPoint.ZERO);
        }

        isTorsionFree() {
          return this.multiplyUnsafe(CURVE.l).equals(ExtendedPoint.ZERO);
        }

        toAffine(invZ = invert(this.z)) {
          const {
            x,
            y,
            z
          } = this;
          const ax = mod(x * invZ);
          const ay = mod(y * invZ);
          const zz = mod(z * invZ);
          if (zz !== _1n) throw new Error('invZ was invalid');
          return new Point(ax, ay);
        }

        fromRistrettoBytes() {
          legacyRist();
        }

        toRistrettoBytes() {
          legacyRist();
        }

        fromRistrettoHash() {
          legacyRist();
        }

      }

      exports.ExtendedPoint = ExtendedPoint;
      ExtendedPoint.BASE = new ExtendedPoint(CURVE.Gx, CURVE.Gy, _1n, mod(CURVE.Gx * CURVE.Gy));
      ExtendedPoint.ZERO = new ExtendedPoint(_0n, _1n, _1n, _0n);

      function assertExtPoint(other) {
        if (!(other instanceof ExtendedPoint)) throw new TypeError('ExtendedPoint expected');
      }

      function assertRstPoint(other) {
        if (!(other instanceof RistrettoPoint)) throw new TypeError('RistrettoPoint expected');
      }

      function legacyRist() {
        throw new Error('Legacy method: switch to RistrettoPoint');
      }

      class RistrettoPoint {
        constructor(ep) {
          this.ep = ep;
        }

        static calcElligatorRistrettoMap(r0) {
          const {
            d
          } = CURVE;
          const r = mod(SQRT_M1 * r0 * r0);
          const Ns = mod((r + _1n) * ONE_MINUS_D_SQ);
          let c = BigInt(-1);
          const D = mod((c - d * r) * mod(r + d));
          let {
            isValid: Ns_D_is_sq,
            value: s
          } = uvRatio(Ns, D);
          let s_ = mod(s * r0);
          if (!edIsNegative(s_)) s_ = mod(-s_);
          if (!Ns_D_is_sq) s = s_;
          if (!Ns_D_is_sq) c = r;
          const Nt = mod(c * (r - _1n) * D_MINUS_ONE_SQ - D);
          const s2 = s * s;
          const W0 = mod((s + s) * D);
          const W1 = mod(Nt * SQRT_AD_MINUS_ONE);
          const W2 = mod(_1n - s2);
          const W3 = mod(_1n + s2);
          return new ExtendedPoint(mod(W0 * W3), mod(W2 * W1), mod(W1 * W3), mod(W0 * W2));
        }

        static hashToCurve(hex) {
          hex = ensureBytes(hex, 64);
          const r1 = bytes255ToNumberLE(hex.slice(0, 32));
          const R1 = this.calcElligatorRistrettoMap(r1);
          const r2 = bytes255ToNumberLE(hex.slice(32, 64));
          const R2 = this.calcElligatorRistrettoMap(r2);
          return new RistrettoPoint(R1.add(R2));
        }

        static fromHex(hex) {
          hex = ensureBytes(hex, 32);
          const {
            a,
            d
          } = CURVE;
          const emsg = 'RistrettoPoint.fromHex: the hex is not valid encoding of RistrettoPoint';
          const s = bytes255ToNumberLE(hex);
          if (!equalBytes(numberTo32BytesLE(s), hex) || edIsNegative(s)) throw new Error(emsg);
          const s2 = mod(s * s);
          const u1 = mod(_1n + a * s2);
          const u2 = mod(_1n - a * s2);
          const u1_2 = mod(u1 * u1);
          const u2_2 = mod(u2 * u2);
          const v = mod(a * d * u1_2 - u2_2);
          const {
            isValid,
            value: I
          } = invertSqrt(mod(v * u2_2));
          const Dx = mod(I * u2);
          const Dy = mod(I * Dx * v);
          let x = mod((s + s) * Dx);
          if (edIsNegative(x)) x = mod(-x);
          const y = mod(u1 * Dy);
          const t = mod(x * y);
          if (!isValid || edIsNegative(t) || y === _0n) throw new Error(emsg);
          return new RistrettoPoint(new ExtendedPoint(x, y, _1n, t));
        }

        toRawBytes() {
          let {
            x,
            y,
            z,
            t
          } = this.ep;
          const u1 = mod(mod(z + y) * mod(z - y));
          const u2 = mod(x * y);
          const {
            value: invsqrt
          } = invertSqrt(mod(u1 * u2 ** _2n));
          const D1 = mod(invsqrt * u1);
          const D2 = mod(invsqrt * u2);
          const zInv = mod(D1 * D2 * t);
          let D;

          if (edIsNegative(t * zInv)) {
            let _x = mod(y * SQRT_M1);

            let _y = mod(x * SQRT_M1);

            x = _x;
            y = _y;
            D = mod(D1 * INVSQRT_A_MINUS_D);
          } else {
            D = D2;
          }

          if (edIsNegative(x * zInv)) y = mod(-y);
          let s = mod((z - y) * D);
          if (edIsNegative(s)) s = mod(-s);
          return numberTo32BytesLE(s);
        }

        toHex() {
          return bytesToHex(this.toRawBytes());
        }

        toString() {
          return this.toHex();
        }

        equals(other) {
          assertRstPoint(other);
          const a = this.ep;
          const b = other.ep;
          const one = mod(a.x * b.y) === mod(a.y * b.x);
          const two = mod(a.y * b.y) === mod(a.x * b.x);
          return one || two;
        }

        add(other) {
          assertRstPoint(other);
          return new RistrettoPoint(this.ep.add(other.ep));
        }

        subtract(other) {
          assertRstPoint(other);
          return new RistrettoPoint(this.ep.subtract(other.ep));
        }

        multiply(scalar) {
          return new RistrettoPoint(this.ep.multiply(scalar));
        }

        multiplyUnsafe(scalar) {
          return new RistrettoPoint(this.ep.multiplyUnsafe(scalar));
        }

      }

      exports.RistrettoPoint = RistrettoPoint;
      RistrettoPoint.BASE = new RistrettoPoint(ExtendedPoint.BASE);
      RistrettoPoint.ZERO = new RistrettoPoint(ExtendedPoint.ZERO);
      const pointPrecomputes = new WeakMap();

      class Point {
        constructor(x, y) {
          this.x = x;
          this.y = y;
        }

        _setWindowSize(windowSize) {
          this._WINDOW_SIZE = windowSize;
          pointPrecomputes.delete(this);
        }

        static fromHex(hex, strict = true) {
          const {
            d,
            P
          } = CURVE;
          hex = ensureBytes(hex, 32);
          const normed = hex.slice();
          normed[31] = hex[31] & ~0x80;
          const y = bytesToNumberLE(normed);
          if (strict && y >= P) throw new Error('Expected 0 < hex < P');
          if (!strict && y >= MAX_256B) throw new Error('Expected 0 < hex < 2**256');
          const y2 = mod(y * y);
          const u = mod(y2 - _1n);
          const v = mod(d * y2 + _1n);
          let {
            isValid,
            value: x
          } = uvRatio(u, v);
          if (!isValid) throw new Error('Point.fromHex: invalid y coordinate');
          const isXOdd = (x & _1n) === _1n;
          const isLastByteOdd = (hex[31] & 0x80) !== 0;

          if (isLastByteOdd !== isXOdd) {
            x = mod(-x);
          }

          return new Point(x, y);
        }

        static async fromPrivateKey(privateKey) {
          return (await getExtendedPublicKey(privateKey)).point;
        }

        toRawBytes() {
          const bytes = numberTo32BytesLE(this.y);
          bytes[31] |= this.x & _1n ? 0x80 : 0;
          return bytes;
        }

        toHex() {
          return bytesToHex(this.toRawBytes());
        }

        toX25519() {
          const {
            y
          } = this;
          const u = mod((_1n + y) * invert(_1n - y));
          return numberTo32BytesLE(u);
        }

        isTorsionFree() {
          return ExtendedPoint.fromAffine(this).isTorsionFree();
        }

        equals(other) {
          return this.x === other.x && this.y === other.y;
        }

        negate() {
          return new Point(mod(-this.x), this.y);
        }

        add(other) {
          return ExtendedPoint.fromAffine(this).add(ExtendedPoint.fromAffine(other)).toAffine();
        }

        subtract(other) {
          return this.add(other.negate());
        }

        multiply(scalar) {
          return ExtendedPoint.fromAffine(this).multiply(scalar, this).toAffine();
        }

      }

      exports.Point = Point;
      Point.BASE = new Point(CURVE.Gx, CURVE.Gy);
      Point.ZERO = new Point(_0n, _1n);

      class Signature {
        constructor(r, s) {
          this.r = r;
          this.s = s;
          this.assertValidity();
        }

        static fromHex(hex) {
          const bytes = ensureBytes(hex, 64);
          const r = Point.fromHex(bytes.slice(0, 32), false);
          const s = bytesToNumberLE(bytes.slice(32, 64));
          return new Signature(r, s);
        }

        assertValidity() {
          const {
            r,
            s
          } = this;
          if (!(r instanceof Point)) throw new Error('Expected Point instance');
          normalizeScalar(s, CURVE.l, false);
          return this;
        }

        toRawBytes() {
          const u8 = new Uint8Array(64);
          u8.set(this.r.toRawBytes());
          u8.set(numberTo32BytesLE(this.s), 32);
          return u8;
        }

        toHex() {
          return bytesToHex(this.toRawBytes());
        }

      }

      exports.Signature = Signature;

      function concatBytes(...arrays) {
        if (!arrays.every(a => a instanceof Uint8Array)) throw new Error('Expected Uint8Array list');
        if (arrays.length === 1) return arrays[0];
        const length = arrays.reduce((a, arr) => a + arr.length, 0);
        const result = new Uint8Array(length);

        for (let i = 0, pad = 0; i < arrays.length; i++) {
          const arr = arrays[i];
          result.set(arr, pad);
          pad += arr.length;
        }

        return result;
      }

      const hexes = Array.from({
        length: 256
      }, (v, i) => i.toString(16).padStart(2, '0'));

      function bytesToHex(uint8a) {
        if (!(uint8a instanceof Uint8Array)) throw new Error('Uint8Array expected');
        let hex = '';

        for (let i = 0; i < uint8a.length; i++) {
          hex += hexes[uint8a[i]];
        }

        return hex;
      }

      function hexToBytes(hex) {
        if (typeof hex !== 'string') {
          throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
        }

        if (hex.length % 2) throw new Error('hexToBytes: received invalid unpadded hex');
        const array = new Uint8Array(hex.length / 2);

        for (let i = 0; i < array.length; i++) {
          const j = i * 2;
          const hexByte = hex.slice(j, j + 2);
          const byte = Number.parseInt(hexByte, 16);
          if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
          array[i] = byte;
        }

        return array;
      }

      function numberTo32BytesBE(num) {
        const length = 32;
        const hex = num.toString(16).padStart(length * 2, '0');
        return hexToBytes(hex);
      }

      function numberTo32BytesLE(num) {
        return numberTo32BytesBE(num).reverse();
      }

      function edIsNegative(num) {
        return (mod(num) & _1n) === _1n;
      }

      function bytesToNumberLE(uint8a) {
        if (!(uint8a instanceof Uint8Array)) throw new Error('Expected Uint8Array');
        return BigInt('0x' + bytesToHex(Uint8Array.from(uint8a).reverse()));
      }

      function bytes255ToNumberLE(bytes) {
        return mod(bytesToNumberLE(bytes) & _2n ** _255n - _1n);
      }

      function mod(a, b = CURVE.P) {
        const res = a % b;
        return res >= _0n ? res : b + res;
      }

      function invert(number, modulo = CURVE.P) {
        if (number === _0n || modulo <= _0n) {
          throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
        }

        let a = mod(number, modulo);
        let b = modulo;
        let x = _0n,
            y = _1n,
            u = _1n,
            v = _0n;

        while (a !== _0n) {
          const q = b / a;
          const r = b % a;
          const m = x - u * q;
          const n = y - v * q;
          b = a, a = r, x = u, y = v, u = m, v = n;
        }

        const gcd = b;
        if (gcd !== _1n) throw new Error('invert: does not exist');
        return mod(x, modulo);
      }

      function invertBatch(nums, p = CURVE.P) {
        const tmp = new Array(nums.length);
        const lastMultiplied = nums.reduce((acc, num, i) => {
          if (num === _0n) return acc;
          tmp[i] = acc;
          return mod(acc * num, p);
        }, _1n);
        const inverted = invert(lastMultiplied, p);
        nums.reduceRight((acc, num, i) => {
          if (num === _0n) return acc;
          tmp[i] = mod(acc * tmp[i], p);
          return mod(acc * num, p);
        }, inverted);
        return tmp;
      }

      function pow2(x, power) {
        const {
          P
        } = CURVE;
        let res = x;

        while (power-- > _0n) {
          res *= res;
          res %= P;
        }

        return res;
      }

      function pow_2_252_3(x) {
        const {
          P
        } = CURVE;

        const _5n = BigInt(5);

        const _10n = BigInt(10);

        const _20n = BigInt(20);

        const _40n = BigInt(40);

        const _80n = BigInt(80);

        const x2 = x * x % P;
        const b2 = x2 * x % P;
        const b4 = pow2(b2, _2n) * b2 % P;
        const b5 = pow2(b4, _1n) * x % P;
        const b10 = pow2(b5, _5n) * b5 % P;
        const b20 = pow2(b10, _10n) * b10 % P;
        const b40 = pow2(b20, _20n) * b20 % P;
        const b80 = pow2(b40, _40n) * b40 % P;
        const b160 = pow2(b80, _80n) * b80 % P;
        const b240 = pow2(b160, _80n) * b80 % P;
        const b250 = pow2(b240, _10n) * b10 % P;
        const pow_p_5_8 = pow2(b250, _2n) * x % P;
        return {
          pow_p_5_8,
          b2
        };
      }

      function uvRatio(u, v) {
        const v3 = mod(v * v * v);
        const v7 = mod(v3 * v3 * v);
        const pow = pow_2_252_3(u * v7).pow_p_5_8;
        let x = mod(u * v3 * pow);
        const vx2 = mod(v * x * x);
        const root1 = x;
        const root2 = mod(x * SQRT_M1);
        const useRoot1 = vx2 === u;
        const useRoot2 = vx2 === mod(-u);
        const noRoot = vx2 === mod(-u * SQRT_M1);
        if (useRoot1) x = root1;
        if (useRoot2 || noRoot) x = root2;
        if (edIsNegative(x)) x = mod(-x);
        return {
          isValid: useRoot1 || useRoot2,
          value: x
        };
      }

      function invertSqrt(number) {
        return uvRatio(_1n, number);
      }

      function modlLE(hash) {
        return mod(bytesToNumberLE(hash), CURVE.l);
      }

      function equalBytes(b1, b2) {
        if (b1.length !== b2.length) {
          return false;
        }

        for (let i = 0; i < b1.length; i++) {
          if (b1[i] !== b2[i]) {
            return false;
          }
        }

        return true;
      }

      function ensureBytes(hex, expectedLength) {
        const bytes = hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes(hex);
        if (typeof expectedLength === 'number' && bytes.length !== expectedLength) throw new Error(`Expected ${expectedLength} bytes`);
        return bytes;
      }

      function normalizeScalar(num, max, strict = true) {
        if (!max) throw new TypeError('Specify max value');
        if (typeof num === 'number' && Number.isSafeInteger(num)) num = BigInt(num);

        if (typeof num === 'bigint' && num < max) {
          if (strict) {
            if (_0n < num) return num;
          } else {
            if (_0n <= num) return num;
          }
        }

        throw new TypeError('Expected valid scalar: 0 < scalar < max');
      }

      function adjustBytes25519(bytes) {
        bytes[0] &= 248;
        bytes[31] &= 127;
        bytes[31] |= 64;
        return bytes;
      }

      function decodeScalar25519(n) {
        return bytesToNumberLE(adjustBytes25519(ensureBytes(n, 32)));
      }

      function checkPrivateKey(key) {
        key = typeof key === 'bigint' || typeof key === 'number' ? numberTo32BytesBE(normalizeScalar(key, MAX_256B)) : ensureBytes(key);
        if (key.length !== 32) throw new Error(`Expected 32 bytes`);
        return key;
      }

      function getKeyFromHash(hashed) {
        const head = adjustBytes25519(hashed.slice(0, 32));
        const prefix = hashed.slice(32, 64);
        const scalar = modlLE(head);
        const point = Point.BASE.multiply(scalar);
        const pointBytes = point.toRawBytes();
        return {
          head,
          prefix,
          scalar,
          point,
          pointBytes
        };
      }

      let _sha512Sync;

      function sha512s(...m) {
        if (typeof _sha512Sync !== 'function') throw new Error('utils.sha512Sync must be set to use sync methods');
        return _sha512Sync(...m);
      }

      async function getExtendedPublicKey(key) {
        return getKeyFromHash(await exports.utils.sha512(checkPrivateKey(key)));
      }

      function getExtendedPublicKeySync(key) {
        return getKeyFromHash(sha512s(checkPrivateKey(key)));
      }

      async function getPublicKey(privateKey) {
        return (await getExtendedPublicKey(privateKey)).pointBytes;
      }

      exports.getPublicKey = getPublicKey;

      function getPublicKeySync(privateKey) {
        return getExtendedPublicKeySync(privateKey).pointBytes;
      }

      async function sign(message, privateKey) {
        message = ensureBytes(message);
        const {
          prefix,
          scalar,
          pointBytes
        } = await getExtendedPublicKey(privateKey);
        const r = modlLE(await exports.utils.sha512(prefix, message));
        const R = Point.BASE.multiply(r);
        const k = modlLE(await exports.utils.sha512(R.toRawBytes(), pointBytes, message));
        const s = mod(r + k * scalar, CURVE.l);
        return new Signature(R, s).toRawBytes();
      }

      exports.sign = sign;

      function signSync(message, privateKey) {
        message = ensureBytes(message);
        const {
          prefix,
          scalar,
          pointBytes
        } = getExtendedPublicKeySync(privateKey);
        const r = modlLE(sha512s(prefix, message));
        const R = Point.BASE.multiply(r);
        const k = modlLE(sha512s(R.toRawBytes(), pointBytes, message));
        const s = mod(r + k * scalar, CURVE.l);
        return new Signature(R, s).toRawBytes();
      }

      function prepareVerification(sig, message, publicKey) {
        message = ensureBytes(message);
        if (!(publicKey instanceof Point)) publicKey = Point.fromHex(publicKey, false);
        const {
          r,
          s
        } = sig instanceof Signature ? sig.assertValidity() : Signature.fromHex(sig);
        const SB = ExtendedPoint.BASE.multiplyUnsafe(s);
        return {
          r,
          s,
          SB,
          pub: publicKey,
          msg: message
        };
      }

      function finishVerification(publicKey, r, SB, hashed) {
        const k = modlLE(hashed);
        const kA = ExtendedPoint.fromAffine(publicKey).multiplyUnsafe(k);
        const RkA = ExtendedPoint.fromAffine(r).add(kA);
        return RkA.subtract(SB).multiplyUnsafe(CURVE.h).equals(ExtendedPoint.ZERO);
      }

      async function verify(sig, message, publicKey) {
        const {
          r,
          SB,
          msg,
          pub
        } = prepareVerification(sig, message, publicKey);
        const hashed = await exports.utils.sha512(r.toRawBytes(), pub.toRawBytes(), msg);
        return finishVerification(pub, r, SB, hashed);
      }

      exports.verify = verify;

      function verifySync(sig, message, publicKey) {
        const {
          r,
          SB,
          msg,
          pub
        } = prepareVerification(sig, message, publicKey);
        const hashed = sha512s(r.toRawBytes(), pub.toRawBytes(), msg);
        return finishVerification(pub, r, SB, hashed);
      }

      exports.sync = {
        getExtendedPublicKey: getExtendedPublicKeySync,
        getPublicKey: getPublicKeySync,
        sign: signSync,
        verify: verifySync
      };

      async function getSharedSecret(privateKey, publicKey) {
        const {
          head
        } = await getExtendedPublicKey(privateKey);
        const u = Point.fromHex(publicKey).toX25519();
        return exports.curve25519.scalarMult(head, u);
      }

      exports.getSharedSecret = getSharedSecret;

      Point.BASE._setWindowSize(8);

      function cswap(swap, x_2, x_3) {
        const dummy = mod(swap * (x_2 - x_3));
        x_2 = mod(x_2 - dummy);
        x_3 = mod(x_3 + dummy);
        return [x_2, x_3];
      }

      function montgomeryLadder(pointU, scalar) {
        const {
          P
        } = CURVE;
        const u = normalizeScalar(pointU, P);
        const k = normalizeScalar(scalar, P);
        const a24 = BigInt(121665);
        const x_1 = u;
        let x_2 = _1n;
        let z_2 = _0n;
        let x_3 = u;
        let z_3 = _1n;
        let swap = _0n;
        let sw;

        for (let t = BigInt(255 - 1); t >= _0n; t--) {
          const k_t = k >> t & _1n;
          swap ^= k_t;
          sw = cswap(swap, x_2, x_3);
          x_2 = sw[0];
          x_3 = sw[1];
          sw = cswap(swap, z_2, z_3);
          z_2 = sw[0];
          z_3 = sw[1];
          swap = k_t;
          const A = x_2 + z_2;
          const AA = mod(A * A);
          const B = x_2 - z_2;
          const BB = mod(B * B);
          const E = AA - BB;
          const C = x_3 + z_3;
          const D = x_3 - z_3;
          const DA = mod(D * A);
          const CB = mod(C * B);
          x_3 = mod((DA + CB) ** _2n);
          z_3 = mod(x_1 * (DA - CB) ** _2n);
          x_2 = mod(AA * BB);
          z_2 = mod(E * (AA + mod(a24 * E)));
        }

        sw = cswap(swap, x_2, x_3);
        x_2 = sw[0];
        x_3 = sw[1];
        sw = cswap(swap, z_2, z_3);
        z_2 = sw[0];
        z_3 = sw[1];
        const {
          pow_p_5_8,
          b2
        } = pow_2_252_3(z_2);
        const xp2 = mod(pow2(pow_p_5_8, BigInt(3)) * b2);
        return mod(x_2 * xp2);
      }

      function encodeUCoordinate(u) {
        return numberTo32BytesLE(mod(u, CURVE.P));
      }

      function decodeUCoordinate(uEnc) {
        const u = ensureBytes(uEnc, 32);
        u[31] &= 127;
        return bytesToNumberLE(u);
      }

      exports.curve25519 = {
        BASE_POINT_U: '0900000000000000000000000000000000000000000000000000000000000000',

        scalarMult(privateKey, publicKey) {
          const u = decodeUCoordinate(publicKey);
          const p = decodeScalar25519(privateKey);
          const pu = montgomeryLadder(u, p);
          if (pu === _0n) throw new Error('Invalid private or public key received');
          return encodeUCoordinate(pu);
        },

        scalarMultBase(privateKey) {
          return exports.curve25519.scalarMult(privateKey, exports.curve25519.BASE_POINT_U);
        }

      };
      const crypto = {
        node: nodeCrypto,
        web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined
      };
      exports.utils = {
        TORSION_SUBGROUP: ['0100000000000000000000000000000000000000000000000000000000000000', 'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a', '0000000000000000000000000000000000000000000000000000000000000080', '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05', 'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f', '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85', '0000000000000000000000000000000000000000000000000000000000000000', 'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa'],
        bytesToHex,
        hexToBytes,
        concatBytes,
        getExtendedPublicKey,
        mod,
        invert,
        hashToPrivateScalar: hash => {
          hash = ensureBytes(hash);
          if (hash.length < 40 || hash.length > 1024) throw new Error('Expected 40-1024 bytes of private key as per FIPS 186');
          return mod(bytesToNumberLE(hash), CURVE.l - _1n) + _1n;
        },
        randomBytes: (bytesLength = 32) => {
          if (crypto.web) {
            return crypto.web.getRandomValues(new Uint8Array(bytesLength));
          } else if (crypto.node) {
            const {
              randomBytes
            } = crypto.node;
            return new Uint8Array(randomBytes(bytesLength).buffer);
          } else {
            throw new Error("The environment doesn't have randomBytes function");
          }
        },
        randomPrivateKey: () => {
          return exports.utils.randomBytes(32);
        },
        sha512: async (...messages) => {
          const message = concatBytes(...messages);

          if (crypto.web) {
            const buffer = await crypto.web.subtle.digest('SHA-512', message.buffer);
            return new Uint8Array(buffer);
          } else if (crypto.node) {
            return Uint8Array.from(crypto.node.createHash('sha512').update(message).digest());
          } else {
            throw new Error("The environment doesn't have sha512 function");
          }
        },

        precompute(windowSize = 8, point = Point.BASE) {
          const cached = point.equals(Point.BASE) ? point : new Point(point.x, point.y);

          cached._setWindowSize(windowSize);

          cached.multiply(_2n);
          return cached;
        },

        sha512Sync: undefined
      };
      Object.defineProperties(exports.utils, {
        sha512Sync: {
          configurable: false,

          get() {
            return _sha512Sync;
          },

          set(val) {
            if (!_sha512Sync) _sha512Sync = val;
          }

        }
      });
    }, {
      "crypto": 2
    }],
    7: [function (require, module, exports) {
      module.exports = require('./lib/axios');
    }, {
      "./lib/axios": 9
    }],
    8: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      var settle = require('./../core/settle');

      var cookies = require('./../helpers/cookies');

      var buildURL = require('./../helpers/buildURL');

      var buildFullPath = require('../core/buildFullPath');

      var parseHeaders = require('./../helpers/parseHeaders');

      var isURLSameOrigin = require('./../helpers/isURLSameOrigin');

      var transitionalDefaults = require('../defaults/transitional');

      var AxiosError = require('../core/AxiosError');

      var CanceledError = require('../cancel/CanceledError');

      var parseProtocol = require('../helpers/parseProtocol');

      module.exports = function xhrAdapter(config) {
        return new Promise(function dispatchXhrRequest(resolve, reject) {
          var requestData = config.data;
          var requestHeaders = config.headers;
          var responseType = config.responseType;
          var onCanceled;

          function done() {
            if (config.cancelToken) {
              config.cancelToken.unsubscribe(onCanceled);
            }

            if (config.signal) {
              config.signal.removeEventListener('abort', onCanceled);
            }
          }

          if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
            delete requestHeaders['Content-Type'];
          }

          var request = new XMLHttpRequest();

          if (config.auth) {
            var username = config.auth.username || '';
            var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
            requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
          }

          var fullPath = buildFullPath(config.baseURL, config.url);
          request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
          request.timeout = config.timeout;

          function onloadend() {
            if (!request) {
              return;
            }

            var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
            var responseData = !responseType || responseType === 'text' || responseType === 'json' ? request.responseText : request.response;
            var response = {
              data: responseData,
              status: request.status,
              statusText: request.statusText,
              headers: responseHeaders,
              config: config,
              request: request
            };
            settle(function _resolve(value) {
              resolve(value);
              done();
            }, function _reject(err) {
              reject(err);
              done();
            }, response);
            request = null;
          }

          if ('onloadend' in request) {
            request.onloadend = onloadend;
          } else {
            request.onreadystatechange = function handleLoad() {
              if (!request || request.readyState !== 4) {
                return;
              }

              if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
                return;
              }

              setTimeout(onloadend);
            };
          }

          request.onabort = function handleAbort() {
            if (!request) {
              return;
            }

            reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));
            request = null;
          };

          request.onerror = function handleError() {
            reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request, request));
            request = null;
          };

          request.ontimeout = function handleTimeout() {
            var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
            var transitional = config.transitional || transitionalDefaults;

            if (config.timeoutErrorMessage) {
              timeoutErrorMessage = config.timeoutErrorMessage;
            }

            reject(new AxiosError(timeoutErrorMessage, transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED, config, request));
            request = null;
          };

          if (utils.isStandardBrowserEnv()) {
            var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : undefined;

            if (xsrfValue) {
              requestHeaders[config.xsrfHeaderName] = xsrfValue;
            }
          }

          if ('setRequestHeader' in request) {
            utils.forEach(requestHeaders, function setRequestHeader(val, key) {
              if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
                delete requestHeaders[key];
              } else {
                request.setRequestHeader(key, val);
              }
            });
          }

          if (!utils.isUndefined(config.withCredentials)) {
            request.withCredentials = !!config.withCredentials;
          }

          if (responseType && responseType !== 'json') {
            request.responseType = config.responseType;
          }

          if (typeof config.onDownloadProgress === 'function') {
            request.addEventListener('progress', config.onDownloadProgress);
          }

          if (typeof config.onUploadProgress === 'function' && request.upload) {
            request.upload.addEventListener('progress', config.onUploadProgress);
          }

          if (config.cancelToken || config.signal) {
            onCanceled = function (cancel) {
              if (!request) {
                return;
              }

              reject(!cancel || cancel && cancel.type ? new CanceledError() : cancel);
              request.abort();
              request = null;
            };

            config.cancelToken && config.cancelToken.subscribe(onCanceled);

            if (config.signal) {
              config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
            }
          }

          if (!requestData) {
            requestData = null;
          }

          var protocol = parseProtocol(fullPath);

          if (protocol && ['http', 'https', 'file'].indexOf(protocol) === -1) {
            reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
            return;
          }

          request.send(requestData);
        });
      };
    }, {
      "../cancel/CanceledError": 11,
      "../core/AxiosError": 14,
      "../core/buildFullPath": 16,
      "../defaults/transitional": 22,
      "../helpers/parseProtocol": 34,
      "./../core/settle": 19,
      "./../helpers/buildURL": 25,
      "./../helpers/cookies": 27,
      "./../helpers/isURLSameOrigin": 30,
      "./../helpers/parseHeaders": 33,
      "./../utils": 38
    }],
    9: [function (require, module, exports) {
      'use strict';

      var utils = require('./utils');

      var bind = require('./helpers/bind');

      var Axios = require('./core/Axios');

      var mergeConfig = require('./core/mergeConfig');

      var defaults = require('./defaults');

      function createInstance(defaultConfig) {
        var context = new Axios(defaultConfig);
        var instance = bind(Axios.prototype.request, context);
        utils.extend(instance, Axios.prototype, context);
        utils.extend(instance, context);

        instance.create = function create(instanceConfig) {
          return createInstance(mergeConfig(defaultConfig, instanceConfig));
        };

        return instance;
      }

      var axios = createInstance(defaults);
      axios.Axios = Axios;
      axios.CanceledError = require('./cancel/CanceledError');
      axios.CancelToken = require('./cancel/CancelToken');
      axios.isCancel = require('./cancel/isCancel');
      axios.VERSION = require('./env/data').version;
      axios.toFormData = require('./helpers/toFormData');
      axios.AxiosError = require('../lib/core/AxiosError');
      axios.Cancel = axios.CanceledError;

      axios.all = function all(promises) {
        return Promise.all(promises);
      };

      axios.spread = require('./helpers/spread');
      axios.isAxiosError = require('./helpers/isAxiosError');
      module.exports = axios;
      module.exports.default = axios;
    }, {
      "../lib/core/AxiosError": 14,
      "./cancel/CancelToken": 10,
      "./cancel/CanceledError": 11,
      "./cancel/isCancel": 12,
      "./core/Axios": 13,
      "./core/mergeConfig": 18,
      "./defaults": 21,
      "./env/data": 23,
      "./helpers/bind": 24,
      "./helpers/isAxiosError": 29,
      "./helpers/spread": 35,
      "./helpers/toFormData": 36,
      "./utils": 38
    }],
    10: [function (require, module, exports) {
      'use strict';

      var CanceledError = require('./CanceledError');

      function CancelToken(executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.');
        }

        var resolvePromise;
        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });
        var token = this;
        this.promise.then(function (cancel) {
          if (!token._listeners) return;
          var i;
          var l = token._listeners.length;

          for (i = 0; i < l; i++) {
            token._listeners[i](cancel);
          }

          token._listeners = null;
        });

        this.promise.then = function (onfulfilled) {
          var _resolve;

          var promise = new Promise(function (resolve) {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);

          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };

          return promise;
        };

        executor(function cancel(message) {
          if (token.reason) {
            return;
          }

          token.reason = new CanceledError(message);
          resolvePromise(token.reason);
        });
      }

      CancelToken.prototype.throwIfRequested = function throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      };

      CancelToken.prototype.subscribe = function subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }

        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      };

      CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }

        var index = this._listeners.indexOf(listener);

        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      };

      CancelToken.source = function source() {
        var cancel;
        var token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token: token,
          cancel: cancel
        };
      };

      module.exports = CancelToken;
    }, {
      "./CanceledError": 11
    }],
    11: [function (require, module, exports) {
      'use strict';

      var AxiosError = require('../core/AxiosError');

      var utils = require('../utils');

      function CanceledError(message) {
        AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED);
        this.name = 'CanceledError';
      }

      utils.inherits(CanceledError, AxiosError, {
        __CANCEL__: true
      });
      module.exports = CanceledError;
    }, {
      "../core/AxiosError": 14,
      "../utils": 38
    }],
    12: [function (require, module, exports) {
      'use strict';

      module.exports = function isCancel(value) {
        return !!(value && value.__CANCEL__);
      };
    }, {}],
    13: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      var buildURL = require('../helpers/buildURL');

      var InterceptorManager = require('./InterceptorManager');

      var dispatchRequest = require('./dispatchRequest');

      var mergeConfig = require('./mergeConfig');

      var buildFullPath = require('./buildFullPath');

      var validator = require('../helpers/validator');

      var validators = validator.validators;

      function Axios(instanceConfig) {
        this.defaults = instanceConfig;
        this.interceptors = {
          request: new InterceptorManager(),
          response: new InterceptorManager()
        };
      }

      Axios.prototype.request = function request(configOrUrl, config) {
        if (typeof configOrUrl === 'string') {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }

        config = mergeConfig(this.defaults, config);

        if (config.method) {
          config.method = config.method.toLowerCase();
        } else if (this.defaults.method) {
          config.method = this.defaults.method.toLowerCase();
        } else {
          config.method = 'get';
        }

        var transitional = config.transitional;

        if (transitional !== undefined) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }

        var requestInterceptorChain = [];
        var synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
            return;
          }

          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });
        var responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });
        var promise;

        if (!synchronousRequestInterceptors) {
          var chain = [dispatchRequest, undefined];
          Array.prototype.unshift.apply(chain, requestInterceptorChain);
          chain = chain.concat(responseInterceptorChain);
          promise = Promise.resolve(config);

          while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift());
          }

          return promise;
        }

        var newConfig = config;

        while (requestInterceptorChain.length) {
          var onFulfilled = requestInterceptorChain.shift();
          var onRejected = requestInterceptorChain.shift();

          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected(error);
            break;
          }
        }

        try {
          promise = dispatchRequest(newConfig);
        } catch (error) {
          return Promise.reject(error);
        }

        while (responseInterceptorChain.length) {
          promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
        }

        return promise;
      };

      Axios.prototype.getUri = function getUri(config) {
        config = mergeConfig(this.defaults, config);
        var fullPath = buildFullPath(config.baseURL, config.url);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      };

      utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
        Axios.prototype[method] = function (url, config) {
          return this.request(mergeConfig(config || {}, {
            method: method,
            url: url,
            data: (config || {}).data
          }));
        };
      });
      utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
        function generateHTTPMethod(isForm) {
          return function httpMethod(url, data, config) {
            return this.request(mergeConfig(config || {}, {
              method: method,
              headers: isForm ? {
                'Content-Type': 'multipart/form-data'
              } : {},
              url: url,
              data: data
            }));
          };
        }

        Axios.prototype[method] = generateHTTPMethod();
        Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
      });
      module.exports = Axios;
    }, {
      "../helpers/buildURL": 25,
      "../helpers/validator": 37,
      "./../utils": 38,
      "./InterceptorManager": 15,
      "./buildFullPath": 16,
      "./dispatchRequest": 17,
      "./mergeConfig": 18
    }],
    14: [function (require, module, exports) {
      'use strict';

      var utils = require('../utils');

      function AxiosError(message, code, config, request, response) {
        Error.call(this);
        this.message = message;
        this.name = 'AxiosError';
        code && (this.code = code);
        config && (this.config = config);
        request && (this.request = request);
        response && (this.response = response);
      }

      utils.inherits(AxiosError, Error, {
        toJSON: function toJSON() {
          return {
            message: this.message,
            name: this.name,
            description: this.description,
            number: this.number,
            fileName: this.fileName,
            lineNumber: this.lineNumber,
            columnNumber: this.columnNumber,
            stack: this.stack,
            config: this.config,
            code: this.code,
            status: this.response && this.response.status ? this.response.status : null
          };
        }
      });
      var prototype = AxiosError.prototype;
      var descriptors = {};
      ['ERR_BAD_OPTION_VALUE', 'ERR_BAD_OPTION', 'ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK', 'ERR_FR_TOO_MANY_REDIRECTS', 'ERR_DEPRECATED', 'ERR_BAD_RESPONSE', 'ERR_BAD_REQUEST', 'ERR_CANCELED'].forEach(function (code) {
        descriptors[code] = {
          value: code
        };
      });
      Object.defineProperties(AxiosError, descriptors);
      Object.defineProperty(prototype, 'isAxiosError', {
        value: true
      });

      AxiosError.from = function (error, code, config, request, response, customProps) {
        var axiosError = Object.create(prototype);
        utils.toFlatObject(error, axiosError, function filter(obj) {
          return obj !== Error.prototype;
        });
        AxiosError.call(axiosError, error.message, code, config, request, response);
        axiosError.name = error.name;
        customProps && Object.assign(axiosError, customProps);
        return axiosError;
      };

      module.exports = AxiosError;
    }, {
      "../utils": 38
    }],
    15: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      function InterceptorManager() {
        this.handlers = [];
      }

      InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled: fulfilled,
          rejected: rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      };

      InterceptorManager.prototype.eject = function eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      };

      InterceptorManager.prototype.forEach = function forEach(fn) {
        utils.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      };

      module.exports = InterceptorManager;
    }, {
      "./../utils": 38
    }],
    16: [function (require, module, exports) {
      'use strict';

      var isAbsoluteURL = require('../helpers/isAbsoluteURL');

      var combineURLs = require('../helpers/combineURLs');

      module.exports = function buildFullPath(baseURL, requestedURL) {
        if (baseURL && !isAbsoluteURL(requestedURL)) {
          return combineURLs(baseURL, requestedURL);
        }

        return requestedURL;
      };
    }, {
      "../helpers/combineURLs": 26,
      "../helpers/isAbsoluteURL": 28
    }],
    17: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      var transformData = require('./transformData');

      var isCancel = require('../cancel/isCancel');

      var defaults = require('../defaults');

      var CanceledError = require('../cancel/CanceledError');

      function throwIfCancellationRequested(config) {
        if (config.cancelToken) {
          config.cancelToken.throwIfRequested();
        }

        if (config.signal && config.signal.aborted) {
          throw new CanceledError();
        }
      }

      module.exports = function dispatchRequest(config) {
        throwIfCancellationRequested(config);
        config.headers = config.headers || {};
        config.data = transformData.call(config, config.data, config.headers, config.transformRequest);
        config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers);
        utils.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], function cleanHeaderConfig(method) {
          delete config.headers[method];
        });
        var adapter = config.adapter || defaults.adapter;
        return adapter(config).then(function onAdapterResolution(response) {
          throwIfCancellationRequested(config);
          response.data = transformData.call(config, response.data, response.headers, config.transformResponse);
          return response;
        }, function onAdapterRejection(reason) {
          if (!isCancel(reason)) {
            throwIfCancellationRequested(config);

            if (reason && reason.response) {
              reason.response.data = transformData.call(config, reason.response.data, reason.response.headers, config.transformResponse);
            }
          }

          return Promise.reject(reason);
        });
      };
    }, {
      "../cancel/CanceledError": 11,
      "../cancel/isCancel": 12,
      "../defaults": 21,
      "./../utils": 38,
      "./transformData": 20
    }],
    18: [function (require, module, exports) {
      'use strict';

      var utils = require('../utils');

      module.exports = function mergeConfig(config1, config2) {
        config2 = config2 || {};
        var config = {};

        function getMergedValue(target, source) {
          if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
            return utils.merge(target, source);
          } else if (utils.isPlainObject(source)) {
            return utils.merge({}, source);
          } else if (utils.isArray(source)) {
            return source.slice();
          }

          return source;
        }

        function mergeDeepProperties(prop) {
          if (!utils.isUndefined(config2[prop])) {
            return getMergedValue(config1[prop], config2[prop]);
          } else if (!utils.isUndefined(config1[prop])) {
            return getMergedValue(undefined, config1[prop]);
          }
        }

        function valueFromConfig2(prop) {
          if (!utils.isUndefined(config2[prop])) {
            return getMergedValue(undefined, config2[prop]);
          }
        }

        function defaultToConfig2(prop) {
          if (!utils.isUndefined(config2[prop])) {
            return getMergedValue(undefined, config2[prop]);
          } else if (!utils.isUndefined(config1[prop])) {
            return getMergedValue(undefined, config1[prop]);
          }
        }

        function mergeDirectKeys(prop) {
          if (prop in config2) {
            return getMergedValue(config1[prop], config2[prop]);
          } else if (prop in config1) {
            return getMergedValue(undefined, config1[prop]);
          }
        }

        var mergeMap = {
          'url': valueFromConfig2,
          'method': valueFromConfig2,
          'data': valueFromConfig2,
          'baseURL': defaultToConfig2,
          'transformRequest': defaultToConfig2,
          'transformResponse': defaultToConfig2,
          'paramsSerializer': defaultToConfig2,
          'timeout': defaultToConfig2,
          'timeoutMessage': defaultToConfig2,
          'withCredentials': defaultToConfig2,
          'adapter': defaultToConfig2,
          'responseType': defaultToConfig2,
          'xsrfCookieName': defaultToConfig2,
          'xsrfHeaderName': defaultToConfig2,
          'onUploadProgress': defaultToConfig2,
          'onDownloadProgress': defaultToConfig2,
          'decompress': defaultToConfig2,
          'maxContentLength': defaultToConfig2,
          'maxBodyLength': defaultToConfig2,
          'beforeRedirect': defaultToConfig2,
          'transport': defaultToConfig2,
          'httpAgent': defaultToConfig2,
          'httpsAgent': defaultToConfig2,
          'cancelToken': defaultToConfig2,
          'socketPath': defaultToConfig2,
          'responseEncoding': defaultToConfig2,
          'validateStatus': mergeDirectKeys
        };
        utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
          var merge = mergeMap[prop] || mergeDeepProperties;
          var configValue = merge(prop);
          utils.isUndefined(configValue) && merge !== mergeDirectKeys || (config[prop] = configValue);
        });
        return config;
      };
    }, {
      "../utils": 38
    }],
    19: [function (require, module, exports) {
      'use strict';

      var AxiosError = require('./AxiosError');

      module.exports = function settle(resolve, reject, response) {
        var validateStatus = response.config.validateStatus;

        if (!response.status || !validateStatus || validateStatus(response.status)) {
          resolve(response);
        } else {
          reject(new AxiosError('Request failed with status code ' + response.status, [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4], response.config, response.request, response));
        }
      };
    }, {
      "./AxiosError": 14
    }],
    20: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      var defaults = require('../defaults');

      module.exports = function transformData(data, headers, fns) {
        var context = this || defaults;
        utils.forEach(fns, function transform(fn) {
          data = fn.call(context, data, headers);
        });
        return data;
      };
    }, {
      "../defaults": 21,
      "./../utils": 38
    }],
    21: [function (require, module, exports) {
      (function (process) {
        (function () {
          'use strict';

          var utils = require('../utils');

          var normalizeHeaderName = require('../helpers/normalizeHeaderName');

          var AxiosError = require('../core/AxiosError');

          var transitionalDefaults = require('./transitional');

          var toFormData = require('../helpers/toFormData');

          var DEFAULT_CONTENT_TYPE = {
            'Content-Type': 'application/x-www-form-urlencoded'
          };

          function setContentTypeIfUnset(headers, value) {
            if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
              headers['Content-Type'] = value;
            }
          }

          function getDefaultAdapter() {
            var adapter;

            if (typeof XMLHttpRequest !== 'undefined') {
              adapter = require('../adapters/xhr');
            } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
              adapter = require('../adapters/http');
            }

            return adapter;
          }

          function stringifySafely(rawValue, parser, encoder) {
            if (utils.isString(rawValue)) {
              try {
                (parser || JSON.parse)(rawValue);
                return utils.trim(rawValue);
              } catch (e) {
                if (e.name !== 'SyntaxError') {
                  throw e;
                }
              }
            }

            return (encoder || JSON.stringify)(rawValue);
          }

          var defaults = {
            transitional: transitionalDefaults,
            adapter: getDefaultAdapter(),
            transformRequest: [function transformRequest(data, headers) {
              normalizeHeaderName(headers, 'Accept');
              normalizeHeaderName(headers, 'Content-Type');

              if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
                return data;
              }

              if (utils.isArrayBufferView(data)) {
                return data.buffer;
              }

              if (utils.isURLSearchParams(data)) {
                setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
                return data.toString();
              }

              var isObjectPayload = utils.isObject(data);
              var contentType = headers && headers['Content-Type'];
              var isFileList;

              if ((isFileList = utils.isFileList(data)) || isObjectPayload && contentType === 'multipart/form-data') {
                var _FormData = this.env && this.env.FormData;

                return toFormData(isFileList ? {
                  'files[]': data
                } : data, _FormData && new _FormData());
              } else if (isObjectPayload || contentType === 'application/json') {
                setContentTypeIfUnset(headers, 'application/json');
                return stringifySafely(data);
              }

              return data;
            }],
            transformResponse: [function transformResponse(data) {
              var transitional = this.transitional || defaults.transitional;
              var silentJSONParsing = transitional && transitional.silentJSONParsing;
              var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
              var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

              if (strictJSONParsing || forcedJSONParsing && utils.isString(data) && data.length) {
                try {
                  return JSON.parse(data);
                } catch (e) {
                  if (strictJSONParsing) {
                    if (e.name === 'SyntaxError') {
                      throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
                    }

                    throw e;
                  }
                }
              }

              return data;
            }],
            timeout: 0,
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',
            maxContentLength: -1,
            maxBodyLength: -1,
            env: {
              FormData: require('./env/FormData')
            },
            validateStatus: function validateStatus(status) {
              return status >= 200 && status < 300;
            },
            headers: {
              common: {
                'Accept': 'application/json, text/plain, */*'
              }
            }
          };
          utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
            defaults.headers[method] = {};
          });
          utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
            defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
          });
          module.exports = defaults;
        }).call(this);
      }).call(this, require('_process'));
    }, {
      "../adapters/http": 8,
      "../adapters/xhr": 8,
      "../core/AxiosError": 14,
      "../helpers/normalizeHeaderName": 31,
      "../helpers/toFormData": 36,
      "../utils": 38,
      "./env/FormData": 32,
      "./transitional": 22,
      "_process": 5
    }],
    22: [function (require, module, exports) {
      'use strict';

      module.exports = {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false
      };
    }, {}],
    23: [function (require, module, exports) {
      module.exports = {
        "version": "0.27.2"
      };
    }, {}],
    24: [function (require, module, exports) {
      'use strict';

      module.exports = function bind(fn, thisArg) {
        return function wrap() {
          var args = new Array(arguments.length);

          for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i];
          }

          return fn.apply(thisArg, args);
        };
      };
    }, {}],
    25: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      function encode(val) {
        return encodeURIComponent(val).replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+').replace(/%5B/gi, '[').replace(/%5D/gi, ']');
      }

      module.exports = function buildURL(url, params, paramsSerializer) {
        if (!params) {
          return url;
        }

        var serializedParams;

        if (paramsSerializer) {
          serializedParams = paramsSerializer(params);
        } else if (utils.isURLSearchParams(params)) {
          serializedParams = params.toString();
        } else {
          var parts = [];
          utils.forEach(params, function serialize(val, key) {
            if (val === null || typeof val === 'undefined') {
              return;
            }

            if (utils.isArray(val)) {
              key = key + '[]';
            } else {
              val = [val];
            }

            utils.forEach(val, function parseValue(v) {
              if (utils.isDate(v)) {
                v = v.toISOString();
              } else if (utils.isObject(v)) {
                v = JSON.stringify(v);
              }

              parts.push(encode(key) + '=' + encode(v));
            });
          });
          serializedParams = parts.join('&');
        }

        if (serializedParams) {
          var hashmarkIndex = url.indexOf('#');

          if (hashmarkIndex !== -1) {
            url = url.slice(0, hashmarkIndex);
          }

          url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
        }

        return url;
      };
    }, {
      "./../utils": 38
    }],
    26: [function (require, module, exports) {
      'use strict';

      module.exports = function combineURLs(baseURL, relativeURL) {
        return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
      };
    }, {}],
    27: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },
          read: function read(name) {
            var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return match ? decodeURIComponent(match[3]) : null;
          },
          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      }() : function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() {
            return null;
          },
          remove: function remove() {}
        };
      }();
    }, {
      "./../utils": 38
    }],
    28: [function (require, module, exports) {
      'use strict';

      module.exports = function isAbsoluteURL(url) {
        return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
      };
    }, {}],
    29: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      module.exports = function isAxiosError(payload) {
        return utils.isObject(payload) && payload.isAxiosError === true;
      };
    }, {
      "./../utils": 38
    }],
    30: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;

        function resolveURL(url) {
          var href = url;

          if (msie) {
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);
        return function isURLSameOrigin(requestURL) {
          var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
          return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
        };
      }() : function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      }();
    }, {
      "./../utils": 38
    }],
    31: [function (require, module, exports) {
      'use strict';

      var utils = require('../utils');

      module.exports = function normalizeHeaderName(headers, normalizedName) {
        utils.forEach(headers, function processHeader(value, name) {
          if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
            headers[normalizedName] = value;
            delete headers[name];
          }
        });
      };
    }, {
      "../utils": 38
    }],
    32: [function (require, module, exports) {
      module.exports = null;
    }, {}],
    33: [function (require, module, exports) {
      'use strict';

      var utils = require('./../utils');

      var ignoreDuplicateOf = ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent'];

      module.exports = function parseHeaders(headers) {
        var parsed = {};
        var key;
        var val;
        var i;

        if (!headers) {
          return parsed;
        }

        utils.forEach(headers.split('\n'), function parser(line) {
          i = line.indexOf(':');
          key = utils.trim(line.substr(0, i)).toLowerCase();
          val = utils.trim(line.substr(i + 1));

          if (key) {
            if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
              return;
            }

            if (key === 'set-cookie') {
              parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
            } else {
              parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
          }
        });
        return parsed;
      };
    }, {
      "./../utils": 38
    }],
    34: [function (require, module, exports) {
      'use strict';

      module.exports = function parseProtocol(url) {
        var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
        return match && match[1] || '';
      };
    }, {}],
    35: [function (require, module, exports) {
      'use strict';

      module.exports = function spread(callback) {
        return function wrap(arr) {
          return callback.apply(null, arr);
        };
      };
    }, {}],
    36: [function (require, module, exports) {
      (function () {
        (function () {
          'use strict';

          var utils = require('../utils');

          function toFormData(obj, formData) {
            formData = formData || new FormData();
            var stack = [];

            function convertValue(value) {
              if (value === null) return '';

              if (utils.isDate(value)) {
                return value.toISOString();
              }

              if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
                return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
              }

              return value;
            }

            function build(data, parentKey) {
              if (utils.isPlainObject(data) || utils.isArray(data)) {
                if (stack.indexOf(data) !== -1) {
                  throw Error('Circular reference detected in ' + parentKey);
                }

                stack.push(data);
                utils.forEach(data, function each(value, key) {
                  if (utils.isUndefined(value)) return;
                  var fullKey = parentKey ? parentKey + '.' + key : key;
                  var arr;

                  if (value && !parentKey && typeof value === 'object') {
                    if (utils.endsWith(key, '{}')) {
                      value = JSON.stringify(value);
                    } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
                      arr.forEach(function (el) {
                        !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
                      });
                      return;
                    }
                  }

                  build(value, fullKey);
                });
                stack.pop();
              } else {
                formData.append(parentKey, convertValue(data));
              }
            }

            build(obj);
            return formData;
          }

          module.exports = toFormData;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "../utils": 38,
      "buffer": 3
    }],
    37: [function (require, module, exports) {
      'use strict';

      var VERSION = require('../env/data').version;

      var AxiosError = require('../core/AxiosError');

      var validators = {};
      ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function (type, i) {
        validators[type] = function validator(thing) {
          return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
        };
      });
      var deprecatedWarnings = {};

      validators.transitional = function transitional(validator, version, message) {
        function formatMessage(opt, desc) {
          return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
        }

        return function (value, opt, opts) {
          if (validator === false) {
            throw new AxiosError(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')), AxiosError.ERR_DEPRECATED);
          }

          if (version && !deprecatedWarnings[opt]) {
            deprecatedWarnings[opt] = true;
            console.warn(formatMessage(opt, ' has been deprecated since v' + version + ' and will be removed in the near future'));
          }

          return validator ? validator(value, opt, opts) : true;
        };
      };

      function assertOptions(options, schema, allowUnknown) {
        if (typeof options !== 'object') {
          throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
        }

        var keys = Object.keys(options);
        var i = keys.length;

        while (i-- > 0) {
          var opt = keys[i];
          var validator = schema[opt];

          if (validator) {
            var value = options[opt];
            var result = value === undefined || validator(value, opt, options);

            if (result !== true) {
              throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
            }

            continue;
          }

          if (allowUnknown !== true) {
            throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
          }
        }
      }

      module.exports = {
        assertOptions: assertOptions,
        validators: validators
      };
    }, {
      "../core/AxiosError": 14,
      "../env/data": 23
    }],
    38: [function (require, module, exports) {
      'use strict';

      var bind = require('./helpers/bind');

      var toString = Object.prototype.toString;

      var kindOf = function (cache) {
        return function (thing) {
          var str = toString.call(thing);
          return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
        };
      }(Object.create(null));

      function kindOfTest(type) {
        type = type.toLowerCase();
        return function isKindOf(thing) {
          return kindOf(thing) === type;
        };
      }

      function isArray(val) {
        return Array.isArray(val);
      }

      function isUndefined(val) {
        return typeof val === 'undefined';
      }

      function isBuffer(val) {
        return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
      }

      var isArrayBuffer = kindOfTest('ArrayBuffer');

      function isArrayBufferView(val) {
        var result;

        if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
          result = ArrayBuffer.isView(val);
        } else {
          result = val && val.buffer && isArrayBuffer(val.buffer);
        }

        return result;
      }

      function isString(val) {
        return typeof val === 'string';
      }

      function isNumber(val) {
        return typeof val === 'number';
      }

      function isObject(val) {
        return val !== null && typeof val === 'object';
      }

      function isPlainObject(val) {
        if (kindOf(val) !== 'object') {
          return false;
        }

        var prototype = Object.getPrototypeOf(val);
        return prototype === null || prototype === Object.prototype;
      }

      var isDate = kindOfTest('Date');
      var isFile = kindOfTest('File');
      var isBlob = kindOfTest('Blob');
      var isFileList = kindOfTest('FileList');

      function isFunction(val) {
        return toString.call(val) === '[object Function]';
      }

      function isStream(val) {
        return isObject(val) && isFunction(val.pipe);
      }

      function isFormData(thing) {
        var pattern = '[object FormData]';
        return thing && (typeof FormData === 'function' && thing instanceof FormData || toString.call(thing) === pattern || isFunction(thing.toString) && thing.toString() === pattern);
      }

      var isURLSearchParams = kindOfTest('URLSearchParams');

      function trim(str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
      }

      function isStandardBrowserEnv() {
        if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' || navigator.product === 'NativeScript' || navigator.product === 'NS')) {
          return false;
        }

        return typeof window !== 'undefined' && typeof document !== 'undefined';
      }

      function forEach(obj, fn) {
        if (obj === null || typeof obj === 'undefined') {
          return;
        }

        if (typeof obj !== 'object') {
          obj = [obj];
        }

        if (isArray(obj)) {
          for (var i = 0, l = obj.length; i < l; i++) {
            fn.call(null, obj[i], i, obj);
          }
        } else {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              fn.call(null, obj[key], key, obj);
            }
          }
        }
      }

      function merge() {
        var result = {};

        function assignValue(val, key) {
          if (isPlainObject(result[key]) && isPlainObject(val)) {
            result[key] = merge(result[key], val);
          } else if (isPlainObject(val)) {
            result[key] = merge({}, val);
          } else if (isArray(val)) {
            result[key] = val.slice();
          } else {
            result[key] = val;
          }
        }

        for (var i = 0, l = arguments.length; i < l; i++) {
          forEach(arguments[i], assignValue);
        }

        return result;
      }

      function extend(a, b, thisArg) {
        forEach(b, function assignValue(val, key) {
          if (thisArg && typeof val === 'function') {
            a[key] = bind(val, thisArg);
          } else {
            a[key] = val;
          }
        });
        return a;
      }

      function stripBOM(content) {
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
        }

        return content;
      }

      function inherits(constructor, superConstructor, props, descriptors) {
        constructor.prototype = Object.create(superConstructor.prototype, descriptors);
        constructor.prototype.constructor = constructor;
        props && Object.assign(constructor.prototype, props);
      }

      function toFlatObject(sourceObj, destObj, filter) {
        var props;
        var i;
        var prop;
        var merged = {};
        destObj = destObj || {};

        do {
          props = Object.getOwnPropertyNames(sourceObj);
          i = props.length;

          while (i-- > 0) {
            prop = props[i];

            if (!merged[prop]) {
              destObj[prop] = sourceObj[prop];
              merged[prop] = true;
            }
          }

          sourceObj = Object.getPrototypeOf(sourceObj);
        } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

        return destObj;
      }

      function endsWith(str, searchString, position) {
        str = String(str);

        if (position === undefined || position > str.length) {
          position = str.length;
        }

        position -= searchString.length;
        var lastIndex = str.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      }

      function toArray(thing) {
        if (!thing) return null;
        var i = thing.length;
        if (isUndefined(i)) return null;
        var arr = new Array(i);

        while (i-- > 0) {
          arr[i] = thing[i];
        }

        return arr;
      }

      var isTypedArray = function (TypedArray) {
        return function (thing) {
          return TypedArray && thing instanceof TypedArray;
        };
      }(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

      module.exports = {
        isArray: isArray,
        isArrayBuffer: isArrayBuffer,
        isBuffer: isBuffer,
        isFormData: isFormData,
        isArrayBufferView: isArrayBufferView,
        isString: isString,
        isNumber: isNumber,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isUndefined: isUndefined,
        isDate: isDate,
        isFile: isFile,
        isBlob: isBlob,
        isFunction: isFunction,
        isStream: isStream,
        isURLSearchParams: isURLSearchParams,
        isStandardBrowserEnv: isStandardBrowserEnv,
        forEach: forEach,
        merge: merge,
        extend: extend,
        trim: trim,
        stripBOM: stripBOM,
        inherits: inherits,
        toFlatObject: toFlatObject,
        kindOf: kindOf,
        kindOfTest: kindOfTest,
        endsWith: endsWith,
        toArray: toArray,
        isTypedArray: isTypedArray,
        isFileList: isFileList
      };
    }, {
      "./helpers/bind": 24
    }],
    39: [function (require, module, exports) {
      (function (process, global) {
        (function () {
          (function () {
            'use strict';

            var INPUT_ERROR = 'input is invalid type';
            var FINALIZE_ERROR = 'finalize already called';
            var WINDOW = typeof window === 'object';
            var root = WINDOW ? window : {};

            if (root.JS_SHA3_NO_WINDOW) {
              WINDOW = false;
            }

            var WEB_WORKER = !WINDOW && typeof self === 'object';
            var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;

            if (NODE_JS) {
              root = global;
            } else if (WEB_WORKER) {
              root = self;
            }

            var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && typeof module === 'object' && module.exports;
            var AMD = typeof define === 'function' && define.amd;
            var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
            var HEX_CHARS = '0123456789abcdef'.split('');
            var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
            var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
            var KECCAK_PADDING = [1, 256, 65536, 16777216];
            var PADDING = [6, 1536, 393216, 100663296];
            var SHIFT = [0, 8, 16, 24];
            var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
            var BITS = [224, 256, 384, 512];
            var SHAKE_BITS = [128, 256];
            var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array', 'digest'];
            var CSHAKE_BYTEPAD = {
              '128': 168,
              '256': 136
            };

            if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
              Array.isArray = function (obj) {
                return Object.prototype.toString.call(obj) === '[object Array]';
              };
            }

            if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
              ArrayBuffer.isView = function (obj) {
                return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
              };
            }

            var createOutputMethod = function (bits, padding, outputType) {
              return function (message) {
                return new Keccak(bits, padding, bits).update(message)[outputType]();
              };
            };

            var createShakeOutputMethod = function (bits, padding, outputType) {
              return function (message, outputBits) {
                return new Keccak(bits, padding, outputBits).update(message)[outputType]();
              };
            };

            var createCshakeOutputMethod = function (bits, padding, outputType) {
              return function (message, outputBits, n, s) {
                return methods['cshake' + bits].update(message, outputBits, n, s)[outputType]();
              };
            };

            var createKmacOutputMethod = function (bits, padding, outputType) {
              return function (key, message, outputBits, s) {
                return methods['kmac' + bits].update(key, message, outputBits, s)[outputType]();
              };
            };

            var createOutputMethods = function (method, createMethod, bits, padding) {
              for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
                var type = OUTPUT_TYPES[i];
                method[type] = createMethod(bits, padding, type);
              }

              return method;
            };

            var createMethod = function (bits, padding) {
              var method = createOutputMethod(bits, padding, 'hex');

              method.create = function () {
                return new Keccak(bits, padding, bits);
              };

              method.update = function (message) {
                return method.create().update(message);
              };

              return createOutputMethods(method, createOutputMethod, bits, padding);
            };

            var createShakeMethod = function (bits, padding) {
              var method = createShakeOutputMethod(bits, padding, 'hex');

              method.create = function (outputBits) {
                return new Keccak(bits, padding, outputBits);
              };

              method.update = function (message, outputBits) {
                return method.create(outputBits).update(message);
              };

              return createOutputMethods(method, createShakeOutputMethod, bits, padding);
            };

            var createCshakeMethod = function (bits, padding) {
              var w = CSHAKE_BYTEPAD[bits];
              var method = createCshakeOutputMethod(bits, padding, 'hex');

              method.create = function (outputBits, n, s) {
                if (!n && !s) {
                  return methods['shake' + bits].create(outputBits);
                } else {
                  return new Keccak(bits, padding, outputBits).bytepad([n, s], w);
                }
              };

              method.update = function (message, outputBits, n, s) {
                return method.create(outputBits, n, s).update(message);
              };

              return createOutputMethods(method, createCshakeOutputMethod, bits, padding);
            };

            var createKmacMethod = function (bits, padding) {
              var w = CSHAKE_BYTEPAD[bits];
              var method = createKmacOutputMethod(bits, padding, 'hex');

              method.create = function (key, outputBits, s) {
                return new Kmac(bits, padding, outputBits).bytepad(['KMAC', s], w).bytepad([key], w);
              };

              method.update = function (key, message, outputBits, s) {
                return method.create(key, outputBits, s).update(message);
              };

              return createOutputMethods(method, createKmacOutputMethod, bits, padding);
            };

            var algorithms = [{
              name: 'keccak',
              padding: KECCAK_PADDING,
              bits: BITS,
              createMethod: createMethod
            }, {
              name: 'sha3',
              padding: PADDING,
              bits: BITS,
              createMethod: createMethod
            }, {
              name: 'shake',
              padding: SHAKE_PADDING,
              bits: SHAKE_BITS,
              createMethod: createShakeMethod
            }, {
              name: 'cshake',
              padding: CSHAKE_PADDING,
              bits: SHAKE_BITS,
              createMethod: createCshakeMethod
            }, {
              name: 'kmac',
              padding: CSHAKE_PADDING,
              bits: SHAKE_BITS,
              createMethod: createKmacMethod
            }];
            var methods = {},
                methodNames = [];

            for (var i = 0; i < algorithms.length; ++i) {
              var algorithm = algorithms[i];
              var bits = algorithm.bits;

              for (var j = 0; j < bits.length; ++j) {
                var methodName = algorithm.name + '_' + bits[j];
                methodNames.push(methodName);
                methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);

                if (algorithm.name !== 'sha3') {
                  var newMethodName = algorithm.name + bits[j];
                  methodNames.push(newMethodName);
                  methods[newMethodName] = methods[methodName];
                }
              }
            }

            function Keccak(bits, padding, outputBits) {
              this.blocks = [];
              this.s = [];
              this.padding = padding;
              this.outputBits = outputBits;
              this.reset = true;
              this.finalized = false;
              this.block = 0;
              this.start = 0;
              this.blockCount = 1600 - (bits << 1) >> 5;
              this.byteCount = this.blockCount << 2;
              this.outputBlocks = outputBits >> 5;
              this.extraBytes = (outputBits & 31) >> 3;

              for (var i = 0; i < 50; ++i) {
                this.s[i] = 0;
              }
            }

            Keccak.prototype.update = function (message) {
              if (this.finalized) {
                throw new Error(FINALIZE_ERROR);
              }

              var notString,
                  type = typeof message;

              if (type !== 'string') {
                if (type === 'object') {
                  if (message === null) {
                    throw new Error(INPUT_ERROR);
                  } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
                    message = new Uint8Array(message);
                  } else if (!Array.isArray(message)) {
                    if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
                      throw new Error(INPUT_ERROR);
                    }
                  }
                } else {
                  throw new Error(INPUT_ERROR);
                }

                notString = true;
              }

              var blocks = this.blocks,
                  byteCount = this.byteCount,
                  length = message.length,
                  blockCount = this.blockCount,
                  index = 0,
                  s = this.s,
                  i,
                  code;

              while (index < length) {
                if (this.reset) {
                  this.reset = false;
                  blocks[0] = this.block;

                  for (i = 1; i < blockCount + 1; ++i) {
                    blocks[i] = 0;
                  }
                }

                if (notString) {
                  for (i = this.start; index < length && i < byteCount; ++index) {
                    blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
                  }
                } else {
                  for (i = this.start; index < length && i < byteCount; ++index) {
                    code = message.charCodeAt(index);

                    if (code < 0x80) {
                      blocks[i >> 2] |= code << SHIFT[i++ & 3];
                    } else if (code < 0x800) {
                      blocks[i >> 2] |= (0xc0 | code >> 6) << SHIFT[i++ & 3];
                      blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
                    } else if (code < 0xd800 || code >= 0xe000) {
                      blocks[i >> 2] |= (0xe0 | code >> 12) << SHIFT[i++ & 3];
                      blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
                      blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
                    } else {
                      code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
                      blocks[i >> 2] |= (0xf0 | code >> 18) << SHIFT[i++ & 3];
                      blocks[i >> 2] |= (0x80 | code >> 12 & 0x3f) << SHIFT[i++ & 3];
                      blocks[i >> 2] |= (0x80 | code >> 6 & 0x3f) << SHIFT[i++ & 3];
                      blocks[i >> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
                    }
                  }
                }

                this.lastByteIndex = i;

                if (i >= byteCount) {
                  this.start = i - byteCount;
                  this.block = blocks[blockCount];

                  for (i = 0; i < blockCount; ++i) {
                    s[i] ^= blocks[i];
                  }

                  f(s);
                  this.reset = true;
                } else {
                  this.start = i;
                }
              }

              return this;
            };

            Keccak.prototype.encode = function (x, right) {
              var o = x & 255,
                  n = 1;
              var bytes = [o];
              x = x >> 8;
              o = x & 255;

              while (o > 0) {
                bytes.unshift(o);
                x = x >> 8;
                o = x & 255;
                ++n;
              }

              if (right) {
                bytes.push(n);
              } else {
                bytes.unshift(n);
              }

              this.update(bytes);
              return bytes.length;
            };

            Keccak.prototype.encodeString = function (str) {
              var notString,
                  type = typeof str;

              if (type !== 'string') {
                if (type === 'object') {
                  if (str === null) {
                    throw new Error(INPUT_ERROR);
                  } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
                    str = new Uint8Array(str);
                  } else if (!Array.isArray(str)) {
                    if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
                      throw new Error(INPUT_ERROR);
                    }
                  }
                } else {
                  throw new Error(INPUT_ERROR);
                }

                notString = true;
              }

              var bytes = 0,
                  length = str.length;

              if (notString) {
                bytes = length;
              } else {
                for (var i = 0; i < str.length; ++i) {
                  var code = str.charCodeAt(i);

                  if (code < 0x80) {
                    bytes += 1;
                  } else if (code < 0x800) {
                    bytes += 2;
                  } else if (code < 0xd800 || code >= 0xe000) {
                    bytes += 3;
                  } else {
                    code = 0x10000 + ((code & 0x3ff) << 10 | str.charCodeAt(++i) & 0x3ff);
                    bytes += 4;
                  }
                }
              }

              bytes += this.encode(bytes * 8);
              this.update(str);
              return bytes;
            };

            Keccak.prototype.bytepad = function (strs, w) {
              var bytes = this.encode(w);

              for (var i = 0; i < strs.length; ++i) {
                bytes += this.encodeString(strs[i]);
              }

              var paddingBytes = w - bytes % w;
              var zeros = [];
              zeros.length = paddingBytes;
              this.update(zeros);
              return this;
            };

            Keccak.prototype.finalize = function () {
              if (this.finalized) {
                return;
              }

              this.finalized = true;
              var blocks = this.blocks,
                  i = this.lastByteIndex,
                  blockCount = this.blockCount,
                  s = this.s;
              blocks[i >> 2] |= this.padding[i & 3];

              if (this.lastByteIndex === this.byteCount) {
                blocks[0] = blocks[blockCount];

                for (i = 1; i < blockCount + 1; ++i) {
                  blocks[i] = 0;
                }
              }

              blocks[blockCount - 1] |= 0x80000000;

              for (i = 0; i < blockCount; ++i) {
                s[i] ^= blocks[i];
              }

              f(s);
            };

            Keccak.prototype.toString = Keccak.prototype.hex = function () {
              this.finalize();
              var blockCount = this.blockCount,
                  s = this.s,
                  outputBlocks = this.outputBlocks,
                  extraBytes = this.extraBytes,
                  i = 0,
                  j = 0;
              var hex = '',
                  block;

              while (j < outputBlocks) {
                for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
                  block = s[i];
                  hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F] + HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F] + HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F] + HEX_CHARS[block >> 28 & 0x0F] + HEX_CHARS[block >> 24 & 0x0F];
                }

                if (j % blockCount === 0) {
                  f(s);
                  i = 0;
                }
              }

              if (extraBytes) {
                block = s[i];
                hex += HEX_CHARS[block >> 4 & 0x0F] + HEX_CHARS[block & 0x0F];

                if (extraBytes > 1) {
                  hex += HEX_CHARS[block >> 12 & 0x0F] + HEX_CHARS[block >> 8 & 0x0F];
                }

                if (extraBytes > 2) {
                  hex += HEX_CHARS[block >> 20 & 0x0F] + HEX_CHARS[block >> 16 & 0x0F];
                }
              }

              return hex;
            };

            Keccak.prototype.arrayBuffer = function () {
              this.finalize();
              var blockCount = this.blockCount,
                  s = this.s,
                  outputBlocks = this.outputBlocks,
                  extraBytes = this.extraBytes,
                  i = 0,
                  j = 0;
              var bytes = this.outputBits >> 3;
              var buffer;

              if (extraBytes) {
                buffer = new ArrayBuffer(outputBlocks + 1 << 2);
              } else {
                buffer = new ArrayBuffer(bytes);
              }

              var array = new Uint32Array(buffer);

              while (j < outputBlocks) {
                for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
                  array[j] = s[i];
                }

                if (j % blockCount === 0) {
                  f(s);
                }
              }

              if (extraBytes) {
                array[i] = s[i];
                buffer = buffer.slice(0, bytes);
              }

              return buffer;
            };

            Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

            Keccak.prototype.digest = Keccak.prototype.array = function () {
              this.finalize();
              var blockCount = this.blockCount,
                  s = this.s,
                  outputBlocks = this.outputBlocks,
                  extraBytes = this.extraBytes,
                  i = 0,
                  j = 0;
              var array = [],
                  offset,
                  block;

              while (j < outputBlocks) {
                for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
                  offset = j << 2;
                  block = s[i];
                  array[offset] = block & 0xFF;
                  array[offset + 1] = block >> 8 & 0xFF;
                  array[offset + 2] = block >> 16 & 0xFF;
                  array[offset + 3] = block >> 24 & 0xFF;
                }

                if (j % blockCount === 0) {
                  f(s);
                }
              }

              if (extraBytes) {
                offset = j << 2;
                block = s[i];
                array[offset] = block & 0xFF;

                if (extraBytes > 1) {
                  array[offset + 1] = block >> 8 & 0xFF;
                }

                if (extraBytes > 2) {
                  array[offset + 2] = block >> 16 & 0xFF;
                }
              }

              return array;
            };

            function Kmac(bits, padding, outputBits) {
              Keccak.call(this, bits, padding, outputBits);
            }

            Kmac.prototype = new Keccak();

            Kmac.prototype.finalize = function () {
              this.encode(this.outputBits, true);
              return Keccak.prototype.finalize.call(this);
            };

            var f = function (s) {
              var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;

              for (n = 0; n < 48; n += 2) {
                c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
                c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
                c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
                c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
                c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
                c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
                c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
                c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
                c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
                c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
                h = c8 ^ (c2 << 1 | c3 >>> 31);
                l = c9 ^ (c3 << 1 | c2 >>> 31);
                s[0] ^= h;
                s[1] ^= l;
                s[10] ^= h;
                s[11] ^= l;
                s[20] ^= h;
                s[21] ^= l;
                s[30] ^= h;
                s[31] ^= l;
                s[40] ^= h;
                s[41] ^= l;
                h = c0 ^ (c4 << 1 | c5 >>> 31);
                l = c1 ^ (c5 << 1 | c4 >>> 31);
                s[2] ^= h;
                s[3] ^= l;
                s[12] ^= h;
                s[13] ^= l;
                s[22] ^= h;
                s[23] ^= l;
                s[32] ^= h;
                s[33] ^= l;
                s[42] ^= h;
                s[43] ^= l;
                h = c2 ^ (c6 << 1 | c7 >>> 31);
                l = c3 ^ (c7 << 1 | c6 >>> 31);
                s[4] ^= h;
                s[5] ^= l;
                s[14] ^= h;
                s[15] ^= l;
                s[24] ^= h;
                s[25] ^= l;
                s[34] ^= h;
                s[35] ^= l;
                s[44] ^= h;
                s[45] ^= l;
                h = c4 ^ (c8 << 1 | c9 >>> 31);
                l = c5 ^ (c9 << 1 | c8 >>> 31);
                s[6] ^= h;
                s[7] ^= l;
                s[16] ^= h;
                s[17] ^= l;
                s[26] ^= h;
                s[27] ^= l;
                s[36] ^= h;
                s[37] ^= l;
                s[46] ^= h;
                s[47] ^= l;
                h = c6 ^ (c0 << 1 | c1 >>> 31);
                l = c7 ^ (c1 << 1 | c0 >>> 31);
                s[8] ^= h;
                s[9] ^= l;
                s[18] ^= h;
                s[19] ^= l;
                s[28] ^= h;
                s[29] ^= l;
                s[38] ^= h;
                s[39] ^= l;
                s[48] ^= h;
                s[49] ^= l;
                b0 = s[0];
                b1 = s[1];
                b32 = s[11] << 4 | s[10] >>> 28;
                b33 = s[10] << 4 | s[11] >>> 28;
                b14 = s[20] << 3 | s[21] >>> 29;
                b15 = s[21] << 3 | s[20] >>> 29;
                b46 = s[31] << 9 | s[30] >>> 23;
                b47 = s[30] << 9 | s[31] >>> 23;
                b28 = s[40] << 18 | s[41] >>> 14;
                b29 = s[41] << 18 | s[40] >>> 14;
                b20 = s[2] << 1 | s[3] >>> 31;
                b21 = s[3] << 1 | s[2] >>> 31;
                b2 = s[13] << 12 | s[12] >>> 20;
                b3 = s[12] << 12 | s[13] >>> 20;
                b34 = s[22] << 10 | s[23] >>> 22;
                b35 = s[23] << 10 | s[22] >>> 22;
                b16 = s[33] << 13 | s[32] >>> 19;
                b17 = s[32] << 13 | s[33] >>> 19;
                b48 = s[42] << 2 | s[43] >>> 30;
                b49 = s[43] << 2 | s[42] >>> 30;
                b40 = s[5] << 30 | s[4] >>> 2;
                b41 = s[4] << 30 | s[5] >>> 2;
                b22 = s[14] << 6 | s[15] >>> 26;
                b23 = s[15] << 6 | s[14] >>> 26;
                b4 = s[25] << 11 | s[24] >>> 21;
                b5 = s[24] << 11 | s[25] >>> 21;
                b36 = s[34] << 15 | s[35] >>> 17;
                b37 = s[35] << 15 | s[34] >>> 17;
                b18 = s[45] << 29 | s[44] >>> 3;
                b19 = s[44] << 29 | s[45] >>> 3;
                b10 = s[6] << 28 | s[7] >>> 4;
                b11 = s[7] << 28 | s[6] >>> 4;
                b42 = s[17] << 23 | s[16] >>> 9;
                b43 = s[16] << 23 | s[17] >>> 9;
                b24 = s[26] << 25 | s[27] >>> 7;
                b25 = s[27] << 25 | s[26] >>> 7;
                b6 = s[36] << 21 | s[37] >>> 11;
                b7 = s[37] << 21 | s[36] >>> 11;
                b38 = s[47] << 24 | s[46] >>> 8;
                b39 = s[46] << 24 | s[47] >>> 8;
                b30 = s[8] << 27 | s[9] >>> 5;
                b31 = s[9] << 27 | s[8] >>> 5;
                b12 = s[18] << 20 | s[19] >>> 12;
                b13 = s[19] << 20 | s[18] >>> 12;
                b44 = s[29] << 7 | s[28] >>> 25;
                b45 = s[28] << 7 | s[29] >>> 25;
                b26 = s[38] << 8 | s[39] >>> 24;
                b27 = s[39] << 8 | s[38] >>> 24;
                b8 = s[48] << 14 | s[49] >>> 18;
                b9 = s[49] << 14 | s[48] >>> 18;
                s[0] = b0 ^ ~b2 & b4;
                s[1] = b1 ^ ~b3 & b5;
                s[10] = b10 ^ ~b12 & b14;
                s[11] = b11 ^ ~b13 & b15;
                s[20] = b20 ^ ~b22 & b24;
                s[21] = b21 ^ ~b23 & b25;
                s[30] = b30 ^ ~b32 & b34;
                s[31] = b31 ^ ~b33 & b35;
                s[40] = b40 ^ ~b42 & b44;
                s[41] = b41 ^ ~b43 & b45;
                s[2] = b2 ^ ~b4 & b6;
                s[3] = b3 ^ ~b5 & b7;
                s[12] = b12 ^ ~b14 & b16;
                s[13] = b13 ^ ~b15 & b17;
                s[22] = b22 ^ ~b24 & b26;
                s[23] = b23 ^ ~b25 & b27;
                s[32] = b32 ^ ~b34 & b36;
                s[33] = b33 ^ ~b35 & b37;
                s[42] = b42 ^ ~b44 & b46;
                s[43] = b43 ^ ~b45 & b47;
                s[4] = b4 ^ ~b6 & b8;
                s[5] = b5 ^ ~b7 & b9;
                s[14] = b14 ^ ~b16 & b18;
                s[15] = b15 ^ ~b17 & b19;
                s[24] = b24 ^ ~b26 & b28;
                s[25] = b25 ^ ~b27 & b29;
                s[34] = b34 ^ ~b36 & b38;
                s[35] = b35 ^ ~b37 & b39;
                s[44] = b44 ^ ~b46 & b48;
                s[45] = b45 ^ ~b47 & b49;
                s[6] = b6 ^ ~b8 & b0;
                s[7] = b7 ^ ~b9 & b1;
                s[16] = b16 ^ ~b18 & b10;
                s[17] = b17 ^ ~b19 & b11;
                s[26] = b26 ^ ~b28 & b20;
                s[27] = b27 ^ ~b29 & b21;
                s[36] = b36 ^ ~b38 & b30;
                s[37] = b37 ^ ~b39 & b31;
                s[46] = b46 ^ ~b48 & b40;
                s[47] = b47 ^ ~b49 & b41;
                s[8] = b8 ^ ~b0 & b2;
                s[9] = b9 ^ ~b1 & b3;
                s[18] = b18 ^ ~b10 & b12;
                s[19] = b19 ^ ~b11 & b13;
                s[28] = b28 ^ ~b20 & b22;
                s[29] = b29 ^ ~b21 & b23;
                s[38] = b38 ^ ~b30 & b32;
                s[39] = b39 ^ ~b31 & b33;
                s[48] = b48 ^ ~b40 & b42;
                s[49] = b49 ^ ~b41 & b43;
                s[0] ^= RC[n];
                s[1] ^= RC[n + 1];
              }
            };

            if (COMMON_JS) {
              module.exports = methods;
            } else {
              for (i = 0; i < methodNames.length; ++i) {
                root[methodNames[i]] = methods[methodNames[i]];
              }

              if (AMD) {
                define(function () {
                  return methods;
                });
              }
            }
          })();
        }).call(this);
      }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {
      "_process": 5
    }],
    40: [function (require, module, exports) {
      !function (e, t) {
        "object" == typeof exports && "undefined" != typeof module ? t(exports, require("axios"), require("@noble/ed25519"), require("js-sha3")) : "function" == typeof define && define.amd ? define(["exports", "axios", "@noble/ed25519", "js-sha3"], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self)["mq-web3"] = {}, e.axios, e.ed, e["js-sha3"]);
      }(this, function (e, t, n, r) {
        "use strict";

        function i(e) {
          return e && "object" == typeof e && "default" in e ? e : {
            default: e
          };
        }

        var a,
            s = i(t),
            o = i(n);

        function u(e, t) {
          var n = Object.keys(e);

          if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t && (r = r.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })), n.push.apply(n, r);
          }

          return n;
        }

        function c(e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2 ? u(Object(n), !0).forEach(function (t) {
              g(e, t, n[t]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : u(Object(n)).forEach(function (t) {
              Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
            });
          }

          return e;
        }

        function l() {
          l = function () {
            return e;
          };

          var e = {},
              t = Object.prototype,
              n = t.hasOwnProperty,
              r = "function" == typeof Symbol ? Symbol : {},
              i = r.iterator || "@@iterator",
              a = r.asyncIterator || "@@asyncIterator",
              s = r.toStringTag || "@@toStringTag";

          function o(e, t, n) {
            return Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0
            }), e[t];
          }

          try {
            o({}, "");
          } catch (e) {
            o = function (e, t, n) {
              return e[t] = n;
            };
          }

          function u(e, t, n, r) {
            var i = t && t.prototype instanceof h ? t : h,
                a = Object.create(i.prototype),
                s = new N(r || []);
            return a._invoke = function (e, t, n) {
              var r = "suspendedStart";
              return function (i, a) {
                if ("executing" === r) throw new Error("Generator is already running");

                if ("completed" === r) {
                  if ("throw" === i) throw a;
                  return S();
                }

                for (n.method = i, n.arg = a;;) {
                  var s = n.delegate;

                  if (s) {
                    var o = k(s, n);

                    if (o) {
                      if (o === f) continue;
                      return o;
                    }
                  }

                  if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
                    if ("suspendedStart" === r) throw r = "completed", n.arg;
                    n.dispatchException(n.arg);
                  } else "return" === n.method && n.abrupt("return", n.arg);
                  r = "executing";
                  var u = c(e, t, n);

                  if ("normal" === u.type) {
                    if (r = n.done ? "completed" : "suspendedYield", u.arg === f) continue;
                    return {
                      value: u.arg,
                      done: n.done
                    };
                  }

                  "throw" === u.type && (r = "completed", n.method = "throw", n.arg = u.arg);
                }
              };
            }(e, n, s), a;
          }

          function c(e, t, n) {
            try {
              return {
                type: "normal",
                arg: e.call(t, n)
              };
            } catch (e) {
              return {
                type: "throw",
                arg: e
              };
            }
          }

          e.wrap = u;
          var f = {};

          function h() {}

          function p() {}

          function d() {}

          var m = {};
          o(m, i, function () {
            return this;
          });
          var g = Object.getPrototypeOf,
              y = g && g(g(x([])));
          y && y !== t && n.call(y, i) && (m = y);
          var v = d.prototype = h.prototype = Object.create(m);

          function w(e) {
            ["next", "throw", "return"].forEach(function (t) {
              o(e, t, function (e) {
                return this._invoke(t, e);
              });
            });
          }

          function b(e, t) {
            function r(i, a, s, o) {
              var u = c(e[i], e, a);

              if ("throw" !== u.type) {
                var l = u.arg,
                    f = l.value;
                return f && "object" == typeof f && n.call(f, "__await") ? t.resolve(f.__await).then(function (e) {
                  r("next", e, s, o);
                }, function (e) {
                  r("throw", e, s, o);
                }) : t.resolve(f).then(function (e) {
                  l.value = e, s(l);
                }, function (e) {
                  return r("throw", e, s, o);
                });
              }

              o(u.arg);
            }

            var i;

            this._invoke = function (e, n) {
              function a() {
                return new t(function (t, i) {
                  r(e, n, t, i);
                });
              }

              return i = i ? i.then(a, a) : a();
            };
          }

          function k(e, t) {
            var n = e.iterator[t.method];

            if (void 0 === n) {
              if (t.delegate = null, "throw" === t.method) {
                if (e.iterator.return && (t.method = "return", t.arg = void 0, k(e, t), "throw" === t.method)) return f;
                t.method = "throw", t.arg = new TypeError("The iterator does not provide a 'throw' method");
              }

              return f;
            }

            var r = c(n, e.iterator, t.arg);
            if ("throw" === r.type) return t.method = "throw", t.arg = r.arg, t.delegate = null, f;
            var i = r.arg;
            return i ? i.done ? (t[e.resultName] = i.value, t.next = e.nextLoc, "return" !== t.method && (t.method = "next", t.arg = void 0), t.delegate = null, f) : i : (t.method = "throw", t.arg = new TypeError("iterator result is not an object"), t.delegate = null, f);
          }

          function T(e) {
            var t = {
              tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t);
          }

          function I(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t;
          }

          function N(e) {
            this.tryEntries = [{
              tryLoc: "root"
            }], e.forEach(T, this), this.reset(!0);
          }

          function x(e) {
            if (e) {
              var t = e[i];
              if (t) return t.call(e);
              if ("function" == typeof e.next) return e;

              if (!isNaN(e.length)) {
                var r = -1,
                    a = function t() {
                  for (; ++r < e.length;) if (n.call(e, r)) return t.value = e[r], t.done = !1, t;

                  return t.value = void 0, t.done = !0, t;
                };

                return a.next = a;
              }
            }

            return {
              next: S
            };
          }

          function S() {
            return {
              value: void 0,
              done: !0
            };
          }

          return p.prototype = d, o(v, "constructor", d), o(d, "constructor", p), p.displayName = o(d, s, "GeneratorFunction"), e.isGeneratorFunction = function (e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === p || "GeneratorFunction" === (t.displayName || t.name));
          }, e.mark = function (e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, d) : (e.__proto__ = d, o(e, s, "GeneratorFunction")), e.prototype = Object.create(v), e;
          }, e.awrap = function (e) {
            return {
              __await: e
            };
          }, w(b.prototype), o(b.prototype, a, function () {
            return this;
          }), e.AsyncIterator = b, e.async = function (t, n, r, i, a) {
            void 0 === a && (a = Promise);
            var s = new b(u(t, n, r, i), a);
            return e.isGeneratorFunction(n) ? s : s.next().then(function (e) {
              return e.done ? e.value : s.next();
            });
          }, w(v), o(v, s, "Generator"), o(v, i, function () {
            return this;
          }), o(v, "toString", function () {
            return "[object Generator]";
          }), e.keys = function (e) {
            var t = [];

            for (var n in e) t.push(n);

            return t.reverse(), function n() {
              for (; t.length;) {
                var r = t.pop();
                if (r in e) return n.value = r, n.done = !1, n;
              }

              return n.done = !0, n;
            };
          }, e.values = x, N.prototype = {
            constructor: N,
            reset: function (e) {
              if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = !1, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(I), !e) for (var t in this) "t" === t.charAt(0) && n.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = void 0);
            },
            stop: function () {
              this.done = !0;
              var e = this.tryEntries[0].completion;
              if ("throw" === e.type) throw e.arg;
              return this.rval;
            },
            dispatchException: function (e) {
              if (this.done) throw e;
              var t = this;

              function r(n, r) {
                return s.type = "throw", s.arg = e, t.next = n, r && (t.method = "next", t.arg = void 0), !!r;
              }

              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var a = this.tryEntries[i],
                    s = a.completion;
                if ("root" === a.tryLoc) return r("end");

                if (a.tryLoc <= this.prev) {
                  var o = n.call(a, "catchLoc"),
                      u = n.call(a, "finallyLoc");

                  if (o && u) {
                    if (this.prev < a.catchLoc) return r(a.catchLoc, !0);
                    if (this.prev < a.finallyLoc) return r(a.finallyLoc);
                  } else if (o) {
                    if (this.prev < a.catchLoc) return r(a.catchLoc, !0);
                  } else {
                    if (!u) throw new Error("try statement without catch or finally");
                    if (this.prev < a.finallyLoc) return r(a.finallyLoc);
                  }
                }
              }
            },
            abrupt: function (e, t) {
              for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                var i = this.tryEntries[r];

                if (i.tryLoc <= this.prev && n.call(i, "finallyLoc") && this.prev < i.finallyLoc) {
                  var a = i;
                  break;
                }
              }

              a && ("break" === e || "continue" === e) && a.tryLoc <= t && t <= a.finallyLoc && (a = null);
              var s = a ? a.completion : {};
              return s.type = e, s.arg = t, a ? (this.method = "next", this.next = a.finallyLoc, f) : this.complete(s);
            },
            complete: function (e, t) {
              if ("throw" === e.type) throw e.arg;
              return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), f;
            },
            finish: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), I(n), f;
              }
            },
            catch: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];

                if (n.tryLoc === e) {
                  var r = n.completion;

                  if ("throw" === r.type) {
                    var i = r.arg;
                    I(n);
                  }

                  return i;
                }
              }

              throw new Error("illegal catch attempt");
            },
            delegateYield: function (e, t, n) {
              return this.delegate = {
                iterator: x(e),
                resultName: t,
                nextLoc: n
              }, "next" === this.method && (this.arg = void 0), f;
            }
          }, e;
        }

        function f(e, t, n, r, i, a, s) {
          try {
            var o = e[a](s),
                u = o.value;
          } catch (e) {
            return void n(e);
          }

          o.done ? t(u) : Promise.resolve(u).then(r, i);
        }

        function h(e) {
          return function () {
            var t = this,
                n = arguments;
            return new Promise(function (r, i) {
              var a = e.apply(t, n);

              function s(e) {
                f(a, r, i, s, o, "next", e);
              }

              function o(e) {
                f(a, r, i, s, o, "throw", e);
              }

              s(void 0);
            });
          };
        }

        function p(e, t) {
          if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
        }

        function d(e, t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r);
          }
        }

        function m(e, t, n) {
          return t && d(e.prototype, t), n && d(e, n), Object.defineProperty(e, "prototype", {
            writable: !1
          }), e;
        }

        function g(e, t, n) {
          return t in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : e[t] = n, e;
        }

        function y(e, t) {
          if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
          e.prototype = Object.create(t && t.prototype, {
            constructor: {
              value: e,
              writable: !0,
              configurable: !0
            }
          }), Object.defineProperty(e, "prototype", {
            writable: !1
          }), t && w(e, t);
        }

        function v(e) {
          return v = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (e) {
            return e.__proto__ || Object.getPrototypeOf(e);
          }, v(e);
        }

        function w(e, t) {
          return w = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (e, t) {
            return e.__proto__ = t, e;
          }, w(e, t);
        }

        function b(e, t) {
          if (t && ("object" == typeof t || "function" == typeof t)) return t;
          if (void 0 !== t) throw new TypeError("Derived constructors may only return object or undefined");
          return function (e) {
            if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return e;
          }(e);
        }

        function k(e) {
          var t = function () {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;

            try {
              return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
            } catch (e) {
              return !1;
            }
          }();

          return function () {
            var n,
                r = v(e);

            if (t) {
              var i = v(this).constructor;
              n = Reflect.construct(r, arguments, i);
            } else n = r.apply(this, arguments);

            return b(this, n);
          };
        }

        function T(e, t) {
          return function (e) {
            if (Array.isArray(e)) return e;
          }(e) || function (e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null == n) return;
            var r,
                i,
                a = [],
                s = !0,
                o = !1;

            try {
              for (n = n.call(e); !(s = (r = n.next()).done) && (a.push(r.value), !t || a.length !== t); s = !0);
            } catch (e) {
              o = !0, i = e;
            } finally {
              try {
                s || null == n.return || n.return();
              } finally {
                if (o) throw i;
              }
            }

            return a;
          }(e, t) || N(e, t) || function () {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          }();
        }

        function I(e) {
          return function (e) {
            if (Array.isArray(e)) return x(e);
          }(e) || function (e) {
            if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e);
          }(e) || N(e) || function () {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          }();
        }

        function N(e, t) {
          if (e) {
            if ("string" == typeof e) return x(e, t);
            var n = Object.prototype.toString.call(e).slice(8, -1);
            return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? x(e, t) : void 0;
          }
        }

        function x(e, t) {
          (null == t || t > e.length) && (t = e.length);

          for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];

          return r;
        }

        var S = m(function e(t) {
          p(this, e), (a = s.default.create({
            baseURL: t,
            headers: {
              "Content-Type": "application/json;charset=UTF-8"
            },
            timeout: 1e4
          })).interceptors.request.use(function (e) {
            return e;
          }, function (e) {
            throw new Error(e);
          }), a.interceptors.response.use(function (e) {
            var t = e.data;
            if (0 !== t.code) throw new Error(t.msg);
            return t;
          }, function (e) {
            var t = e.response,
                n = t.status,
                r = t.data;
            if (200 !== n) throw new Error(r.message);
          });
        }),
            E = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.post("/api/pubkey/", t);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            L = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.post("/api/groups/", t);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            O = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/chats/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            D = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/group_members/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            B = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.post("/api/group_invitation/", t);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            F = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/messages/history/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            _ = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.post("/api/messages/status/", t);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            U = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/users/search/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            A = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/my_profile/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            j = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.post("/api/my_profile/", t);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            R = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/contacts/search/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            P = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/contacts/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            V = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.post("/api/contacts/add_friends/", t);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            C = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/contacts/add_friends/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            K = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.get("/api/contacts/friend_requests/", {
                    params: t
                  });

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            M = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.post("/api/contacts/friend_requests/", t);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            q = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, a.post("/api/notification/status/", t);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }();

        function G(e) {
          let t = typeof e;

          if ("object" == t) {
            if (Array.isArray(e)) return "array";
            if (null === e) return "null";
          }

          return t;
        }

        let W = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),
            X = [];

        for (let e = 0; e < W.length; e++) X[W[e].charCodeAt(0)] = e;

        var $, J;

        function Z() {
          let e = 0,
              t = 0;

          for (let n = 0; n < 28; n += 7) {
            let r = this.buf[this.pos++];
            if (e |= (127 & r) << n, 0 == (128 & r)) return this.assertBounds(), [e, t];
          }

          let n = this.buf[this.pos++];
          if (e |= (15 & n) << 28, t = (112 & n) >> 4, 0 == (128 & n)) return this.assertBounds(), [e, t];

          for (let n = 3; n <= 31; n += 7) {
            let r = this.buf[this.pos++];
            if (t |= (127 & r) << n, 0 == (128 & r)) return this.assertBounds(), [e, t];
          }

          throw new Error("invalid varint");
        }

        function Y(e, t, n) {
          for (let r = 0; r < 28; r += 7) {
            const i = e >>> r,
                  a = !(i >>> 7 == 0 && 0 == t),
                  s = 255 & (a ? 128 | i : i);
            if (n.push(s), !a) return;
          }

          const r = e >>> 28 & 15 | (7 & t) << 4,
                i = !(t >> 3 == 0);

          if (n.push(255 & (i ? 128 | r : r)), i) {
            for (let e = 3; e < 31; e += 7) {
              const r = t >>> e,
                    i = !(r >>> 7 == 0),
                    a = 255 & (i ? 128 | r : r);
              if (n.push(a), !i) return;
            }

            n.push(t >>> 31 & 1);
          }
        }

        X["-".charCodeAt(0)] = W.indexOf("+"), X["_".charCodeAt(0)] = W.indexOf("/"), function (e) {
          e.symbol = Symbol.for("protobuf-ts/unknown"), e.onRead = (n, r, i, a, s) => {
            (t(r) ? r[e.symbol] : r[e.symbol] = []).push({
              no: i,
              wireType: a,
              data: s
            });
          }, e.onWrite = (t, n, r) => {
            for (let {
              no: t,
              wireType: i,
              data: a
            } of e.list(n)) r.tag(t, i).raw(a);
          }, e.list = (n, r) => {
            if (t(n)) {
              let t = n[e.symbol];
              return r ? t.filter(e => e.no == r) : t;
            }

            return [];
          }, e.last = (t, n) => e.list(t, n).slice(-1)[0];

          const t = t => t && Array.isArray(t[e.symbol]);
        }($ || ($ = {})), function (e) {
          e[e.Varint = 0] = "Varint", e[e.Bit64 = 1] = "Bit64", e[e.LengthDelimited = 2] = "LengthDelimited", e[e.StartGroup = 3] = "StartGroup", e[e.EndGroup = 4] = "EndGroup", e[e.Bit32 = 5] = "Bit32";
        }(J || (J = {}));
        const H = 4294967296;

        function Q(e) {
          let t = "-" == e[0];
          t && (e = e.slice(1));
          const n = 1e6;
          let r = 0,
              i = 0;

          function a(t, a) {
            const s = Number(e.slice(t, a));
            i *= n, r = r * n + s, r >= H && (i += r / H | 0, r %= H);
          }

          return a(-24, -18), a(-18, -12), a(-12, -6), a(-6), [t, r, i];
        }

        function z(e, t) {
          if (t <= 2097151) return "" + (H * t + e);
          let n = (e >>> 24 | t << 8) >>> 0 & 16777215,
              r = t >> 16 & 65535,
              i = (16777215 & e) + 6777216 * n + 6710656 * r,
              a = n + 8147497 * r,
              s = 2 * r,
              o = 1e7;

          function u(e, t) {
            let n = e ? String(e) : "";
            return t ? "0000000".slice(n.length) + n : n;
          }

          return i >= o && (a += Math.floor(i / o), i %= o), a >= o && (s += Math.floor(a / o), a %= o), u(s, 0) + u(a, s) + u(i, 1);
        }

        function ee(e, t) {
          if (e >= 0) {
            for (; e > 127;) t.push(127 & e | 128), e >>>= 7;

            t.push(e);
          } else {
            for (let n = 0; n < 9; n++) t.push(127 & e | 128), e >>= 7;

            t.push(1);
          }
        }

        function te() {
          let e = this.buf[this.pos++],
              t = 127 & e;
          if (0 == (128 & e)) return this.assertBounds(), t;
          if (e = this.buf[this.pos++], t |= (127 & e) << 7, 0 == (128 & e)) return this.assertBounds(), t;
          if (e = this.buf[this.pos++], t |= (127 & e) << 14, 0 == (128 & e)) return this.assertBounds(), t;
          if (e = this.buf[this.pos++], t |= (127 & e) << 21, 0 == (128 & e)) return this.assertBounds(), t;
          e = this.buf[this.pos++], t |= (15 & e) << 28;

          for (let t = 5; 0 != (128 & e) && t < 10; t++) e = this.buf[this.pos++];

          if (0 != (128 & e)) throw new Error("invalid varint");
          return this.assertBounds(), t >>> 0;
        }

        const ne = function () {
          const e = new DataView(new ArrayBuffer(8));
          return void 0 !== globalThis.BigInt && "function" == typeof e.getBigInt64 && "function" == typeof e.getBigUint64 && "function" == typeof e.setBigInt64 && "function" == typeof e.setBigUint64 ? {
            MIN: BigInt("-9223372036854775808"),
            MAX: BigInt("9223372036854775807"),
            UMIN: BigInt("0"),
            UMAX: BigInt("18446744073709551615"),
            C: BigInt,
            V: e
          } : void 0;
        }();

        function re(e) {
          if (!e) throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
        }

        const ie = /^-?[0-9]+$/,
              ae = 4294967296;

        class se {
          constructor(e, t) {
            this.lo = 0 | e, this.hi = 0 | t;
          }

          isZero() {
            return 0 == this.lo && 0 == this.hi;
          }

          toNumber() {
            let e = this.hi * ae + (this.lo >>> 0);
            if (!Number.isSafeInteger(e)) throw new Error("cannot convert to safe number");
            return e;
          }

        }

        class oe extends se {
          static from(e) {
            if (ne) switch (typeof e) {
              case "string":
                if ("0" == e) return this.ZERO;
                if ("" == e) throw new Error("string is no integer");
                e = ne.C(e);

              case "number":
                if (0 === e) return this.ZERO;
                e = ne.C(e);

              case "bigint":
                if (!e) return this.ZERO;
                if (e < ne.UMIN) throw new Error("signed value for ulong");
                if (e > ne.UMAX) throw new Error("ulong too large");
                return ne.V.setBigUint64(0, e, !0), new oe(ne.V.getInt32(0, !0), ne.V.getInt32(4, !0));
            } else switch (typeof e) {
              case "string":
                if ("0" == e) return this.ZERO;
                if (e = e.trim(), !ie.test(e)) throw new Error("string is no integer");
                let [t, n, r] = Q(e);
                if (t) throw new Error("signed value");
                return new oe(n, r);

              case "number":
                if (0 == e) return this.ZERO;
                if (!Number.isSafeInteger(e)) throw new Error("number is no integer");
                if (e < 0) throw new Error("signed value for ulong");
                return new oe(e, e / ae);
            }
            throw new Error("unknown value " + typeof e);
          }

          toString() {
            return ne ? this.toBigInt().toString() : z(this.lo, this.hi);
          }

          toBigInt() {
            return re(ne), ne.V.setInt32(0, this.lo, !0), ne.V.setInt32(4, this.hi, !0), ne.V.getBigUint64(0, !0);
          }

        }

        oe.ZERO = new oe(0, 0);

        class ue extends se {
          static from(e) {
            if (ne) switch (typeof e) {
              case "string":
                if ("0" == e) return this.ZERO;
                if ("" == e) throw new Error("string is no integer");
                e = ne.C(e);

              case "number":
                if (0 === e) return this.ZERO;
                e = ne.C(e);

              case "bigint":
                if (!e) return this.ZERO;
                if (e < ne.MIN) throw new Error("ulong too small");
                if (e > ne.MAX) throw new Error("ulong too large");
                return ne.V.setBigInt64(0, e, !0), new ue(ne.V.getInt32(0, !0), ne.V.getInt32(4, !0));
            } else switch (typeof e) {
              case "string":
                if ("0" == e) return this.ZERO;
                if (e = e.trim(), !ie.test(e)) throw new Error("string is no integer");
                let [t, n, r] = Q(e),
                    i = new ue(n, r);
                return t ? i.negate() : i;

              case "number":
                if (0 == e) return this.ZERO;
                if (!Number.isSafeInteger(e)) throw new Error("number is no integer");
                return e > 0 ? new ue(e, e / ae) : new ue(-e, -e / ae).negate();
            }
            throw new Error("unknown value " + typeof e);
          }

          isNegative() {
            return 0 != (2147483648 & this.hi);
          }

          negate() {
            let e = ~this.hi,
                t = this.lo;
            return t ? t = 1 + ~t : e += 1, new ue(t, e);
          }

          toString() {
            if (ne) return this.toBigInt().toString();

            if (this.isNegative()) {
              let e = this.negate();
              return "-" + z(e.lo, e.hi);
            }

            return z(this.lo, this.hi);
          }

          toBigInt() {
            return re(ne), ne.V.setInt32(0, this.lo, !0), ne.V.setInt32(4, this.hi, !0), ne.V.getBigInt64(0, !0);
          }

        }

        ue.ZERO = new ue(0, 0);
        const ce = {
          readUnknownField: !0,
          readerFactory: e => new le(e)
        };

        class le {
          constructor(e, t) {
            this.varint64 = Z, this.uint32 = te, this.buf = e, this.len = e.length, this.pos = 0, this.view = new DataView(e.buffer, e.byteOffset, e.byteLength), this.textDecoder = null != t ? t : new TextDecoder("utf-8", {
              fatal: !0
            });
          }

          tag() {
            let e = this.uint32(),
                t = e >>> 3,
                n = 7 & e;
            if (t <= 0 || n < 0 || n > 5) throw new Error("illegal tag: field no " + t + " wire type " + n);
            return [t, n];
          }

          skip(e) {
            let t = this.pos;

            switch (e) {
              case J.Varint:
                for (; 128 & this.buf[this.pos++];);

                break;

              case J.Bit64:
                this.pos += 4;

              case J.Bit32:
                this.pos += 4;
                break;

              case J.LengthDelimited:
                let t = this.uint32();
                this.pos += t;
                break;

              case J.StartGroup:
                let n;

                for (; (n = this.tag()[1]) !== J.EndGroup;) this.skip(n);

                break;

              default:
                throw new Error("cant skip wire type " + e);
            }

            return this.assertBounds(), this.buf.subarray(t, this.pos);
          }

          assertBounds() {
            if (this.pos > this.len) throw new RangeError("premature EOF");
          }

          int32() {
            return 0 | this.uint32();
          }

          sint32() {
            let e = this.uint32();
            return e >>> 1 ^ -(1 & e);
          }

          int64() {
            return new ue(...this.varint64());
          }

          uint64() {
            return new oe(...this.varint64());
          }

          sint64() {
            let [e, t] = this.varint64(),
                n = -(1 & e);
            return e = (e >>> 1 | (1 & t) << 31) ^ n, t = t >>> 1 ^ n, new ue(e, t);
          }

          bool() {
            let [e, t] = this.varint64();
            return 0 !== e || 0 !== t;
          }

          fixed32() {
            return this.view.getUint32((this.pos += 4) - 4, !0);
          }

          sfixed32() {
            return this.view.getInt32((this.pos += 4) - 4, !0);
          }

          fixed64() {
            return new oe(this.sfixed32(), this.sfixed32());
          }

          sfixed64() {
            return new ue(this.sfixed32(), this.sfixed32());
          }

          float() {
            return this.view.getFloat32((this.pos += 4) - 4, !0);
          }

          double() {
            return this.view.getFloat64((this.pos += 8) - 8, !0);
          }

          bytes() {
            let e = this.uint32(),
                t = this.pos;
            return this.pos += e, this.assertBounds(), this.buf.subarray(t, t + e);
          }

          string() {
            return this.textDecoder.decode(this.bytes());
          }

        }

        function fe(e, t) {
          if (!e) throw new Error(t);
        }

        function he(e) {
          if ("number" != typeof e) throw new Error("invalid int 32: " + typeof e);
          if (!Number.isInteger(e) || e > 2147483647 || e < -2147483648) throw new Error("invalid int 32: " + e);
        }

        function pe(e) {
          if ("number" != typeof e) throw new Error("invalid uint 32: " + typeof e);
          if (!Number.isInteger(e) || e > 4294967295 || e < 0) throw new Error("invalid uint 32: " + e);
        }

        function de(e) {
          if ("number" != typeof e) throw new Error("invalid float 32: " + typeof e);
          if (Number.isFinite(e) && (e > 34028234663852886e22 || e < -34028234663852886e22)) throw new Error("invalid float 32: " + e);
        }

        const me = {
          writeUnknownFields: !0,
          writerFactory: () => new ge()
        };

        class ge {
          constructor(e) {
            this.stack = [], this.textEncoder = null != e ? e : new TextEncoder(), this.chunks = [], this.buf = [];
          }

          finish() {
            this.chunks.push(new Uint8Array(this.buf));
            let e = 0;

            for (let t = 0; t < this.chunks.length; t++) e += this.chunks[t].length;

            let t = new Uint8Array(e),
                n = 0;

            for (let e = 0; e < this.chunks.length; e++) t.set(this.chunks[e], n), n += this.chunks[e].length;

            return this.chunks = [], t;
          }

          fork() {
            return this.stack.push({
              chunks: this.chunks,
              buf: this.buf
            }), this.chunks = [], this.buf = [], this;
          }

          join() {
            let e = this.finish(),
                t = this.stack.pop();
            if (!t) throw new Error("invalid state, fork stack empty");
            return this.chunks = t.chunks, this.buf = t.buf, this.uint32(e.byteLength), this.raw(e);
          }

          tag(e, t) {
            return this.uint32((e << 3 | t) >>> 0);
          }

          raw(e) {
            return this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []), this.chunks.push(e), this;
          }

          uint32(e) {
            for (pe(e); e > 127;) this.buf.push(127 & e | 128), e >>>= 7;

            return this.buf.push(e), this;
          }

          int32(e) {
            return he(e), ee(e, this.buf), this;
          }

          bool(e) {
            return this.buf.push(e ? 1 : 0), this;
          }

          bytes(e) {
            return this.uint32(e.byteLength), this.raw(e);
          }

          string(e) {
            let t = this.textEncoder.encode(e);
            return this.uint32(t.byteLength), this.raw(t);
          }

          float(e) {
            de(e);
            let t = new Uint8Array(4);
            return new DataView(t.buffer).setFloat32(0, e, !0), this.raw(t);
          }

          double(e) {
            let t = new Uint8Array(8);
            return new DataView(t.buffer).setFloat64(0, e, !0), this.raw(t);
          }

          fixed32(e) {
            pe(e);
            let t = new Uint8Array(4);
            return new DataView(t.buffer).setUint32(0, e, !0), this.raw(t);
          }

          sfixed32(e) {
            he(e);
            let t = new Uint8Array(4);
            return new DataView(t.buffer).setInt32(0, e, !0), this.raw(t);
          }

          sint32(e) {
            return he(e), ee(e = (e << 1 ^ e >> 31) >>> 0, this.buf), this;
          }

          sfixed64(e) {
            let t = new Uint8Array(8),
                n = new DataView(t.buffer),
                r = ue.from(e);
            return n.setInt32(0, r.lo, !0), n.setInt32(4, r.hi, !0), this.raw(t);
          }

          fixed64(e) {
            let t = new Uint8Array(8),
                n = new DataView(t.buffer),
                r = oe.from(e);
            return n.setInt32(0, r.lo, !0), n.setInt32(4, r.hi, !0), this.raw(t);
          }

          int64(e) {
            let t = ue.from(e);
            return Y(t.lo, t.hi, this.buf), this;
          }

          sint64(e) {
            let t = ue.from(e),
                n = t.hi >> 31;
            return Y(t.lo << 1 ^ n, (t.hi << 1 | t.lo >>> 31) ^ n, this.buf), this;
          }

          uint64(e) {
            let t = oe.from(e);
            return Y(t.lo, t.hi, this.buf), this;
          }

        }

        const ye = {
          emitDefaultValues: !1,
          enumAsInteger: !1,
          useProtoFieldName: !1,
          prettySpaces: 0
        },
              ve = {
          ignoreUnknownFields: !1
        };
        const we = Symbol.for("protobuf-ts/message-type");

        function be(e) {
          let t = !1;
          const n = [];

          for (let r = 0; r < e.length; r++) {
            let i = e.charAt(r);
            "_" == i ? t = !0 : /\d/.test(i) ? (n.push(i), t = !0) : t ? (n.push(i.toUpperCase()), t = !1) : 0 == r ? n.push(i.toLowerCase()) : n.push(i);
          }

          return n.join("");
        }

        var ke, Te, Ie;

        function Ne(e) {
          var t, n, r, i;
          return e.localName = null !== (t = e.localName) && void 0 !== t ? t : be(e.name), e.jsonName = null !== (n = e.jsonName) && void 0 !== n ? n : be(e.name), e.repeat = null !== (r = e.repeat) && void 0 !== r ? r : Ie.NO, e.opt = null !== (i = e.opt) && void 0 !== i ? i : !e.repeat && !e.oneof && "message" == e.kind, e;
        }

        function xe(e) {
          if ("object" != typeof e || null === e || !e.hasOwnProperty("oneofKind")) return !1;

          switch (typeof e.oneofKind) {
            case "string":
              return void 0 !== e[e.oneofKind] && 2 == Object.keys(e).length;

            case "undefined":
              return 1 == Object.keys(e).length;

            default:
              return !1;
          }
        }

        !function (e) {
          e[e.DOUBLE = 1] = "DOUBLE", e[e.FLOAT = 2] = "FLOAT", e[e.INT64 = 3] = "INT64", e[e.UINT64 = 4] = "UINT64", e[e.INT32 = 5] = "INT32", e[e.FIXED64 = 6] = "FIXED64", e[e.FIXED32 = 7] = "FIXED32", e[e.BOOL = 8] = "BOOL", e[e.STRING = 9] = "STRING", e[e.BYTES = 12] = "BYTES", e[e.UINT32 = 13] = "UINT32", e[e.SFIXED32 = 15] = "SFIXED32", e[e.SFIXED64 = 16] = "SFIXED64", e[e.SINT32 = 17] = "SINT32", e[e.SINT64 = 18] = "SINT64";
        }(ke || (ke = {})), function (e) {
          e[e.BIGINT = 0] = "BIGINT", e[e.STRING = 1] = "STRING", e[e.NUMBER = 2] = "NUMBER";
        }(Te || (Te = {})), function (e) {
          e[e.NO = 0] = "NO", e[e.PACKED = 1] = "PACKED", e[e.UNPACKED = 2] = "UNPACKED";
        }(Ie || (Ie = {}));

        class Se {
          constructor(e) {
            var t;
            this.fields = null !== (t = e.fields) && void 0 !== t ? t : [];
          }

          prepare() {
            if (this.data) return;
            const e = [],
                  t = [],
                  n = [];

            for (let r of this.fields) if (r.oneof) n.includes(r.oneof) || (n.push(r.oneof), e.push(r.oneof), t.push(r.oneof));else switch (t.push(r.localName), r.kind) {
              case "scalar":
              case "enum":
                r.opt && !r.repeat || e.push(r.localName);
                break;

              case "message":
                r.repeat && e.push(r.localName);
                break;

              case "map":
                e.push(r.localName);
            }

            this.data = {
              req: e,
              known: t,
              oneofs: Object.values(n)
            };
          }

          is(e, t, n = !1) {
            if (t < 0) return !0;
            if (null == e || "object" != typeof e) return !1;
            this.prepare();
            let r = Object.keys(e),
                i = this.data;
            if (r.length < i.req.length || i.req.some(e => !r.includes(e))) return !1;
            if (!n && r.some(e => !i.known.includes(e))) return !1;
            if (t < 1) return !0;

            for (const r of i.oneofs) {
              const i = e[r];
              if (!xe(i)) return !1;
              if (void 0 === i.oneofKind) continue;
              const a = this.fields.find(e => e.localName === i.oneofKind);
              if (!a) return !1;
              if (!this.field(i[i.oneofKind], a, n, t)) return !1;
            }

            for (const r of this.fields) if (void 0 === r.oneof && !this.field(e[r.localName], r, n, t)) return !1;

            return !0;
          }

          field(e, t, n, r) {
            let i = t.repeat;

            switch (t.kind) {
              case "scalar":
                return void 0 === e ? t.opt : i ? this.scalars(e, t.T, r, t.L) : this.scalar(e, t.T, t.L);

              case "enum":
                return void 0 === e ? t.opt : i ? this.scalars(e, ke.INT32, r) : this.scalar(e, ke.INT32);

              case "message":
                return void 0 === e || (i ? this.messages(e, t.T(), n, r) : this.message(e, t.T(), n, r));

              case "map":
                if ("object" != typeof e || null === e) return !1;
                if (r < 2) return !0;
                if (!this.mapKeys(e, t.K, r)) return !1;

                switch (t.V.kind) {
                  case "scalar":
                    return this.scalars(Object.values(e), t.V.T, r, t.V.L);

                  case "enum":
                    return this.scalars(Object.values(e), ke.INT32, r);

                  case "message":
                    return this.messages(Object.values(e), t.V.T(), n, r);
                }

            }

            return !0;
          }

          message(e, t, n, r) {
            return n ? t.isAssignable(e, r) : t.is(e, r);
          }

          messages(e, t, n, r) {
            if (!Array.isArray(e)) return !1;
            if (r < 2) return !0;

            if (n) {
              for (let n = 0; n < e.length && n < r; n++) if (!t.isAssignable(e[n], r - 1)) return !1;
            } else for (let n = 0; n < e.length && n < r; n++) if (!t.is(e[n], r - 1)) return !1;

            return !0;
          }

          scalar(e, t, n) {
            let r = typeof e;

            switch (t) {
              case ke.UINT64:
              case ke.FIXED64:
              case ke.INT64:
              case ke.SFIXED64:
              case ke.SINT64:
                switch (n) {
                  case Te.BIGINT:
                    return "bigint" == r;

                  case Te.NUMBER:
                    return "number" == r && !isNaN(e);

                  default:
                    return "string" == r;
                }

              case ke.BOOL:
                return "boolean" == r;

              case ke.STRING:
                return "string" == r;

              case ke.BYTES:
                return e instanceof Uint8Array;

              case ke.DOUBLE:
              case ke.FLOAT:
                return "number" == r && !isNaN(e);

              default:
                return "number" == r && Number.isInteger(e);
            }
          }

          scalars(e, t, n, r) {
            if (!Array.isArray(e)) return !1;
            if (n < 2) return !0;
            if (Array.isArray(e)) for (let i = 0; i < e.length && i < n; i++) if (!this.scalar(e[i], t, r)) return !1;
            return !0;
          }

          mapKeys(e, t, n) {
            let r = Object.keys(e);

            switch (t) {
              case ke.INT32:
              case ke.FIXED32:
              case ke.SFIXED32:
              case ke.SINT32:
              case ke.UINT32:
                return this.scalars(r.slice(0, n).map(e => parseInt(e)), t, n);

              case ke.BOOL:
                return this.scalars(r.slice(0, n).map(e => "true" == e || "false" != e && e), t, n);

              default:
                return this.scalars(r, t, n, Te.STRING);
            }
          }

        }

        function Ee(e, t) {
          switch (t) {
            case Te.BIGINT:
              return e.toBigInt();

            case Te.NUMBER:
              return e.toNumber();

            default:
              return e.toString();
          }
        }

        class Le {
          constructor(e) {
            this.info = e;
          }

          prepare() {
            var e;

            if (void 0 === this.fMap) {
              this.fMap = {};
              const t = null !== (e = this.info.fields) && void 0 !== e ? e : [];

              for (const e of t) this.fMap[e.name] = e, this.fMap[e.jsonName] = e, this.fMap[e.localName] = e;
            }
          }

          assert(e, t, n) {
            if (!e) {
              let e = G(n);
              throw "number" != e && "boolean" != e || (e = n.toString()), new Error(`Cannot parse JSON ${e} for ${this.info.typeName}#${t}`);
            }
          }

          read(e, t, n) {
            this.prepare();
            const r = [];

            for (const [a, s] of Object.entries(e)) {
              const e = this.fMap[a];

              if (!e) {
                if (!n.ignoreUnknownFields) throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${a}`);
                continue;
              }

              const o = e.localName;
              let u;

              if (e.oneof) {
                if (r.includes(e.oneof)) throw new Error(`Multiple members of the oneof group "${e.oneof}" of ${this.info.typeName} are present in JSON.`);
                r.push(e.oneof), u = t[e.oneof] = {
                  oneofKind: o
                };
              } else u = t;

              if ("map" == e.kind) {
                if (null === s) continue;
                this.assert(null !== (i = s) && "object" == typeof i && !Array.isArray(i), e.name, s);
                const t = u[o];

                for (const [r, i] of Object.entries(s)) {
                  let a;

                  switch (this.assert(null !== i, e.name + " map value", null), e.V.kind) {
                    case "message":
                      a = e.V.T().internalJsonRead(i, n);
                      break;

                    case "enum":
                      if (a = this.enum(e.V.T(), i, e.name, n.ignoreUnknownFields), !1 === a) continue;
                      break;

                    case "scalar":
                      a = this.scalar(i, e.V.T, e.V.L, e.name);
                  }

                  this.assert(void 0 !== a, e.name + " map value", i);
                  let s = r;
                  e.K == ke.BOOL && (s = "true" == s || "false" != s && s), s = this.scalar(s, e.K, Te.STRING, e.name).toString(), t[s] = a;
                }
              } else if (e.repeat) {
                if (null === s) continue;
                this.assert(Array.isArray(s), e.name, s);
                const t = u[o];

                for (const r of s) {
                  let i;

                  switch (this.assert(null !== r, e.name, null), e.kind) {
                    case "message":
                      i = e.T().internalJsonRead(r, n);
                      break;

                    case "enum":
                      if (i = this.enum(e.T(), r, e.name, n.ignoreUnknownFields), !1 === i) continue;
                      break;

                    case "scalar":
                      i = this.scalar(r, e.T, e.L, e.name);
                  }

                  this.assert(void 0 !== i, e.name, s), t.push(i);
                }
              } else switch (e.kind) {
                case "message":
                  if (null === s && "google.protobuf.Value" != e.T().typeName) {
                    this.assert(void 0 === e.oneof, e.name + " (oneof member)", null);
                    continue;
                  }

                  u[o] = e.T().internalJsonRead(s, n, u[o]);
                  break;

                case "enum":
                  let t = this.enum(e.T(), s, e.name, n.ignoreUnknownFields);
                  if (!1 === t) continue;
                  u[o] = t;
                  break;

                case "scalar":
                  u[o] = this.scalar(s, e.T, e.L, e.name);
              }
            }

            var i;
          }

          enum(e, t, n, r) {
            if ("google.protobuf.NullValue" == e[0] && fe(null === t, `Unable to parse field ${this.info.typeName}#${n}, enum ${e[0]} only accepts null.`), null === t) return 0;

            switch (typeof t) {
              case "number":
                return fe(Number.isInteger(t), `Unable to parse field ${this.info.typeName}#${n}, enum can only be integral number, got ${t}.`), t;

              case "string":
                let i = t;
                e[2] && t.substring(0, e[2].length) === e[2] && (i = t.substring(e[2].length));
                let a = e[1][i];
                return (void 0 !== a || !r) && (fe("number" == typeof a, `Unable to parse field ${this.info.typeName}#${n}, enum ${e[0]} has no value for "${t}".`), a);
            }

            fe(!1, `Unable to parse field ${this.info.typeName}#${n}, cannot parse enum value from ${typeof t}".`);
          }

          scalar(e, t, n, r) {
            let i;

            try {
              switch (t) {
                case ke.DOUBLE:
                case ke.FLOAT:
                  if (null === e) return 0;
                  if ("NaN" === e) return Number.NaN;
                  if ("Infinity" === e) return Number.POSITIVE_INFINITY;
                  if ("-Infinity" === e) return Number.NEGATIVE_INFINITY;

                  if ("" === e) {
                    i = "empty string";
                    break;
                  }

                  if ("string" == typeof e && e.trim().length !== e.length) {
                    i = "extra whitespace";
                    break;
                  }

                  if ("string" != typeof e && "number" != typeof e) break;
                  let r = Number(e);

                  if (Number.isNaN(r)) {
                    i = "not a number";
                    break;
                  }

                  if (!Number.isFinite(r)) {
                    i = "too large or small";
                    break;
                  }

                  return t == ke.FLOAT && de(r), r;

                case ke.INT32:
                case ke.FIXED32:
                case ke.SFIXED32:
                case ke.SINT32:
                case ke.UINT32:
                  if (null === e) return 0;
                  let a;
                  if ("number" == typeof e ? a = e : "" === e ? i = "empty string" : "string" == typeof e && (e.trim().length !== e.length ? i = "extra whitespace" : a = Number(e)), void 0 === a) break;
                  return t == ke.UINT32 ? pe(a) : he(a), a;

                case ke.INT64:
                case ke.SFIXED64:
                case ke.SINT64:
                  if (null === e) return Ee(ue.ZERO, n);
                  if ("number" != typeof e && "string" != typeof e) break;
                  return Ee(ue.from(e), n);

                case ke.FIXED64:
                case ke.UINT64:
                  if (null === e) return Ee(oe.ZERO, n);
                  if ("number" != typeof e && "string" != typeof e) break;
                  return Ee(oe.from(e), n);

                case ke.BOOL:
                  if (null === e) return !1;
                  if ("boolean" != typeof e) break;
                  return e;

                case ke.STRING:
                  if (null === e) return "";

                  if ("string" != typeof e) {
                    i = "extra whitespace";
                    break;
                  }

                  try {
                    encodeURIComponent(e);
                  } catch (i) {
                    i = "invalid UTF8";
                    break;
                  }

                  return e;

                case ke.BYTES:
                  if (null === e || "" === e) return new Uint8Array(0);
                  if ("string" != typeof e) break;
                  return function (e) {
                    let t = 3 * e.length / 4;
                    "=" == e[e.length - 2] ? t -= 2 : "=" == e[e.length - 1] && (t -= 1);
                    let n,
                        r = new Uint8Array(t),
                        i = 0,
                        a = 0,
                        s = 0;

                    for (let t = 0; t < e.length; t++) {
                      if (n = X[e.charCodeAt(t)], void 0 === n) switch (e[t]) {
                        case "=":
                          a = 0;

                        case "\n":
                        case "\r":
                        case "\t":
                        case " ":
                          continue;

                        default:
                          throw Error("invalid base64 string.");
                      }

                      switch (a) {
                        case 0:
                          s = n, a = 1;
                          break;

                        case 1:
                          r[i++] = s << 2 | (48 & n) >> 4, s = n, a = 2;
                          break;

                        case 2:
                          r[i++] = (15 & s) << 4 | (60 & n) >> 2, s = n, a = 3;
                          break;

                        case 3:
                          r[i++] = (3 & s) << 6 | n, a = 0;
                      }
                    }

                    if (1 == a) throw Error("invalid base64 string.");
                    return r.subarray(0, i);
                  }(e);
              }
            } catch (e) {
              i = e.message;
            }

            this.assert(!1, r + (i ? " - " + i : ""), e);
          }

        }

        class Oe {
          constructor(e) {
            var t;
            this.fields = null !== (t = e.fields) && void 0 !== t ? t : [];
          }

          write(e, t) {
            const n = {},
                  r = e;

            for (const e of this.fields) {
              if (!e.oneof) {
                let i = this.field(e, r[e.localName], t);
                void 0 !== i && (n[t.useProtoFieldName ? e.name : e.jsonName] = i);
                continue;
              }

              const i = r[e.oneof];
              if (i.oneofKind !== e.localName) continue;
              const a = "scalar" == e.kind || "enum" == e.kind ? Object.assign(Object.assign({}, t), {
                emitDefaultValues: !0
              }) : t;
              let s = this.field(e, i[e.localName], a);
              fe(void 0 !== s), n[t.useProtoFieldName ? e.name : e.jsonName] = s;
            }

            return n;
          }

          field(e, t, n) {
            let r;

            if ("map" == e.kind) {
              fe("object" == typeof t && null !== t);
              const i = {};

              switch (e.V.kind) {
                case "scalar":
                  for (const [n, r] of Object.entries(t)) {
                    const t = this.scalar(e.V.T, r, e.name, !1, !0);
                    fe(void 0 !== t), i[n.toString()] = t;
                  }

                  break;

                case "message":
                  const r = e.V.T();

                  for (const [a, s] of Object.entries(t)) {
                    const t = this.message(r, s, e.name, n);
                    fe(void 0 !== t), i[a.toString()] = t;
                  }

                  break;

                case "enum":
                  const a = e.V.T();

                  for (const [r, s] of Object.entries(t)) {
                    fe(void 0 === s || "number" == typeof s);
                    const t = this.enum(a, s, e.name, !1, !0, n.enumAsInteger);
                    fe(void 0 !== t), i[r.toString()] = t;
                  }

              }

              (n.emitDefaultValues || Object.keys(i).length > 0) && (r = i);
            } else if (e.repeat) {
              fe(Array.isArray(t));
              const i = [];

              switch (e.kind) {
                case "scalar":
                  for (let n = 0; n < t.length; n++) {
                    const r = this.scalar(e.T, t[n], e.name, e.opt, !0);
                    fe(void 0 !== r), i.push(r);
                  }

                  break;

                case "enum":
                  const r = e.T();

                  for (let a = 0; a < t.length; a++) {
                    fe(void 0 === t[a] || "number" == typeof t[a]);
                    const s = this.enum(r, t[a], e.name, e.opt, !0, n.enumAsInteger);
                    fe(void 0 !== s), i.push(s);
                  }

                  break;

                case "message":
                  const a = e.T();

                  for (let r = 0; r < t.length; r++) {
                    const s = this.message(a, t[r], e.name, n);
                    fe(void 0 !== s), i.push(s);
                  }

              }

              (n.emitDefaultValues || i.length > 0 || n.emitDefaultValues) && (r = i);
            } else switch (e.kind) {
              case "scalar":
                r = this.scalar(e.T, t, e.name, e.opt, n.emitDefaultValues);
                break;

              case "enum":
                r = this.enum(e.T(), t, e.name, e.opt, n.emitDefaultValues, n.enumAsInteger);
                break;

              case "message":
                r = this.message(e.T(), t, e.name, n);
            }

            return r;
          }

          enum(e, t, n, r, i, a) {
            if ("google.protobuf.NullValue" == e[0]) return null;

            if (void 0 !== t) {
              if (0 !== t || i || r) return fe("number" == typeof t), fe(Number.isInteger(t)), a || !e[1].hasOwnProperty(t) ? t : e[2] ? e[2] + e[1][t] : e[1][t];
            } else fe(r);
          }

          message(e, t, n, r) {
            return void 0 === t ? r.emitDefaultValues ? null : void 0 : e.internalJsonWrite(t, r);
          }

          scalar(e, t, n, r, i) {
            if (void 0 === t) return void fe(r);
            const a = i || r;

            switch (e) {
              case ke.INT32:
              case ke.SFIXED32:
              case ke.SINT32:
                return 0 === t ? a ? 0 : void 0 : (he(t), t);

              case ke.FIXED32:
              case ke.UINT32:
                return 0 === t ? a ? 0 : void 0 : (pe(t), t);

              case ke.FLOAT:
                de(t);

              case ke.DOUBLE:
                return 0 === t ? a ? 0 : void 0 : (fe("number" == typeof t), Number.isNaN(t) ? "NaN" : t === Number.POSITIVE_INFINITY ? "Infinity" : t === Number.NEGATIVE_INFINITY ? "-Infinity" : t);

              case ke.STRING:
                return "" === t ? a ? "" : void 0 : (fe("string" == typeof t), t);

              case ke.BOOL:
                return !1 === t ? !a && void 0 : (fe("boolean" == typeof t), t);

              case ke.UINT64:
              case ke.FIXED64:
                fe("number" == typeof t || "string" == typeof t || "bigint" == typeof t);
                let e = oe.from(t);
                if (e.isZero() && !a) return;
                return e.toString();

              case ke.INT64:
              case ke.SFIXED64:
              case ke.SINT64:
                fe("number" == typeof t || "string" == typeof t || "bigint" == typeof t);
                let n = ue.from(t);
                if (n.isZero() && !a) return;
                return n.toString();

              case ke.BYTES:
                return fe(t instanceof Uint8Array), t.byteLength ? function (e) {
                  let t,
                      n = "",
                      r = 0,
                      i = 0;

                  for (let a = 0; a < e.length; a++) switch (t = e[a], r) {
                    case 0:
                      n += W[t >> 2], i = (3 & t) << 4, r = 1;
                      break;

                    case 1:
                      n += W[i | t >> 4], i = (15 & t) << 2, r = 2;
                      break;

                    case 2:
                      n += W[i | t >> 6], n += W[63 & t], r = 0;
                  }

                  return r && (n += W[i], n += "=", 1 == r && (n += "=")), n;
                }(t) : a ? "" : void 0;
            }
          }

        }

        function De(e, t = Te.STRING) {
          switch (e) {
            case ke.BOOL:
              return !1;

            case ke.UINT64:
            case ke.FIXED64:
              return Ee(oe.ZERO, t);

            case ke.INT64:
            case ke.SFIXED64:
            case ke.SINT64:
              return Ee(ue.ZERO, t);

            case ke.DOUBLE:
            case ke.FLOAT:
              return 0;

            case ke.BYTES:
              return new Uint8Array(0);

            case ke.STRING:
              return "";

            default:
              return 0;
          }
        }

        class Be {
          constructor(e) {
            this.info = e;
          }

          prepare() {
            var e;

            if (!this.fieldNoToField) {
              const t = null !== (e = this.info.fields) && void 0 !== e ? e : [];
              this.fieldNoToField = new Map(t.map(e => [e.no, e]));
            }
          }

          read(e, t, n, r) {
            this.prepare();
            const i = void 0 === r ? e.len : e.pos + r;

            for (; e.pos < i;) {
              const [r, i] = e.tag(),
                    a = this.fieldNoToField.get(r);

              if (!a) {
                let a = n.readUnknownField;
                if ("throw" == a) throw new Error(`Unknown field ${r} (wire type ${i}) for ${this.info.typeName}`);
                let s = e.skip(i);
                !1 !== a && (!0 === a ? $.onRead : a)(this.info.typeName, t, r, i, s);
                continue;
              }

              let s = t,
                  o = a.repeat,
                  u = a.localName;

              switch (a.oneof && (s = s[a.oneof], s.oneofKind !== u && (s = t[a.oneof] = {
                oneofKind: u
              })), a.kind) {
                case "scalar":
                case "enum":
                  let t = "enum" == a.kind ? ke.INT32 : a.T,
                      r = "scalar" == a.kind ? a.L : void 0;

                  if (o) {
                    let n = s[u];

                    if (i == J.LengthDelimited && t != ke.STRING && t != ke.BYTES) {
                      let i = e.uint32() + e.pos;

                      for (; e.pos < i;) n.push(this.scalar(e, t, r));
                    } else n.push(this.scalar(e, t, r));
                  } else s[u] = this.scalar(e, t, r);

                  break;

                case "message":
                  if (o) {
                    let t = s[u],
                        r = a.T().internalBinaryRead(e, e.uint32(), n);
                    t.push(r);
                  } else s[u] = a.T().internalBinaryRead(e, e.uint32(), n, s[u]);

                  break;

                case "map":
                  let [c, l] = this.mapEntry(a, e, n);
                  s[u][c] = l;
              }
            }
          }

          mapEntry(e, t, n) {
            let r,
                i,
                a = t.uint32(),
                s = t.pos + a;

            for (; t.pos < s;) {
              let [a, s] = t.tag();

              switch (a) {
                case 1:
                  r = e.K == ke.BOOL ? t.bool().toString() : this.scalar(t, e.K, Te.STRING);
                  break;

                case 2:
                  switch (e.V.kind) {
                    case "scalar":
                      i = this.scalar(t, e.V.T, e.V.L);
                      break;

                    case "enum":
                      i = t.int32();
                      break;

                    case "message":
                      i = e.V.T().internalBinaryRead(t, t.uint32(), n);
                  }

                  break;

                default:
                  throw new Error(`Unknown field ${a} (wire type ${s}) in map entry for ${this.info.typeName}#${e.name}`);
              }
            }

            if (void 0 === r) {
              let t = De(e.K);
              r = e.K == ke.BOOL ? t.toString() : t;
            }

            if (void 0 === i) switch (e.V.kind) {
              case "scalar":
                i = De(e.V.T, e.V.L);
                break;

              case "enum":
                i = 0;
                break;

              case "message":
                i = e.V.T().create();
            }
            return [r, i];
          }

          scalar(e, t, n) {
            switch (t) {
              case ke.INT32:
                return e.int32();

              case ke.STRING:
                return e.string();

              case ke.BOOL:
                return e.bool();

              case ke.DOUBLE:
                return e.double();

              case ke.FLOAT:
                return e.float();

              case ke.INT64:
                return Ee(e.int64(), n);

              case ke.UINT64:
                return Ee(e.uint64(), n);

              case ke.FIXED64:
                return Ee(e.fixed64(), n);

              case ke.FIXED32:
                return e.fixed32();

              case ke.BYTES:
                return e.bytes();

              case ke.UINT32:
                return e.uint32();

              case ke.SFIXED32:
                return e.sfixed32();

              case ke.SFIXED64:
                return Ee(e.sfixed64(), n);

              case ke.SINT32:
                return e.sint32();

              case ke.SINT64:
                return Ee(e.sint64(), n);
            }
          }

        }

        class Fe {
          constructor(e) {
            this.info = e;
          }

          prepare() {
            if (!this.fields) {
              const e = this.info.fields ? this.info.fields.concat() : [];
              this.fields = e.sort((e, t) => e.no - t.no);
            }
          }

          write(e, t, n) {
            this.prepare();

            for (const r of this.fields) {
              let i,
                  a,
                  s = r.repeat,
                  o = r.localName;

              if (r.oneof) {
                const t = e[r.oneof];
                if (t.oneofKind !== o) continue;
                i = t[o], a = !0;
              } else i = e[o], a = !1;

              switch (r.kind) {
                case "scalar":
                case "enum":
                  let e = "enum" == r.kind ? ke.INT32 : r.T;
                  if (s) {
                    if (fe(Array.isArray(i)), s == Ie.PACKED) this.packed(t, e, r.no, i);else for (const n of i) this.scalar(t, e, r.no, n, !0);
                  } else void 0 === i ? fe(r.opt) : this.scalar(t, e, r.no, i, a || r.opt);
                  break;

                case "message":
                  if (s) {
                    fe(Array.isArray(i));

                    for (const e of i) this.message(t, n, r.T(), r.no, e);
                  } else this.message(t, n, r.T(), r.no, i);

                  break;

                case "map":
                  fe("object" == typeof i && null !== i);

                  for (const [e, a] of Object.entries(i)) this.mapEntry(t, n, r, e, a);

              }
            }

            let r = n.writeUnknownFields;
            !1 !== r && (!0 === r ? $.onWrite : r)(this.info.typeName, e, t);
          }

          mapEntry(e, t, n, r, i) {
            e.tag(n.no, J.LengthDelimited), e.fork();
            let a = r;

            switch (n.K) {
              case ke.INT32:
              case ke.FIXED32:
              case ke.UINT32:
              case ke.SFIXED32:
              case ke.SINT32:
                a = Number.parseInt(r);
                break;

              case ke.BOOL:
                fe("true" == r || "false" == r), a = "true" == r;
            }

            switch (this.scalar(e, n.K, 1, a, !0), n.V.kind) {
              case "scalar":
                this.scalar(e, n.V.T, 2, i, !0);
                break;

              case "enum":
                this.scalar(e, ke.INT32, 2, i, !0);
                break;

              case "message":
                this.message(e, t, n.V.T(), 2, i);
            }

            e.join();
          }

          message(e, t, n, r, i) {
            void 0 !== i && (n.internalBinaryWrite(i, e.tag(r, J.LengthDelimited).fork(), t), e.join());
          }

          scalar(e, t, n, r, i) {
            let [a, s, o] = this.scalarInfo(t, r);
            o && !i || (e.tag(n, a), e[s](r));
          }

          packed(e, t, n, r) {
            if (!r.length) return;
            fe(t !== ke.BYTES && t !== ke.STRING), e.tag(n, J.LengthDelimited), e.fork();
            let [, i] = this.scalarInfo(t);

            for (let t = 0; t < r.length; t++) e[i](r[t]);

            e.join();
          }

          scalarInfo(e, t) {
            let n,
                r = J.Varint,
                i = void 0 === t,
                a = 0 === t;

            switch (e) {
              case ke.INT32:
                n = "int32";
                break;

              case ke.STRING:
                a = i || !t.length, r = J.LengthDelimited, n = "string";
                break;

              case ke.BOOL:
                a = !1 === t, n = "bool";
                break;

              case ke.UINT32:
                n = "uint32";
                break;

              case ke.DOUBLE:
                r = J.Bit64, n = "double";
                break;

              case ke.FLOAT:
                r = J.Bit32, n = "float";
                break;

              case ke.INT64:
                a = i || ue.from(t).isZero(), n = "int64";
                break;

              case ke.UINT64:
                a = i || oe.from(t).isZero(), n = "uint64";
                break;

              case ke.FIXED64:
                a = i || oe.from(t).isZero(), r = J.Bit64, n = "fixed64";
                break;

              case ke.BYTES:
                a = i || !t.byteLength, r = J.LengthDelimited, n = "bytes";
                break;

              case ke.FIXED32:
                r = J.Bit32, n = "fixed32";
                break;

              case ke.SFIXED32:
                r = J.Bit32, n = "sfixed32";
                break;

              case ke.SFIXED64:
                a = i || ue.from(t).isZero(), r = J.Bit64, n = "sfixed64";
                break;

              case ke.SINT32:
                n = "sint32";
                break;

              case ke.SINT64:
                a = i || ue.from(t).isZero(), n = "sint64";
            }

            return [r, n, i || a];
          }

        }

        function _e(e, t, n) {
          let r,
              i,
              a = n;

          for (let n of e.fields) {
            let e = n.localName;

            if (n.oneof) {
              const s = a[n.oneof];
              if (null == s) continue;

              if (r = s[e], i = t[n.oneof], i.oneofKind = s.oneofKind, null == r) {
                delete i[e];
                continue;
              }
            } else if (r = a[e], i = t, null == r) continue;

            switch (n.kind) {
              case "scalar":
              case "enum":
                n.repeat ? i[e] = r.concat() : i[e] = r;
                break;

              case "message":
                let t = n.T();
                if (n.repeat) for (let n = 0; n < r.length; n++) i[e][n] = t.create(r[n]);else void 0 === i[e] ? i[e] = t.create(r) : t.mergePartial(i[e], r);
                break;

              case "map":
                switch (n.V.kind) {
                  case "scalar":
                  case "enum":
                    Object.assign(i[e], r);
                    break;

                  case "message":
                    let t = n.V.T();

                    for (let n of Object.keys(r)) i[e][n] = t.create(r[n]);

                }

            }
          }
        }

        const Ue = Object.values;

        function Ae(e, t, n) {
          if (t === n) return !0;
          if (e !== ke.BYTES) return !1;
          let r = t,
              i = n;
          if (r.length !== i.length) return !1;

          for (let e = 0; e < r.length; e++) if (r[e] != i[e]) return !1;

          return !0;
        }

        function je(e, t, n) {
          if (t.length !== n.length) return !1;

          for (let r = 0; r < t.length; r++) if (!Ae(e, t[r], n[r])) return !1;

          return !0;
        }

        function Re(e, t, n) {
          if (t.length !== n.length) return !1;

          for (let r = 0; r < t.length; r++) if (!e.equals(t[r], n[r])) return !1;

          return !0;
        }

        class Pe {
          constructor(e, t, n) {
            this.defaultCheckDepth = 16, this.typeName = e, this.fields = t.map(Ne), this.options = null != n ? n : {}, this.refTypeCheck = new Se(this), this.refJsonReader = new Le(this), this.refJsonWriter = new Oe(this), this.refBinReader = new Be(this), this.refBinWriter = new Fe(this);
          }

          create(e) {
            let t = function (e) {
              const t = {};
              Object.defineProperty(t, we, {
                enumerable: !1,
                value: e
              });

              for (let n of e.fields) {
                let e = n.localName;
                if (!n.opt) if (n.oneof) t[n.oneof] = {
                  oneofKind: void 0
                };else if (n.repeat) t[e] = [];else switch (n.kind) {
                  case "scalar":
                    t[e] = De(n.T, n.L);
                    break;

                  case "enum":
                    t[e] = 0;
                    break;

                  case "map":
                    t[e] = {};
                }
              }

              return t;
            }(this);

            return void 0 !== e && _e(this, t, e), t;
          }

          clone(e) {
            let t = this.create();
            return _e(this, t, e), t;
          }

          equals(e, t) {
            return function (e, t, n) {
              if (t === n) return !0;
              if (!t || !n) return !1;

              for (let r of e.fields) {
                let e = r.localName,
                    i = r.oneof ? t[r.oneof][e] : t[e],
                    a = r.oneof ? n[r.oneof][e] : n[e];

                switch (r.kind) {
                  case "enum":
                  case "scalar":
                    let e = "enum" == r.kind ? ke.INT32 : r.T;
                    if (!(r.repeat ? je(e, i, a) : Ae(e, i, a))) return !1;
                    break;

                  case "map":
                    if (!("message" == r.V.kind ? Re(r.V.T(), Ue(i), Ue(a)) : je("enum" == r.V.kind ? ke.INT32 : r.V.T, Ue(i), Ue(a)))) return !1;
                    break;

                  case "message":
                    let t = r.T();
                    if (!(r.repeat ? Re(t, i, a) : t.equals(i, a))) return !1;
                }
              }

              return !0;
            }(this, e, t);
          }

          is(e, t = this.defaultCheckDepth) {
            return this.refTypeCheck.is(e, t, !1);
          }

          isAssignable(e, t = this.defaultCheckDepth) {
            return this.refTypeCheck.is(e, t, !0);
          }

          mergePartial(e, t) {
            _e(this, e, t);
          }

          fromBinary(e, t) {
            let n = function (e) {
              return e ? Object.assign(Object.assign({}, ce), e) : ce;
            }(t);

            return this.internalBinaryRead(n.readerFactory(e), e.byteLength, n);
          }

          fromJson(e, t) {
            return this.internalJsonRead(e, function (e) {
              return e ? Object.assign(Object.assign({}, ve), e) : ve;
            }(t));
          }

          fromJsonString(e, t) {
            let n = JSON.parse(e);
            return this.fromJson(n, t);
          }

          toJson(e, t) {
            return this.internalJsonWrite(e, function (e) {
              return e ? Object.assign(Object.assign({}, ye), e) : ye;
            }(t));
          }

          toJsonString(e, t) {
            var n;
            let r = this.toJson(e, t);
            return JSON.stringify(r, null, null !== (n = null == t ? void 0 : t.prettySpaces) && void 0 !== n ? n : 0);
          }

          toBinary(e, t) {
            let n = function (e) {
              return e ? Object.assign(Object.assign({}, me), e) : me;
            }(t);

            return this.internalBinaryWrite(e, n.writerFactory(), n).finish();
          }

          internalJsonRead(e, t, n) {
            if (null !== e && "object" == typeof e && !Array.isArray(e)) {
              let r = null != n ? n : this.create();
              return this.refJsonReader.read(e, r, t), r;
            }

            throw new Error(`Unable to parse message ${this.typeName} from JSON ${G(e)}.`);
          }

          internalJsonWrite(e, t) {
            return this.refJsonWriter.write(e, t);
          }

          internalBinaryWrite(e, t, n) {
            return this.refBinWriter.write(e, t, n), t;
          }

          internalBinaryRead(e, t, n, r) {
            let i = null != r ? r : this.create();
            return this.refBinReader.read(e, i, n, t), i;
          }

        }

        var Ve = new (function (e) {
          y(n, e);
          var t = k(n);

          function n() {
            return p(this, n), t.call(this, "pb.ConnectCommand", [{
              no: 1,
              name: "nodeId",
              kind: "scalar",
              T: 9
            }, {
              no: 2,
              name: "userId",
              kind: "scalar",
              T: 9
            }, {
              no: 3,
              name: "timestamp",
              kind: "scalar",
              T: 4,
              L: 0
            }, {
              no: 4,
              name: "msgSign",
              kind: "scalar",
              T: 9
            }]);
          }

          return m(n, [{
            key: "create",
            value: function (e) {
              var t = {
                nodeId: "",
                userId: "",
                timestamp: 0n,
                msgSign: ""
              };
              return globalThis.Object.defineProperty(t, we, {
                enumerable: !1,
                value: this
              }), void 0 !== e && _e(this, t, e), t;
            }
          }, {
            key: "internalBinaryRead",
            value: function (e, t, n, r) {
              for (var i = null != r ? r : this.create(), a = e.pos + t; e.pos < a;) {
                var s = T(e.tag(), 2),
                    o = s[0],
                    u = s[1];

                switch (o) {
                  case 1:
                    i.nodeId = e.string();
                    break;

                  case 2:
                    i.userId = e.string();
                    break;

                  case 3:
                    i.timestamp = e.uint64().toBigInt();
                    break;

                  case 4:
                    i.msgSign = e.string();
                    break;

                  default:
                    var c = n.readUnknownField;
                    if ("throw" === c) throw new globalThis.Error("Unknown field ".concat(o, " (wire type ").concat(u, ") for ").concat(this.typeName));
                    var l = e.skip(u);
                    !1 !== c && (!0 === c ? $.onRead : c)(this.typeName, i, o, u, l);
                }
              }

              return i;
            }
          }, {
            key: "internalBinaryWrite",
            value: function (e, t, n) {
              "" !== e.nodeId && t.tag(1, J.LengthDelimited).string(e.nodeId), "" !== e.userId && t.tag(2, J.LengthDelimited).string(e.userId), 0n !== e.timestamp && t.tag(3, J.Varint).uint64(e.timestamp), "" !== e.msgSign && t.tag(4, J.LengthDelimited).string(e.msgSign);
              var r = n.writeUnknownFields;
              return !1 !== r && (1 == r ? $.onWrite : r)(this.typeName, e, t), t;
            }
          }]), n;
        }(Pe))();
        new (function (e) {
          y(n, e);
          var t = k(n);

          function n() {
            return p(this, n), t.call(this, "pb.DisconnectCommand", [{
              no: 1,
              name: "nodeId",
              kind: "scalar",
              T: 9
            }, {
              no: 2,
              name: "userId",
              kind: "scalar",
              T: 9
            }, {
              no: 3,
              name: "timestamp",
              kind: "scalar",
              T: 4,
              L: 0
            }, {
              no: 4,
              name: "msgSign",
              kind: "scalar",
              T: 9
            }]);
          }

          return m(n, [{
            key: "create",
            value: function (e) {
              var t = {
                nodeId: "",
                userId: "",
                timestamp: 0n,
                msgSign: ""
              };
              return globalThis.Object.defineProperty(t, we, {
                enumerable: !1,
                value: this
              }), void 0 !== e && _e(this, t, e), t;
            }
          }, {
            key: "internalBinaryRead",
            value: function (e, t, n, r) {
              for (var i = null != r ? r : this.create(), a = e.pos + t; e.pos < a;) {
                var s = T(e.tag(), 2),
                    o = s[0],
                    u = s[1];

                switch (o) {
                  case 1:
                    i.nodeId = e.string();
                    break;

                  case 2:
                    i.userId = e.string();
                    break;

                  case 3:
                    i.timestamp = e.uint64().toBigInt();
                    break;

                  case 4:
                    i.msgSign = e.string();
                    break;

                  default:
                    var c = n.readUnknownField;
                    if ("throw" === c) throw new globalThis.Error("Unknown field ".concat(o, " (wire type ").concat(u, ") for ").concat(this.typeName));
                    var l = e.skip(u);
                    !1 !== c && (!0 === c ? $.onRead : c)(this.typeName, i, o, u, l);
                }
              }

              return i;
            }
          }, {
            key: "internalBinaryWrite",
            value: function (e, t, n) {
              "" !== e.nodeId && t.tag(1, J.LengthDelimited).string(e.nodeId), "" !== e.userId && t.tag(2, J.LengthDelimited).string(e.userId), 0n !== e.timestamp && t.tag(3, J.Varint).uint64(e.timestamp), "" !== e.msgSign && t.tag(4, J.LengthDelimited).string(e.msgSign);
              var r = n.writeUnknownFields;
              return !1 !== r && (1 == r ? $.onWrite : r)(this.typeName, e, t), t;
            }
          }]), n;
        }(Pe))();
        var Ce = new (function (e) {
          y(n, e);
          var t = k(n);

          function n() {
            return p(this, n), t.call(this, "pb.Web3MQRequestMessage", [{
              no: 1,
              name: "payload",
              kind: "scalar",
              T: 12
            }, {
              no: 2,
              name: "contentTopic",
              kind: "scalar",
              T: 9
            }, {
              no: 3,
              name: "version",
              kind: "scalar",
              T: 13
            }, {
              no: 4,
              name: "comeFrom",
              kind: "scalar",
              T: 9
            }, {
              no: 5,
              name: "fromSign",
              kind: "scalar",
              T: 9
            }, {
              no: 6,
              name: "payloadType",
              kind: "scalar",
              T: 9
            }, {
              no: 7,
              name: "cipherSuite",
              kind: "scalar",
              T: 9
            }, {
              no: 8,
              name: "needStore",
              kind: "scalar",
              T: 8
            }, {
              no: 9,
              name: "timestamp",
              kind: "scalar",
              T: 4,
              L: 0
            }, {
              no: 10,
              name: "messageId",
              kind: "scalar",
              T: 9
            }, {
              no: 11,
              name: "messageType",
              kind: "scalar",
              opt: !0,
              T: 9
            }, {
              no: 12,
              name: "nodeId",
              kind: "scalar",
              T: 9
            }]);
          }

          return m(n, [{
            key: "create",
            value: function (e) {
              var t = {
                payload: new Uint8Array(0),
                contentTopic: "",
                version: 0,
                comeFrom: "",
                fromSign: "",
                payloadType: "",
                cipherSuite: "",
                needStore: !1,
                timestamp: 0n,
                messageId: "",
                nodeId: ""
              };
              return globalThis.Object.defineProperty(t, we, {
                enumerable: !1,
                value: this
              }), void 0 !== e && _e(this, t, e), t;
            }
          }, {
            key: "internalBinaryRead",
            value: function (e, t, n, r) {
              for (var i = null != r ? r : this.create(), a = e.pos + t; e.pos < a;) {
                var s = T(e.tag(), 2),
                    o = s[0],
                    u = s[1];

                switch (o) {
                  case 1:
                    i.payload = e.bytes();
                    break;

                  case 2:
                    i.contentTopic = e.string();
                    break;

                  case 3:
                    i.version = e.uint32();
                    break;

                  case 4:
                    i.comeFrom = e.string();
                    break;

                  case 5:
                    i.fromSign = e.string();
                    break;

                  case 6:
                    i.payloadType = e.string();
                    break;

                  case 7:
                    i.cipherSuite = e.string();
                    break;

                  case 8:
                    i.needStore = e.bool();
                    break;

                  case 9:
                    i.timestamp = e.uint64().toBigInt();
                    break;

                  case 10:
                    i.messageId = e.string();
                    break;

                  case 11:
                    i.messageType = e.string();
                    break;

                  case 12:
                    i.nodeId = e.string();
                    break;

                  default:
                    var c = n.readUnknownField;
                    if ("throw" === c) throw new globalThis.Error("Unknown field ".concat(o, " (wire type ").concat(u, ") for ").concat(this.typeName));
                    var l = e.skip(u);
                    !1 !== c && (!0 === c ? $.onRead : c)(this.typeName, i, o, u, l);
                }
              }

              return i;
            }
          }, {
            key: "internalBinaryWrite",
            value: function (e, t, n) {
              e.payload.length && t.tag(1, J.LengthDelimited).bytes(e.payload), "" !== e.contentTopic && t.tag(2, J.LengthDelimited).string(e.contentTopic), 0 !== e.version && t.tag(3, J.Varint).uint32(e.version), "" !== e.comeFrom && t.tag(4, J.LengthDelimited).string(e.comeFrom), "" !== e.fromSign && t.tag(5, J.LengthDelimited).string(e.fromSign), "" !== e.payloadType && t.tag(6, J.LengthDelimited).string(e.payloadType), "" !== e.cipherSuite && t.tag(7, J.LengthDelimited).string(e.cipherSuite), !1 !== e.needStore && t.tag(8, J.Varint).bool(e.needStore), 0n !== e.timestamp && t.tag(9, J.Varint).uint64(e.timestamp), "" !== e.messageId && t.tag(10, J.LengthDelimited).string(e.messageId), void 0 !== e.messageType && t.tag(11, J.LengthDelimited).string(e.messageType), "" !== e.nodeId && t.tag(12, J.LengthDelimited).string(e.nodeId);
              var r = n.writeUnknownFields;
              return !1 !== r && (1 == r ? $.onWrite : r)(this.typeName, e, t), t;
            }
          }]), n;
        }(Pe))(),
            Ke = new (function (e) {
          y(n, e);
          var t = k(n);

          function n() {
            return p(this, n), t.call(this, "pb.Web3MQMessageStatusResp", [{
              no: 1,
              name: "messageId",
              kind: "scalar",
              T: 9
            }, {
              no: 2,
              name: "contentTopic",
              kind: "scalar",
              T: 9
            }, {
              no: 3,
              name: "messageStatus",
              kind: "scalar",
              T: 9
            }, {
              no: 4,
              name: "version",
              kind: "scalar",
              T: 9
            }, {
              no: 5,
              name: "comeFrom",
              kind: "scalar",
              T: 9
            }, {
              no: 6,
              name: "fromSign",
              kind: "scalar",
              T: 9
            }, {
              no: 7,
              name: "timestamp",
              kind: "scalar",
              T: 4,
              L: 0
            }]);
          }

          return m(n, [{
            key: "create",
            value: function (e) {
              var t = {
                messageId: "",
                contentTopic: "",
                messageStatus: "",
                version: "",
                comeFrom: "",
                fromSign: "",
                timestamp: 0n
              };
              return globalThis.Object.defineProperty(t, we, {
                enumerable: !1,
                value: this
              }), void 0 !== e && _e(this, t, e), t;
            }
          }, {
            key: "internalBinaryRead",
            value: function (e, t, n, r) {
              for (var i = null != r ? r : this.create(), a = e.pos + t; e.pos < a;) {
                var s = T(e.tag(), 2),
                    o = s[0],
                    u = s[1];

                switch (o) {
                  case 1:
                    i.messageId = e.string();
                    break;

                  case 2:
                    i.contentTopic = e.string();
                    break;

                  case 3:
                    i.messageStatus = e.string();
                    break;

                  case 4:
                    i.version = e.string();
                    break;

                  case 5:
                    i.comeFrom = e.string();
                    break;

                  case 6:
                    i.fromSign = e.string();
                    break;

                  case 7:
                    i.timestamp = e.uint64().toBigInt();
                    break;

                  default:
                    var c = n.readUnknownField;
                    if ("throw" === c) throw new globalThis.Error("Unknown field ".concat(o, " (wire type ").concat(u, ") for ").concat(this.typeName));
                    var l = e.skip(u);
                    !1 !== c && (!0 === c ? $.onRead : c)(this.typeName, i, o, u, l);
                }
              }

              return i;
            }
          }, {
            key: "internalBinaryWrite",
            value: function (e, t, n) {
              "" !== e.messageId && t.tag(1, J.LengthDelimited).string(e.messageId), "" !== e.contentTopic && t.tag(2, J.LengthDelimited).string(e.contentTopic), "" !== e.messageStatus && t.tag(3, J.LengthDelimited).string(e.messageStatus), "" !== e.version && t.tag(4, J.LengthDelimited).string(e.version), "" !== e.comeFrom && t.tag(5, J.LengthDelimited).string(e.comeFrom), "" !== e.fromSign && t.tag(6, J.LengthDelimited).string(e.fromSign), 0n !== e.timestamp && t.tag(7, J.Varint).uint64(e.timestamp);
              var r = n.writeUnknownFields;
              return !1 !== r && (1 == r ? $.onWrite : r)(this.typeName, e, t), t;
            }
          }]), n;
        }(Pe))();
        new (function (e) {
          y(n, e);
          var t = k(n);

          function n() {
            return p(this, n), t.call(this, "pb.Web3MQChangeMessageStatus", [{
              no: 1,
              name: "messageId",
              kind: "scalar",
              T: 9
            }, {
              no: 2,
              name: "contentTopic",
              kind: "scalar",
              T: 9
            }, {
              no: 3,
              name: "messageStatus",
              kind: "scalar",
              T: 9
            }, {
              no: 4,
              name: "version",
              kind: "scalar",
              T: 9
            }, {
              no: 5,
              name: "comeFrom",
              kind: "scalar",
              T: 9
            }, {
              no: 6,
              name: "fromSign",
              kind: "scalar",
              T: 9
            }, {
              no: 7,
              name: "timestamp",
              kind: "scalar",
              T: 4,
              L: 0
            }]);
          }

          return m(n, [{
            key: "create",
            value: function (e) {
              var t = {
                messageId: "",
                contentTopic: "",
                messageStatus: "",
                version: "",
                comeFrom: "",
                fromSign: "",
                timestamp: 0n
              };
              return globalThis.Object.defineProperty(t, we, {
                enumerable: !1,
                value: this
              }), void 0 !== e && _e(this, t, e), t;
            }
          }, {
            key: "internalBinaryRead",
            value: function (e, t, n, r) {
              for (var i = null != r ? r : this.create(), a = e.pos + t; e.pos < a;) {
                var s = T(e.tag(), 2),
                    o = s[0],
                    u = s[1];

                switch (o) {
                  case 1:
                    i.messageId = e.string();
                    break;

                  case 2:
                    i.contentTopic = e.string();
                    break;

                  case 3:
                    i.messageStatus = e.string();
                    break;

                  case 4:
                    i.version = e.string();
                    break;

                  case 5:
                    i.comeFrom = e.string();
                    break;

                  case 6:
                    i.fromSign = e.string();
                    break;

                  case 7:
                    i.timestamp = e.uint64().toBigInt();
                    break;

                  default:
                    var c = n.readUnknownField;
                    if ("throw" === c) throw new globalThis.Error("Unknown field ".concat(o, " (wire type ").concat(u, ") for ").concat(this.typeName));
                    var l = e.skip(u);
                    !1 !== c && (!0 === c ? $.onRead : c)(this.typeName, i, o, u, l);
                }
              }

              return i;
            }
          }, {
            key: "internalBinaryWrite",
            value: function (e, t, n) {
              "" !== e.messageId && t.tag(1, J.LengthDelimited).string(e.messageId), "" !== e.contentTopic && t.tag(2, J.LengthDelimited).string(e.contentTopic), "" !== e.messageStatus && t.tag(3, J.LengthDelimited).string(e.messageStatus), "" !== e.version && t.tag(4, J.LengthDelimited).string(e.version), "" !== e.comeFrom && t.tag(5, J.LengthDelimited).string(e.comeFrom), "" !== e.fromSign && t.tag(6, J.LengthDelimited).string(e.fromSign), 0n !== e.timestamp && t.tag(7, J.Varint).uint64(e.timestamp);
              var r = n.writeUnknownFields;
              return !1 !== r && (1 == r ? $.onWrite : r)(this.typeName, e, t), t;
            }
          }]), n;
        }(Pe))();
        var Me = new (function (e) {
          y(n, e);
          var t = k(n);

          function n() {
            return p(this, n), t.call(this, "pb.MessageItem", [{
              no: 1,
              name: "messageId",
              kind: "scalar",
              T: 9
            }, {
              no: 2,
              name: "version",
              kind: "scalar",
              T: 13
            }, {
              no: 3,
              name: "payload",
              kind: "scalar",
              T: 12
            }, {
              no: 4,
              name: "payloadType",
              kind: "scalar",
              T: 9
            }, {
              no: 5,
              name: "comeFrom",
              kind: "scalar",
              T: 9
            }, {
              no: 6,
              name: "fromSign",
              kind: "scalar",
              T: 9
            }, {
              no: 7,
              name: "contentTopic",
              kind: "scalar",
              T: 9
            }, {
              no: 8,
              name: "cipherSuite",
              kind: "scalar",
              T: 9
            }, {
              no: 9,
              name: "timestamp",
              kind: "scalar",
              T: 4,
              L: 0
            }, {
              no: 10,
              name: "read",
              kind: "scalar",
              T: 8
            }, {
              no: 11,
              name: "readTimestamp",
              kind: "scalar",
              T: 4,
              L: 0
            }]);
          }

          return m(n, [{
            key: "create",
            value: function (e) {
              var t = {
                messageId: "",
                version: 0,
                payload: new Uint8Array(0),
                payloadType: "",
                comeFrom: "",
                fromSign: "",
                contentTopic: "",
                cipherSuite: "",
                timestamp: 0n,
                read: !1,
                readTimestamp: 0n
              };
              return globalThis.Object.defineProperty(t, we, {
                enumerable: !1,
                value: this
              }), void 0 !== e && _e(this, t, e), t;
            }
          }, {
            key: "internalBinaryRead",
            value: function (e, t, n, r) {
              for (var i = null != r ? r : this.create(), a = e.pos + t; e.pos < a;) {
                var s = T(e.tag(), 2),
                    o = s[0],
                    u = s[1];

                switch (o) {
                  case 1:
                    i.messageId = e.string();
                    break;

                  case 2:
                    i.version = e.uint32();
                    break;

                  case 3:
                    i.payload = e.bytes();
                    break;

                  case 4:
                    i.payloadType = e.string();
                    break;

                  case 5:
                    i.comeFrom = e.string();
                    break;

                  case 6:
                    i.fromSign = e.string();
                    break;

                  case 7:
                    i.contentTopic = e.string();
                    break;

                  case 8:
                    i.cipherSuite = e.string();
                    break;

                  case 9:
                    i.timestamp = e.uint64().toBigInt();
                    break;

                  case 10:
                    i.read = e.bool();
                    break;

                  case 11:
                    i.readTimestamp = e.uint64().toBigInt();
                    break;

                  default:
                    var c = n.readUnknownField;
                    if ("throw" === c) throw new globalThis.Error("Unknown field ".concat(o, " (wire type ").concat(u, ") for ").concat(this.typeName));
                    var l = e.skip(u);
                    !1 !== c && (!0 === c ? $.onRead : c)(this.typeName, i, o, u, l);
                }
              }

              return i;
            }
          }, {
            key: "internalBinaryWrite",
            value: function (e, t, n) {
              "" !== e.messageId && t.tag(1, J.LengthDelimited).string(e.messageId), 0 !== e.version && t.tag(2, J.Varint).uint32(e.version), e.payload.length && t.tag(3, J.LengthDelimited).bytes(e.payload), "" !== e.payloadType && t.tag(4, J.LengthDelimited).string(e.payloadType), "" !== e.comeFrom && t.tag(5, J.LengthDelimited).string(e.comeFrom), "" !== e.fromSign && t.tag(6, J.LengthDelimited).string(e.fromSign), "" !== e.contentTopic && t.tag(7, J.LengthDelimited).string(e.contentTopic), "" !== e.cipherSuite && t.tag(8, J.LengthDelimited).string(e.cipherSuite), 0n !== e.timestamp && t.tag(9, J.Varint).uint64(e.timestamp), !1 !== e.read && t.tag(10, J.Varint).bool(e.read), 0n !== e.readTimestamp && t.tag(11, J.Varint).uint64(e.readTimestamp);
              var r = n.writeUnknownFields;
              return !1 !== r && (1 == r ? $.onWrite : r)(this.typeName, e, t), t;
            }
          }]), n;
        }(Pe))(),
            qe = new (function (e) {
          y(n, e);
          var t = k(n);

          function n() {
            return p(this, n), t.call(this, "pb.Web3MQMessageListResponse", [{
              no: 1,
              name: "data",
              kind: "message",
              repeat: 1,
              T: function () {
                return Me;
              }
            }]);
          }

          return m(n, [{
            key: "create",
            value: function (e) {
              var t = {
                data: []
              };
              return globalThis.Object.defineProperty(t, we, {
                enumerable: !1,
                value: this
              }), void 0 !== e && _e(this, t, e), t;
            }
          }, {
            key: "internalBinaryRead",
            value: function (e, t, n, r) {
              for (var i = null != r ? r : this.create(), a = e.pos + t; e.pos < a;) {
                var s = T(e.tag(), 2),
                    o = s[0],
                    u = s[1];
                if (1 === o) i.data.push(Me.internalBinaryRead(e, e.uint32(), n));else {
                  var c = n.readUnknownField;
                  if ("throw" === c) throw new globalThis.Error("Unknown field ".concat(o, " (wire type ").concat(u, ") for ").concat(this.typeName));
                  var l = e.skip(u);
                  !1 !== c && (!0 === c ? $.onRead : c)(this.typeName, i, o, u, l);
                }
              }

              return i;
            }
          }, {
            key: "internalBinaryWrite",
            value: function (e, t, n) {
              for (var r = 0; r < e.data.length; r++) Me.internalBinaryWrite(e.data[r], t.tag(1, J.LengthDelimited).fork(), n).join();

              var i = n.writeUnknownFields;
              return !1 !== i && (1 == i ? $.onWrite : i)(this.typeName, e, t), t;
            }
          }]), n;
        }(Pe))();
        new (function (e) {
          y(n, e);
          var t = k(n);

          function n() {
            return p(this, n), t.call(this, "pb.GetHistoryMessagesRequest", [{
              no: 1,
              name: "comeFrom",
              kind: "scalar",
              T: 9
            }, {
              no: 2,
              name: "fromSign",
              kind: "scalar",
              T: 9
            }, {
              no: 3,
              name: "version",
              kind: "scalar",
              T: 13
            }, {
              no: 4,
              name: "timestamp",
              kind: "scalar",
              T: 4,
              L: 0
            }]);
          }

          return m(n, [{
            key: "create",
            value: function (e) {
              var t = {
                comeFrom: "",
                fromSign: "",
                version: 0,
                timestamp: 0n
              };
              return globalThis.Object.defineProperty(t, we, {
                enumerable: !1,
                value: this
              }), void 0 !== e && _e(this, t, e), t;
            }
          }, {
            key: "internalBinaryRead",
            value: function (e, t, n, r) {
              for (var i = null != r ? r : this.create(), a = e.pos + t; e.pos < a;) {
                var s = T(e.tag(), 2),
                    o = s[0],
                    u = s[1];

                switch (o) {
                  case 1:
                    i.comeFrom = e.string();
                    break;

                  case 2:
                    i.fromSign = e.string();
                    break;

                  case 3:
                    i.version = e.uint32();
                    break;

                  case 4:
                    i.timestamp = e.uint64().toBigInt();
                    break;

                  default:
                    var c = n.readUnknownField;
                    if ("throw" === c) throw new globalThis.Error("Unknown field ".concat(o, " (wire type ").concat(u, ") for ").concat(this.typeName));
                    var l = e.skip(u);
                    !1 !== c && (!0 === c ? $.onRead : c)(this.typeName, i, o, u, l);
                }
              }

              return i;
            }
          }, {
            key: "internalBinaryWrite",
            value: function (e, t, n) {
              "" !== e.comeFrom && t.tag(1, J.LengthDelimited).string(e.comeFrom), "" !== e.fromSign && t.tag(2, J.LengthDelimited).string(e.fromSign), 0 !== e.version && t.tag(3, J.Varint).uint32(e.version), 0n !== e.timestamp && t.tag(4, J.Varint).uint64(e.timestamp);
              var r = n.writeUnknownFields;
              return !1 !== r && (1 == r ? $.onWrite : r)(this.typeName, e, t), t;
            }
          }]), n;
        }(Pe))();

        var Ge = function (e) {
          return Array.from(e, function (e) {
            return ("0" + (255 & e).toString(16)).slice(-2);
          }).join("");
        },
            We = function () {
          var e = h(l().mark(function e(t, n, i, a) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.abrupt("return", r.sha3_224.update(t).update(n).update(i.toString()).update(a).hex());

                case 1:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n, r, i) {
            return e.apply(this, arguments);
          };
        }(),
            Xe = function (e, t) {
          var n = new Uint8Array(t.length + 1);
          n[0] = e;

          for (var r = 0; r < t.length; r++) n[r + 1] = t[r];

          return n;
        },
            $e = function () {
          var e = h(l().mark(function e() {
            var t, n, r, i;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return t = o.default.utils.randomPrivateKey(), e.next = 3, o.default.getPublicKey(t);

                case 3:
                  return n = e.sent, r = Ge(t), i = Ge(n), e.abrupt("return", {
                    PrivateKey: r,
                    PublicKey: i
                  });

                case 7:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function () {
            return e.apply(this, arguments);
          };
        }(),
            Je = function () {
          var e = h(l().mark(function e(t, n) {
            var r;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (t) {
                    e.next = 2;
                    break;
                  }

                  throw new Error("Ed25519PrivateKey not found");

                case 2:
                  return e.next = 4, o.default.sign(new TextEncoder().encode(n), t);

                case 4:
                  return r = e.sent, e.abrupt("return", (i = r, btoa(String.fromCharCode.apply(null, i))));

                case 6:
                case "end":
                  return e.stop();
              }

              var i;
            }, e);
          }));
          return function (t, n) {
            return e.apply(this, arguments);
          };
        }(),
            Ze = function () {
          var e = new Date();
          return ("0" + e.getDate()).slice(-2) + "/" + ("0" + (e.getMonth() + 1)).slice(-2) + "/" + e.getFullYear() + " " + ("0" + e.getHours()).slice(-2) + ":" + ("0" + e.getMinutes()).slice(-2);
        },
            Ye = function () {
          var e = h(l().mark(function e(t) {
            var n, r, i, a, s, o, u, c, f, h;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return n = t.PrivateKey, r = t.userid, i = Date.now(), a = "nodeId", s = BigInt(i), o = a + r + s.toString(), e.next = 7, Je(n, o);

                case 7:
                  return u = e.sent, c = {
                    nodeId: a,
                    userId: r,
                    timestamp: s,
                    msgSign: u
                  }, f = Ve.toBinary(c), h = Xe(2, f), e.abrupt("return", h);

                case 12:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            He = function () {
          var e = h(l().mark(function e(t, n, r, i) {
            var a, s, o, u, c, f, h, p, d, m, g;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return a = t.userid, s = t.PrivateKey, o = Date.now(), u = "NONE", c = new TextEncoder().encode(r), e.next = 6, We(a, n, o, c);

                case 6:
                  return f = e.sent, h = f + a + n + i + o.toString(), e.next = 10, Je(s, h);

                case 10:
                  return p = e.sent, !0, d = {
                    payload: c,
                    contentTopic: n,
                    version: 1,
                    comeFrom: a,
                    fromSign: p,
                    payloadType: "text/plain; charset=utf-8",
                    cipherSuite: u,
                    needStore: true,
                    timestamp: BigInt(o),
                    messageId: f,
                    nodeId: i
                  }, m = Ce.toBinary(d), g = Xe(16, m), e.abrupt("return", g);

                case 16:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n, r, i) {
            return e.apply(this, arguments);
          };
        }(),
            Qe = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.abrupt("return", t.map(function (e, t) {
                    var n = "";
                    n = "NONE" == e.cipher_suite ? decodeURIComponent(escape(window.atob(e.payload))) : "不支持的加密类型 " + e.cipher_suite;
                    var r = new Date(e.timestamp),
                        i = r.getHours() + ":" + r.getMinutes(),
                        a = r.getFullYear() + "-" + (r.getMonth() + 1) + "-" + r.getDate();
                    return {
                      _id: t + 1,
                      id: t + 1,
                      indexId: t + 1,
                      content: n,
                      senderId: e.from,
                      username: "",
                      avatar: "assets/imgs/doe.png",
                      date: a,
                      timestamp: i,
                      system: !1,
                      saved: !1,
                      distributed: !0,
                      seen: !0,
                      failure: !1
                    };
                  }));

                case 1:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            ze = function () {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "http",
              t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "us-west-2.web3mq.com",
              n = t,
              r = "https://".concat(n),
              i = "ws://".concat(n, "/messages");
          return "ws" === e ? i : r;
        },
            et = function () {
          function e(t) {
            p(this, e), g(this, "_client", void 0), g(this, "_keys", void 0), g(this, "channelList", void 0), g(this, "activeChannel", void 0), this._client = t, this._keys = t.keys, this.channelList = null, this.activeChannel = null;
          }

          var t, n, r, i;
          return m(e, [{
            key: "setActiveChannel",
            value: function (e) {
              this.activeChannel = e, this._client.emit("channel.activeChange", {
                type: "channel.activeChange"
              });
            }
          }, {
            key: "queryChannels",
            value: (i = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u, f, h;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = this._keys, r = n.userid, i = n.PrivateKey, a = Date.now(), s = r + a, e.next = 5, Je(i, s);

                  case 5:
                    return o = e.sent, e.next = 8, O(c({
                      web3mq_signature: o,
                      userid: r,
                      timestamp: a
                    }, t));

                  case 8:
                    u = e.sent, f = u.data.result, h = void 0 === f ? [] : f, this.channelList && 1 !== t.page ? this.channelList = [].concat(I(this.channelList), I(h)) : this.channelList = h, this.channelList && this.setActiveChannel(this.channelList[0]), this._client.emit("channel.getList", {
                      type: "channel.getList"
                    });

                  case 14:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return i.apply(this, arguments);
            })
          }, {
            key: "createRoom",
            value: (r = h(l().mark(function e() {
              var t, n, r, i, a, s, o, u, c;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return t = this._keys, n = t.userid, r = t.PrivateKey, i = Date.now(), a = n + i, e.next = 5, Je(r, a);

                  case 5:
                    return s = e.sent, e.next = 8, L({
                      web3mq_signature: s,
                      userid: n,
                      timestamp: i
                    });

                  case 8:
                    if (o = e.sent, u = o.data, c = void 0 === u ? {
                      groupid: ""
                    } : u, this.channelList) {
                      e.next = 13;
                      break;
                    }

                    return e.abrupt("return");

                  case 13:
                    this.channelList = [{
                      topic: c.groupid,
                      topic_type: "group"
                    }].concat(I(this.channelList)), this._client.emit("channel.getList", {
                      type: "channel.getList"
                    });

                  case 15:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function () {
              return r.apply(this, arguments);
            })
          }, {
            key: "getGroupMemberList",
            value: (n = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u, f, h;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    if (!(r = null === (n = this.activeChannel) || void 0 === n ? void 0 : n.topic)) {
                      e.next = 12;
                      break;
                    }

                    return i = this._keys, a = i.userid, s = i.PrivateKey, o = Date.now(), u = a + r + o, e.next = 7, Je(s, u);

                  case 7:
                    return f = e.sent, e.next = 10, D(c({
                      web3mq_signature: f,
                      userid: a,
                      timestamp: o,
                      groupid: r
                    }, t));

                  case 10:
                    return h = e.sent, e.abrupt("return", h);

                  case 12:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return n.apply(this, arguments);
            })
          }, {
            key: "inviteGroupMember",
            value: (t = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u, c, f;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    if (!(r = null === (n = this.activeChannel) || void 0 === n ? void 0 : n.topic)) {
                      e.next = 12;
                      break;
                    }

                    return i = this._keys, a = i.userid, s = i.PrivateKey, o = Date.now(), u = a + r + o, e.next = 7, Je(s, u);

                  case 7:
                    return c = e.sent, e.next = 10, B({
                      web3mq_signature: c,
                      userid: a,
                      timestamp: o,
                      groupid: r,
                      members: t
                    });

                  case 10:
                    return f = e.sent, e.abrupt("return", f);

                  case 12:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return t.apply(this, arguments);
            })
          }]), e;
        }(),
            tt = function () {
          function e(t) {
            p(this, e), g(this, "_client", void 0), g(this, "ws", void 0), g(this, "nodeId", void 0), this._client = t, this.ws = null, this.nodeId = "", this.init();
          }

          return m(e, [{
            key: "init",
            value: function () {
              var e = this;
              if (!("WebSocket" in window)) throw new Error("Browser not supported WebSocket");
              if (!this._client.wsUrl) throw new Error("The url is required!");
              var t = new WebSocket(this._client.wsUrl);
              t.binaryType = "arraybuffer", t.onopen = h(l().mark(function n() {
                var r;
                return l().wrap(function (n) {
                  for (;;) switch (n.prev = n.next) {
                    case 0:
                      return console.log("connection is successful"), n.next = 3, Ye(e._client.keys);

                    case 3:
                      r = n.sent, t.send(r);

                    case 5:
                    case "end":
                      return n.stop();
                  }
                }, n);
              })), t.onmessage = function (t) {
                var n = new Uint8Array(t.data),
                    r = n[0],
                    i = n.slice(1, n.length);

                if (3 === r) {
                  var a = Ve.fromBinary(i).nodeId;
                  e.nodeId = a;
                } else e.receive(r, i);
              }, this.ws = t;
            }
          }, {
            key: "send",
            value: function (e) {
              if (!this.ws) throw new Error("websocket Initialization failed");
              return this.ws.send(e);
            }
          }, {
            key: "receive",
            value: function (e, t) {}
          }]), e;
        }(),
            nt = function () {
          function e(t) {
            p(this, e), g(this, "_client", void 0), g(this, "_keys", void 0), g(this, "messageList", void 0), this._client = t, this._keys = t.keys, t.connect.receive = this.receive, this.messageList = null;
          }

          var t, n, r;
          return m(e, [{
            key: "getMessageList",
            value: (r = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u, f, h, p, d, m, g;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    if (!(r = null === (n = this._client.channel.activeChannel) || void 0 === n ? void 0 : n.topic)) {
                      e.next = 18;
                      break;
                    }

                    return a = this._keys, s = a.userid, o = a.PrivateKey, u = Date.now(), f = s + r + u, e.next = 7, Je(o, f);

                  case 7:
                    return h = e.sent, e.next = 10, F(c({
                      userid: s,
                      timestamp: u,
                      web3mq_signature: h,
                      topic: r
                    }, t));

                  case 10:
                    return p = e.sent, d = p.data.result, m = void 0 === d ? [] : d, e.next = 15, Qe(m);

                  case 15:
                    g = e.sent, this.messageList = null !== (i = g.reverse()) && void 0 !== i ? i : [], this._client.emit("message.getList", {
                      type: "message.getList"
                    });

                  case 18:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return r.apply(this, arguments);
            })
          }, {
            key: "changeMessageStatus",
            value: (n = h(l().mark(function e(t) {
              var n,
                  r,
                  i,
                  a,
                  s,
                  o,
                  u,
                  c,
                  f,
                  h,
                  p = arguments;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    if (r = p.length > 1 && void 0 !== p[1] ? p[1] : "delivered", !(i = null === (n = this._client.channel.activeChannel) || void 0 === n ? void 0 : n.topic)) {
                      e.next = 13;
                      break;
                    }

                    return a = this._keys, s = a.userid, o = a.PrivateKey, u = Date.now(), c = s + r + u, e.next = 8, Je(o, c);

                  case 8:
                    return f = e.sent, e.next = 11, _({
                      topic: i,
                      web3mq_signature: f,
                      timestamp: u,
                      userid: s,
                      messages: t,
                      status: r
                    });

                  case 11:
                    return h = e.sent, e.abrupt("return", h);

                  case 13:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return n.apply(this, arguments);
            })
          }, {
            key: "sendMessage",
            value: (t = h(l().mark(function e(t) {
              var n, r, i, a, s, o;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    if (n = this._client, r = n.keys, i = n.connect, !(a = n.channel).activeChannel) {
                      e.next = 7;
                      break;
                    }

                    return s = a.activeChannel.topic, e.next = 5, He(r, s, t, i.nodeId);

                  case 5:
                    o = e.sent, i.send(o);

                  case 7:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return t.apply(this, arguments);
            })
          }, {
            key: "receive",
            value: function (e, t) {
              if (20 === e) {
                console.log("Receive notification");
                var n = qe.fromBinary(t);
                console.log("Receive notification----------", n), this._client.notify.receiveNotify(n);
              }

              if (21 === e) {
                var r = Ke.fromBinary(t);
                console.log("msgStatus:", r), this._client.emit("message.new", {
                  type: "message.new"
                });
              }
            }
          }]), e;
        }(),
            rt = function () {
          function e(t) {
            p(this, e), g(this, "_client", void 0), g(this, "_keys", void 0), this._client = t, this._keys = t.keys;
          }

          var t, n, r;
          return m(e, [{
            key: "searchUsers",
            value: (r = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = this._keys, r = n.userid, i = n.PrivateKey, a = Date.now(), s = r + t + a, e.next = 5, Je(i, s);

                  case 5:
                    return o = e.sent, e.next = 8, U({
                      web3mq_signature: o,
                      userid: r,
                      timestamp: a,
                      keyword: t
                    });

                  case 8:
                    return u = e.sent, e.abrupt("return", u);

                  case 10:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return r.apply(this, arguments);
            })
          }, {
            key: "getMyProfile",
            value: (n = h(l().mark(function e() {
              var t, n, r, i, a, s, o;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return t = this._keys, n = t.userid, r = t.PrivateKey, i = Date.now(), a = n + i, e.next = 5, Je(r, a);

                  case 5:
                    return s = e.sent, e.next = 8, A({
                      web3mq_signature: s,
                      userid: n,
                      timestamp: i
                    });

                  case 8:
                    return o = e.sent, e.abrupt("return", o);

                  case 10:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function () {
              return n.apply(this, arguments);
            })
          }, {
            key: "updateMyProfile",
            value: (t = h(l().mark(function e(t, n) {
              var r, i, a, s, o, u, c;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return r = this._keys, i = r.userid, a = r.PrivateKey, s = Date.now(), o = i + s, e.next = 5, Je(a, o);

                  case 5:
                    return u = e.sent, e.next = 8, j({
                      web3mq_signature: u,
                      userid: i,
                      timestamp: s,
                      nickname: t,
                      avatar_url: n
                    });

                  case 8:
                    return c = e.sent, e.abrupt("return", c);

                  case 10:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e, n) {
              return t.apply(this, arguments);
            })
          }]), e;
        }(),
            it = function () {
          function e(t) {
            p(this, e), g(this, "_client", void 0), g(this, "_keys", void 0), g(this, "contactList", void 0), g(this, "myFriendRequestList", void 0), g(this, "receiveFriendRequestList", void 0), this._client = t, this._keys = t.keys, this.contactList = null, this.myFriendRequestList = null, this.receiveFriendRequestList = null;
          }

          var t, n, r, i, a, s;
          return m(e, [{
            key: "searchContact",
            value: (s = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = this._keys, r = n.userid, i = n.PrivateKey, a = Date.now(), s = r + t + a, e.next = 5, Je(i, s);

                  case 5:
                    return o = e.sent, e.next = 8, R({
                      web3mq_signature: o,
                      userid: r,
                      timestamp: a,
                      keyword: t
                    });

                  case 8:
                    return u = e.sent, e.abrupt("return", u);

                  case 10:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return s.apply(this, arguments);
            })
          }, {
            key: "getContactList",
            value: (a = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u, f, h;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = this._client.emit, r = this._keys, i = r.userid, a = r.PrivateKey, s = Date.now(), o = i + s, e.next = 6, Je(a, o);

                  case 6:
                    return u = e.sent, e.next = 9, P(c({
                      web3mq_signature: u,
                      userid: i,
                      timestamp: s
                    }, t));

                  case 9:
                    f = e.sent, h = f.data, this.contactList = h.result, n("contact.getList", {
                      type: "contact.getList"
                    });

                  case 13:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return a.apply(this, arguments);
            })
          }, {
            key: "sendFriend",
            value: (i = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = this._keys, r = n.userid, i = n.PrivateKey, a = Date.now(), s = r + t + a, e.next = 5, Je(i, s);

                  case 5:
                    return o = e.sent, e.next = 8, V({
                      web3mq_signature: o,
                      userid: r,
                      timestamp: a,
                      target_userid: t
                    });

                  case 8:
                    return u = e.sent, e.abrupt("return", u);

                  case 10:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return i.apply(this, arguments);
            })
          }, {
            key: "getMyFriendRequestList",
            value: (r = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u, f, h;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = this._client.emit, r = this._keys, i = r.userid, a = r.PrivateKey, s = Date.now(), o = i + s, e.next = 6, Je(a, o);

                  case 6:
                    return u = e.sent, e.next = 9, C(c({
                      web3mq_signature: u,
                      userid: i,
                      timestamp: s
                    }, t));

                  case 9:
                    f = e.sent, h = f.data, this.myFriendRequestList = h.result, n("contact.friendList", {
                      type: "contact.friendList"
                    });

                  case 13:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return r.apply(this, arguments);
            })
          }, {
            key: "getReceiveFriendRequestList",
            value: (n = h(l().mark(function e(t) {
              var n, r, i, a, s, o, u, f, h;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = this._client.emit, r = this._keys, i = r.userid, a = r.PrivateKey, s = Date.now(), o = i + s, e.next = 6, Je(a, o);

                  case 6:
                    return u = e.sent, e.next = 9, K(c({
                      web3mq_signature: u,
                      userid: i,
                      timestamp: s
                    }, t));

                  case 9:
                    f = e.sent, h = f.data, this.receiveFriendRequestList = h.result, n("contact.reviceList", {
                      type: "contact.reviceList"
                    });

                  case 13:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return n.apply(this, arguments);
            })
          }, {
            key: "operationFriend",
            value: (t = h(l().mark(function e(t) {
              var n,
                  r,
                  i,
                  a,
                  s,
                  o,
                  u,
                  c,
                  f = arguments;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = f.length > 1 && void 0 !== f[1] ? f[1] : "agree", r = this._keys, i = r.userid, a = r.PrivateKey, s = Date.now(), o = i + n + t + s, e.next = 6, Je(a, o);

                  case 6:
                    return u = e.sent, e.next = 9, M({
                      web3mq_signature: u,
                      userid: i,
                      timestamp: s,
                      target_userid: t,
                      action: n
                    });

                  case 9:
                    return c = e.sent, e.abrupt("return", c);

                  case 11:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return t.apply(this, arguments);
            })
          }]), e;
        }(),
            at = function () {
          function e(t) {
            p(this, e), g(this, "_client", void 0), g(this, "_keys", void 0), g(this, "notificationList", void 0), this._client = t, this._keys = t.keys, this.notificationList = null;
          }

          var t;
          return m(e, [{
            key: "changeNotificationStatus",
            value: (t = h(l().mark(function e(t) {
              var n,
                  r,
                  i,
                  a,
                  s,
                  o,
                  u,
                  c,
                  f = arguments;
              return l().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                  case 0:
                    return n = f.length > 1 && void 0 !== f[1] ? f[1] : "delivered", r = this._keys, i = r.userid, a = r.PrivateKey, s = Date.now(), o = i + n + s, e.next = 6, Je(a, o);

                  case 6:
                    return u = e.sent, e.next = 9, q({
                      web3mq_signature: u,
                      userid: i,
                      timestamp: s,
                      messages: t,
                      status: n
                    });

                  case 9:
                    return c = e.sent, e.abrupt("return", c);

                  case 11:
                  case "end":
                    return e.stop();
                }
              }, e, this);
            })), function (e) {
              return t.apply(this, arguments);
            })
          }, {
            key: "receiveNotify",
            value: function (e) {
              console.log("notify class -------", e), this.notificationList = e, this._client.emit("notification.getList", {
                type: "notification.getList"
              });
            }
          }]), e;
        }(),
            st = c(c({}, {
          "channel.created": !0,
          "channel.getList": !0,
          "channel.activeChange": !0,
          "channel.updated": !0,
          "contact.activeChange": !0,
          "contact.getList": !0,
          "contact.friendList": !0,
          "contact.reviceList": !0,
          "contact.updateList": !0,
          "message.new": !0,
          "message.updated": !0,
          "message.getList": !0,
          "message.getThreadList": !0,
          "message.openAllThread": !0,
          "notification.messageNew": !0,
          "notification.getList": !0
        }), {}, {
          all: !0
        }),
            ot = function () {
          function e() {
            p(this, e), g(this, "events", void 0), this.events = {};
          }

          return m(e, [{
            key: "on",
            value: function (e, t) {
              if (!(st[e] || !1)) throw Error("Invalid event type ".concat(e));
              if ("function" != typeof t) throw new Error("You need to add a callback method to the ".concat(e, " event"));
              var n = this.events[e] || [];
              n.push(t), this.events[e] = n;
            }
          }, {
            key: "emit",
            value: function (e) {
              for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];

              var i = this.events[e] || [];
              if (0 === i.length) throw new Error("The ".concat(e, " event was not registered"));
              i.forEach(function (e) {
                return e.apply(void 0, n);
              });
            }
          }, {
            key: "off",
            value: function (e, t) {
              void 0 === t && (this.events[e] = []);
              var n = (this.events[e] || []).filter(function (e) {
                return e != t && e.initialCallback != t;
              });
              this.events[e] = n;
            }
          }, {
            key: "once",
            value: function (e, t) {
              var n = this;
              if (void 0 === t) throw new Error("The callback function is required");

              var r = function r() {
                t.apply(void 0, arguments), n.off(e, r);
              };

              r.initialCallback = t, this.on(e, r);
            }
          }]), e;
        }(),
            ut = m(function e(t, n) {
          var r = this;
          p(this, e), g(this, "keys", void 0), g(this, "wsUrl", void 0), g(this, "channel", void 0), g(this, "listeners", void 0), g(this, "connect", void 0), g(this, "message", void 0), g(this, "user", void 0), g(this, "contact", void 0), g(this, "notify", void 0), g(this, "on", function (e, t) {
            return r.listeners.on(e, t);
          }), g(this, "emit", function (e, t) {
            return r.listeners.emit(e, t);
          }), g(this, "off", function (e, t) {
            return r.listeners.off(e, t);
          }), g(this, "once", function (e, t) {
            return r.listeners.once(e, t);
          }), this.keys = c(c({}, t), {}, {
            userid: "user:".concat(t.PublicKey)
          }), this.wsUrl = ze("ws", n), this.listeners = new ot(), this.channel = new et(this), this.connect = new tt(this), this.message = new nt(this), this.user = new rt(this), this.contact = new it(this), this.notify = new at(this), new S(ze("http", n));
        });

        g(ut, "_instance", void 0), g(ut, "getInstance", function (e, t) {
          if (!e) throw new Error("The PrivateKey and PublicKey is required!");
          return ut._instance || (ut._instance = new ut(e, t)), ut._instance;
        });
        var ct = m(function e() {
          p(this, e);
        });
        g(ct, "getEthAccount", h(l().mark(function e() {
          var t, n, r, i, a, s;
          return l().wrap(function (e) {
            for (;;) switch (e.prev = e.next) {
              case 0:
                return t = {
                  address: "",
                  balance: 0,
                  shortAddress: ""
                }, n = {
                  method: "wallet_requestPermissions",
                  params: [{
                    eth_accounts: {}
                  }]
                }, e.next = 4, window.ethereum.request(n).catch(function (e) {
                  console.log(e, "e");
                });

              case 4:
                if (e.sent) {
                  e.next = 7;
                  break;
                }

                return e.abrupt("return", t);

              case 7:
                return e.prev = 7, e.next = 10, window.ethereum.request({
                  method: "eth_accounts"
                });

              case 10:
                if (!((r = e.sent) && r.length > 0)) {
                  e.next = 19;
                  break;
                }

                return t.address = r[0], i = r[0].length, t.shortAddress = r[0].substring(0, 5) + "..." + r[0].substring(i - 4, i), e.next = 17, window.ethereum.request({
                  method: "eth_getBalance",
                  params: [r[0], "latest"]
                });

              case 17:
                (a = e.sent) && (s = a.toString(10), t.balance = s / 1e18);

              case 19:
                e.next = 24;
                break;

              case 21:
                e.prev = 21, e.t0 = e.catch(7), console.log(e.t0);

              case 24:
                return e.abrupt("return", t);

              case 25:
              case "end":
                return e.stop();
            }
          }, e, null, [[7, 21]]);
        }))), g(ct, "signMetaMask", function () {
          var e = h(l().mark(function e(t, n) {
            var i, a, s, o, u, c, f, h, p, d, m;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return new S(ze("http", n)), e.next = 3, ct.getEthAccount();

                case 3:
                  return i = e.sent, a = i.address, e.next = 7, $e();

                case 7:
                  return s = e.sent, o = s.PrivateKey, u = s.PublicKey, c = "user:".concat(u), f = Date.now(), "eth", h = r.sha3_224(c + a + "eth" + u + f.toString()), p = "Web3MQ wants you to sign in with your Ethereum account:\n    ".concat(a, "\n    For Web3MQ registration\n    URI: ").concat(t, "\n    Version: 1\n    Nonce: ").concat(h, "\n    Issued At: ").concat(Ze()), e.next = 17, window.ethereum.request({
                    method: "personal_sign",
                    params: [p, a, "web3mq"]
                  });

                case 17:
                  return d = e.sent, m = {
                    userid: c,
                    pubkey: u,
                    metamask_signature: d,
                    sign_content: p,
                    wallet_address: a,
                    wallet_type: "eth",
                    timestamp: f
                  }, e.next = 21, E(m);

                case 21:
                  return e.abrupt("return", {
                    PrivateKey: o,
                    PublicKey: u
                  });

                case 22:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n) {
            return e.apply(this, arguments);
          };
        }());

        var lt = function () {
          var e = h(l().mark(function e(t, n) {
            var r;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, o.default.getSharedSecret(t, n);

                case 2:
                  return r = e.sent, e.abrupt("return", r);

                case 4:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n) {
            return e.apply(this, arguments);
          };
        }(),
            ft = function (e) {
          e = e.replace(/_/g, "/").replace(/-/g, "+"), e += "===".slice((e.length + 3) % 4);
          var t = atob(e).split("").map(function (e) {
            return e.charCodeAt(0);
          });
          return new Uint8Array(t);
        },
            ht = function () {
          var e = h(l().mark(function e(t) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, crypto.subtle.importKey("raw", ft(t), "HKDF", !1, ["deriveKey"]);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t) {
            return e.apply(this, arguments);
          };
        }(),
            pt = function () {
          var e = h(l().mark(function e(t, n) {
            var r, i, a;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return r = {
                    name: "HKDF",
                    salt: new Uint8Array(),
                    info: new TextEncoder().encode(n),
                    hash: "SHA-256"
                  }, e.next = 3, window.crypto.subtle.deriveKey(r, t, {
                    name: "AES-GCM",
                    length: 256
                  }, !0, ["encrypt", "decrypt"]);

                case 3:
                  return i = e.sent, e.next = 6, crypto.subtle.exportKey("raw", i);

                case 6:
                  return a = e.sent, e.abrupt("return", (s = a, btoa(String.fromCharCode.apply(null, new Uint8Array(s)))));

                case 8:
                case "end":
                  return e.stop();
              }

              var s;
            }, e);
          }));
          return function (t, n) {
            return e.apply(this, arguments);
          };
        }(),
            dt = function (e) {
          for (var t = new ArrayBuffer(e.length), n = new Uint8Array(t), r = 0, i = e.length; r < i; r++) n[r] = e.charCodeAt(r);

          return t;
        },
            mt = function () {
          var e = h(l().mark(function e(t, n) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, window.crypto.subtle.importKey("raw", t, n, !0, ["encrypt", "decrypt"]);

                case 2:
                  return e.abrupt("return", e.sent);

                case 3:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n) {
            return e.apply(this, arguments);
          };
        }(),
            gt = function () {
          var e = h(l().mark(function e(t, n, r, i, a) {
            var s, o, u;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return s = {
                    name: t,
                    iv: dt(atob(i)),
                    length: r
                  }, e.next = 3, mt(dt(atob(n)), t);

                case 3:
                  return o = e.sent, e.next = 6, window.crypto.subtle.decrypt(s, o, a);

                case 6:
                  return u = e.sent, e.abrupt("return", u);

                case 8:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n, r, i, a) {
            return e.apply(this, arguments);
          };
        }(),
            yt = function () {
          var e = h(l().mark(function e(t, n, r, i, a) {
            var s, o, u;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return s = {
                    name: t,
                    iv: dt(atob(i)),
                    length: r
                  }, e.next = 3, mt(dt(atob(n)), t);

                case 3:
                  return o = e.sent, e.next = 6, window.crypto.subtle.encrypt(s, o, a);

                case 6:
                  return u = e.sent, e.abrupt("return", u);

                case 8:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n, r, i, a) {
            return e.apply(this, arguments);
          };
        }(),
            vt = function () {
          var e = h(l().mark(function e(t, n, i) {
            var a, s, o, u;
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, lt(t, n);

                case 2:
                  return a = e.sent, s = r.sha3_224(a + i), e.next = 6, ht(btoa(s.match(/\w{2}/g).map(function (e) {
                    return String.fromCharCode(parseInt(e, 16));
                  }).join("")));

                case 6:
                  return o = e.sent, e.next = 9, pt(o, i.toString());

                case 9:
                  return u = e.sent, e.abrupt("return", u);

                case 11:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n, r) {
            return e.apply(this, arguments);
          };
        }(),
            wt = function () {
          var e = h(l().mark(function e(t, n, r) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return 256, e.next = 3, yt("AES-GCM", t, 256, n, r);

                case 3:
                  return e.abrupt("return", e.sent);

                case 4:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n, r) {
            return e.apply(this, arguments);
          };
        }(),
            bt = function () {
          var e = h(l().mark(function e(t, n, r) {
            return l().wrap(function (e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return 256, e.next = 3, gt("AES-GCM", t, 256, n, r);

                case 3:
                  return e.abrupt("return", e.sent);

                case 4:
                case "end":
                  return e.stop();
              }
            }, e);
          }));
          return function (t, n, r) {
            return e.apply(this, arguments);
          };
        }();

        e.Channel = et, e.Client = ut, e.Contact = it, e.DownloadKeyPair = function (e) {
          var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "KeyPairs",
              n = document.createElement("a");
          n.download = t, n.style = "display: none", n.href = "data:text/txt;charset=utf-8,".concat(e), document.body.appendChild(n), n.click();
        }, e.GenerateEd25519KeyPair = $e, e.GetContactBytes = Xe, e.Message = nt, e.Notify = at, e.Register = ct, e.User = rt, e.aesGCMDecrypt = bt, e.aesGCMEncrypt = wt, e.getCurrentDate = Ze, e.getDataSignature = Je, e.getMessageSharedSecret = vt, e.renderMessagesList = Qe, e.selectUrl = ze, e.sendConnectCommand = Ye, e.sendMessageCommand = He, Object.defineProperty(e, "__esModule", {
          value: !0
        });
      });
    }, {
      "@noble/ed25519": 6,
      "axios": 7,
      "js-sha3": 39
    }],
    41: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.onRpcRequest = void 0;

      var Web3MQ = _interopRequireWildcard(require("mq-web3"));

      function _getRequireWildcardCache(nodeInterop) {
        if (typeof WeakMap !== "function") return null;
        var cacheBabelInterop = new WeakMap();
        var cacheNodeInterop = new WeakMap();
        return (_getRequireWildcardCache = function (nodeInterop) {
          return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
        })(nodeInterop);
      }

      function _interopRequireWildcard(obj, nodeInterop) {
        if (!nodeInterop && obj && obj.__esModule) {
          return obj;
        }

        if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
          return {
            default: obj
          };
        }

        var cache = _getRequireWildcardCache(nodeInterop);

        if (cache && cache.has(obj)) {
          return cache.get(obj);
        }

        var newObj = {};
        var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

        for (var key in obj) {
          if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

            if (desc && (desc.get || desc.set)) {
              Object.defineProperty(newObj, key, desc);
            } else {
              newObj[key] = obj[key];
            }
          }
        }

        newObj.default = obj;

        if (cache) {
          cache.set(obj, newObj);
        }

        return newObj;
      }

      const onRpcRequest = async ({
        origin,
        request
      }) => {
        switch (request.method) {
          case 'web3-mq':
            return new Promise((resolve, reject) => {
              resolve(Web3MQ);
            });

          default:
            throw new Error('Method not found.');
        }
      };

      exports.onRpcRequest = onRpcRequest;
    }, {
      "mq-web3": 40
    }]
  }, {}, [41])(41);
});