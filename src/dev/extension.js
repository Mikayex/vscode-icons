var vscode = require('vscode');
var fs = require('fs');
var open = require('open');
var msg = require('./messages').messages;
var settings = require('./settings');
var vars = settings.getSettings();

function showWelcomeMessage() {
  settings.setStatus(settings.status.notInstalled);
  vscode.window.showInformationMessage(msg.welcomeMessage,
    { title: msg.aboutOfficialApi }, { title: msg.seeReadme })
    .then(function (btn) {
      if (!btn) return;
      if (btn.title === msg.aboutOfficialApi) {
        open(msg.urlOfficialApi);
      } else if (btn.title === msg.seeReadme) {
        open(msg.urlReadme);
      }
    });
}

function showNewVersionMessage() {
  vscode.window.showInformationMessage(msg.newVersionMessage + ' v.' + vars.extVersion,
    { title: msg.seeReleaseNotes }, { title: msg.dontshowthis })
    .then(function (btn) {
      settings.setStatus(settings.status.disabled);
      if (!btn) return;
      if (btn.title === msg.seeReleaseNotes) {
        open(msg.urlReleaseNote);
      } else if (btn.title === msg.dontshowthis) {
        vscode.workspace.getConfiguration()
          .update('vsicons.dontShowNewVersionMessage', true, true);
      }
    });
}

function runAutoInstall() {
  var state = settings.getState();
  var isNewVersion = state.version !== vars.extVersion;

  if (!state.welcomeShown) {
    // show welcome message
    showWelcomeMessage();
    return;
  }

  if (isNewVersion) {
    settings.setStatus(state.status);
    if (!vscode.workspace.getConfiguration().vsicons.dontShowNewVersionMessage) {
      showNewVersionMessage();
    }
  }
}

function writeIconManifest(manifest) {
  fs.writeFileSync(vars.iconManifestPath, manifest);
}

function readIconManifest() {
  var result = fs.readFileSync(vars.iconManifestPath, 'utf8');
  return result;
}

function activateIcons(iconsArray, active) {
  var breaker = '################';
  var iconManifest = readIconManifest();
  iconsArray.forEach(function (icon) {
    var normalIcon = '"' + icon + '"';
    var brokenIcon = '"' + icon + breaker + '"';
    if (!active) {
      iconManifest = iconManifest.replace(normalIcon, brokenIcon);
    } else {
      iconManifest = iconManifest.replace(brokenIcon, normalIcon);
    }
  }, this);
  writeIconManifest(iconManifest);
}

function checkPresets() {
  console.log('checking presets!!');
  var conf = vscode.workspace.getConfiguration().vsicons;
  // angular 2
  var angularIcons = [
    'component.js',
    'component.ts',
    'directive.js',
    'directive.ts',
    'module.js',
    'module.ts',
    'pipe.js',
    'pipe.ts',
    'routing.js',
    'routing.ts',
    'service.js',
    'service.ts'
  ];
  activateIcons(angularIcons, conf.presets.angular2);
}

function activate() {
  console.log('vscode-icons is active!'); //eslint-disable-line
  runAutoInstall();
  checkPresets();
}
exports.activate = activate;

// this method is called when your vscode is closed
function deactivate() { }
exports.deactivate = deactivate;
