// see https://www.npmjs.com/package/strip-comments#usage
declare module 'strip-comments' {
	type Options = {
		// https://github.com/jonschlinkert/extract-comments
	};

	function d(input: string, options?: any): string;

	function line(input: string, options?: any): string;

	d.line = line;

	export default d;
}
