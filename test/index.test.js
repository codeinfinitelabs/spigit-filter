'use strict';

const Stream = require('stream');
const SpigitFilter = require('../lib');
const Chai = require('chai');

const expect = Chai.expect;

describe('SpigitFilter', () => {

    const getPublisher = function () {

        const publisher = new Stream.Readable({ objectMode: true });
        publisher._read = () => {};

        return publisher;
    };

    it('does not allow unknown options', (done) => {

        expect(() => new SpigitFilter({ bogus: 'option' })).to.throw('"bogus" is not allowed');
        done();
    });

    it('does not require any options and allows all levels', (done) => {

        const stream = new SpigitFilter();
        const logs = [];
    
        stream.on('data', (log) => {

            logs.push(log);
        });

        stream.on('end', () => {

            expect.fail('End should never be called');
        });

        const publisher = getPublisher();

        publisher.pipe(stream);

        const timestamp = 'timestamp';

        publisher.push({ level: 'debug', payload: { a: 1 }, timestamp });
        publisher.push({ level: 'info', payload: { b: 1 }, timestamp });
        publisher.push({ level: 'warn', payload: { c: 1 }, timestamp });
        publisher.push({ level: 'error', payload: { d: 1 }, timestamp });

        setTimeout(() => {

            expect(logs).to.deep.equal([
                { level: 'debug', payload: { a: 1 }, timestamp: 'timestamp' },
                { level: 'info', payload: { b: 1 }, timestamp: 'timestamp' },
                { level: 'warn', payload: { c: 1 }, timestamp: 'timestamp' },
                { level: 'error', payload: { d: 1 }, timestamp: 'timestamp' } 
            ]);
            done();
        }, 100);
    });

    it('filters log level INFO', (done) => {

        const stream = new SpigitFilter({ log: 'info' });
        const logs = [];
    
        stream.on('data', (log) => {

            logs.push(log);
        });

        stream.on('end', () => {

            expect.fail('End should never be called');
        });

        const publisher = getPublisher();

        publisher.pipe(stream);

        const timestamp = 'timestamp';

        publisher.push({ level: 'debug', payload: { a: 1 }, timestamp });
        publisher.push({ level: 'info', payload: { b: 1 }, timestamp });
        publisher.push({ level: 'warn', payload: { c: 1 }, timestamp });
        publisher.push({ level: 'error', payload: { d: 1 }, timestamp });

        setTimeout(() => {

            expect(logs).to.deep.equal([ 
                { level: 'info', payload: { b: 1 }, timestamp: 'timestamp' },
                { level: 'warn', payload: { c: 1 }, timestamp: 'timestamp' },
                { level: 'error', payload: { d: 1 }, timestamp: 'timestamp' } 
            ]);
            done();
        }, 100);
    });
});