# 'fluxgear-bind-dispatch'

Bind properties to dispatch events.

Part of the `fluxgear` project

## Example

```
import { toEvents, bindDispatch } from 'fluxgear-bind-dispatch';

const EVENTS = {
  BUTTON_CLICKED: true,
  INPUT_CHANGED([domEvent]) {
    return {
      value: domEvent.currentTarget.value,
    };
  },
}::toEvents();

const mapEventsToProps = {
  onClick: EVENTS.BUTTON_CLICKED,
  onChange: EVENTS.INPUT_CHANGED,
}::bindDIspatch();
```
