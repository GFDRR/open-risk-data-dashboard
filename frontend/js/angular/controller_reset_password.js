/**
 * Created by Manuel on 18/09/2017.
 */

RodiApp.controller('RodiCtrlResetPassword', ['$scope', 'RodiSrv', '$location', '$window', function ($scope, RodiSrv, $location, $window) {

    // ************************************** //
    // ********** INIT CONFIRM ************** //
    // ************************************** //

    $scope.usernamepar = $location.search().username;
    $scope.keypar = $location.search().key;
    $scope.errormsg = "";
    $scope.password="";
    $scope.password_again="";


    $scope.sendNewPassword = function()
    {

        if($scope.password !== '' && $scope.password_again !== '' && $scope.password == $scope.password_again)
        {
            RodiSrv.setNewPasswordTwice($scope.usernamepar, $scope.keypar, $scope.password, $scope.password_again,
                function(data)
                {
                    // Success
                    vex.dialog.alert('New password successfully set.');

                }, function(data)
                {
                    // Error
                    vex.dialog.alert(data.detail);
                }
            );
        } else
            {
                //Error
                vex.dialog.alert('The Password and the Password confirmation fields are mandatory and must have the same value.');
            }

    }

    $scope.changepage = function(page)
    {
        $window.location.href = baseUrl + page;
    }

} ]);
