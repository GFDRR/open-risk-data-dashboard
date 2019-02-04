/**
 * Created by Manuel on 15/05/2017.
 */

 // https://tc39.github.io/ecma262/#sec-array.prototype.find
 // Array.prototype.find() polyfill
 if (!Array.prototype.find) {
   Object.defineProperty(Array.prototype, 'find', {
     value: function(predicate) {
      // 1. Let O be ? ToObject(this value).
       if (this == null) {
         throw new TypeError('"this" is null or not defined');
       }

       var o = Object(this);

       // 2. Let len be ? ToLength(? Get(O, "length")).
       var len = o.length >>> 0;

       // 3. If IsCallable(predicate) is false, throw a TypeError exception.
       if (typeof predicate !== 'function') {
         throw new TypeError('predicate must be a function');
       }

       // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
       var thisArg = arguments[1];

       // 5. Let k be 0.
       var k = 0;

       // 6. Repeat, while k < len
       while (k < len) {
         // a. Let Pk be ! ToString(k).
         // b. Let kValue be ? Get(O, Pk).
         // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
         // d. If testResult is true, return kValue.
         var kValue = o[k];
         if (predicate.call(thisArg, kValue, k, o)) {
           return kValue;
         }
         // e. Increase k by 1.
         k++;
       }

       // 7. Return undefined.
       return undefined;
     },
     configurable: true,
     writable: true
   });
 }

var RodiApp = angular.module('RodiApp', ['ngTable']);

function getLocation(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

var spli_url = getLocation(window.location.href);
var baseUrl = spli_url.protocol + '//' + spli_url.host + '/';
//var baseUrl = 'http://localhost:63342/RODI/frontend/';

//
// Base API url
//
// NOTE:
//     use:
//         baseAPIurl = 'https://dev.riskopendata.org/api/'
//     to have full access to development backend from
//     your local development installation
//
//var baseAPIurl = '/api/';
var baseAPIurl = 'https://dev.riskopendata.org/api/';
//var baseAPIurl= 'https://index.opendri.org/api/'

RodiApp.config(function($locationProvider) {

    $locationProvider.html5Mode(true);

});
