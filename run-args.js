import commander from 'commander';


export const getRunArgs = () => {
    commander
        .option('--db-path <value>', 'DB path', 'packages.sqlite3')
        .option('--lock-path <value>', 'Path to package-lock.json', 'package-lock.json')
        .option('--exclude <value>', 'Comma separated list of packages', [])
        .parse(process.argv);

    return commander.opts();
};
