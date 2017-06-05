/**
 * Created by Manuel on 15/05/2017.
 */

var RodiApp = angular.module('RodiApp', []);

var baseUrl = 'http://localhost:63342/RODI/';
// Da modificare quando è online

// var baseUrl = 'http://www.riskopendata.org/';

RodiApp.config(function($locationProvider) {

    $locationProvider.html5Mode(true);

});
