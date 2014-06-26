var module = angular.module('app', [
    'ui.router',
    'templates',
    'app.home',
    'app.contacts'
]);
module.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/home');
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
});

module.controller('AppController', function ($scope, $rootScope, $location) {

});

$(document).ready(function () {
    angular.bootstrap($('html'), ['app']);
});