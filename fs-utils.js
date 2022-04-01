const fs = require('fs');


const transformEntry = ([name, info]) => ({
    name: name.split('node_modules/')
        .pop(),
    version: info.version,
    resolved: info.resolved,
});


const getPackages = ({path='package-lock.json', exclude=['']} = {}) => {
    const fileData = JSON.parse(fs.readFileSync(path).toString());
    const packages = fileData.packages || fileData.dependencies;

    return Object.entries(packages)
        .map(transformEntry)
        .filter(item => exclude.indexOf(item.name) === -1)
};


module.exports = {
    target: 'node',
    getPackages,
}
