var module = angular.module('app.home', [
    'ui.router'
]);

module.config(function ($stateProvider) {
    $stateProvider.state('/home', {
        url: '/home',
        templateUrl: 'home/home.tpl.html',
        controller: 'HomeController'
    });
});

module.controller('HomeController', function ($scope) {
    $scope.greetings = 'Hi!'
});