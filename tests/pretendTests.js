(function () {
    'use strict';

    describe('pretend', function () {
        var myService;

        beforeEach(function () {
            myService = pretend('myService');
        });

        it('....', function () {
            var testPromise = myService.returns(function(){
                return 'bla';
            }).for.promise('test');

            myService.instance.test().then(function(x){
               console.log(x)
            });
            testPromise.resolve();
        });

    });
}());