/**
 * Created by Manuel on 15/05/2017.
 */


RodiApp.directive('svgMap', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        templateUrl: 'img/svg_file/world.svg',
        link: function (scope, element, attrs) {

            var regions = element[0].querySelectorAll('path');

            angular.forEach(regions, function (path, key) {
                var regionElement = angular.element(path);
                regionElement.attr("region", "");
                regionElement.attr("array-data", "arrayData");
                regionElement.attr("obj-rodi-variable", "objRodiVariable");
                // regionElement.attr("b-popup-country", "bPopupCountry");
                // regionElement.attr("value-data", "valueData");
                // regionElement.attr("popup-class", "popupClass");
                $compile(regionElement)(scope);
            })

        }
    }
}]);

RodiApp.directive('region', ['$compile', '$window', function ($compile, $window) {
    return {
        restrict: 'A',
        scope: {
            "arrayData": "=arrayData",
            "objRodiVariable": "=objRodiVariable"
        },
        link: function (scope, element, attrs) {

            scope.elementId = element.attr("id");
            scope.elementDesc = element.attr("data-name");

            scope.regionClick = function () {
                $window.location.href = scope.objRodiVariable.location + 'country-details.html?idcountry='+ scope.elementId;
            };

            scope.showPopup = function ($event) {

                console.log("X ->",$event.originalEvent.pageX,"Y ->",$event.originalEvent.pageY);

                scope.popupX = $event.originalEvent.pageX;
                scope.popupY = $event.originalEvent.pageY;

                scope.objRodiVariable.bPopupCountry = true;
                scope.objRodiVariable.countryID = scope.elementId;
                scope.objRodiVariable.countryDesc = scope.elementDesc;
                scope.objRodiVariable.valueData = scope.arrayData[scope.elementId].value;
                scope.objRodiVariable.popupClass = "animated fadeIn";
            };

            scope.hidePopup = function () {

                scope.objRodiVariable.bPopupCountry = false;
                // scope.bPopupCountry = false;
                scope.objRodiVariable.valueData = "";
                scope.objRodiVariable.countryID ="";
                scope.objRodiVariable.countryDesc = "";
                scope.objRodiVariable.popupClass = "animated fadeOut";
            };

            if(scope.elementId in scope.arrayData){

                // Click event
                element.attr("ng-click", "regionClick()");

                // Mouse over-leave
                element.attr("ng-mouseover", "showPopup($event)");
                element.attr("ng-mouseleave", "hidePopup()");

                // Remove style elements from svg
                element.removeAttr("style");
                // Replace new style elements

                scope.$watch("arrayData", function(newValue, oldValue) {
                    element.attr("style", "fill:rgb(255," + parseInt((1-scope.arrayData[scope.elementId].value) * 255) + "," + parseInt((1-scope.arrayData[scope.elementId].value) * 255)  + "); fill-rule:evenodd;");
                });

            }

            element.removeAttr("region");
            $compile(element)(scope);
        }
    }
}]);

RodiApp.directive('hazardmenu',function(){
    return {
        transclude: true,
        restrict: 'E',
        controller: "RodiCtrl",
        templateUrl: 'views/hazard_menu.html'
    }
});

RodiApp.directive('mainmenu',function(){
    return {
        transclude: true,
        restrict: 'E',
        controller: "RodiCtrlMainMenu",
        templateUrl: 'views/web_menu.html'
    }
});


RodiApp.directive('loginform',function(){
    return {
        transclude: true,
        restrict: 'E',
        controller: "RodiCtrlMainMenu",
        templateUrl: 'views/login_form.html'
    }
});

RodiApp.directive('helpfeedbackbox',function(){
    return {
        transclude: true,
        restrict: 'E',
        controller: "RodiCtrlMainMenu",
        templateUrl: 'views/help_feedback_view.html'
    }
});

