'use strict';

function Pretend(){
    var mockService = null;

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

            var runner = angular.module('pretend-runner', [moduleName, 'pretend']);
            runner.run(function(MockService){
                mockService = MockService;
            });

            angular.bootstrap(document.createElement('div'), ['pretend-runner']);
        },
        mock: function(objectName, options){
            if(!pretend){ throw new Error('Cannot create a mock prior to initialization.'); }
            return mockService.getMock(objectName, options);
        }
    }
}

var pretend = angular.module('pretend', []);
window.pretend = new Pretend();