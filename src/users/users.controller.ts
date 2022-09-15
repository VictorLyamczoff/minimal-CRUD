import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http-error.class';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';
import 'reflect-metadata';
import { IUserController } from './users.controller.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { ValidateMiddleware } from '../common/validate.middleware';
import { UserRegisterDto } from './dto/user-register.dto';
import { JsonWebTokenError, sign, TokenExpiredError, verify } from 'jsonwebtoken';
import { IConfigService } from '../config/config.service.iterface';
import { IUserService } from './user.service.interface';
import { AuthGuard } from '../common/auth.guard';
import { jwt } from '../config/tokens.config';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/info',
				method: 'get',
				func: this.info,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/refresh',
				method: 'get',
				func: this.refreshTokens,
				middlewares: [new AuthGuard()],
			},
		]);
	}

	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.validateUser(req.body);

		if (!result) {
			return next(new HTTPError(401, 'Ошибка авторизации', 'login'));
		}

		const accessToken = await this.generateAccessToken(
			req.body.email,
			this.configService.get('SECRET'),
		);

		const refreshToken = await this.generateRefreshToken(
			req.body.email,
			this.configService.get('SECRET'),
		);
		const decodeAccessToken = verify(accessToken, 'MYSECRET');

		this.ok(res, {
			accessToken: accessToken,
			refreshToken: refreshToken,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			exp: decodeAccessToken?.exp * 1000 - Date.now(),
		});
	}

	async register(
		{ body }: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.createUser(body);
		if (!result) {
			return next(new HTTPError(422, 'Такой пользователь уже существует', 'register'));
		} else {
			this.ok(res, { email: result.email, id: result.id });
			this.loggerService.log('Пользователь зарегистрирован');
		}
	}

	async info(
		{ headers: { authorization }, user }: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const userInfo = await this.userService.getUserInfo(user);
		let decodedToken;
		if (authorization) {
			decodedToken = verify(authorization.split(' ')[1], this.configService.get('SECRET'));
			this.ok(res, {
				id: userInfo?.id,
				email: userInfo?.email,
				name: userInfo?.name,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				token: decodedToken?.exp * 1000 - Date.now(),
			});
		}
	}

	private generateAccessToken(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const payload = {
				email,
				type: jwt.tokens.access.type,
			};
			const options = { expiresIn: jwt.tokens.access.expiresIn };
			sign(payload, secret, options, (err, token) => {
				if (err) {
					reject(err);
				}
				resolve(token as string);
			});
		});
	}

	private generateRefreshToken(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const payload = {
				email,
				type: jwt.tokens.refresh.type,
			};
			const options = { expiresIn: jwt.tokens.refresh.expiresIn };
			sign(payload, secret, options, (err, token) => {
				if (err) {
					reject(err);
				}
				resolve(token as string);
			});
		});
	}

	async refreshTokens(
		{ headers: { authorization }, user }: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const userInfo = await this.userService.getUserInfo(user);
		try {
			let decodedToken;
			if (authorization) {
				decodedToken = verify(authorization.split(' ')[1], this.configService.get('SECRET'));
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				if (decodedToken.type !== 'refresh') {
					return next(new HTTPError(400, 'Некорректный токен', 'refresh'));
				}
			}
		} catch (e) {
			if (e instanceof TokenExpiredError) {
				return next(new HTTPError(400, 'Срок действия токен истек', 'refresh'));
			}
			if (e instanceof JsonWebTokenError) {
				return next(new HTTPError(400, 'Некорректный токен', 'refresh'));
			}
		}

		if (userInfo) {
			const accessToken = await this.generateAccessToken(
				userInfo?.email,
				this.configService.get('SECRET'),
			);
			const refreshToken = await this.generateAccessToken(
				userInfo?.email,
				this.configService.get('SECRET'),
			);
			this.ok(res, {
				id: userInfo?.id,
				email: userInfo?.email,
				name: userInfo?.name,
				accessToken: accessToken,
				refreshToken: refreshToken,
			});
		}
	}
}
