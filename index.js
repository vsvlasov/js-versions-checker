import util from "util";
import { getRunArgs } from "./run-args";
import { getReleaseDate, writeReleaseDate, getDatabase } from "./database";
import { getPackages } from "./fs-utils";

const exec = util.promisify(require("child_process").exec);

async function loadDate(packageInfo) {
  const { stdout, stderr } = await exec(
    `npm view ${packageInfo.name} time --json`
  );
  if (stderr) {
    console.log(stderr);
    return null;
  }

  const data = JSON.parse(stdout);
  return new Date(data[packageInfo.version]).valueOf();
}

async function getDate(db, packageInfo) {
  let date;
  const { name, version } = packageInfo;
  date = getReleaseDate({ name, version, db });

  if (date) return date;

  date = await loadDate(packageInfo);
  writeReleaseDate({
    db,
    name: packageInfo.name,
    version: packageInfo.version,
    releaseDate: date,
  });

  return date;
}

const showProgress = 50;

(async () => {
  const { dbPath, lockPath, exclude } = getRunArgs();

  const criticalDate = new Date("2022-02-24");
  const details = getPackages({
    path: lockPath,
    exclude,
  });
  const db = getDatabase({ path: dbPath });

  console.log(`Total amount of packages to scan: ${details.length}`);
  console.log(`Items updated after ${criticalDate} will be shown below:`);

  const d = [];
  for (let i = 0; i < details.length; i += 1) {
    if (i % showProgress === 0) {
      console.log(`Processing item #${i}...`);
    }
    d.push(getDate(db, details[i]));
  }

  for (let i = 0; i < details.length; i += 1) {
    const date = await d[i];
    if (!date || date >= criticalDate.valueOf()) {
      process.exitCode = 1;
      console.log(details[i].name, new Date(date));
    }
  }
  db.close();
})();
