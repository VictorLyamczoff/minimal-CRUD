import { registerDecorator, ValidationOptions } from 'class-validator';

export function ContainsUppercaseLetter(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string): void {
		registerDecorator({
			name: 'contains-uppercase-letter',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					return /[A-Z]/.test(value);
				},
				defaultMessage() {
					return '$свойство должно содержать не менее 1 заглавной буквы [A-Z]';
				},
			},
		});
	};
}
