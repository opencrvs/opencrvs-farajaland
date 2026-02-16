1. Issue classic token with acccess:
   ....
2. Create secret: MIGRATION_GH_TOKEN

# Before migration steps:

1. Grant provision user:
   1.1. On production environment get provision user public key
   1.2. Add provision user public key from production to /home/provision/.ssh/authorized_keys on backup server

# Post migration steps:

1. Configure approval users list