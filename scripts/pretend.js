(function () {
    'use strict';

    function createModule(){
        angular.module('pretend').factory('Pretend', ['$rootScope', '$q', function($rootScope, $q, $provider) {
            return {
                getMock: function(name){
                    var instance = {},
                        spies = {},
                        deferredFunctions = {},
                        realInstance = angular.injector(['pretend']).get(name);


                    var keys = Object.keys(realInstance);

                    angular.forEach(keys, function(key){
                        setProperty(key, undefined, { type: (function(){
                            var prop =  realInstance[key],
                                isMethod = ('function' === typeof prop);

                            if(isMethod){
                                return (prop.toString().indexOf('.promise') === -1) ? 'method' : 'promise';
                            }

                            return 'property'
                        }())});
                    })

                    function setProperty(property, value, options){

                        if(options.type === 'property'){
                            instance[property] = value;
                        }else{
                            instance[property] = null;
                            // Wrap the returning value with a callback function for the Jasmine.callFake call
                            // This way we can pass on the actual function arguments to the callback function if the user specified one.
                            spies[property] = spyOn(instance, property).and.callFake(function () {
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
                        instance: instance,
                        spies: spies
                    };
                }
            };
        }]);
    }

    function Pretend(){
        var pretend = null;

        return {
            init: function(name){
                angular.module('pretend', [name]);

                createModule();

                angular.module('pretend').run(function(Pretend){
                    pretend = Pretend;
                });

                angular.bootstrap(document.createElement('div'), ['pretend']);
            },
            mock: function(name){
                return pretend.getMock(name);
            }
        }
    }

    window.pretend = new Pretend();
}());