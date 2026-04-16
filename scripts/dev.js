const { spawn } = require("child_process");

const children = [];
let exiting = false;

function start(command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
  });

  children.push(child);

  child.on("exit", (code) => {
    if (exiting) {
      return;
    }

    exiting = true;

    for (const current of children) {
      if (current.pid && !current.killed) {
        current.kill();
      }
    }

    process.exit(code ?? 0);
  });
}

function shutdown() {
  if (exiting) {
    return;
  }

  exiting = true;

  for (const child of children) {
    if (child.pid && !child.killed) {
      child.kill();
    }
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start("npm", ["--prefix", "backend", "run", "dev"]);
start("npm", ["--prefix", "frontend", "run", "dev"]);