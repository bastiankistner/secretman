/* eslint-disable @typescript-eslint/no-empty-interface */
import { Argv } from 'yargs';

import { RootCmdArgv } from '../secrets';

export const command = 'list';
export const desc = 'list names of secrets that are currently set';

export const builder = async (yargs: Argv) => {
	// yargs.options('out', {
	// 	alias: 'o',
	// 	describe: 'Filename to output variable content to',
	// 	type: 'string',
	// });
};

interface CmdArgv {}

export const handler = async (argv: Argv & RootCmdArgv & CmdArgv) => {
	const { secretManager, gooleServiceAccount } = argv;

	const [secrets] = await secretManager.listSecrets({
		parent: `projects/${gooleServiceAccount.project_id}`,
	});

	secrets.forEach((secret) => {
		process.stdout.write(`${secret.name}\n`);
	});

	return process.exit(0);
};
