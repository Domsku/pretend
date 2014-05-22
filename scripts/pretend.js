(function () {
    'use strict';

    angular.module('pretend', []);
    angular.module('pretend').factory('Pretend', function ($rootScope, $q) {

        return {
            get: function(){
                 return function Pretend(instanceName) {
                    var instance = {},
                        deferredFunctions = {};

                    function setProperty(property, value, options){


                        if(options.type === 'property'){
                            instance[property] = value;
                        }else{
                            instance[property] = null;
                            // Wrap the returning value with a callback function for the Jasmine.callFake call
                            // This way we can pass on the actual function arguments to the callback function if the user specified one.
                            spyOn(instance, property).and.callFake(function () {
                                var args = arguments;

                                if (options.type === 'promise') {
                                    var deferred = $q.defer();

                                    deferredFunctions[property] = function (reject) {
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
                        returns: function (value) {
                            return {
                                for: {
                                    property: function(name){
                                        setProperty(name, value, { type: 'property' });
                                    },
                                    method: function(name){
                                        setProperty(name, value, { type: 'method' });
                                    },
                                    promise: function(name){
                                        setProperty(name, value, { type: 'promise' });

                                        return {
                                            resolve: function () {
                                                deferredFunctions[name]();
                                            },
                                            reject: function () {
                                                deferredFunctions[name](true);
                                            }
                                        }
                                    }
                                }
                            };
                        },
                        instance: instance
                    }
                };
            }
        }
    });

    angular.module('pretend').run(function(Pretend){
        window.pretend = Pretend.get();
    });
    angular.bootstrap(document.createElement('div'), ['pretend']);
}());