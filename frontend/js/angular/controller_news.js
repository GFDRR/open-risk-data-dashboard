/**
 * Created by Manuel on 22/05/2017.
 */

RodiApp.controller('RodiCtrlNews', ['$scope', 'RodiSrv', '$location', '$window', function ($scope, RodiSrv, $location, $window) {


    var idNews = $location.search().idnews;

    $scope.newsDetails = RodiSrv.getNewsDetails(idNews);

    console.log($scope.newsDetails);

    $scope.goBack = function(page)
    {
        $window.history.back();
    };

}]);
