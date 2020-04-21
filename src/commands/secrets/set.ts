import path from 'path';

import { Argv } from 'yargs';
import fs from 'fs-extra';
import getStdIn from 'get-stdin';
// import stripComments from 'strip-comments';

import { RootCmdArgv } from '../secrets';
import { upsertSecret } from '../../utils/secrets';

export const command = 'set';
export const desc = `set secret [options] [--input | --file] (you can also pipe input via echo -n "myinput" | sltx secrets set)`;
export const builder = async (yargs: Argv) => {
	yargs.options('input', {
		alias: 'i',
		describe: "Raw input to write, make sure to enclose in ''",
		type: 'string',
	});
	yargs.options('file', {
		alias: 'f',
		describe: 'Name of file that will be loaded and used as content',
		type: 'string',
	});
	yargs.options('strip-comments', {
		alias: 'c',
		describe: 'Strip bash comments.',
		default: false,
		type: 'boolean',
	});

	yargs.conflicts('input', 'file');
};

interface CmdArgv {
	input?: string;
	file?: string;
	stripComments?: boolean;
}

export const handler = async (argv: Argv & RootCmdArgv & CmdArgv) => {
	let value = await getStdIn();

	// try to load current .env.[branch] as content if neither file nor input are specified and no piped input is avilable
	if (value === '' && !argv.file && !argv.input) {
		const filePath = path.resolve(process.cwd(), `.env.${argv.env}`);
		if (!fs.existsSync(filePath)) {
			process.stderr.write(`Failed to load default environment config for current branch from ${filePath}.\n`);
			process.exit(1);
		}
		value = fs.readFileSync(filePath, { encoding: 'utf8' });
	}

	if (argv.input) {
		value = argv.input;
	}

	if (argv.file) {
		const filePath = path.resolve(process.cwd(), argv.file);
		if (!fs.existsSync(filePath)) {
			process.stderr.write(`Could not find input file\n`);
			process.exit(1);
		}
		value = fs.readFileSync(filePath, { encoding: 'utf8' });
	}

	const { secretManager, name, gooleServiceAccount } = argv;

	if (argv.stripComments) {
		console.log('does not work yet');
		// value = stripComments(value);
	}

	const secretName = await upsertSecret({
		client: secretManager,
		name,
		value,
		projectId: gooleServiceAccount.project_id,
	});

	process.stdout.write(`Successfully updated secret ${secretName}\n`);
	process.exit(0);
};
