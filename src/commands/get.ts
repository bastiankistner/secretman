import path from 'path';

import { CommandBuilder, Argv } from 'yargs';
import { writeFileSync } from 'fs-extra';

import { RootOptions } from '../index';
import { getSecret } from '../utils/secrets';
import { getGoogleApplicationCredentialsAdvanced, getSecretManager } from '../utils/service-account';
import { getInfo } from '../utils/common';

export const command = 'get';

export const describe =
	'Fetches a secret and either prints it or outputs it to a file. It can optionally be parsed into comma separated line or base64 value';

interface CmdArgv {
	out?: string;
	parse?: 'comma-separated-one-line' | 'base64';
}

export const builder: CommandBuilder<RootOptions, RootOptions & CmdArgv> = async (args) => {
	return args
		.options('out', {
			alias: 'o',
			describe: 'Filename to output variable content to',
			type: 'string',
			demandOption: false,
		})
		.options('parse', {
			alias: 'p',
			choices: ['comma-separated-one-line', 'base64'],
			demandOption: false,
		})
		.hide('version');
};

export const handler: (args: RootOptions & CmdArgv) => void = async (args) => {
	const credentials = getGoogleApplicationCredentialsAdvanced(args['service-account-keyfile']);
	const secretManager = getSecretManager(credentials);

	const { name } = getInfo(args);

	let secret = await getSecret({ client: secretManager, name, projectId: credentials.project_id });

	if (!secret) {
		process.stderr.write(`Could not find secret ${name}\n`);
		process.exit(1);
	}

	if (secret) {
		switch (args.parse) {
			case 'comma-separated-one-line':
				secret = secret
					.replace(/[\n\r]{1,}/g, '\n') // replace multiple new-lines with a single new-line
					.replace(/[\n\r]/g, ','); // replace single new-line with comma
				if (secret.startsWith(',')) secret = secret.slice(1); // remove comma if string starts with it
				break;
			case 'base64':
				secret = Buffer.from(secret, 'base64').toString();
				break;
			default:
				break;
		}

		if (args.out) {
			const filePath = path.resolve(process.cwd(), args.out);
			writeFileSync(filePath, secret);
			process.stdout.write(`Environment config written to ${filePath}\n`);
		} else {
			process.stdout.write(secret);
		}
	}
	return process.exit(0);
};
