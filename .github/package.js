const child_process = require('child_process');
const path = require('path');
const glob = require('glob');
const fs = require('fs');

function readMeta(filePath) {
  const modinfo = JSON.parse(fs.readFileSync(filePath));
  return {
    name: modinfo.ModName.English.replace(' (Jakob)', '').replace(/ /g, '-').replace(',', ''),
    folder: `[${modinfo.Category.English}] ${modinfo.ModName.English}`,
    version: modinfo.Version,
    id: modinfo.ModID,
    dependencies: modinfo.ModDependencies
  }
}

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  fs.readdirSync(source).forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// const idsToPackage = [
//   "jakob_industrial_cities",
//   "jakob_new_world_cities",
//   "jakob_pescatarians"
// ];

const modsToPackage = glob.sync("./{foreign-additions,mods}/**/modinfo.json")
  .map(e => readMeta(e))
  .filter(e => fs.existsSync(path.join('out', e.folder)));
  // .filter(e => idsToPackage.indexOf(e.id) >= 0);
const modsToInclude = glob.sync("./{foreign-additions,mods,shared}/**/modinfo.json")
  .map(e => readMeta(e));

for (mod of modsToPackage) {
  // const sharedMods = modsToInclude.filter(e => mod.ModDependencies?.indexOf(e.id) >= 0);
  console.log(`Package ${mod.name}-${mod.version}.zip`);
  // for (shared of sharedMods) {
  //   copyFolderSync(path.join('out', shared.folder), path.join('out', mod.folder, shared.folder));
  // }
  child_process.execFileSync('tar', [
      '-ca',
      '-f', path.join(process.cwd(), `out/${mod.name}-${mod.version}.zip`),
      '-C', path.join(process.cwd(), 'out/'), `${mod.folder}`
    ]);
}
