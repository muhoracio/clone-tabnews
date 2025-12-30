const { exec } = require("node:child_process");

let i = 0;
let interval;
const spinner = ["|", "/", "-", "\\"];

function startLoading() {
  if (interval) return;
  process.stdout.write("\n");
  interval = setInterval(() => {
    const char = spinner[i % spinner.length];
    process.stdout.write(
      `\r🔴 Aguardando Postgres aceitar conexões... ${char}`,
    );
    i++;
  }, 100);
}

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(err, stdout) {
    if (stdout.search("accepting connections") === -1) {
      startLoading();
      checkPostgres();
      return;
    }

    clearInterval(interval);
    process.stdout.write("\r🟢 Postgres está pronto e aceitando conexões!\n");
  }
}

checkPostgres();
