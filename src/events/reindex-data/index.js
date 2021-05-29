// const arc = require('@architect/functions')
const reindex = require('@architect/shared/reindex')
exports.handler = async function subscribe () {
//   const message = event.Records[0].Sns.Message
//   const item = message ? JSON.parse(message).item : []
  await reindex()
  return
}
