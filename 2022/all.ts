import fs from 'fs';

Promise.all(fs.readdirSync(__dirname).map((file) => import(`./${file}`)))
.then(() => console.log('done.'));
