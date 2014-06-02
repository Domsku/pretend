(function () {
    'use strict';

    var DEFAULT_RETURN_VALUE = undefined;

    function createModule(moduleName){

        angular.module('pretend').factory('Pretend', ['$rootScope', '$q', '$injector', function($rootScope, $q, $injector) {
            var mock = {},
                properties = {};

            function getInstance(objectName){
                try{
                    return $injector.get(objectName);
                }catch(ex){
                    throw new Error('Unknown provider \'' + objectName + '\' in module \'' + moduleName + '\'. Was everything loaded before calling init()?');
                }
            }

            function initializeMock(objectName){
                var instance = getInstance(objectName),
                    props = Object.keys(instance);

                angular.forEach(props, function(prop){
                    var type = getPropertyType(instance, prop);
                    setProperty(prop, type, DEFAULT_RETURN_VALUE);
                });
            }

            function getPropertyType(instance, property) {
                var prop = instance[property],
                    isMethod = ('function' === typeof prop);

                if (isMethod) {
                    return (prop.toString().indexOf('.promise') === -1) ? 'method' : 'promise';
                }

                return 'property';
            }

            function setProperty(propertyName, type, value){
                var property = properties[propertyName] = {
                    name: propertyName,
                    type: type,
                    spy: undefined
                };

                setPropertyValue(property, value);
            }

            function setPropertyValue(property, value){
                if(property.type === 'property'){
                    mock[property.name] = value;
                }else{
                    mock[property.name] = null;

                    // Wrap the returning value with a callback function for the Jasmine.callFake call
                    // This way we can pass on the actual function arguments to the callback function if the user specified one.
                    property.spy = spyOn(mock, property.name).and.callFake(function () {
                        var args = arguments;

                        if (property.type === 'promise') {
                            var deferred = $q.defer();

                            property.deferred = function (reject) {
                                deferred[(reject) ? 'reject' : 'resolve']('function' === typeof value ? value.apply(value, args) : value);
                                $rootScope.$digest();
                            };

                            return deferred.promise;
                        } else {
                            return ('function' === typeof value) ? value.apply(value, args) : value;
                        }
                    });
                }
            }

            return {
                getMock: function(objectName){
                    if(!objectName) { throw new Error('The name of the object that needs to be mocked is required.'); }

                    initializeMock(objectName);

                    return {
                        mock: mock,
                        returns: function (returnValue) {
                            return {
                                for: function(propertyName){
                                    if(!propertyName){ throw new Error('The name of the property to set a return value for is required.'); }

                                    var property = properties[propertyName];
                                    if(!property){ throw new Error('The property \'' + propertyName + '\' is not part of the object \'' + objectName + '\'.'); }

                                    setPropertyValue(property, returnValue);

                                    if(property.type === 'promise'){
                                        return {
                                            resolve: function (scope) {
                                                property.deferred();
                                                if(scope) { scope.$digest(); }
                                            },
                                            reject: function (scope) {
                                                property.deferred(true);
                                                if(scope) { scope.$digest(); }
                                            }
                                        }
                                    }
                                }
                            };
                        },
                        spy: function(propertyName){
                            return properties[propertyName].spy;
                        }
                    };
                }
            };
        }]);
    }

    function Pretend(){
        var pretend = null;

        function moduleExists(moduleName) {
            try {
                angular.module(moduleName);
            } catch(ex) {
                if(/No module/.test(ex) || (ex.message.indexOf('$injector:nomod') > -1)) {
                    return false;
                }
            }
            return true;
        }

        return {
            init: function(moduleName){
                if(!moduleName){ throw new Error('A module name is required when initializing.'); }
                if(!moduleExists(moduleName)){ throw new Error('Unknown module \'' + moduleName + '\'.'); }

                angular.module('pretend', [moduleName, 'ngMock']);

                createModule(moduleName);

                angular.module('pretend').run(function(Pretend){
                    pretend = Pretend;
                });

                angular.bootstrap(document.createElement('div'), ['pretend']);
            },
            mock: function(objectName){
                if(!pretend){ throw new Error('Cannot create a mock prior to initialization.'); }
                return pretend.getMock(objectName);
            }
        }
    }

    window.pretend = new Pretend();
}());