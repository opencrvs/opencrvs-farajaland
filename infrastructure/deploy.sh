# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e

BASEDIR=$(dirname $0)
PROJECT_ROOT=$(dirname $(dirname $0))

# Default values
SSH_PORT=22

# Reading Names parameters
for i in "$@"; do
    case $i in
    --host=*)
        HOST="${i#*=}"
        shift
        ;;
    --ssh_host=*)
        SSH_HOST="${i#*=}"
        shift
        ;;
    --ssh_user=*)
        SSH_USER="${i#*=}"
        shift
        ;;
    --ssh_port=*)
        SSH_PORT="${i#*=}"
        shift
        ;;
    --environment=*)
        ENV="${i#*=}"
        shift
        ;;
    --version=*)
        VERSION="${i#*=}"
        shift
        ;;
    --country_config_version=*)
        COUNTRY_CONFIG_VERSION="${i#*=}"
        shift
        ;;
    --replicas=*)
        REPLICAS="${i#*=}"
        shift
        ;;
    *) ;;

    esac
done

# Read environment variable file for the environment
# .env.qa
# .env.development
# .env.production
if [ -f .env.$environment ]
then
    export $(cat $BASEDIR/../.env.$environment | sed 's/#.*//g' | xargs)
fi

trap trapint SIGINT SIGTERM
function trapint {
    exit 0
}

print_usage_and_exit () {
    echo 'Usage: ./deploy.sh --host --environment --ssh_host --ssh_user --version --country_config_version --replicas'
    echo "  --environment can be 'production', 'development', 'qa' or similar"
    echo '  --host    is the server to deploy to'
    echo "  --version can be any OpenCRVS Core docker image tag or 'latest'"
    echo "  --country_config_version can be any OpenCRVS Country Configuration docker image tag or 'latest'"
    echo "  --replicas number of supported mongo databases in your replica set.  Can be 1, 3 or 5"
    exit 1
}

if [ -z "$ENV" ] ; then
    echo 'Error: Argument --environment is required.'
    print_usage_and_exit
fi

if [ -z "$HOST" ] ; then
    echo 'Error: Argument --host is required'
    print_usage_and_exit
fi

if [ -z "$VERSION" ] ; then
    echo 'Error: Argument --version is required.'
    print_usage_and_exit
fi

if [ -z "$SSH_HOST" ] ; then
    echo 'Error: Argument --ssh_host is required.'
    print_usage_and_exit
fi

if [ -z "$SSH_USER" ] ; then
    echo 'Error: Argument --ssh_user is required.'
    print_usage_and_exit
fi

if [ -z "$COUNTRY_CONFIG_VERSION" ] ; then
    echo 'Error: Argument --country_config_version is required.'
    print_usage_and_exit
fi

if [ -z "$REPLICAS" ] ; then
    echo 'Error: Argument --replicas is required in position 8.'
    print_usage_and_exit
fi

if [ -z "$SMTP_HOST" ] ; then
    echo 'Error: Missing environment variable SMTP_HOST.'
    print_usage_and_exit
fi

if [ -z "$SMTP_PORT" ] ; then
    echo 'Error: Missing environment variable SMTP_PORT.'
    print_usage_and_exit
fi

if [ -z "$SMTP_USERNAME" ] ; then
    echo 'Error: Missing environment variable SMTP_USERNAME.'
    print_usage_and_exit
fi

if [ -z "$SMTP_PASSWORD" ] ; then
    echo 'Error: Missing environment variable SMTP_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$ALERT_EMAIL" ] ; then
    echo 'Error: Missing environment variable ALERT_EMAIL.'
    print_usage_and_exit
fi

if [ -z "$KIBANA_USERNAME" ] ; then
    echo 'Error: Missing environment variable KIBANA_USERNAME.'
    print_usage_and_exit
fi

if [ -z "$KIBANA_PASSWORD" ] ; then
    echo 'Error: Missing environment variable KIBANA_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$ELASTICSEARCH_SUPERUSER_PASSWORD" ] ; then
    echo 'Error: Missing environment variable ELASTICSEARCH_SUPERUSER_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$MINIO_ROOT_USER" ] ; then
    echo 'Error: Missing environment variable MINIO_ROOT_USER.'
    print_usage_and_exit
fi

if [ -z "$MINIO_ROOT_PASSWORD" ] ; then
    echo 'Error: Missing environment variable MINIO_ROOT_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$MONGODB_ADMIN_USER" ] ; then
    echo 'Error: Missing environment variable MONGODB_ADMIN_USER.'
    print_usage_and_exit
fi

if [ -z "$MONGODB_ADMIN_PASSWORD" ] ; then
    echo 'Error: Missing environment variable MONGODB_ADMIN_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$SUPER_USER_PASSWORD" ] ; then
    echo 'Error: Missing environment variable SUPER_USER_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$DOCKERHUB_ACCOUNT" ] ; then
    echo 'Error: Missing environment variable DOCKERHUB_ACCOUNT.'
    print_usage_and_exit
fi

if [ -z "$DOCKERHUB_REPO" ] ; then
    echo 'Error: Missing environment variable DOCKERHUB_REPO.'
    print_usage_and_exit
fi

if [ -z "$CONTENT_SECURITY_POLICY_WILDCARD" ] ; then
    echo 'Error: Missing environment variable CONTENT_SECURITY_POLICY_WILDCARD.'
    print_usage_and_exit
fi

if [ -z "$TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK" ] ; then
    echo 'Info: Missing optional MOSIP environment variable TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK.'
    TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK=''
fi

if [ -z "$TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY" ] ; then
    echo 'Info: Missing optional MOSIP environment variable TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY.'
    TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY=''
fi

if [ -z "$TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD" ] ; then
    echo 'Info: Missing optional MOSIP environment variable TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD.'
    TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD=''
fi

if [ -z "$NATIONAL_ID_OIDP_CLIENT_ID" ] ; then
  echo 'Info: Missing optional National ID verification environment variable NATIONAL_ID_OIDP_CLIENT_ID'
fi

if [ -z "$NATIONAL_ID_OIDP_BASE_URL" ] ; then
  echo 'Info: Missing optional National ID verification environment variable NATIONAL_ID_OIDP_BASE_URL'
fi

if [ -z "$NATIONAL_ID_OIDP_REST_URL" ] ; then
  echo 'Info: Missing optional National ID verification environment variable NATIONAL_ID_OIDP_REST_URL'
fi

if [ -z "$NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS" ] ; then
  echo 'Info: Missing optional National ID verification environment variable NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS'
fi

if [ -z "$NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS" ] ; then
  echo 'Info: Missing optional National ID verification environment variable NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS'
fi

if [ -z "$NATIONAL_ID_OIDP_CLIENT_PRIVATE_KEY" ] ; then
  echo 'Info: Missing optional National ID verification environment variable NATIONAL_ID_OIDP_CLIENT_PRIVATE_KEY'
fi

if [ -z "$NATIONAL_ID_OIDP_JWT_AUD_CLAIM" ] ; then
  echo 'Info: Missing optional National ID verification environment variable NATIONAL_ID_OIDP_CLIENT_PRIVATE_KEY'
fi

if [ -z "$EMAIL_API_KEY" ] ; then
    echo 'Info: Missing optional environment variable EMAIL_API_KEY.'
fi

if [ -z "$SENTRY_DSN" ] ; then
    echo 'Info: Missing optional Sentry DSN environment variable SENTRY_DSN'
fi

if [ -z "$INFOBIP_GATEWAY_ENDPOINT" ] ; then
  echo 'Info: Missing optional Infobip Gateway endpoint environment variable INFOBIP_GATEWAY_ENDPOINT'
fi

if [ -z "$INFOBIP_API_KEY" ] ; then
  echo 'Info: Missing optional Infobip API Key environment variable INFOBIP_API_KEY'
fi

if [ -z "$INFOBIP_SENDER_ID" ] ; then
  echo 'Info: Missing optional Infobip Sender ID environment variable INFOBIP_SENDER_ID'
fi

if [ -z "$SENDER_EMAIL_ADDRESS" ] ; then
  echo 'Info: Missing optional return sender email address environment variable SENDER_EMAIL_ADDRESS'
fi

LOG_LOCATION=${LOG_LOCATION:-/var/log}

(cd /tmp/ && curl -O https://raw.githubusercontent.com/opencrvs/opencrvs-core/$VERSION/docker-compose.yml)
(cd /tmp/ && curl -O https://raw.githubusercontent.com/opencrvs/opencrvs-core/$VERSION/docker-compose.deps.yml)

COMPOSE_FILED_FROM_CORE="docker-compose.deps.yml docker-compose.yml"

SSH_ARGS=${SSH_ARGS:-""}

configured_rsync() {
  rsync -e "ssh -p $SSH_PORT $SSH_ARGS" "$@"
}

configured_ssh() {
  ssh $SSH_USER@$SSH_HOST -p $SSH_PORT $SSH_ARGS "$@"
}

# Rotate MongoDB credentials
# https://unix.stackexchange.com/a/230676
generate_password() {
  local password=`openssl rand -base64 25 | tr -cd '[:alnum:]._-' ; echo ''`
  echo $password
}

# Create new passwords for all MongoDB users created in
# infrastructure/mongodb/docker-entrypoint-initdb.d/create-mongo-users.sh
#
# If you're adding a new MongoDB user, you'll need to also create a new update statement in
# infrastructure/mongodb/on-deploy.sh

USER_MGNT_MONGODB_PASSWORD=`generate_password`
HEARTH_MONGODB_PASSWORD=`generate_password`
CONFIG_MONGODB_PASSWORD=`generate_password`
METRICS_MONGODB_PASSWORD=`generate_password`
PERFORMANCE_MONGODB_PASSWORD=`generate_password`
OPENHIM_MONGODB_PASSWORD=`generate_password`
WEBHOOKS_MONGODB_PASSWORD=`generate_password`

#
# Elasticsearch credentials
#
# Notice that all of these passwords change on each deployment.

# Application password for OpenCRVS Search
ROTATING_SEARCH_ELASTIC_PASSWORD=`generate_password`
# If new applications require access to ElasticSearch, new passwords should be generated here.
# Remember to add the user to infrastructure/elasticsearch/setup-users.sh so it is created when you deploy.

# Used by Metricsbeat when writing data to ElasticSearch
ROTATING_METRICBEAT_ELASTIC_PASSWORD=`generate_password`

# Used by APM for writing data to ElasticSearch
ROTATING_APM_ELASTIC_PASSWORD=`generate_password`

echo
echo "Deploying VERSION $VERSION to $SSH_HOST..."
echo
echo "Deploying COUNTRY_CONFIG_VERSION $COUNTRY_CONFIG_VERSION to $SSH_HOST..."
echo

configured_rsync() {
  rsync -e "ssh -p $SSH_PORT $SSH_ARGS" "$@"
}

configured_rsync -rlD $PROJECT_ROOT/infrastructure $SSH_USER@$SSH_HOST:/opt/opencrvs/ --delete --no-perms --omit-dir-times --verbose
configured_rsync -rlD /tmp/docker-compose.yml /tmp/docker-compose.deps.yml $SSH_USER@$SSH_HOST:/opt/opencrvs/infrastructure --no-perms --omit-dir-times  --verbose

configured_ssh << EOF
  docker login -u $DOCKER_USERNAME -p $DOCKER_TOKEN
EOF

rotate_secrets() {
  files_to_rotate=$1
  echo "ROTATING SECRETS ON: $files_to_rotate"
  configured_ssh '/opt/opencrvs/infrastructure/rotate-secrets.sh '$files_to_rotate' | tee -a '$LOG_LOCATION'/rotate-secrets.log'
}

# Setup configuration files and compose file for the deployment domain
configured_ssh "SMTP_HOST=$SMTP_HOST SMTP_PORT=$SMTP_PORT SMTP_USERNAME=$SMTP_USERNAME SMTP_PASSWORD=$SMTP_PASSWORD ALERT_EMAIL=$ALERT_EMAIL MINIO_ROOT_USER=$MINIO_ROOT_USER MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD /opt/opencrvs/infrastructure/setup-deploy-config.sh $HOST | tee -a $LOG_LOCATION/setup-deploy-config.log"


# Takes in a space separated string of docker-compose.yml files
# returns a new line separated list of images defined in those files
# This function gets a clean list of images and substitutes environment variables
# So that we have a clean list to download
get_docker_tags_from_compose_files() {
   COMPOSE_FILES=$1

   SPACE_SEPARATED_COMPOSE_FILE_LIST=$(printf " %s" "${COMPOSE_FILES[@]}")
   SPACE_SEPARATED_COMPOSE_FILE_LIST=${SPACE_SEPARATED_COMPOSE_FILE_LIST:1}

   IMAGE_TAG_LIST=$(cat $SPACE_SEPARATED_COMPOSE_FILE_LIST \
   `# Select rows with the image tag` \
   | grep image: \
   `# Only keep the image version` \
   | sed "s/image://")

   # SOME_VARIABLE:-some-default VERSION:-latest
   IMAGE_TAGS_WITH_VARIABLE_SUBSTITUTIONS_WITH_DEFAULTS=$(echo $IMAGE_TAG_LIST \
   `# Matches variables with default values like VERSION:-latest` \
   | grep -o "[A-Za-z_0-9]\+:-[A-Za-z_0-9.-]\+" \
   | sort --unique)

   # This reads Docker image tag definitions with a variable substitution
   # and defines the environment variables with the defaults unles the variable is already present.
   # Done as a preprosessing step for envsubs
   for VARIABLE_NAME_WITH_DEFAULT_VALUE in ${IMAGE_TAGS_WITH_VARIABLE_SUBSTITUTIONS_WITH_DEFAULTS[@]}; do
      IFS=':' read -r -a variable_and_default <<< "$VARIABLE_NAME_WITH_DEFAULT_VALUE"
      VARIABLE_NAME="${variable_and_default[0]}"
      # Read default value and remove the leading hyphen
      DEFAULT_VALUE=$(echo ${variable_and_default[1]} | sed "s/^-//")
      CURRENT_VALUE=$(echo "${!VARIABLE_NAME}")

      if [ -z "${!VARIABLE_NAME}" ]; then
         IMAGE_TAG_LIST=$(echo $IMAGE_TAG_LIST | sed "s/\${$VARIABLE_NAME:-$DEFAULT_VALUE}/$DEFAULT_VALUE/g")
      else
         IMAGE_TAG_LIST=$(echo $IMAGE_TAG_LIST | sed "s/\${$VARIABLE_NAME:-$DEFAULT_VALUE}/$CURRENT_VALUE/g")
      fi
   done

   IMAGE_TAG_LIST_WITHOUT_VARIABLE_SUBSTITUTION_DEFAULT_VALUES=$(echo $IMAGE_TAG_LIST \
   | sed -E "s/:-[A-Za-z_0-9]+//g" \
   | sed -E "s/[{}]//g")

   echo $IMAGE_TAG_LIST_WITHOUT_VARIABLE_SUBSTITUTION_DEFAULT_VALUES \
   | envsubst \
   | sed 's/ /\n/g'
}

split_and_join() {
   separator_for_splitting=$1
   separator_for_joining=$2
   text=$3
   SPLIT=$(echo $text | sed -e "s/$separator_for_splitting/$separator_for_joining/g")
   echo $SPLIT
}

docker_stack_deploy() {
  environment_compose=$1
  echo "DEPLOYING THIS ENVIRONMENT: $environment_compose"

  ENVIRONMENT_COMPOSE_WITH_LOCAL_PATHS=$(echo "$environment_compose" | sed "s|docker-compose|$BASEDIR/docker-compose|g")
  CORE_COMPOSE_FILES_WITH_LOCAL_PATHS=$(echo "$COMPOSE_FILED_FROM_CORE" | sed "s|docker-compose|/tmp/docker-compose|g")
  COMMON_COMPOSE_FILES_WITH_LOCAL_PATHS="$BASEDIR/docker-compose.deploy.yml $CORE_COMPOSE_FILES_WITH_LOCAL_PATHS"

  ENV_VARIABLES="VERSION=$VERSION
  COUNTRY_CONFIG_VERSION=$COUNTRY_CONFIG_VERSION
  PAPERTRAIL=$PAPERTRAIL
  USER_MGNT_MONGODB_PASSWORD=$USER_MGNT_MONGODB_PASSWORD
  HEARTH_MONGODB_PASSWORD=$HEARTH_MONGODB_PASSWORD
  CONFIG_MONGODB_PASSWORD=$CONFIG_MONGODB_PASSWORD
  METRICS_MONGODB_PASSWORD=$METRICS_MONGODB_PASSWORD
  PERFORMANCE_MONGODB_PASSWORD=$PERFORMANCE_MONGODB_PASSWORD
  OPENHIM_MONGODB_PASSWORD=$OPENHIM_MONGODB_PASSWORD
  WEBHOOKS_MONGODB_PASSWORD=$WEBHOOKS_MONGODB_PASSWORD
  MONGODB_ADMIN_USER=$MONGODB_ADMIN_USER
  MONGODB_ADMIN_PASSWORD=$MONGODB_ADMIN_PASSWORD
  MINIO_ROOT_USER=$MINIO_ROOT_USER
  MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD
  EMAIL_API_KEY=$EMAIL_API_KEY
  SENTRY_DSN=$SENTRY_DSN
  INFOBIP_GATEWAY_ENDPOINT=$INFOBIP_GATEWAY_ENDPOINT
  INFOBIP_API_KEY=$INFOBIP_API_KEY
  INFOBIP_SENDER_ID=$INFOBIP_SENDER_ID
  SENDER_EMAIL_ADDRESS=$SENDER_EMAIL_ADDRESS
  DOCKERHUB_ACCOUNT=$DOCKERHUB_ACCOUNT
  DOCKERHUB_REPO=$DOCKERHUB_REPO
  ELASTICSEARCH_SUPERUSER_PASSWORD=$ELASTICSEARCH_SUPERUSER_PASSWORD
  ROTATING_METRICBEAT_ELASTIC_PASSWORD=$ROTATING_METRICBEAT_ELASTIC_PASSWORD
  ROTATING_APM_ELASTIC_PASSWORD=$ROTATING_APM_ELASTIC_PASSWORD
  ROTATING_SEARCH_ELASTIC_PASSWORD=$ROTATING_SEARCH_ELASTIC_PASSWORD
  KIBANA_USERNAME=$KIBANA_USERNAME
  KIBANA_PASSWORD=$KIBANA_PASSWORD
  SUPER_USER_PASSWORD=$SUPER_USER_PASSWORD
  WIREGUARD_ADMIN_PASSWORD=$WIREGUARD_ADMIN_PASSWORD
  TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK=$TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK
  TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY=$TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY
  TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD=$TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD
  NATIONAL_ID_OIDP_CLIENT_ID=$NATIONAL_ID_OIDP_CLIENT_ID
  NATIONAL_ID_OIDP_BASE_URL=$NATIONAL_ID_OIDP_BASE_URL
  NATIONAL_ID_OIDP_REST_URL=$NATIONAL_ID_OIDP_REST_URL
  NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS=$NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS
  NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS=$NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS
  NATIONAL_ID_OIDP_CLIENT_PRIVATE_KEY=$NATIONAL_ID_OIDP_CLIENT_PRIVATE_KEY
  NATIONAL_ID_OIDP_JWT_AUD_CLAIM=$NATIONAL_ID_OIDP_JWT_AUD_CLAIM
  CONTENT_SECURITY_POLICY_WILDCARD=$CONTENT_SECURITY_POLICY_WILDCARD"

  echo "Pulling all docker images. This might take a while"

  EXISTING_IMAGES=$(configured_ssh "docker images --format '{{.Repository}}:{{.Tag}}'")
  IMAGE_TAGS_TO_DOWNLOAD=$(get_docker_tags_from_compose_files "$COMMON_COMPOSE_FILES_WITH_LOCAL_PATHS $ENVIRONMENT_COMPOSE_WITH_LOCAL_PATHS")

  for tag in ${IMAGE_TAGS_TO_DOWNLOAD[@]}; do
    if [[ $EXISTING_IMAGES == *"$tag"* ]]; then
      echo "$tag already exists on the machine. Skipping..."
      continue
    fi

    echo "Downloading $tag"

    until configured_ssh "cd /opt/opencrvs && docker pull $tag"
    do
      echo "Server failed to download $tag. Retrying..."
      sleep 5
    done
  done

  echo "Updating docker swarm stack with new compose files"
  COMMON_COMPOSE_FILES="infrastructure/docker-compose.deps.yml infrastructure/docker-compose.yml infrastructure/docker-compose.deploy.yml"

  configured_ssh 'cd /opt/opencrvs && \
    '$ENV_VARIABLES' docker stack deploy --prune -c '$(split_and_join " " " -c " "$COMMON_COMPOSE_FILES infrastructure/$environment_compose")' --with-registry-auth opencrvs'
}
# Deploy the OpenCRVS stack onto the swarm
ENVIRONMENT_COMPOSE="docker-compose.$ENV-deploy.yml"
FILES_TO_ROTATE="/opt/opencrvs/infrastructure/docker-compose.deploy.yml /opt/opencrvs/infrastructure/docker-compose.$ENV-deploy.yml"

rotate_secrets "$FILES_TO_ROTATE"
docker_stack_deploy "$ENVIRONMENT_COMPOSE"
echo
echo "This script doesnt ensure that all docker containers successfully start, just that docker_stack_deploy ran successfully."
echo
echo "Waiting 2 mins for mongo to deploy before working with data. Please note it can take up to 10 minutes for the entire stack to deploy in some scenarios."
echo

echo "Setting up Kibana config & alerts"

while true; do
  if configured_ssh "ELASTICSEARCH_SUPERUSER_PASSWORD=$ELASTICSEARCH_SUPERUSER_PASSWORD HOST=kibana.$HOST /opt/opencrvs/infrastructure/monitoring/kibana/setup-config.sh"; then
    break
  fi
  sleep 5
done