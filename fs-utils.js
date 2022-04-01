const fs = require("fs");

const transformEntry = ([name, info]) => ({
  name: name.split("node_modules/").pop(),
  version: info.version,
  resolved: info.resolved,
});

const getPackages = ({ path, exclude } = {}) => {
  const fileData = JSON.parse(fs.readFileSync(path).toString());
  const packages = fileData.packages || fileData.dependencies;

  return Object.entries(packages)
    .map(transformEntry)
    .filter((item) => item.name !== "")
    .filter((item) => exclude.indexOf(item.name) === -1);
};

module.exports = {
  getPackages,
};
