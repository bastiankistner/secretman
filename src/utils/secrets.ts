import { SecretManagerServiceClient } from '@google-cloud/secret-manager/build/src/v1beta1';

type NameOptions = {
	name: string;
	projectId: string;
	version?: number | string;
};

type GetOptions = NameOptions & {
	client: SecretManagerServiceClient;
};

type CreateOptions = Omit<GetOptions, 'version'>;

type AddVersionOptions = GetOptions &
	CreateOptions & {
		value: string;
	};

function getFullName(options: NameOptions) {
	return `projects/${options.projectId}/secrets/${options.name}${
		!options.version ? '' : `/versions/${options.version}`
	}`;
}

export async function getSecret(options: GetOptions) {
	const [version] = await options.client.accessSecretVersion({
		name: getFullName({ ...options, version: options.version || 'latest' }),
	});

	if (!version) {
		throw new Error(`Could not find secret ${options.name}`);
	}
	const payload = version.payload?.data?.toString();

	return payload;
}

export async function createSecret({ name, projectId, client }: CreateOptions) {
	await client.createSecret({
		parent: `projects/${projectId}`,
		secretId: name,
		secret: {
			replication: {
				automatic: {},
			},
		},
	});

	return null;
}

export async function addVersion(options: AddVersionOptions) {
	const payload = Buffer.from(options.value, 'utf8');

	const parent = getFullName(options);

	await options.client.addSecretVersion({
		parent,
		payload: {
			data: payload,
		},
	});

	return parent;
}

export async function upsertSecret(options: AddVersionOptions) {
	let name: string;
	try {
		await getSecret(options);
	} catch (err) {
		await createSecret(options);
	} finally {
		name = await addVersion(options);
	}
	return name;
}
