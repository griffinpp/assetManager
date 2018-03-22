// don't need any call throughs to happen
const proxyquire = require('proxyquire').noCallThru();

// set up stubs
const getStub = sinon.stub();
const setStub = sinon.stub();
const delStub = sinon.stub();
getStub.withArgs('testKey').returns({ name: 'test', notes: null });
getStub.withArgs('missingKey').returns(undefined);

function cacheStub() {
  this.get = getStub;
  this.set = setStub;
  this.del = delStub;
}

// use proxyquire to load the subject under test, loading a stub for its dependency
const sut = proxyquire('../../src/data/adapters/memory.adapter', { 'node-cache': cacheStub });

describe('memory.adapter module', () => {
  beforeEach(() => {
    getStub.resetHistory();
    setStub.resetHistory();
    delStub.resetHistory();
  });

  describe('.getRecord()', () => {
    it('should attempt to fetch the record from the cache', () => {
      sut.getRecord('testKey');
      expect(getStub.calledOnce).to.equal(true);
      expect(getStub.calledWith('testKey')).to.equal(true);
    });

    describe('when the record exists in cache', () => {
      it('should return the record\'s uri, name, and notes', () => {
        const result = sut.getRecord('testKey');
        expect(result).to.deep.equal({ uri: 'testKey', name: 'test', notes: null });
      });
    });

    describe('when the record does not exist in cache', () => {
      it('should return null', () => {
        const result = sut.getRecord('missingKey');
        expect(result).to.equal(null);
      });
    });
  });

  describe('.setRecord()', () => {
    it('should save the record\'s name and notes properties into an object in the cache at the specified key', () => {
      sut.setRecord('testKey', { name: 'test', notes: 'new note', otherProp: 'some other property' });
      expect(setStub.calledOnce).to.equal(true);
      expect(setStub.calledWith('testKey', { name: 'test', notes: 'new note' })).to.equal(true);
    });
  });

  describe('.updateRecord()', () => {
    it('should save the updated record at the specified key', () => {
      sut.updateRecord('testKey', { name: 'test', notes: 'note' }, { name: 'newTest', notes: 'new note' });
      expect(setStub.calledOnce).to.equal(true);
      expect(setStub.calledWith('testKey', { name: 'newTest', notes: 'new note' })).to.equal(true);
    });

    describe('when no name is provided', () => {
      it('should keep the name from the existing record', () => {
        sut.updateRecord('testKey', { name: 'test', notes: 'note' }, { notes: 'new note' });
        expect(setStub.calledOnce).to.equal(true);
        expect(setStub.calledWith('testKey', { name: 'test', notes: 'new note' })).to.equal(true);
      });
    });

    describe('when no notes are provided', () => {
      it('should keep the notes from the existing record', () => {
        sut.updateRecord('testKey', { name: 'test', notes: 'note' }, { name: 'newTest' });
        expect(setStub.calledOnce).to.equal(true);
        expect(setStub.calledWith('testKey', { name: 'newTest', notes: 'note' })).to.equal(true);
      });
    });
  });

  describe('.delRecord()', () => {
    it('should remove the specified key from the cache', () => {
      sut.delRecord('testKey');
      expect(delStub.calledOnce).to.equal(true);
      expect(delStub.calledWith('testKey')).to.equal(true);
    });
  });
});
