const proxyquire = require('proxyquire').noCallThru();

const getStub = sinon.stub();
const putStub = sinon.stub();
getStub.withArgs('testKey').returns({ name: 'test', notes: null });
getStub.withArgs('missingKey').throws(() => {
  const e = new Error();
  e.status = 404;
  return e;
});

function pouchStub() {
  this.get = getStub;
  this.put = putStub;
}

// use proxyquire to load the subject under test, loading a stub for its dependency
// eslint-disable-next-line quote-props
const sut = proxyquire('../../src/data/adapters/couch.adapter', { 'pouchdb': pouchStub });

describe('couch.adapter module', () => {
  beforeEach(() => {
    getStub.resetHistory();
    putStub.resetHistory();
  });

  describe('.getRecord()', () => {
    it('should attempt to fetch the record from the db', async () => {
      await sut.getRecord('testKey');
      expect(getStub.calledOnce).to.equal(true);
      expect(getStub.calledWith('testKey')).to.equal(true);
    });

    describe('when the record exists', () => {
      it('should return the record\'s uri, name, and notes', async () => {
        const result = await sut.getRecord('testKey');
        expect(result).to.deep.equal({ uri: 'testKey', name: 'test', notes: null });
      });
    });

    describe('when the record does not exist', () => {
      it('should return null', async () => {
        const result = await sut.getRecord('missingKey');
        expect(result).to.equal(null);
      });
    });
  });

  describe('.setRecord()', () => {
    it('should save the record\'s name and notes properties at the specified key in the db', async () => {
      await sut.setRecord('testKey', { name: 'test', notes: 'new note', otherProp: 'some other property' });
      expect(putStub.calledOnce).to.equal(true);
      expect(putStub.calledWith({ _id: 'testKey', name: 'test', notes: 'new note' })).to.equal(true);
    });
  });

  describe('.updateRecord()', () => {
    it('should save the updated record at the specified key', async () => {
      await sut.updateRecord('testKey', { _rev: '1', name: 'test', notes: 'note' }, { name: 'newTest', notes: 'new note' });
      expect(putStub.calledOnce).to.equal(true);
      expect(putStub.calledWith({
        _id: 'testKey',
        _rev: '1',
        name: 'newTest',
        notes: 'new note',
      })).to.equal(true);
    });

    describe('when no name is provided', () => {
      it('should keep the name from the existing record', async () => {
        await sut.updateRecord('testKey', { _rev: '1', name: 'test', notes: 'note' }, { notes: 'new note' });
        expect(putStub.calledOnce).to.equal(true);
        expect(putStub.calledWith({
          _id: 'testKey',
          _rev: '1',
          name: 'test',
          notes: 'new note',
        })).to.equal(true);
      });
    });

    describe('when no notes are provided', () => {
      it('should keep the notes from the existing record', async () => {
        await sut.updateRecord(
          'testKey',
          {
            _rev: '1',
            name: 'test',
            notes: 'note',
          }, {
            name: 'newTest',
          },
        );
        expect(putStub.calledOnce).to.equal(true);
        expect(putStub.calledWith({
          _id: 'testKey',
          _rev: '1',
          name: 'newTest',
          notes: 'note',
        })).to.equal(true);
      });
    });
  });

  describe('.delRecord()', () => {
    it('should update the record\'s _deleted flag in the db', async () => {
      await sut.delRecord(
        'testKey',
        {
          _id: 'testKey',
          _rev: '1',
          name: 'test',
          notes: 'note',
        },
      );
      expect(putStub.calledOnce).to.equal(true);
      expect(putStub.calledWith({
        _id: 'testKey',
        _rev: '1',
        name: 'test',
        notes: 'note',
        _deleted: true,
      })).to.equal(true);
    });
  });
});
