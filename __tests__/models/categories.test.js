const Categories = require('../../src/models/categories/categories');

const testModel = require('../../model-test');

testModel(Categories, () => ({name: 'Test Category', description: 'A test category...'}), () => ({name: 'Updated Category'}), 'Modular');
