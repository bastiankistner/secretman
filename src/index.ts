import 'source-map-support/register';
import yargs from 'yargs';
import chalk from 'chalk';

import * as getCommand from './commands/get';
import * as listCommand from './commands/list';
import * as setCommand from './commands/set';

export type RootOptions = {
	'service-account-keyfile': string;
	env?: string;
	name?: string;
};

// eslint-disable-next-line no-unused-expressions
yargs
	.options('service-account-keyfile', {
		describe: 'Google SA as filename, env name to content or file or the content itself, that can be text or base64',
		alias: 'k',
		type: 'string',
		demandOption: true,
	})
	.option('env', {
		describe: 'Environment, usually branch name (e.g. dev or master). Uses current branch name if unspecified',
		alias: 'e',
		type: 'string',
		demandOption: false,
	})
	.options('name', {
		describe:
			'Name of the secret. If unset, it will be constructed based on name in current working directories package.json and current branch name',
		alias: 'n',
		type: 'string',
		demandOption: false,
	})
	// .showHelpOnFail(true)
	.version()
	.alias('version', 'v')
	.describe('v', 'Show version information')
	.usage(
		`secretman - managing secrets on google secret manager\n\n${chalk.green(
			'HINT'
		)}: all options can be provided as uppercased environemnt variables, whereas dashes are to be replaced with underscores, aliases allowed`
	)
	.command(getCommand)
	.command(setCommand)
	.command(listCommand)
	.demandCommand(1, 'Warning: No command provided')
	.strict()
	.env('SECRETMAN').argv;
