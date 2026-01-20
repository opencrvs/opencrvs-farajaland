# Swarm to k8s migration

## High level steps

### Preparation steps

1. Fork infrastructure repository (manual step)
2. Copy environments, secrets and variables from countryconfig repository to new infrastructure repository (automated)
3. Create configuration files for new environments:
   - take existing configuration files and manually re-write
   - run environments:migration and ask additional questions
   - ...
4. Configure self-hosted runner


## Migration workflow

### Prerequisites

1. Infrastructure repository with environments, secrets and variables
2. Helm chart and ansible inventory configuration files
3. Self-hosted runner on server
4. Same versions of image tags

### Run github workflows

1. Run provision
2. Run deploy dependencies
3. Run deploy OpenCRVS


## Implementation details

### Copy environments, secrets and variables from countryconfig repository to infrastructure repository (automated)

Workflow in Countryconfig repository:
1. Exports secrets, variables and environments. What is needed?
   - List of secrets to export
   - List of variables to export
2. Triggers workflow in infrastructure repository to create secrets, variables and environments. 
   What is needed?
   - Sufficient permissions to trigger workflow in another repository
3. Run command on remote server to bootstrap self-hosted runner:
   - Private key for provision user
   - GitHub token with sufficient permissions to register self-hosted runner in infrastructure repository

Workflow in Infrastructure repository:
1. Create repository level variables
2. Create environments
3. Create secrets and variables for each environment
4. Generate inventory files for ansible
5. Generate helm chart values
