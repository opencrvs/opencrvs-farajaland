ansible-playbook --start-at-task="Label nodes" -i inventory.ini ../server-setup/playbook.yml -e "dockerhub_username=rikukissa
dockerhub_password=ooPFs2UKFGwjf_H-Qi7JfsDqXnafj
manager_production_server_ip=10.0.2.2
encrypted_disk_size=30GB
disk_encryption_key=JUST_MY_LOCAL_PASSWORD
elasticsearch_superuser_password=JUST_MY_LOCAL_PASSWORD
encrypt_data=True
mongodb_admin_username=opencrvs-admin
mongodb_admin_password=JUST_MY_LOCAL_PASSWORD"

