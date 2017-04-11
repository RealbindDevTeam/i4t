import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser(function (options, user) {

    user.profile                     = options.profile || {};
    user.profile.first_name          = options.profile.first_name;
    user.profile.last_name           = options.profile.last_name;
    user.profile.language_code       = options.profile.language_code;
    user.profile.image               = options.profile.image || {};
    user.profile.image.complete      = options.profile.image.complete;
    user.profile.image.extension     = options.profile.image.extension;
    user.profile.image.name          = options.profile.image.name;
    user.profile.image.progress      = options.profile.image.progress;
    user.profile.image.size          = options.profile.image.size;
    user.profile.image.store         = options.profile.image.store;
    user.profile.image.token         = options.profile.image.token;
    user.profile.image.type          = options.profile.image.type;
    user.profile.image.uploaded_at   = options.profile.image.uploaded_at;
    user.profile.image.uploading     = options.profile.uploading;
    user.profile.image.url           = options.profile.url;  

    // Returns the user object
    return user;
});