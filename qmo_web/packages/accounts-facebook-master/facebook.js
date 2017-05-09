Accounts.oauth.registerService('facebook');

if (Meteor.isClient) {

  Meteor.loginWithFacebook = function (options, callback) {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);

    var fbLoginSuccess = function (data) {
      data.cordova = true;

      Accounts.callLoginMethod({
        methodArguments: [data],
        userCallback: callback
      });
    };

    if (typeof facebookConnectPlugin != "undefined" && ((Meteor.settings && Meteor.settings.public && Meteor.settings.public.facebook) || options)) {
      facebookConnectPlugin.getLoginStatus(
        function (response) {
          if (response.status != "connected") {
            facebookConnectPlugin.login(options.requestPermissions || Meteor.settings.public.facebook.permissions,
              fbLoginSuccess,
              function (error) {
                callback(new Meteor.Error(500, error));
              }
            );
          } else {
            fbLoginSuccess(response);
          }
        },
        function (error) {
          callback(new Meteor.Error(500, error));
        }
      );
    } else {
      Facebook.requestCredential(options, credentialRequestCompleteCallback);
    }
  };

} else {

  if (Meteor.settings &&
    Meteor.settings.facebook &&
    Meteor.settings.facebook.appId &&
    Meteor.settings.facebook.secret) {

    ServiceConfiguration.configurations.remove({
      service: "facebook"
    });

    ServiceConfiguration.configurations.insert({
      service: "facebook",
      appId: Meteor.settings.facebook.appId,
      secret: Meteor.settings.facebook.secret
    });

    Accounts.addAutopublishFields({
      // publish all fields including access token, which can legitimately
      // be used from the client (if transmitted over ssl or on
      // localhost). https://developers.facebook.com/docs/concepts/login/access-tokens-and-types/,
      // "Sharing of Access Tokens"
      forLoggedInUser: ['services.facebook'],
      forOtherUsers: [
        // https://www.facebook.com/help/167709519956542
        'services.facebook.id', 'services.facebook.username', 'services.facebook.gender'
      ]
    });

  } else {
    console.log("Meteor settings for accounts-facebook-cordova not configured correctly.")
  }
}
