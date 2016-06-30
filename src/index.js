import { toMessage } from 'fluxgear-tomessages';

function toEvents() {
  const eventDefinitions = this;
  const events = {};
  for (const eventName of Object.keys(eventDefinitions)) {
    const message = toMessage.call(eventName);
    const create = eventDefinitions[eventName];
    if (create && typeof create === 'function') {
      Object.defineProperty(message, 'create', {
        value: create,
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

export { toEvents, bindDispatch };
export default bindDispatch;
