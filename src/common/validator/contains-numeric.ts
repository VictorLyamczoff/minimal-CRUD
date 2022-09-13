import { registerDecorator, ValidationOptions } from 'class-validator';

export function ContainsNumeric(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string): void {
		registerDecorator({
			name: 'contains-numeric',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					return /[0-9]/.test(value);
				},
				defaultMessage() {
					return '$свойство должно содержать не менее 1 числового символа [0-9]';
				},
			},
		});
	};
}
