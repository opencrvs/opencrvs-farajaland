# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#!/bin/bash
set -e

# Define common variables
kibana_alerting_api_url="http://kibana:5601/api/alerting/rules/_find?page=1&per_page=100&default_search_operator=AND&sort_field=name&sort_order=asc"

curl() {
  result=$(docker run --rm -v /opt/opencrvs/infrastructure/monitoring/kibana/config.ndjson:/config.ndjson --network=opencrvs_overlay_net curlimages/curl -s -w "\n%{http_code}" "$@")
  response=$(echo "$result" | sed '$d')
  http_status=$(echo "$result" | tail -n1)

  if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
    echo "HTTP request successful with status code $http_status"
  else
    echo "Error: HTTP request failed with status code $http_status"
    echo "Response: $response"
    exit 1
  fi
}
# Initial API status check to ensure Kibana is ready
status_code=$(curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD -o /dev/null -w '%{http_code}' "$kibana_alerting_api_url")

if [ "$status_code" -ne 200 ]; then
  echo "Kibana is not ready. API returned status code: $status_code"
  exit 1
fi

# Delete all alerts
curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "$kibana_alerting_api_url" | docker run --rm -i --network=opencrvs_overlay_net ghcr.io/jqlang/jq -r '.data[].id' | while read -r id; do
  curl --connect-timeout 60 -X DELETE -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "http://kibana:5601/api/alerting/rule/$id"
done

# Import configuration
curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" -H 'kbn-xsrf: true' --form file=@/config.ndjson > /dev/null

# Re-enable all alerts
curl --connect-timeout 60 -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "$kibana_alerting_api_url" | docker run --rm -i --network=opencrvs_overlay_net ghcr.io/jqlang/jq -r '.data[].id' | while read -r id; do
  curl --connect-timeout 60 -X POST -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "http://kibana:5601/api/alerting/rule/$id/_disable"
  curl --connect-timeout 60 -X POST -H 'kbn-xsrf: true' -u elastic:$ELASTICSEARCH_SUPERUSER_PASSWORD "http://kibana:5601/api/alerting/rule/$id/_enable"
done