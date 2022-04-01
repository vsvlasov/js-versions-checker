const Database = require('better-sqlite3');

const getDatabase = ({ path='packages.sqlite3' } = {}) => {
    const db = Database(path, {});

    // Init table if not exists
    db.exec('CREATE TABLE IF NOT EXISTS packages (name TEXT, version TEXT, release_date NUMBER )')

    return db;
}


const getReleaseDate = ({db, name, version}) => db.prepare(
    'SELECT release_date FROM packages WHERE name=? AND version=?'
).get(
    name,
    version
)?.release_date;


const writeReleaseDate = ({db, name, version, releaseDate}) => db.prepare(
    'INSERT INTO packages (name, version, release_date) VALUES (?, ?, ?)'
).run(
    name,
    version,
    releaseDate.valueOf(),
);


module.exports = {
    target: 'node',
    getReleaseDate,
    writeReleaseDate,
    getDatabase,
};
