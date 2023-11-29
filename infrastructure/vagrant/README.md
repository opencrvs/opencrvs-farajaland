# Using Vagrant to develop provisioning / deployment scripts

1. Install dependencies

```
brew install vagrant qemu
vagrant plugin install vagrant-vbguest
vagrant plugin install vagrant-qemu
vagrant plugin install vagrant-hostsupdater
```

2. `vagrant up` installs and starts your virtual machine

You are now ready to SSH into your machine

```
default: SSH address: 127.0.0.1:2222
default: SSH username: vagrant
default: SSH password: vagrant
```

#ERROR
#If you face this error after running vagrant up
Vagrant SMB synced folders require the account password to be stored
in an NT compatible format. Please update your sharing settings to
enable a Windows compatible password and try again.
#SOLUTION

# Visit System Preferences -> Sharing -> File Sharing -> Options

# Tick to enable file sharing, see here -> https://i.ibb.co/F4ZwF4V/Screen-Shot-2022-09-29-at-10-49-21-am.png
