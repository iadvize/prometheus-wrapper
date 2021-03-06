'use strict';

var request = require('supertest');
var service = require('./server');
var prometheus = require('../index');

describe('labels', function() {
    before(function(done) {
        service.start();
        done();
    });

    it('should be created', function(done) {
        prometheus.createCounter('mycounter', 'This is my test counter', ['foo']);

        request(service.app)
            .get('/metrics')
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;

                const payload = res.text;
                expect(payload).to.contain('# HELP test_mycounter This is my test counter\n# TYPE test_mycounter counter\n');
                done();
            });
    });

    it('should be incremented into a label', function(done) {
        prometheus.get('mycounter').inc({foo: 'bar'});

        request(service.app)
            .get('/metrics')
            .expect(200)
            .end(function(err, res) {
                if (err) throw err;

                const payload = res.text;
                expect(payload).to.contain('foo');
                expect(payload).to.contain('bar');
                done();
            });
    });

    after(function(done) {
        service.stop();
        done();
    });
});
