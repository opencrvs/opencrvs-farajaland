# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

echo "Waiting for 30 seconds before running migrations... This is to ensure that postgres-on-deploy has finished."
sleep 30

docker service update --force --update-parallelism 1 --update-delay 30s opencrvs_migration
echo "Docker service update returned $?"

while true; do
  status=$(docker service inspect opencrvs_migration --format '{{.UpdateStatus.State}}')
  message=$(docker service inspect opencrvs_migration --format '{{.UpdateStatus.Message}}')

  echo "Update status: $status - $message"

  case "$status" in
    completed)
      echo "Migration finished successfully ✅"
      exit 0
      ;;
    paused|rollback_paused)
      echo "Migration failed ❌"
      exit 1
      ;;
  esac

  sleep 5
done
