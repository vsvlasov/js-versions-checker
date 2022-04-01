const {
    getReleaseDate,
    writeReleaseDate,
    getDatabase,
} = require('./database')
const { getPackages } = require('./fs-utils')
const util = require('util');
const exec = util.promisify(require('child_process').exec)


async function loadDate(packageInfo) {
    const {stdout, stderr} = await exec(`npm view ${packageInfo.name} time --json`);
    if (stderr) {
        console.log(stderr);
        return null;
    }

    const data = JSON.parse(stdout);
    return new Date(data[packageInfo.version]).valueOf();
}


async function getDate(db, packageInfo) {
    let date;
    date = getReleaseDate(packageInfo);

    if (date) return date;

    date = await loadDate(packageInfo)
    writeReleaseDate({
        name: packageInfo.name,
        version: packageInfo.version,
        releaseDate: date,
    });

    return date;

}


const showProgress = 50;

(async() => {
    const criticalDate = new Date('2022-02-24');
    const details = getPackages();
    const db = getDatabase();

    console.log(`Total amount of packages to scan: ${details.length}`);
    console.log(`Items updated after ${criticalDate} will be shown below:`);


    const d = [];
    for (let i = 0; i < details.length; i += 1) {
        if (i % showProgress === 0) {
            console.log(`Processing item #${i}...`);
        }
        d.push(getDate(db, details[i]))
    }

    for (let i = 0; i < details.length; i += 1) {
        const date = await d[i];
        if (date >= criticalDate.valueOf()) {
            process.exitCode = 1;
            console.log(details[i].name, new Date(date))
        }
    }
    db.close();
})();

