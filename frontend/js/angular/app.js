/**
 * Created by Manuel on 15/05/2017.
 */

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

var baseAPIurl = '/api/';
//var baseAPIurl = 'https://index.opendri.org/api/';
//var baseAPIurl = 'https://dev.riskopendata.org/api/';

RodiApp.config(function($locationProvider) {

    $locationProvider.html5Mode(true);

});
