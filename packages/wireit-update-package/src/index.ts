type PlainObject = Record<string, any>;

const dict: PlainObject = {};

/**
 * Hello function whithout parameter
 * @returns result string
 */
export function hello(): string;

/**
 * This is hello function
 * @returns result string
 */
export function hello(greet = 'Hello') {
  return `${greet} world`;
}

