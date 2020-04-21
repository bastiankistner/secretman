import 'source-map-support/register';
import yargs from 'yargs';

// eslint-disable-next-line no-unused-expressions
yargs
	.demandCommand()
	.showHelpOnFail(true)
	.version()
	.alias('version', 'v')
	.describe('v', 'Show version information')
	.option('verbose', {
		type: 'boolean',
		description: 'Run with verbose logging',
	})
	// ------------------------------------
	.commandDir('commands')
	.help().argv;
