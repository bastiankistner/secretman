import fs from 'fs';
import os from 'os';
import path from 'path';

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export interface GoogleApplicationCredentials {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
	auth_uri: string;
	token_uri: string;
	auth_provider_x509_cert_url: string;
	client_x509_cert_url: string;
}

export function isJsonPath(value: string) {
	return value.endsWith('.json');
}

export function isEnvironmentVariable(value: string) {
	return typeof process.env[value] !== 'undefined';
}

function convertTilde(pathWithPotentialTilde: string) {
	if (pathWithPotentialTilde.startsWith('~')) {
		pathWithPotentialTilde = `${os.homedir}/${pathWithPotentialTilde.slice(1)}`;
	}
	return pathWithPotentialTilde;
}

export function getGoogleApplicationCredentialsAdvanced(envOrPath: string) {
	if (typeof envOrPath === 'undefined') {
		throw new Error('envOrPath must be set to read google application credentials');
	}

	let source = envOrPath;

	if (isEnvironmentVariable(envOrPath)) {
		source = process.env[envOrPath] as string;
	}

	if (isJsonPath(source)) {
		source = fs.readFileSync(path.resolve(convertTilde(source))).toString();
	}

	if (source === '') {
		throw new Error(`Could not read google application credentials [source: ${source}}]`);
	}

	let parsedServiceAccount: GoogleApplicationCredentials;

	try {
		// try to decode base64 into string
		const decoded = Buffer.from(source, 'base64').toString('utf8').trim();
		// try to decode, if it fails, it wasn't base64 encoded
		parsedServiceAccount = JSON.parse(decoded);
	} catch (err) {
		// parse previous source in case base64 decode failed
		try {
			parsedServiceAccount = JSON.parse(source);
		} catch (parseError) {
			process.stderr.write(`Could not parse google application credentials [source: ${source}]`);
			return process.exit(1);
		}
	}

	return parsedServiceAccount;
}

export const getSecretManager = ({ project_id, client_email, private_key }: GoogleApplicationCredentials) =>
	new SecretManagerServiceClient({
		projectId: project_id,
		credentials: {
			client_email,
			private_key,
		},
	});
