const bcrypt = require('bcrypt');

async function run() {
  const hash = await bcrypt.hash('client123', 12);
  console.log(hash);
}

run();