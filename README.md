# Минимальный CRUD для сущности User

:white_check_mark: Регистрация    
:white_check_mark: Авторизация    
:black_square_button: Выход из системы    
:black_square_button: Удаление пользователя    
:black_square_button: Обновление данных пользователя пользователя    
:white_check_mark: Генерация JWT    
:white_check_mark: Не хранить пароли в открытом виде    
:white_check_mark: Валидация полей API запросов    
:white_check_mark: Защита авторизации    
:black_square_button: Endpoint для refresh token    
:black_square_button: Тесты

## Список API endpoint

- POST /users/register

```json
{
  "name": "Петя",
  "email": "email@myemail.ru",
  "password": "asfASF123"
}
```

RETURN:

```json
{
  "email": "email@myemail.ru",
  "id": 5
}
```

---

- POST /users/login

```json
{
  "email": "email@myemail.ru",
  "password": "asfASF123"
}
```

RETURN:

```json
{
  "jwt": "token"
}
```

---

- GET /users/info

  HEADER: ```Authorization: Bearer {token}```

RETURN:

```json
{
  "id": 5,
  "email": "email@myemail.ru",
  "name": "Петя"
}
```