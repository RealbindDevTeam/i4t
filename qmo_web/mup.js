module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: '54.190.23.172',
      username: 'ubuntu',
      pem: '~/.ssh/deviurest.pem'
      // password: 'server-password'
      // or neither for authenticate from ssh-agent
    }
  },

  meteor: {
    // TODO: change app name and path
    name: 'deviurest',
    path: '../qmo_web',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
      ROOT_URL: 'http://54.190.23.172',
      MONGO_URL: 'mongodb://leonardoe:R34LB1ND2017@deviurest-shard-00-00-pgydc.mongodb.net:27017,deviurest-shard-00-01-pgydc.mongodb.net:27017,deviurest-shard-00-02-pgydc.mongodb.net:27017/meteor?ssl=true&replicaSet=deviurest-shard-0&authSource=admin',
    },

    docker: {
      // change to 'kadirahq/meteord' if your app is not using Meteor 1.4
      image: 'abernix/meteord:base',
    },

    // This is the maximum time in seconds it will wait
    // for your app to start
    // Add 30 seconds if the server has 512mb of ram
    // And 30 more if you have binary npm dependencies.
    deployCheckWaitTime: 180,

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: false
  },

  mongo: {
    port: 27017,
    version: '3.4.1',
    servers: {
      one: {}
    }
  }
};
