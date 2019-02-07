/**
 * Created by Manuel on 20/06/2017.
 */

RodiApp.controller('RodiCtrlConfirmMail', ['$scope', 'RodiSrv', '$location', '$window', function ($scope, RodiSrv, $location, $window) {

    // ************************************** //
    // ********** INIT CONFIRM ************** //
    // ************************************** //

    $scope.usernamepar = $location.search().username;
    $scope.keypar = $location.search().key;
    $scope.bRegConfirm = true;
    $scope.errormsg = "";

    RodiSrv.sendConfirmRegistration($scope.usernamepar, $scope.keypar,
        function(data)
        {
            // Success
            $scope.bRegConfirm = true;

        }, function(data){
            // Error
            $scope.bRegConfirm = false;
            $scope.errormsg = data.detail;
    });

    $scope.changepage = RodiSrv.changepage;

} ]);
