const { readFileSync, writeFileSync } = require('node:fs');
const chalk = require('chalk');
const gulp = require('gulp');
const semver = require('semver');
// const { execa } = require('execa');
const argv = require('./tools/args-parser.js');

/* ------------------------------------------ */
/*  Configuration                             */
/* ------------------------------------------ */

// const production = process.env.NODE_ENV === 'production';
const packageJson = JSON.parse(readFileSync('package.json', { encoding: 'utf-8' }));
const stdio = 'inherit';

/* ------------------------------------------ */

/**
 * Gets the target version based on on the current version and the argument passed as release.
 * @param {string}             currentVersion The current version
 * @param {semver.ReleaseType} releaseType    The release type,
 *    any of `['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease']`
 * @returns {string} The target version
 */
function getTargetVersion(currentVersion, releaseType) {
  if (['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'].includes(releaseType)) {
    return semver.inc(currentVersion, releaseType);
  }
  else {
    return semver.valid(releaseType);
  }
}

/* ------------------------------------------ */

/**
 * Creates a changelog.
 */
async function changelog() {
  const { execa } = await import('execa');
  await execa('npx', ['standard-version', '--skip.bump', '--skip.tag', '--skip.commit'], { stdio });
}

/**
 * Commits and pushes release to Github Upstream.
 */
async function commitTagPush() {
  const { execa } = await import('execa');
  const { version } = packageJson;
  const commitMsg = `chore(release): 🚀 Release v${version}`;
  await execa('git', ['add', '-A'], { stdio });
  await execa('git', ['commit', '--message', commitMsg], { stdio });
  await execa('git', ['tag', `v${version}`], { stdio });
  await execa('git', ['push', 'upstream'], { stdio });
  await execa('git', ['push', 'upstream', '--tags'], { stdio });
}

/* ------------------------------------------ */

/**
 * Updates version and download URL.
 * @param {function} cb Callback function
 * @throws {Error} When missing release type
 * @throws {Error} When incorrect version arguments
 * @throws {Error} When target version is identical to current version
 */
async function bumpVersion(cb) {
  try {
    // @ts-ignore
    const releaseType = argv.release || argv.r;
    const currentVersion = packageJson.version;

    if (!releaseType) {
      return cb(Error('Missing release type'));
    }

    const targetVersion = getTargetVersion(currentVersion, releaseType);

    if (!targetVersion) {
      return cb(new Error(chalk.red('Error: Incorrect version arguments')));
    }

    if (targetVersion === currentVersion) {
      return cb(new Error(chalk.red('Error: Target version is identical to current version')));
    }

    console.log(`Updating version number to '${targetVersion}'`);

    packageJson.version = targetVersion;
    writeFileSync('package.json', JSON.stringify(packageJson, null, '  '));

    return cb();
  }
  catch (err) {
    cb(err);
  }
}

/* ------------------------------------------ */
/*  Scripts                                   */
/* ------------------------------------------ */

module.exports.bump = gulp.series(bumpVersion, changelog);
module.exports.release = commitTagPush;
