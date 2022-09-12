# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

set -e

sed -i "s/{{hostname}}/$HOSTNAME/g" src/client-configs/client-config.prod.js
sed -i "s/{{hostname}}/$HOSTNAME/g" src/client-configs/login-config.prod.js

apt-get update
apt-get install curl

curl -L https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait --output /wait
chmod +x /wait

WAIT_TIMEOUT=240 WAIT_HOSTS=auth:4040 /wait

yarn start:prod
