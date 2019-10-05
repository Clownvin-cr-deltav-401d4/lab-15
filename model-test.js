require('./__tests__/supergoose');

function testModel(Model, getDocument, getDocumentUpdate, type) {
  describe(`${Model.name} Model (${type})`, () => {
    let model = new Model();
    let document;

    beforeAll(() => {
      document = getDocument();
    });

    it('can post() a new document', async () => {
      let record = await model.post(document);
      
      expect(record).toHaveProperty('_id');
      for (const property in document) {
        expect(record[property]).toBe(document[property]);
      }
    });
  
    it('can get() a document', async () => {
      let record = await model.post(document);
      let gotten = await model.get(record._id);

      expect(gotten).toHaveProperty('_id');
      for (const property in document) {
        expect(gotten[property]).toBe(document[property]);
      }
    });
  
    it('can get() all documents', async () => {
      let records = await model.get();
      expect(records.length).toBe(2);
    });
  
    it('can update() a document', async () => {
      let record = await model.post(document);
      let update = getDocumentUpdate();
      let updated = await model.put(record._id, update);

      for (const property in update) {
        expect(updated[property]).toBe(update[property]);
      }
    });
  
    it('can delete() a document', async () => {
      let record = await model.post(document);
      expect(record).toBeTruthy();
  
      await model.delete(record._id);
  
      let gotten = await model.get(record._id);
      expect(gotten).toBe(null);
    });
  });
}

module.exports = exports = testModel;
