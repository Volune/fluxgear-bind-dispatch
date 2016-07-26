import { toMessage } from 'fluxgear-tomessages';

function toEvents() {
  const eventDefinitions = this;
  const events = {};
  for (const eventName of Object.keys(eventDefinitions)) {
    const message = toMessage.call(eventName);
    const definition = eventDefinitions[eventName];
    if (definition && typeof definition === 'function') {
      Object.defineProperty(message, 'create', {
        value: definition,
      });
    } else if (definition && typeof definition === 'object') {
      Object.keys(definition).forEach(key => {
        if (typeof message[key] === 'undefined') {
          Object.defineProperty(message, key, {
            value: definition[key],
          });
        }
      });
    }
    events[eventName] = message;
  }
  return events;
}

function bindDispatch() {
  const mapping = this;
  return (
    {
      dispatch,
      getEmitterProps,
    }
  ) => {
    const boundMapping = {};
    Object.keys(mapping).forEach(propName => {
      const eventType = mapping[propName];
      const create = eventType.create;
      if (create && typeof create === 'function') {
        boundMapping[propName] = (...args) => {
          const event = {
            ...(create(args, { getEmitterProps }) || {}),
            type: eventType,
          };
          dispatch(event);
        };
      } else {
        boundMapping[propName] = (...args) => {
          const event = {
            args,
            getEmitterProps,
            type: eventType,
          };
          dispatch(event);
        };
      }
    });
    return boundMapping;
  };
}

function fromDomEvent(key, domElementKey = 'value') {
  return ([domEvent]) => ({
    [key]: domEvent.currentTarget[domElementKey],
  });
}

export { toEvents, bindDispatch, fromDomEvent };
export default bindDispatch;
