export DOMAIN=opencrvs.local
export REPLICAS=1
export SMTP_PORT=EMPTY
export SMTP_HOST=EMPTY
export SMTP_USERNAME=EMPTY
export SMTP_PASSWORD=EMPTY
export ALERT_EMAIL=EMPTY
export DOCKERHUB_ACCOUNT=opencrvs
export DOCKERHUB_REPO=ocrvs-farajaland
export KIBANA_USERNAME=opencrvs-admin
export KIBANA_PASSWORD=password
export MONGODB_ADMIN_USER=admin
export MONGODB_ADMIN_PASSWORD=JUST_MY_LOCAL_PASSWORD
export ELASTICSEARCH_SUPERUSER_PASSWORD=JUST_MY_LOCAL_PASSWORD
export MINIO_ROOT_USER=minio
export MINIO_ROOT_PASSWORD=JUST_MY_LOCAL_PASSWORD
export EMAIL_API_KEY=
export INFOBIP_SENDER_ID=
export SENTRY_DSN=
export INFOBIP_GATEWAY_ENDPOINT=
export INFOBIP_API_KEY=
export SENDER_EMAIL_ADDRESS=
export SUPER_USER_PASSWORD=JUST_MY_LOCAL_PASSWORD
export CONTENT_SECURITY_POLICY_WILDCARD=*.opencrvs.local


yarn deploy \
--clear_data=no \
--environment=production \
--ssh_host=$DOMAIN \
--host=$DOMAIN \
--version=8e9f6fa \
--country_config_version=27ecd59 \
--country_config_path=../.. \
--replicas=1 \
--ssh_port=50022 \
--ssh_user=vagrant