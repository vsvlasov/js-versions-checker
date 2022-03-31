const fs = require('fs/promises');
const { exec } = require('child_process');

const criticalDate = new Date('2022-02-24');

fs.readFile('package-lock.json')
    .then((buf) => {
        const data = JSON.parse(buf.toString());
        const { packages } = data;
        const details = Object.entries(packages)
            .map(([name, info]) => ({
                name: name.split('node_modules/')
                    .pop(),
                version: info.version,
                resolved: info.resolved,
            }))
            .filter(item => item.name !== '')
            .filter(item => item.name !== 'value-metrics-client');
        console.log(`Total amount of packages to scan: ${details.length}`);
        console.log(`Items updated after ${criticalDate} will be shown below:`);

        const workers = 20;
        const showProgress = 50;

        function processItem(index) {
            if (index % showProgress === 0) {
                console.log(`Processing item #${index}...`);
            }
            const nextIndex = index + workers;
            loadDate(details[index], processItem, nextIndex < details.length ? nextIndex : false);
        }

        for (let i = 0; i < workers; i += 1) {
            processItem(i);
        }
    });

function loadDate(packageInfo, callback, index) {
    exec(`npm view ${packageInfo.name} time --json`, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
        } else {
            let dates;
            try {
                dates = JSON.parse(stdout.toString());
            } catch (err) {
                console.log('Package', packageInfo.name);
                console.log(err);
            }
            const versionDate = new Date(dates[packageInfo.version]);
            const isUpdatedLate = versionDate.valueOf() >= criticalDate.valueOf();
            if (isUpdatedLate) {
                console.log(packageInfo.name, versionDate, isUpdatedLate);
            }
            if (index !== false) {
                callback(index);
            }
        }
    });
}
