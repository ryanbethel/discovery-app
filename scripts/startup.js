const arc = require('@architect/functions')

async function main () {

  await arc.events.publish({
    name: 'reindex-data',
    payload: { trigger: 'sandbox-startup' },
  })

}

main()
