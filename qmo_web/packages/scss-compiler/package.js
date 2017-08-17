Package.describe({
  name: 'scss-compiler',
  summary: 'Sass and SCSS compilers for Meteor.',
  version: '1.0.0',
  git: 'https://github.com/QMODevTeam/QMO',
});

Npm.depends({
  'node-sass': '4.5.3'
});

Package.onUse(function (api) {
  api.versionsFrom('1.4.1');

  api.use([
    'isobuild:compiler-plugin@1.0.0',
    'caching-compiler@1.1.9',
    'ecmascript@0.8.0-rc.0',
    'underscore@1.0.10'
  ]);

  api.addFiles(['plugin/compile-scss.js'], 'server');

  api.export(['SassCompiler'], 'server');
});

Package.on_test(function (api) {
  api.use(['test-helpers',
           'tinytest']);

  api.use(['scss-compiler']);
});
