/**
 * Created by Manuel on 23/05/2017.
 */

RodiApp.controller('RodiCtrlMainMenu', ['$scope', 'RodiSrv', '$filter', '$window', '$location', '$cookieStore', function ($scope, RodiSrv, $filter, $window, $location, $cookieStore) {

    // ************************************** //
    // ********* MAIN MENU CLICK ************ //
    // ************************************** //

    $scope.indexPage = "0"; // page 0 -> index (utilizzato per i contenuti contestuali)
    $scope.showHelpIndex = "";
    $scope.bShowFeedback = false;
    $scope.feedbackMessage = {userid:"", page:"", text:"", data:""};
    $scope.bLogin = false;
    $scope.tokenid = $cookieStore.get('rodi_token');

    if ($location.path().indexOf('index.html') !== -1){
        $scope.bHome = false;
        $scope.indexPage = "0";
    } else
    {
        $scope.bHome = true;
        $scope.indexPage = RodiSrv.setPageIndex($location.path());
    }

    if($scope.tokenid){$scope.bLogin = true; $scope.userinfo = $cookieStore.get('rodi_user');} else {$scope.bLogin = false; $scope.userinfo = RodiSrv.getUserStructureEmpty();}

    $scope.changeview = function(page, index)
    {
        $window.location.href = baseUrl + page;
        $scope.indexPage = index;
    };

    // ************************************** //
    // *********** LOGIN FORM ************** //
    // ************************************** //

    $scope.formloginCss = "display_none";
    $scope.usr_name="";
    $scope.usr_psw = "";

    $scope.loginform = function()
    {
        $scope.formloginCss = "animated slideInDown";
    }

    $scope.logout = function()
    {
        $scope.bLogin = false;
        $cookieStore.remove('rodi_token');
        $cookieStore.remove('rodi_user');
    }

    $scope.closeloginform = function()
    {
        $scope.formloginCss = "display_none";
    }

    $scope.loginUser = function()
    {

        if($scope.usr_name != '' && $scope.usr_psw != '')
        {
            RodiSrv.checkLogin($scope.usr_name, $scope.usr_psw,
                function(data){
                    // Success API

                    if (data.statusText == 'OK')
                    {
                        var token = data.data.token;

                        RodiSrv.getUserInfo(token,
                            function(data){
                                //Success

                                $cookieStore.put('rodi_token', token);
                                $scope.formloginCss = "display_none";
                                $scope.bLogin = true;

                                $scope.userinfo = {pk:data.pk, username:data.username, first_name:data.first_name, last_name:data.last_name, email:data.email, groups:data.groups, title:data.title, institution:data.institution};
                                $cookieStore.put('rodi_user', $scope.userinfo);

                            }, function(data){
                                // Error
                                $cookieStore.remove('rodi_token');
                                $cookieStore.remove('rodi_user');

                                vex.dialog.alert('Login error: unable to retrieve your information');
                                $scope.userinfo = RodiSrv.getUserStructureEmpty();

                                $scope.bLogin = false;
                            }
                        );

                    }

                }, function(data){
                    // Error API
                    $scope.userinfo = RodiSrv.getUserStructureEmpty();
                    vex.dialog.alert('Login error: user name/password is not valid');
                    $scope.bLogin = false;
                });
        } else
        {
            vex.dialog.alert('Login error: insert user name and password');
        }

    }


    // ************************************** //
    // ******** SEARCH SUGGESTIONS ********** //
    // ************************************** //

    $scope.searchValue = "";

    RodiSrv.getCountryList(
        function(data){
            // Success

            $scope.countrySuggestion = data;

            $scope.searchSubmit = function()
            {
                if ($scope.searchValue !== ''){
                    var codeCountry = $filter('filter')($scope.countrySuggestion, {name: $scope.searchValue});

                    if(codeCountry.length > 0)
                    {
                        $window.location.href = baseUrl + 'country-details.html?idcountry='+ codeCountry[0].iso2;
                    } else
                    { vex.dialog.alert('Attention: No data details available'); }
                } else
                {
                    vex.dialog.alert('Attention: Type a country name');
                }

            };

        }, function(data){
            // Error
            // TODO: set e message error
    });

    // ************************************** //
    // ********** HELP & FEEDBACK *********** //
    // ************************************** //

    $scope.showHelp = function ()
    {
        $scope.showHelpIndex = $scope.indexPage;
    }

    $scope.showFeed = function ()
    {
        $scope.bShowFeedback = true;
    }

    $scope.hideHelp = function ()
    {
        $scope.showHelpIndex = "";
    }

    $scope.hideFeed = function ()
    {
        $scope.bShowFeedback = false;
    }

    $scope.sendFeed = function ()
    {

        $scope.feedbackMessage.userid = "cima";
        $scope.feedbackMessage.page = $location.path();
        $scope.feedbackMessage.data = new Date();

        var bSave = RodiSrv.sendFeedback($scope.feedbackMessage);

        if (bSave)
        {
            vex.dialog.alert('Feedback sent correctly!');
            $scope.bShowFeedback = false;
        }
    }

    // ************************************** //
    // ******* REGISTER & FORGOT PSW ******** //
    // ************************************** //

    if ($location.path().indexOf('register.html') !== -1)
    {
        $scope.usr = {
            username: "",
            password: "",
            email: ""
        };
        $scope.checkMail = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;

        $scope.sendRequestRegister = function()
        {
            if($scope.usr.username != '' && $scope.usr.password != '' && $scope.usr.email != '')
            {
                // send request via API

                RodiSrv.sendRegisterRequest($scope.usr, function (data){
                    // Success

                    vex.dialog.alert('Successfully sent request');
                    $scope.usr = {
                        username: "",
                        password: "",
                        email: ""
                    };

                }, function(data){
                    // Error

                    var sMsg = "";
                    angular.forEach(data, function(value, key) {
                        sMsg += key.replace("_"," ") + ': ' + value + '<br /> ';

                    });
                    vex.dialog.alert(sMsg);
                })

            } else
            {
                // Error message
                vex.dialog.alert('All fields are required!');
            }
        }
    }

} ]);
