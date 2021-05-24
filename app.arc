@app
test-rig

@shared

@http
get /
get /status
get /auth
get /login
post /logout
post /log

@scheduled
daily-smoke-tests cron(0 6 ? * MON-FRI *)

@events
smoke-test-all

@tables
data
  scopeID *String
  dataID **String
  ttl TTL

# @aws
# profile default
# region us-east-1
  