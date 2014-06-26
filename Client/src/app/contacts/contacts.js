var module = angular.module('app.contacts', [
    'ui.router'
]);

module.config(function ($stateProvider) {
    $stateProvider.state('/contacts', {
        url: '/contacts',
        templateUrl: 'contacts/contacts.tpl.html',
        controller: 'ContactsController'
    });
});

module.controller('ContactsController', function ($scope) {
    $scope.telephone = '555-33-33'
});