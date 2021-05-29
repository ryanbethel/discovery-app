const arc = require('@architect/functions')
exports.handler = async function scheduled () {
  await arc.events.publish({
    name: 'reindex-data',
    payload: { trigger: 'daily-cron' },
  })
  return
}
