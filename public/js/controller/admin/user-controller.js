'use strict';

define(['angular'], function(angular) {

    var app = angular.module('bugattiApp.controller.admin.userModule', []);

    app.controller('UserCtrl', ['$scope', '$stateParams', '$state', '$modal', 'UserService', 'Auth',
        function($scope, $stateParams, $state, $modal, UserService, Auth) {
            $scope.loginUser = Auth.user;
            $scope.currentPage = 1;
            $scope.pageSize = 20;

            $scope.searchForm = function(jobNo) {
                // count
                UserService.count(jobNo, function(data) {
                    $scope.totalItems = data;
                });

                // list
                UserService.getPage(jobNo, 0, $scope.pageSize, function(data) {
                    $scope.users = data;
                });
            };

            // default list
            $scope.searchForm($scope.s_jobNo);

            // set page
            $scope.setPage = function (pageNo) {
                UserService.getPage($scope.s_jobNo, pageNo - 1, $scope.pageSize, function(data) {
                    $scope.users = data;
                });
            };

            // remove
            $scope.delete = function(jobNo, index) {
                var modalInstance = $modal.open({
                    templateUrl: 'partials/modal.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.ok = function () {
                            UserService.remove(jobNo, function(data) {
                                $modalInstance.close(data);
                            });
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                });
                modalInstance.result.then(function(data) {
                    $scope.users.splice(index, 1);
                    UserService.count($scope.s_jobNo, function(num) {
                        $scope.totalItems = num;
                    });
                });
            };
    }]);

    app.controller('UserShowCtrl', ['$scope', '$stateParams', 'UserService',
        function($scope, $stateParams, UserService) {
        $scope.user = {};
        UserService.get($stateParams.id, function(data) {
            $scope.user = data;
        });
    }]);

    app.controller('UserCreateCtrl', ['$scope', '$stateParams', '$state', 'UserService',
        function($scope, $stateParams, $state, UserService) {
            $scope.user = {role: 'user', locked: false}
            $scope.saveOrUpdate = function(user) {
                UserService.save(angular.toJson(user), function(data) {
                    if (data.r === 'exist') {
                        $scope.form.jobNo.$invalid = true;
                        $scope.form.jobNo.$error.exists = true;
                    } else {
                        $state.go('^');
                    }
                });
            };

        }]);

    app.controller('UserUpdateCtrl', ['$scope', '$filter', '$stateParams', '$state', 'UserService', 'Auth',
        function($scope, $filter, $stateParams, $state, UserService, Auth) {
            $scope.loginUser = Auth.user;
            $scope.user, $scope.master = {};

            UserService.get($stateParams.id, function(data) {
                $scope.master = data;
                $scope.reset = function() {
                    $scope.user = angular.copy($scope.master);
                };
                $scope.isUnchanged = function(user) {
                    return angular.equals(user, $scope.master);
                };
                $scope.reset();

            });

            $scope.saveOrUpdate = function(user) {
                user.lastVisit = $filter('date')(user.lastVisit, "yyyy-MM-dd HH:mm:ss")
                UserService.update($stateParams.id, angular.toJson(user), function(data) {
                    if (data.r === 'exist') {
                        $scope.form.jobNo.$invalid = true;
                        $scope.form.jobNo.$error.exists = true;
                    } else {
                        $state.go('^');
                    }
                });
            };

    }]);

});
