/**
 * Created by Manuel on 15/05/2017.
 */

var RodiApp = angular.module('RodiApp', ['ngCookies']);

var baseUrl = 'http://localhost:63342/RODIGitHub/frontend/';
// Da modificare quando è online
// var baseUrl = 'http://www.riskopendata.org/';

var baseAPIurl = 'https://www.riskopendata.org/api-dev/'; // Sviluppo

RodiApp.config(function($locationProvider) {

    $locationProvider.html5Mode(true);

});
