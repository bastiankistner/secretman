import { Argv, showHelp } from 'yargs';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import type { SecretManagerServiceClient as SecretManagerServiceClientInstance } from '@google-cloud/secret-manager/build/src/v1';
import chalk from 'chalk';

import { getCurrentBranchName } from '../utils/git';
import { getPackageJson } from '../utils/common';
import { getGoogleApplicationCredentialsAdvanced, GoogleApplicationCredentials } from '../utils/service-account';

export type RootCmdArgv = {
	env: string;
	name: string;
	secretManager: SecretManagerServiceClientInstance;
	gooleServiceAccount: GoogleApplicationCredentials;
};

const ENV_PREFIX = 'SECRETS';

export const command = 'secrets [command]';
export const desc = `tools for managing secrets on google secret manager\n\n${chalk.green(
	'HINT'
)}: all options can be provided as uppercased environemnt variables, whereas dashes are to be replaced with underscores, aliases allowed`;
export const handler = () => showHelp();

export const builder = async (yargs: Argv) => {
	// ---- set env prefix
	yargs.env(ENV_PREFIX); // HINT: means we can `SHOPIFY_NAME=abc ./bin/efa shopify` and set an option

	// ---- hide options
	yargs.hide('verbose');
	yargs.hide('version');

	yargs.env();

	// ---- additional options
	yargs.option('env', {
		describe: 'Environment, usually branch name (e.g. dev or master). Uses current branch name if unspecified',
		alias: 'e',
		type: 'string',
		demandOption: false,
	});

	yargs.options('service-account-keyfile', {
		describe: 'Google SA as filename, env name to content or file or the content itself, that can be text or base64',
		alias: 'k',
		type: 'string',
		demandOption: true,
	});

	yargs.options('name', {
		describe:
			'Name of the secret. If unset, it will be constructed based on name in current working directories package.json and current branch name',
		alias: 'n',
		type: 'string',
	});

	// ---- set command dir
	return (
		yargs
			.commandDir('secrets')
			// add google secret manager
			.middleware((argv) => {
				const gooleServiceAccount = getGoogleApplicationCredentialsAdvanced(argv.serviceAccountKeyfile as string);

				return {
					...argv,
					gooleServiceAccount,
					secretManager: new SecretManagerServiceClient({
						projectId: gooleServiceAccount.project_id,
						credentials: {
							client_email: gooleServiceAccount.client_email,
							private_key: gooleServiceAccount.private_key,
						},
					}),
				};
			})
			// add branch name and construct secret name if not defined
			.middleware((argv) => {
				argv.env = argv.env || getCurrentBranchName();

				if (typeof argv.name === 'undefined') {
					const { name } = getPackageJson();

					let safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_') as string;

					if (safeName.startsWith('_')) safeName = safeName.slice(1);

					argv.name = `${safeName}__${argv.env}`;
				}

				return argv;
			})
	);
};
