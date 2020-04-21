import { CommandBuilder } from 'yargs';

import { getSecretManager, getGoogleApplicationCredentialsAdvanced } from '../utils/service-account';
import { RootOptions } from '../index';

export const command = 'list';

export const desc = 'list names of secrets that are currently set';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CmdArgv {}

export const builder: CommandBuilder<RootOptions, RootOptions & CmdArgv> = async (args) => args;

export const handler: (args: RootOptions & CmdArgv) => void = async (args) => {
	const credentials = getGoogleApplicationCredentialsAdvanced(args['service-account-keyfile']);
	const secretManager = getSecretManager(credentials);

	const [secrets] = await secretManager.listSecrets({
		parent: `projects/${credentials.project_id}`,
	});

	secrets.forEach((secret) => {
		process.stdout.write(`${secret.name}\n`);
	});

	return process.exit(0);
};
