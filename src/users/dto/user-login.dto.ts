import { IsEmail, IsString, MinLength } from 'class-validator';
import { ContainsUppercaseLetter } from '../../common/validator/contains-uppercase-letter';
import { ContainsLowercaseLetter } from '../../common/validator/contains-lowercase-letter';
import { ContainsNumeric } from '../../common/validator/contains-numeric';

export class UserLoginDto {
	@IsEmail({}, { message: 'Неверно указан email' })
	email: string;

	@IsString({ message: 'Не указан пароль' })
	@MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
	@ContainsUppercaseLetter()
	@ContainsLowercaseLetter()
	@ContainsNumeric()
	password: string;

	name: string;
}
