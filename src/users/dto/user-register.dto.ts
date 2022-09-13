import { IsEmail, IsString, MinLength } from 'class-validator';
import { ContainsNumeric } from '../../common/validator/contains-numeric';
import { ContainsLowercaseLetter } from '../../common/validator/contains-lowercase-letter';
import { ContainsUppercaseLetter } from '../../common/validator/contains-uppercase-letter';

export class UserRegisterDto {
	@IsEmail({}, { message: 'Неверно указан email' })
	email: string;

	@IsString({ message: 'Не указан пароль' })
	@MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
	@ContainsUppercaseLetter()
	@ContainsLowercaseLetter()
	@ContainsNumeric()
	password: string;

	@IsString({ message: 'Не указано имя' })
	name: string;
}
