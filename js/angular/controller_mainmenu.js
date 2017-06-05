/**
 * Created by Manuel on 23/05/2017.
 */

RodiApp.controller('RodiCtrlMainMenu', ['$scope', 'RodiSrv', '$filter', '$window', '$location', function ($scope, RodiSrv, $filter, $window, $location) {

    // ************************************** //
    // ********* MAIN MENU CLICK ************ //
    // ************************************** //

    if ($location.path().indexOf('index.html') !== -1){
        $scope.bHome = false;
    } else
    {
        $scope.bHome = true;
    }

    $scope.changeview = function(page)
    {
        $window.location.href = baseUrl + page;
    };


    // ************************************** //
    // *********** LOGIN FORM ************** //
    // ************************************** //

    $scope.formloginCss = "display_none";
    $scope.bLogin = false;
    $scope.username = "";

    $scope.loginform = function()
    {
        $scope.formloginCss = "animated slideInDown";
    }

    $scope.logout = function()
    {
        $scope.bLogin = false;
    }

    $scope.closeloginform = function()
    {
        $scope.formloginCss = "display_none";
    }

    $scope.loginUser = function()
    {
        var obj;
        obj = RodiSrv.checkLogin($scope.usr_name, $scope.usr_psw);

        if(obj.status == "OK")
        {
        //     Login success
        //    Sets local store cookies
            $scope.formloginCss = "display_none";
            $scope.bLogin = true;
            $scope.username = obj.name;

        }else {
        //    Login error
            vex.dialog.alert('Login error: password or user name not valid');
        }

    }


    // ************************************** //
    // ******** SEARCH SUGGESTIONS ********** //
    // ************************************** //

    $scope.searchValue = "";
    $scope.countrySuggestion = RodiSrv.getCountryList();

    $scope.searchSubmit = function()
    {
        if ($scope.searchValue !== ''){
            var codeCountry = $filter('filter')($scope.countrySuggestion, {desc: $scope.searchValue});

            console.log(codeCountry);

            if(codeCountry.length > 0)
            {
                $window.location.href = baseUrl + 'country-details.html?idcountry='+ codeCountry[0].code;
            } else
                { vex.dialog.alert('Attention: No data details available'); }
        } else
        {
            vex.dialog.alert('Attention: Type a country name');
        }

    };

} ]);
