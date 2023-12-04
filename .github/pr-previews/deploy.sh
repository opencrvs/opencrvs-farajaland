#!/bin/bash

# Function to display usage
usage() {
    echo "Usage: $0 --core-branch-name <name> --country-config-branch-name <name> --mongodb-admin-address <address> --elasticsearch-admin-address <address> --minio-external-address <address> --minio-address <address> --influxdb-address <address> --redis-address <address> --minio-secret-key <key> --minio-access-key <key> --host-domain <domain>"
    exit 1
}

# Parse named parameters
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --core-branch-name) CORE_BRANCH_NAME="$2"; shift ;;
        --country-config-branch-name) COUNTRY_CONFIG_BRANCH_NAME="$2"; shift ;;
        --mongodb-admin-address) MONGODB_ADMIN_ADDRESS="$2"; shift ;;
        --elasticsearch-admin-address) ELASTICSEARCH_ADMIN_ADDRESS="$2"; shift ;;
        --minio-external-address) MINIO_EXTERNAL_ADDRESS="$2"; shift ;;
        --minio-address) MINIO_ADDRESS="$2"; shift ;;
        --influxdb-address) INFLUXDB_ADDRESS="$2"; shift ;;
        --redis-address) REDIS_ADDRESS="$2"; shift ;;
        --minio-secret-key) MINIO_SECRET_KEY="$2"; shift ;;
        --minio-access-key) MINIO_ACCESS_KEY="$2"; shift ;;
        --host-domain) HOST_DOMAIN="$2"; shift ;;
        *) echo "Unknown parameter: $1"; usage ;;
    esac
    shift
done

# Check if all parameters are set
if [ -z "$CORE_BRANCH_NAME" ] || [ -z "$COUNTRY_CONFIG_BRANCH_NAME" ] || [ -z "$MONGODB_ADMIN_ADDRESS" ] || [ -z "$ELASTICSEARCH_ADMIN_ADDRESS" ] || [ -z "$MINIO_EXTERNAL_ADDRESS" ] || [ -z "$MINIO_ADDRESS" ] || [ -z "$INFLUXDB_ADDRESS" ] || [ -z "$REDIS_ADDRESS" ] || [ -z "$MINIO_SECRET_KEY" ] || [ -z "$MINIO_ACCESS_KEY" ] || [ -z "$HOST_DOMAIN" ]; then
    echo "Error: Missing one or more required parameters."
    usage
fi

# Sanitize branch names
SANITIZED_CORE_BRANCH_NAME=$(echo "$CORE_BRANCH_NAME" | sed 's/[^a-zA-Z0-9_-]/-/g')
SANITIZED_COUNTRY_CONFIG_BRANCH_NAME=$(echo "$COUNTRY_CONFIG_BRANCH_NAME" | sed 's/[^a-zA-Z0-9_-]/-/g')

# Combine names
COMBINED_NAME="${SANITIZED_CORE_BRANCH_NAME}--${SANITIZED_COUNTRY_CONFIG_BRANCH_NAME}"

# Docker service creation
docker service create \
--name "pr_preview_$COMBINED_NAME" \
--network "opencrvs_overlay_net" \
--env "MONGODB_ADMIN_ADDRESS=$MONGODB_ADMIN_ADDRESS" \
--env "ELASTICSEARCH_ADMIN_ADDRESS=$ELASTICSEARCH_ADMIN_ADDRESS" \
--env "MINIO_EXTERNAL_ADDRESS=$MINIO_EXTERNAL_ADDRESS" \
--env "MINIO_ADDRESS=$MINIO_ADDRESS" \
--env "INFLUXDB_ADDRESS=$INFLUXDB_ADDRESS" \
--env "REDIS_ADDRESS=$REDIS_ADDRESS" \
--env "CONTENT_SECURITY_POLICY_WILDCARD=*.$COMBINED_NAME.$HOST_DOMAIN" \
--env "MINIO_SECRET_KEY=$MINIO_SECRET_KEY" \
--env "MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY" \
--env "APN_SERVICE_URL=http://apm-server:8200" \
--env "DATABASE_PREFIX=pr-$COMBINED_NAME" \
--env "CORE_VERSION=$CORE_BRANCH_NAME" \
--env "COUNTY_CONFIG_VERSION=$COUNTRY_CONFIG_BRANCH_NAME" \
--label "traefik.enable=true" \
--label "traefik.http.routers.$COMBINED_NAME.rule=Host(\`$COMBINED_NAME.$HOST_DOMAIN\`)" \
--label "traefik.http.services.$COMBINED_NAME.loadbalancer.server.port=7000" \
--label "traefik.http.routers.$COMBINED_NAME.tls=true" \
--label "traefik.http.routers.$COMBINED_NAME.tls.certresolver=certResolver" \
--label "traefik.http.routers.$COMBINED_NAME.entrypoints=web,websecure" \
--label "traefik.docker.network=opencrvs_overlay_net" \
--label "traefik.http.middlewares.$COMBINED_NAME.headers.customresponseheaders.Pragma=no-cache" \
--label "traefik.http.middlewares.$COMBINED_NAME.headers.customresponseheaders.Cache-control=no-store" \
--label "traefik.http.middlewares.$COMBINED_NAME.headers.customresponseheaders.X-Robots-Tag=none" \
--label "traefik.http.middlewares.$COMBINED_NAME.headers.stsseconds=31536000" \
--label "traefik.http.middlewares.$COMBINED_NAME.headers.stsincludesubdomains=true" \
--label "traefik.http.middlewares.$COMBINED_NAME.headers.stspreload=true" \
rikukissa/opencrvs-standalone
