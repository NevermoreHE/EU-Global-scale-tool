export {};

declare global {
  interface String {
    formatUnicorn(str: any): string;
  }
}

String.prototype.formatUnicorn =
  String.prototype.formatUnicorn ||
  function (this: any) {
    let output = this.toString();

    if (arguments.length) {
      const t = typeof arguments[0];
      let key;
      const args =
        'string' === t || 'number' === t
          ? Array.prototype.slice.call(arguments)
          : arguments[0];

      for (key in args) {
        if (key) {
          output = output.replace(
            new RegExp('\\{' + key + '\\}', 'gi'),
            args[key]
          );
        }
      }
    }
    return output;
  };
