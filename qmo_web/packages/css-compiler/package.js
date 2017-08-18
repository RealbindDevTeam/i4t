Package.describe({
  name: 'css-compiler',
  version: '1.0.0',
  summary: 'Angular CSS compiler for Meteor',
  git: 'https://github.com/QMODevTeam/QMO',
  documentation: 'README.md'
});

Npm.depends({
  'less': '2.7.2',
  'js-string-escape': '1.0.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1');

  api.use([
    'caching-compiler@1.1.9',
    'ecmascript@0.8.0-rc.0',
    'underscore@1.0.10',
    'check@1.2.5',
    'babel-compiler@6.19.1-rc.0',
    'scss-compiler@1.0.0',
    'minifier-css@1.2.16'
  ]);

  api.addFiles([
    'compilers/basic_compiler.js',
    'compilers/css_compiler.js',
    'compilers/less_compiler.js',
    'compilers/style_compiler.js',
    'compilers/sass_compiler.js'
  ], 'server');

  api.export(['StyleCompiler'], 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
});
