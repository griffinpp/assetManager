const sut = require('../../src/helpers');

describe('helpers module', () => {
  describe('.getErrorWithStatus()', () => {
    it('should return a new error object with the given message and .status property set', () => {
      const result = sut.getErrorWithStatus('test', 404);
      expect(result.message).to.equal('test');
      expect(result.status).to.equal(404);
    });
    describe('when no status is provided', () => {
      it('should set the status to 500', () => {
        const result = sut.getErrorWithStatus('test');
        expect(result.message).to.equal('test');
        expect(result.status).to.equal(500);
      });
    });
  });

  describe('.handleControllerError()', () => {
    const jsonStub = sinon.stub();
    const statusStub = sinon.stub().returns({ json: jsonStub });
    const resStub = {
      status: statusStub,
    };
    it('should send a response with the error\'s status and message', () => {
      sut.handleControllerError({ stack: 'stack', status: 404, message: 'test' }, resStub);
      expect(statusStub.calledWith(404)).to.equal(true);
      expect(jsonStub.calledWith({ code: 404, message: 'test' })).to.equal(true);
    });
  });

  // not *strictly* a unit test, since it's not stubbing out
  // .getErrorWithStatus, but that is tested above
  describe('.validateObjExists()', () => {
    describe('when the object does not exist', () => {
      it('should throw an error with the provided message', () => {
        expect(() => {
          sut.validateObjExists(null, 'error message');
        }).to.throw('error message');
      });
    });

    describe('when the object does exist', () => {
      it('should do nothing', () => {
        expect(() => {
          sut.validateObjExists('notNull');
        }).not.to.throw();
      });
    });
  });
});
