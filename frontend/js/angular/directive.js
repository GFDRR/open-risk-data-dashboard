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

            scope.$watch("arrayData", function(newValue, oldValue) {

                scope.elementId = element[0].attributes.id.value;
                scope.elementDesc = element[0].attributes[2].value;

                scope.regionClick = function () {
                    $window.location.href = scope.objRodiVariable.location + 'dataset_list.html?idcountry='+ scope.elementId + '&idcategory=0';
                };

                scope.showPopup = function ($event) {

                    scope.objRodiVariable.popupX = $event.originalEvent.clientX;
                    scope.objRodiVariable.popupY = $event.originalEvent.clientY;

                    scope.objRodiVariable.bPopupCountry = true;
                    scope.objRodiVariable.countryID = scope.elementId;
                    scope.objRodiVariable.countryDesc = scope.elementDesc;
                    scope.objRodiVariable.valueData = parseInt(scope.arrayData[scope.elementId].media * 100);
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

                if(scope.arrayData != undefined)
                {
                    if(scope.elementId in scope.arrayData){

                        // Click event
                        element.attr("ng-click", "regionClick()");

                        // Mouse over-leave
                        element.attr("ng-mouseover", "showPopup($event)");
                        element.attr("ng-mouseleave", "hidePopup()");

                        // Remove style elements from svg
                        element.removeAttr("style");

                        // Replace new style elements
                        element.attr("style", "fill:rgb(" + parseInt((1-scope.arrayData[scope.elementId].media) * 255)  + "," + parseInt((1-scope.arrayData[scope.elementId].media) * 255) + ",255); fill-rule:evenodd;");

                    }
                }

                element.removeAttr("region");
                $compile(element)(scope);

            });

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

RodiApp.directive('browsedata',function(){
    return {
        transclude: true,
        restrict: 'E',
        controller: "RodiCtrl",
        templateUrl: 'views/browse_data.html'
    }
});

RodiApp.directive('rodifooter',function(){
    return {
        transclude: true,
        restrict: 'E',
        controller: "RodiCtrl",
        templateUrl: 'views/footer.html'
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

