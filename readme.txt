
 1. Call pretend.init with the name of the module you want to test.
 2. use the global 'pretend' object to mock services etc. Like:

    // Initialize pretend (do this once when booting your tests).
    pretend.init('myApp');

    // Mock the service/factory that needs to be injected.
    var myService = pretend.mock('myService');

    // Add options object to mock() to indicate promises, methods or properties.
    // Pretend does a best guess while instantiating the mock,
    // but this does not always results as desired.
    var myService = pretend.mock('myService', { promises: ['function1', 'function2'] });

    // The second argument for mock() can also be applied to the
    // setup() function of the mock.
    myService.setup({ promises: ['function1', 'function2'] });

    // Inject the mock as follows
    $provide.value('myService', myService.mock);

    // Setup custom (test specific) return values, like:

        // Basic
        myService.returns('someValue').for('myMethod');

        // With callback
        myService.returns(function(){
            return 'someValue';
        }).for('myOtherMethod');

        // Promise
        var promise = myService.returns('someValue').for('myMethod');
        promise.resolve(); // pass on your injected rootScope to trigger the digest loop.