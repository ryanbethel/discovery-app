@app
discovery-app

@shared

@static
  fingerprint true

@http
get /

@scheduled
update-daily cron(0 * * * * *)

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
  