import fs from 'fs';

import findUp from 'find-up';

export function getPackageJson(cwd = process.cwd()) {
	const packageJsonPath = findUp.sync('package.json', { cwd });
	if (!packageJsonPath) {
		throw new Error('Could not find package.json');
	}
	const json = fs.readFileSync(packageJsonPath, { encoding: 'utf-8' });
	return JSON.parse(json);
}
