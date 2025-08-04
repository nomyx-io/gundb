// Node.js test for the GunDB library
const { createGun, createDatabase, logger, config, IS_BROWSER } = require('./dist/index.js');

// Test functions
const tests = [];

function addTest(name, testFn) {
    tests.push({ name, testFn });
}

function showResult(name, passed, message = '') {
    const status = passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`${name}: ${status}${message ? ' - ' + message : ''}`);
}

// Define tests
addTest('Environment Detection', () => {
    return IS_BROWSER === false;
});

addTest('Config Loading', () => {
    return config && typeof config.gunPeers === 'object' && Array.isArray(config.gunPeers);
});

addTest('Logger Creation', () => {
    return logger && typeof logger.info === 'function';
});

addTest('Gun Instance Creation', () => {
    const gun = createGun({ gunPeers: [] }); // Use empty peers for testing
    return gun && typeof gun.get === 'function';
});

addTest('Database Creation', () => {
    const gun = createGun({ gunPeers: [] });
    const db = createDatabase(gun);
    return db && typeof db.model === 'function';
});

addTest('Model Creation', () => {
    const gun = createGun({ gunPeers: [] });
    const db = createDatabase(gun);
    
    // Simple schema for testing
    const Joi = require('joi');
    const schema = Joi.object({
        id: Joi.string(),
        name: Joi.string().required(),
        value: Joi.number()
    });
    
    const testModel = db.model('test', schema);
    return testModel && typeof testModel.save === 'function';
});

addTest('Data Storage', async () => {
    try {
        const gun = createGun({ gunPeers: [] });
        const db = createDatabase(gun);
        
        const Joi = require('joi');
        const schema = Joi.object({
            id: Joi.string(),
            name: Joi.string().required(),
            value: Joi.number()
        });
        
        const testModel = db.model('test', schema);
        
        const testData = { id: 'test1', name: 'Test Item', value: 42 };
        const result = await testModel.save(testData);
        
        return result && result.name === 'Test Item';
    } catch (error) {
        logger.error('Data storage test failed', { error: error.message });
        return false;
    }
});

addTest('Winston Logger Available (Node.js)', () => {
    try {
        // This should work in Node.js but not in browser
        const winston = require('winston');
        return winston && typeof winston.createLogger === 'function';
    } catch (error) {
        return false;
    }
});

addTest('Koa Middleware Available (Node.js)', () => {
    try {
        const { hasKoaSupport } = require('./dist/index.js');
        return hasKoaSupport === true;
    } catch (error) {
        return false;
    }
});

// Run tests
async function runTests() {
    console.log('\x1b[36m%s\x1b[0m', 'Starting Node.js compatibility tests...\n');
    logger.info('Starting Node.js compatibility tests');
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.testFn();
            showResult(test.name, result);
            if (result) passed++;
            logger.info(`Test "${test.name}": ${result ? 'PASS' : 'FAIL'}`);
        } catch (error) {
            showResult(test.name, false, error.message);
            logger.error(`Test "${test.name}" failed with error`, { error: error.message });
        }
    }
    
    console.log(`\n\x1b[36m%s\x1b[0m`, `Tests completed: ${passed}/${total} passed`);
    logger.info(`All tests completed: ${passed}/${total} passed`);
    
    process.exit(passed === total ? 0 : 1);
}

// Start tests
runTests().catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
});