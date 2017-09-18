/**
 * Created by Manuel on 18/09/2017.
 */

RodiApp.controller('RodiCtrlResetPassword', ['$scope', 'RodiSrv', '$location', '$window', function ($scope, RodiSrv, $location, $window) {

    // ************************************** //
    // ********** INIT CONFIRM ************** //
    // ************************************** //

    RodiSrv.checkAPIversion(function(data){}, function(data){});

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
                    console.log(data);
                    vex.dialog.alert('Password resettata con successo.');

                }, function(data)
                {
                    // Error
                    console.log(data);
                    vex.dialog.alert(data.detail);
                }
            );
        } else
            {
                //Error
                vex.dialog.alert('Password and password confirmation must be equal and not empty');
            }


    }



    console.log($scope.usernamepar);
    console.log($scope.keypar);

    $scope.changepage = function(page)
    {
        $window.location.href = baseUrl + page;
    }

} ]);