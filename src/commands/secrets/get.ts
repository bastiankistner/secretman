import path from 'path';

import { Argv } from 'yargs';
import { writeFileSync } from 'fs-extra';

import { RootCmdArgv } from '../secrets';
import { getSecret } from '../../utils/secrets';

export const command = 'get';
export const desc = 'get secret [options]';

export const builder = async (yargs: Argv) => {
	yargs.options('out', {
		alias: 'o',
		describe: 'Filename to output variable content to',
		type: 'string',
	});
	yargs.options('parse', {
		alias: 'p',
		choices: ['comma-separated-one-line', 'base64'],
	});
};

interface CmdArgv {
	out: string;
	parse: 'comma-separated-one-line';
}

export const handler = async (argv: Argv & RootCmdArgv & CmdArgv) => {
	const { secretManager, name, gooleServiceAccount } = argv;

	let secret = await getSecret({
		client: secretManager,
		name,
		projectId: gooleServiceAccount.project_id,
	});

	if (!secret) {
		process.stderr.write(`Could not find secret ${name}\n`);
		process.exit(1);
	}

	if (secret) {
		switch (argv.parse) {
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

		if (argv.out) {
			const filePath = path.resolve(process.cwd(), argv.out);
			writeFileSync(filePath, secret);
			process.stdout.write(`Environment config written to ${filePath}\n`);
		} else {
			process.stdout.write(secret);
		}
	}
	return process.exit(0);
};
