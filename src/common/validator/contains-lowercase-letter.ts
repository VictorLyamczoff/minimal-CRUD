import { registerDecorator, ValidationOptions } from 'class-validator';

export function ContainsLowercaseLetter(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string): void {
		registerDecorator({
			name: 'contains-lowercase-letter',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					return /[a-z]/.test(value);
				},
				defaultMessage() {
					return '$свойство должно содержать не менее 1 строчной буквы [a-z]';
				},
			},
		});
	};
}
