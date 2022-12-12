import fs from 'fs';

fs.readdirSync(__dirname).forEach((file) => {
    import(`./${file}`);
})

setTimeout(() => console.log('auto-shutdown'), 1000000000);