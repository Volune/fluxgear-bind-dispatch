import { toEvents, bindDispatch } from '../src';
import expect from 'must';
import sinon from 'sinon';
import mustSinon from 'must-sinon';
mustSinon(expect);

const mapFunctionArgs = {
  dispatch() {
  },
  getEmitterProps() {
    return {};
  },
};
sinon.spy(mapFunctionArgs, 'dispatch');

describe('toEvents', () => {
  it('transform event definitions object to events dictionary', () => {
    const eventDefinitions = {
      BUTTON_CLICKED: true,
      INPUT_CHANGED([event]) {
        return {
          value: event.currentTarget.value,
        };
      },
    };
    const events = eventDefinitions::toEvents();
    expect(events).to.be.an.object();
    expect(Object.keys(events).sort()).to.eql(['BUTTON_CLICKED', 'INPUT_CHANGED']);
    expect(events.BUTTON_CLICKED).to.be.truthy();
    expect(events.INPUT_CHANGED).to.be.truthy();
    expect(events.BUTTON_CLICKED).not.to.equal(events.INPUT_CHANGED);
    expect(events.BUTTON_CLICKED).not.to.have.property('create');
    expect(events.INPUT_CHANGED.create).to.be.a.function();
    expect(events.INPUT_CHANGED.create).to.equal(eventDefinitions.INPUT_CHANGED);
  });
  it('doesn\'t fail with empty definitions', () => {
    const messages = {}::toEvents();
    expect(messages).to.be.an.object();
    expect(Object.keys(messages)).to.eql([]);
  });
});

describe('bindDispatch', () => {
  it('doesn\'t fail with empty mapping', () => {
    const mapFunction = {}::bindDispatch();
    expect(mapFunction).to.be.a.function();
    const mapResult = mapFunction(mapFunctionArgs);
    expect(mapResult).to.be.an.object();
    expect(mapResult).to.eql({});
  });
  it('map events', () => {
    const events = {
      BUTTON_CLICKED: true,
      INPUT_CHANGED([event]) {
        return {
          event,
        };
      },
    }::toEvents();
    const mapFunction = {
      onClick: events.BUTTON_CLICKED,
      onChange: events.INPUT_CHANGED,
    }::bindDispatch();
    expect(mapFunction).to.be.a.function();
    const mapResult = mapFunction(mapFunctionArgs);
    expect(mapResult).to.be.an.object();
    expect(Object.keys(mapResult).sort()).to.eql(['onChange', 'onClick']);
    mapFunctionArgs.dispatch.reset();
    mapResult.onClick();
    expect(mapFunctionArgs.dispatch).to.have.been.calledOnce();
    const onClickArg = mapFunctionArgs.dispatch.firstCall.args[0];
    expect(onClickArg).to.be.truthy();
    expect(onClickArg.type).to.equal(events.BUTTON_CLICKED);
    mapFunctionArgs.dispatch.reset();
    const changeEvent = { value: 'test' };
    mapResult.onChange(changeEvent);
    expect(mapFunctionArgs.dispatch).to.have.been.calledOnce();
    const onChangeArg = mapFunctionArgs.dispatch.firstCall.args[0];
    expect(onChangeArg).to.be.truthy();
    expect(onChangeArg.type).to.equal(events.INPUT_CHANGED);
    expect(onChangeArg.event).to.equal(changeEvent);
  });
});
