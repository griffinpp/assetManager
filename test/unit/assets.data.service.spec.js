const dataService = require('../../src/data/assets.data.service');

let testAdapter;
let sut;

describe('assets.data.services module', () => {
  beforeEach(() => {
    // reset our stubs and subject under test
    testAdapter = {
      getRecord: sinon.stub(),
      setRecord: sinon.stub(),
      updateRecord: sinon.stub(),
      delRecord: sinon.stub(),
    };
    // set up our stub returns
    testAdapter.getRecord.withArgs('asset/testKey').returns({ uri: 'asset/testKey', name: 'test', notes: null });
    testAdapter.getRecord.withArgs('asset/missingKey').returns(null);
    // load the test adapter into the data service
    sut = dataService(testAdapter);
  });

  describe('.getAtKey()', () => {
    it('should attempt to fetch the existing record using the adapter', async () => {
      await sut.getAtKey('testKey');
      expect(testAdapter.getRecord.calledOnce).to.equal(true);
      expect(testAdapter.getRecord.calledWith('asset/testKey')).to.equal(true);
    });

    describe('when the record exists', () => {
      it('should return the record', async () => {
        return expect(sut.getAtKey('testKey')).to.eventually.deep.equal({ uri: 'testKey', name: 'test', notes: null });
      });
    });

    describe('when the record does not exist', () => {
      it('should throw an error', () => {
        return expect(sut.getAtKey('missingKey')).to.eventually.be.rejected;
      });
    });
  });

  describe('.setAtKey()', () => {
    it('should attempt to fetch an existing record', async () => {
      await sut.setAtKey('missingKey', { name: 'test' });
      expect(testAdapter.getRecord.calledOnce).to.equal(true);
      expect(testAdapter.getRecord.calledWith('asset/missingKey')).to.equal(true);
    });

    describe('when there is an existing record', () => {
      it('should throw an error', () => {
        return expect(sut.setAtKey('testKey', { name: 'test' })).to.eventually.be.rejected;
      });
    });

    describe('when there is not an existing record', () => {
      it('should insert the new record using the adapter', async () => {
        await sut.setAtKey('missingKey', { name: 'test' });
        expect(testAdapter.setRecord.calledOnce).to.equal(true);
        expect(testAdapter.setRecord.calledWith('asset/missingKey', { name: 'test' })).to.equal(true);
      });
    });
  });

  describe('.updateAtKey()', () => {
    it('should attempt to fetch the existing record', async () => {
      await sut.updateAtKey('testKey');
      expect(testAdapter.getRecord.calledOnce).to.equal(true);
      expect(testAdapter.getRecord.calledWith('asset/testKey')).to.equal(true);
    });

    describe('when there is an existing record', () => {
      it('should update the existing record using the adapter', async () => {
        await sut.updateAtKey('testKey', { notes: 'new note' });
        expect(testAdapter.updateRecord.calledOnce).to.equal(true);
        expect(testAdapter.updateRecord.calledWith(
          'asset/testKey',
          { uri: 'asset/testKey', name: 'test', notes: null },
          { notes: 'new note' },
        )).to.equal(true);
      });
    });

    describe('when there is not an existing record', () => {
      it('should throw an error', () => {
        return expect(sut.updateAtKey('missingKey', { notes: 'new note' })).to.eventually.be.rejected;
      });
    });
  });

  describe('.delAtKey()', () => {
    it('should attempt to fetch the existing record', () => {
      sut.delAtKey('testKey');
      expect(testAdapter.getRecord.calledOnce).to.equal(true);
      expect(testAdapter.getRecord.calledWith('asset/testKey')).to.equal(true);
    });

    describe('when there is an existing record', () => {
      it('should delete the existing record using the adapter', async () => {
        await sut.delAtKey('testKey');
        expect(testAdapter.delRecord.calledOnce).to.equal(true);
        expect(testAdapter.delRecord.calledWith('asset/testKey', { uri: 'asset/testKey', name: 'test', notes: null })).to.equal(true);
      });
    });

    describe('when there is not an existing record', () => {
      it('should throw an error', () => {
        return expect(sut.delAtKey('missingKey')).to.eventually.be.rejected;
      });
    });
  });
});
