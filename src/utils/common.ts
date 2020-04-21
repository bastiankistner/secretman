import fs from 'fs';

import findUp from 'find-up';

import { getCurrentBranchName } from './git';

export function getPackageJson(cwd = process.cwd()): { name?: string; [key: string]: any } {
	const packageJsonPath = findUp.sync('package.json', { cwd });
	if (!packageJsonPath) {
		throw new Error('Could not find package.json');
	}
	const json = fs.readFileSync(packageJsonPath, { encoding: 'utf-8' });
	return JSON.parse(json);
}

export function getInfo({ name, env }: { env?: string; name?: string }) {
	if (typeof env === 'undefined') {
		env = getCurrentBranchName();
		if (!env) throw new Error('Could not determine environment and none was given.');
	}

	if (typeof name === 'undefined') {
		const { name: packageName } = getPackageJson();

		if (!packageName) throw new Error('Could not determine name from package.json and no name was given.');

		let safeName = packageName.replace(/[^a-zA-Z0-9_-]/g, '_');

		if (safeName.startsWith('_')) safeName = safeName.slice(1);

		name = `${safeName}__${env}`;
	}

	return {
		env,
		name,
	};
}
