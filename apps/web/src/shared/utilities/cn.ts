type TClassValue = string | number | boolean | undefined | null;
type TClassArray = TClassValue[];
type TClassObject = Record<string, unknown>;
type TClassInput = TClassValue | TClassArray | TClassObject;

function clsx(...inputs: TClassInput[]): string {
	const classes: string[] = [];

	function processInput(input: TClassInput): void {
		if (input === undefined || input === null || input === false) {
			return;
		}

		if (typeof input === 'string' || typeof input === 'number') {
			classes.push(String(input));
		} else if (Array.isArray(input)) {
			for (const item of input) {
				processInput(item);
			}
		} else if (typeof input === 'object') {
			for (const [key, value] of Object.entries(input)) {
				if (value) {
					classes.push(key);
				}
			}
		}
	}

	for (const input of inputs) {
		processInput(input);
	}

	return classes.join(' ');
}

function cn(...inputs: TClassInput[]): string {
	return clsx(...inputs);
}

export { cn, clsx };
