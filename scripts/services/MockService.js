'use strict';

pretend.factory('MockService', ['$rootScope', '$q', '$injector', function($rootScope, $q, $injector){
    var DEFAULT_RETURN_VALUE = undefined;

    var mock = {},
        properties = {},
        instance = null;

    function getInstance(objectName){
        try{
            return $injector.get(objectName);
        }catch(ex){
            throw new Error('Unknown provider \'' + objectName + '\'. Was everything loaded before calling init()?');
        }
    }

    function initializeMock(objectName){
        instance = getInstance(objectName);
        angular.forEach(Object.keys(instance), setProperty);
    }

    function getPropertyType(propertyName) {
        var prop = instance[propertyName],
            isMethod = ('function' === typeof prop);

        if (isMethod) {
            return (prop.toString().indexOf('.promise') === -1) ? 'method' : 'promise';
        }

        return 'property';
    }

    function getProperty(propertyName){
        return properties[propertyName];
    }

    function setProperty(propertyName, options){
        var property = getProperty(propertyName);

        if(!property){
            properties[propertyName] = {
                name: propertyName,
                type: getPropertyType(propertyName),
                spy: undefined,
                value: DEFAULT_RETURN_VALUE
            };
        }

        if(options){
            properties[propertyName] = angular.extend(properties[propertyName], options);
        }

        return setPropertyValue(propertyName);
    }

    function setPropertyValue(propertyName){
        var property = getProperty(propertyName);
        if(!property){ throw new Error('The property \'' + propertyName + '\' is not part of the object \'' + instance.name + '\'.'); }

        function getReturnValue(args){
            return ('function' === typeof property.value) ? property.value.apply(property.value, args) : property.value;
        }

        if(property.type === 'property'){
            mock[property.name] = getReturnValue();
        }else{
            mock[property.name] = null;

            // Wrap the returning value with a callback function for the Jasmine.callFake call
            // This way we can pass on the actual function arguments to the callback function if the user specified one.
            property.spy = spyOn(mock, property.name).and.callFake(function () {
                var args = arguments;

                if (property.type === 'promise') {
                    var deferred = $q.defer();

                    property.deferred = function (reject) {
                        deferred[(reject) ? 'reject' : 'resolve'](getReturnValue(args));
                        $rootScope.$digest();
                    };

                    return deferred.promise;
                } else {
                    return getReturnValue(args);
                }
            });
        }

        return property;
    }

    return {
        getMock: function(objectName, options){
            if(!objectName) { throw new Error('The name of the object that needs to be mocked is required.'); }

            initializeMock(objectName);

            var result = {
                mock: mock,
                returns: function (returnValue) {
                    return {
                        for: function(propertyName){
                            if(!propertyName){ throw new Error('The name of the property to set a return value for is required.'); }

                            var property = setProperty(propertyName, { value: returnValue });
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
                },
                setup: function(options){
                    angular.forEach(options, function(value, key){
                        angular.forEach(value, function(propertyName){
                            setProperty(propertyName, { type: key });
                        });
                    });
                }
            };

            if(options){ result.setup(options); }
            return result;
        }
    };
}]);