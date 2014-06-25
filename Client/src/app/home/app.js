var module = angular.module('app');
module.config(function($stateProvider) {
    $stateProvider.state('/app', {
        url: '/app',
        templateUrl: "index.html",
        controller: 'AppController'
    });
});
module.controller('AppController', function ($scope) {
    $scope.greetings = 'Hello, my friend!'
});