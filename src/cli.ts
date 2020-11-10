import { Args, c, parse } from "./deps.ts";
import { sites } from "../sites.ts";
import type { ScannerOptions } from "./types.ts";
import { SHERLOCK_VERSION } from "../mod.ts";
import { printSherlockDeno } from "./printer.ts";

const readCliArguments = async (
  argsInput = Deno.args,
): Promise<ScannerOptions> => {
  const args = parseArguments(argsInput);

  // Show a beautiful Sherlock ASCII image if no format is
  if (!args.format || args.help || args.version) {
    printSherlockDeno();
  }

  // Show help
  if (args.help) {
    console.log(getShowHelpStr());
    Deno.exit();
  }

  // Show version
  if (args.version) {
    console.log(getShowVersionStr());
    Deno.exit();
  }

  return {
    username: await getUsername(args),
    showAll: args.all ?? false,
    realtimeOutput: !args.format,
    timeout: args.timeout ?? 30,
    format: args.format ?? "",
  };
};

const parseArguments = (argsInput = Deno.args): Args => {
  return parse(argsInput, {
    boolean: ["all"],
    alias: {
      all: ["a"],
      timeout: ["t"],
      format: ["f"],
    },
  });
};

const getShowHelpStr = (): string => {
  return `Options:
    --help          Show help
    --version       Show version number and number of active sites
    -a, --all       Show all results                                   [boolean]
-t, --timeout       Set timout for requests in seconds    [number] [default: 30]
-f, --format        Select output format [choices: "json", "pretty_json", "csv"]

Examples:
${c.yellow("sherlock JohnDoe")}        Search for JohnDoe
${c.yellow("sherlock -a JohnDoe")}     Search for JohnDoe and show all results`;
};

const getShowVersionStr = (): string => {
  return c.green(
    `You are using version v${c.bold(SHERLOCK_VERSION)}. with a total of ${
      c.bold(`${Object.keys(sites).length}`)
    } sites.`,
  );
};

const ask = async (
  question = "",
  addEmptyLine = false,
  stdin = Deno.stdin,
  stdout = Deno.stdout,
): Promise<string> => {
  const buf = new Uint8Array(1024);

  // Write question to console
  await stdout.write(new TextEncoder().encode(question));

  // Read console's input into answer
  const n = <number> await stdin.read(buf);
  const answer = new TextDecoder().decode(buf.subarray(0, n));

  if (addEmptyLine) console.log();

  return answer.trim();
};

const askForUsername = (): Promise<string> => {
  return ask(c.green(c.bold(`[>] Input username: `)), true);
};

const getUsername = async (args: Args): Promise<string> => {
  if (args._?.length) return String(args._[0]);
  return askForUsername();
};

export {
  ask,
  getShowHelpStr,
  getShowVersionStr,
  getUsername,
  parseArguments,
  readCliArguments,
};
