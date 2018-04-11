const bugfixes = require('bugfixes')
const AccountModel = require('bugfixes-account-models')
const Logs = require('bugfixes-account-logging')

const bugfunctions = bugfixes.functions

module.exports = (event, context, callback) => {
  const log = new Logs()
  log.action = 'account-login'

  let eventBody = JSON.parse(event.body)

  let requestId = null
  if (event.requestContext.requestId) {
    requestId = event.requestContext.requestId

    log.requestId = requestId
  }
  log.content = {
    apiKey: event.requestContext.identity.apiKey,
    email: eventBody.email
  }

  let account = new AccountModel()
  account.email = eventBody.email
  account.getAuthyId((error, result) => {
    if (error) {
      log.content.error = error
      log.send()

      return callback(error)
    }

    if (result.success) {
      if (!requestId) {
        requestId = log.generateId(result.authyId)
      }
      log.authyId = result.authyId
      log.send()

      return callback(null, bugfunctions.lambdaResult(200, {
        requestId: requestId
      }))
    }

    log.send()
    return callback(null, bugfunctions.lambdaError(201, result.message))
  })
}
