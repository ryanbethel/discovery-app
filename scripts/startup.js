const arc = require('@architect/functions')


arc.events.publish({
  name: 'reindex-data',
  payload: { trigger: 'sandbox-startup' },
})

