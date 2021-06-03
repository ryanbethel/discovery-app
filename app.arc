@app
discovery-app

@shared

@static
  fingerprint true

@http
get /
get /table

@scheduled
update-daily rate(1 hour)

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
  