/**
 * Created by Manuel on 23/05/2017.
 */

RodiApp.controller('RodiCtrlMainMenu', ['$scope', 'RodiSrv', '$filter', '$window', '$location', function ($scope, RodiSrv, $filter, $window, $location) {

    // ************************************** //
    // ********* MAIN MENU CLICK ************ //
    // ************************************** //

    $scope.indexPage = "0"; // page 0 -> index (utilizzato per i contenuti contestuali)
    $scope.showHelpIndex = "";
    $scope.bShowFeedback = false;
    $scope.feedbackMessage = {page:"", comment:""};
    $scope.bLogin = false;
    $scope.bResetPassword = false;
    // $scope.tokenid = $cookieStore.get('rodi_token');
    $scope.tokenid = localStorage.getItem('rodi_token');

    if ($location.path().indexOf('index.html') !== -1){
        $scope.bHome = false;
        $scope.indexPage = "0";
    } else
    {
        $scope.bHome = true;
        $scope.indexPage = RodiSrv.setPageIndex($location.path());
    }

    if($scope.tokenid){$scope.bLogin = true; $scope.userinfo = JSON.parse(localStorage.getItem('rodi_user'));} else {$scope.bLogin = false; $scope.userinfo = RodiSrv.getUserStructureEmpty();}

    $scope.changeview = function(page, index)
    {
        $window.location.href = baseUrl + page;
        $scope.indexPage = index;
    };

    $scope.downloadRodiCSV = function()
    {
        // Download del file CSV con tutti i datasets

        $window.location.href = baseAPIurl + 'datasets_dump';
        // RodiSrv.getCSVFile ($scope.tokenid,
        //     function(data)
        //     {
        //         OK
                // var hiddenElement = document.createElement('a');
                //
                // hiddenElement.href = 'data:attachment/csv,' + encodeURI(data);
                // hiddenElement.target = '_blank';
                // hiddenElement.download = 'open_data_for_resilience_index.csv';
                // document.body.appendChild(hiddenElement);
                // hiddenElement.click();
                // document.body.removeChild(hiddenElement);
            //
            // }, function(data)
            // {
            //     Error
                // console.log(data);
            // })

    }

    // ************************************** //
    // *********** LOGIN FORM ************** //
    // ************************************** //

    $scope.formloginCss = "display_none";
    $scope.usr_name="";
    $scope.usr_psw = "";

    $scope.loginform = function($event)
    {
        $event.preventDefault();
        $scope.formloginCss = "animated slideInDown";
    }

    $scope.logout = function()
    {
        $scope.bLogin = false;
        localStorage.removeItem('rodi_token');
        localStorage.removeItem('rodi_user');


    }

    $scope.closeloginform = function()
    {
        $scope.formloginCss = "display_none";
        // resets form for security reasons
        $scope.usr_name = '';
        $scope.usr_psw = '';
    }

    $scope.loginUser = function()
    {
        if($scope.usr_name != '' && $scope.usr_psw != '')
        {
            RodiSrv.checkLogin($scope.usr_name, $scope.usr_psw,
                function(data){
                    // Success API

                    if (data.statusText == 'OK' || data.statusText == 'HTTP/2.0 200')
                    {
                        var token = data.data.token;

                        RodiSrv.getUserInfo(token,
                            function(data){
                                //Success

                                localStorage.setItem('rodi_token', token);

                                $scope.formloginCss = "display_none";
                                $scope.bLogin = true;

                                $scope.userinfo = {pk:data.pk, username:data.username, first_name:data.first_name, last_name:data.last_name, email:data.email, groups:data.groups, title:data.title, institution:data.institution};
                                localStorage.setItem('rodi_user', JSON.stringify($scope.userinfo));


                            }, function(data){
                                // Error
                                localStorage.removeItem('rodi_token');
                                localStorage.removeItem('rodi_user');

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

    $scope.setForgotPassword = function(status)
    {
        $scope.bResetPassword = status;
    }

    $scope.resetPassword = function()
    {

        RodiSrv.resetPassword($scope.usr_name,
            function(data){
                // Success API

                vex.dialog.alert("Request correctly sent, you will receive a message at the email address connected to your user name with instructions on how to reset your password.");
                $scope.bResetPassword = false;

            }, function(data){
                // Error API
                vex.dialog.alert('User name not valid or request already sent.');
            });
    }

    // ************************************** //
    // ******** SEARCH SUGGESTIONS ********** //
    // ************************************** //

    // $scope.searchValue = "";

    // RodiSrv.getCountryList(
    //     function(data){
            // Success

            // $scope.countrySuggestion = data;
            //
            // $scope.searchSubmit = function()
            // {
            //     if ($scope.searchValue !== ''){
            //         var codeCountry = $filter('filter')($scope.countrySuggestion, {name: $scope.searchValue});
            //
            //         if(codeCountry.length > 0)
            //         {
            //             $window.location.href = baseUrl + 'country-details.html?idcountry='+ codeCountry[0].wb_id;
            //         } else
            //         { vex.dialog.alert('Attention: No data details available'); }
            //     } else
            //     {
            //         vex.dialog.alert('Attention: Type a country name');
            //     }
            //
            // };
        //
        // }, function(data){
            // Error
            // TODO: set e message error
    // });

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

        $scope.feedbackMessage.page = "https:/" + $location.url();

        console.log($scope.feedbackMessage);

        RodiSrv.sendFeedback($scope.feedbackMessage, $scope.tokenid,
            function(data){
                // Success
                vex.dialog.alert('Feedback sent correctly!');
                $scope.bShowFeedback = false;

            }, function(data){
                // Error
                vex.dialog.alert('Error, feedback not sent!');
                $scope.bShowFeedback = false;
            });

    }

    // ************************************** //
    // ******* REGISTER & FORGOT PSW ******** //
    // ************************************** //

    if ($location.path().indexOf('register.html') !== -1)
    {
        $scope.usr = {
            username: "",
            institution: "",
            first_name: "",
            last_name: "",
            title: "",
            password: "",
            confirm_password: "",
            email: ""
        };

        $scope.checkMail = /^[a-z]+[a-z0-9._]+@[a-z0-9._-]+\.[a-z.]{2,5}$/;

        $scope.sendRequestRegister = function()
        {
            if($scope.usr.username != '' && $scope.usr.password != '' && $scope.usr.email != '' && $scope.usr.title != '' && $scope.usr.first_name != '' && $scope.usr.last_name != '')
            {
                // send request via API

                if ($scope.usr.password == $scope.usr.confirm_password)
                {
                    RodiSrv.sendRegisterRequest($scope.usr, function (data){
                        // Success

                        vex.dialog.alert('Registration confirmation sent to ' + $scope.usr.email + '. Please check your mailbox.');
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
                } else {
                    // Password e confirm password not match
                    vex.dialog.alert('Password and confirm password must be the same!');
                }

            } else
            {
                // Error message
                vex.dialog.alert('All fields are required!');
            }
        }
    }

} ]);
