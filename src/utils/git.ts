/* eslint-disable no-nested-ternary */
import path from 'path';
import fs from 'fs';

import * as git from 'isomorphic-git';
import findUp from 'find-up';

export function getGitRoot() {
	const dir = findUp.sync('.git', { type: 'directory' });
	if (!dir) {
		throw new Error('Could not find git root');
	}

	return path.resolve(dir, '..');
}

export async function getCurrentBranch() {
	return git.currentBranch({ fs, dir: getGitRoot(), fullname: false });
}

export function getCurrentBranchName(p = process.cwd()): string | undefined {
	const gitHeadPath = `${p}/.git/HEAD`;

	return fs.existsSync(p)
		? fs.existsSync(gitHeadPath)
			? fs.readFileSync(gitHeadPath, 'utf-8').trim().split('/')[2]
			: getCurrentBranchName(path.resolve(p, '..'))
		: undefined;
}
