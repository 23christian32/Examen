# Water Leaks API

API REST hecha con **NestJS + TypeORM + PostgreSQL** para que los ciudadanos reporten
fugas de agua en la via publica. Al crear un reporte, se guarda en la base de datos y
se envia un correo de aviso a la cuadrilla de mantenimiento con los datos de la fuga.

## Entidades

### WATER_REPORT (`Report`)

| Campo         | Tipo      | Descripcion                              |
| ------------- | --------- | ----------------------------------------- |
| id            | number    | PK autogenerada                          |
| address       | string    | Direccion o referencia de la fuga        |
| description   | string    | Que se observa                           |
| severity      | string    | `low` / `medium` / `high`                |
| reporterPhone | string    | Telefono de contacto                     |
| isResolved    | boolean   | Inicia en `false`                        |
| createdAt     | timestamp | Fecha del reporte                        |

### SYSTEM_USER (`User`)

| Campo                 | Tipo    | Descripcion                          |
| --------------------- | ------- | ------------------------------------- |
| id                    | number  | PK autogenerada                      |
| name                  | string  | Nombre del usuario                   |
| email                 | string  | Correo (unico)                       |
| password              | string  | Hasheada con bcryptjs                |
| isNotificationEnabled | boolean | Inicia en `false`                    |

## Requisitos

- Node.js 20+
- Docker (para la base de datos)

## Puesta en marcha

1. Instalar dependencias:

```bash
npm install
```

2. Levantar PostgreSQL:

```bash
docker compose up -d
```

3. Copiar las variables de entorno:

```bash
cp .env.example .env
```

4. Configurar el correo (SMTP). Para no depender de un correo real, el proyecto usa
   [Ethereal](https://ethereal.email) (SMTP de prueba, no entrega correos reales, solo
   los deja ver en una bandeja web). Genera una cuenta gratis con:

```bash
npm run ethereal:create
```

Copia los valores `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` que imprime el
script dentro de tu `.env`. Si preferis usar un SMTP real (Gmail con app password,
Mailtrap, etc.), reemplaza esas mismas variables por las de tu proveedor. Tambien
completa `MAINTENANCE_EMAIL` con el correo que debe recibir el aviso de cada fuga.

5. Ejecutar las migraciones:

```bash
npm run migration:run
```

6. Arrancar la API:

```bash
npm run start:dev
```

La API queda en `http://localhost:3000/api`.

## Endpoints

### Auth

| Metodo | Ruta           | Body               | Respuesta                              |
| ------ | -------------- | ------------------ | --------------------------------------- |
| POST   | /api/auth/register | `CreateUserDto` | 201, usuario creado (sin password)     |
| POST   | /api/auth/login    | `LoginDto`      | 200, datos del usuario / 400 si falla  |

`LoginDto` = `{ email, password }`. Si el correo no existe o la contraseña no coincide,
responde `400 Bad Request` con un mensaje generico ("Correo o contraseña incorrectos")
para no revelar si el correo esta registrado.

### Reports

| Metodo | Ruta          | Body               | Respuesta                     |
| ------ | ------------- | ------------------ | ------------------------------ |
| POST   | /api/reports  | `CreateReportDto`  | 201, reporte creado           |
| GET    | /api/reports  | -                   | 200, lista de reportes        |

`CreateReportDto` = `{ address, description, severity, reporterPhone }`, con
`severity` restringido a `low | medium | high` (validado con `class-validator` y
tambien con un `CHECK` a nivel de base de datos).

Al crear un reporte, el `ReportsService`:

1. Guarda el reporte en `WATER_REPORT`.
2. Dispara el envio del correo de aviso a `MAINTENANCE_EMAIL` usando la plantilla de
   `src/reports/templates/report.template.ts`, **sin esperar** el resultado del envio.
   Si el correo falla o el SMTP esta lento/caido, se loguea un warning pero el reporte
   ya quedo guardado y la respuesta HTTP no se demora.

La validacion se hace con `class-validator` mediante los DTOs de cada modulo, con un
`ValidationPipe` global que usa `whitelist` y `forbidNonWhitelisted`.

## Migraciones

```bash
npm run migration:generate -- src/db/migrations/NombreDeLaMigracion
npm run migration:run
npm run migration:revert
```

Las migraciones compilan primero a `dist/` (ver script `typeorm` en `package.json`).
