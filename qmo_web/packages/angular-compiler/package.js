Package.describe({
  name: 'angular-compiler',
  version: '1.0.0',
  summary: 'Angular Templates, HTML and TypeScript compilers for Meteor',
  git: 'https://github.com/QMODevTeam/QMO',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'Angular Compiler',
  sources: [
    'plugin/register.js'
  ],
  use: [
    // Uses an external packages to get the actual compilers
    'ecmascript@0.8.0-rc.0',
    'urigo:static-html-compiler@0.1.8',
    'css-compiler@1.0.0'
  ]
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1');

  // Required in order to register plugins
  api.use('isobuild:compiler-plugin@1.0.0');

  // These packages are required by Angular2-Meteor NPM.
  // Make sure we have them in this package.
  api.imply([
    'barbatus:typescript@0.6.11',
    'check@1.2.5',
    'tracker@1.1.3'
  ]);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('angular-compiler');
});
