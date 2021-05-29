@app
discovery-app

@shared

@static
  fingerprint true

@http
get /
get /status
get /auth
get /login
post /logout
post /log
get /badge/:repo/:type

@scheduled
update-daily cron(0 6 ? * MON-FRI *)

@events
reindex-data

@tables
data
  scopeID *String
  dataID **String
  ttl TTL

# @aws
# profile default
# region us-east-1
  