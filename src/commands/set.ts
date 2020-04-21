import path from 'path';

import { CommandBuilder } from 'yargs';
import fs from 'fs-extra';
import getStdIn from 'get-stdin';

import { getSecretManager, getGoogleApplicationCredentialsAdvanced } from '../utils/service-account';
import { RootOptions } from '../index';
import { upsertSecret } from '../utils/secrets';
import { getInfo } from '../utils/common';

export const command = 'set';

export const describe = `set secret [options] [--input | --file] (you can also pipe input via echo -n "myinput" | sltx secrets set)`;

interface CmdArgv {
	input?: string;
	file?: string;
	stripComments?: boolean;
}

export const builder: CommandBuilder<RootOptions, RootOptions & CmdArgv> = async (args) => {
	return args
		.options('input', {
			alias: 'i',
			describe: "Raw input to write, make sure to enclose in ''",
			type: 'string',
		})
		.options('file', {
			alias: 'f',
			describe: 'Name of file that will be loaded and used as content',
			type: 'string',
		})
		.options('strip-comments', {
			alias: 'c',
			describe: 'Strip bash comments.',
			default: false,
			type: 'boolean',
		})
		.conflicts('input', 'file')
		.hide('version');
};

export const handler: (args: RootOptions & CmdArgv) => void = async (args) => {
	const credentials = getGoogleApplicationCredentialsAdvanced(args['service-account-keyfile']);
	const secretManager = getSecretManager(credentials);

	const { name, env } = getInfo(args);

	let value = await getStdIn();

	// try to load current .env.[branch] as content if neither file nor input are specified and no piped input is avilable
	if (value === '' && !args.file && !args.input) {
		const filePath = path.resolve(process.cwd(), `.env.${env}`);
		if (!fs.existsSync(filePath)) {
			process.stderr.write(`Failed to load default environment config for current branch from ${filePath}.\n`);
			process.exit(1);
		}
		value = fs.readFileSync(filePath, { encoding: 'utf8' });
	}

	if (args.input) {
		value = args.input;
	}

	if (args.file) {
		const filePath = path.resolve(process.cwd(), args.file);
		if (!fs.existsSync(filePath)) {
			process.stderr.write(`Could not find input file\n`);
			process.exit(1);
		}
		value = fs.readFileSync(filePath, { encoding: 'utf8' });
	}

	if (args.stripComments) {
		console.log('does not work yet');
		// value = stripComments(value);
	}

	const secretName = await upsertSecret({
		client: secretManager,
		name,
		value,
		projectId: credentials.project_id,
	});

	process.stdout.write(`Successfully updated secret ${secretName}\n`);
	process.exit(0);
};
