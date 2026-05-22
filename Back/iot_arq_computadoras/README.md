<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description
[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## API del proyecto
Este backend expone los siguientes endpoints para el front y el ESP32:
- `POST /auth/register` para crear usuario (username/password) en MongoDB.
- `POST /auth/login` para obtener JWT.
- `GET /auth/me` para validar sesión (requiere `Authorization: Bearer <token>`).
- `GET /esp/rele?state=on|off` para prender o apagar la cerradura electronica (requiere JWT).
- `GET /esp/logs` para leer el historial guardado en MongoDB.
- `POST /esp/receive-state` para registrar cambios enviados por el microcontrolador.

Variables de entorno relevantes:

- `PORT` para el puerto HTTP del backend, por defecto `3000`.
## Documentación de la API

Este repositorio contiene el backend (NestJS) que expone una API para controlar una cerradura electrónica conectada a un ESP32 y almacenar un historial de eventos en MongoDB.

Endpoints principales

- `POST /auth/register` — Crear un usuario. Body JSON: `{ "username": "usuario", "password": "secreto" }`.
- `POST /auth/login` — Autenticar y recibir JWT. Body JSON: `{ "username": "usuario", "password": "secreto" }`. Respuesta: `{ "accessToken": "<token>", "user": { ... } }`.
- `GET /auth/me` — Obtener datos del usuario autenticado. Requiere cabecera `Authorization: Bearer <token>`.
- `GET /esp/rele?state=on|off` — Encender/apagar la cerradura electrónica en el ESP. Requiere JWT en `Authorization`.
- `GET /esp/logs` — Obtener el historial de eventos guardado en MongoDB. Requiere JWT.
- `POST /esp/receive-state` — Endpoint abierto para que el ESP envíe eventos/estados. Body JSON ejemplo: `{ "action": "on", "source": "esp32-1", "timestamp": "2026-05-21T12:00:00Z" }`.

Documentación OpenAPI / ReDoc

- YAML OpenAPI: `GET /doc.yml`
- Interfaz ReDoc: `GET /docs`

Ejemplos (curl)

Registrar usuario:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

Login (obtén `accessToken`):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

Llamada protegida (usar token obtenido):

```bash
TOKEN="ey..."
curl -X GET "http://localhost:3000/esp/rele?state=on" \
  -H "Authorization: Bearer $TOKEN"
```

Enviar un evento desde el ESP (sin autenticación):

```bash
curl -X POST http://localhost:3000/esp/receive-state \
  -H "Content-Type: application/json" \
  -d '{"action":"on","source":"esp32-1","timestamp":"2026-05-21T12:00:00Z"}'
```

Variables de entorno importantes

- `PORT` — Puerto HTTP del backend (por defecto `3000`).
- `MONGO_URI` — URI de conexión a MongoDB (ejemplo: `mongodb://mongo:27017/iot`).
- `ESP_BASE_URL` — URL base del ESP (ejemplo: `http://10.0.0.50`). La API enviará peticiones a `ESP_BASE_URL/rele?state=on|off`.
- `ESP_TIMEOUT_MS` — Timeout para peticiones al ESP en ms (por defecto `10000`).
- `JWT_ACCESS_SECRET` — Clave secreta para firmar JWT.
- `JWT_EXPIRES_IN` — Duración del JWT (ejemplo: `1h`).
- `BCRYPT_SALT_ROUNDS` — Rondas para bcrypt al hashear contraseñas.

Ejecución local

```bash
# instalar dependencias
npm install

# modo desarrollo (con watch)
npm run start:dev

# modo producción (build + start)
npm run build
npm run start:prod
```

Ejecución con Docker / Docker Compose

En la raíz del workspace hay un `docker-compose.yml` que inicia `mongo`, `backend` y `frontend`. Para levantar todo:

```bash
docker-compose up --build
```

Nota sobre conexión al ESP desde Docker: si el ESP está en la misma red local, asegúrate de que el contenedor del backend pueda acceder a su IP. En entornos Linux puedes usar `network_mode: host` en Docker Compose o exponer redes adecuadas; alternativamente establece `ESP_BASE_URL` apuntando a la IP accesible desde el contenedor.

Buenas prácticas y seguridad

- Guarda `JWT_ACCESS_SECRET` y `MONGO_URI` en variables de entorno fuera del repositorio.
- Para producción considera usar HTTPS, rotación de claves, refresh tokens y limitación de tasa.

Dónde encontrar la documentación interactiva

- La UI de ReDoc está disponible en: `/docs` (por ejemplo `http://localhost:3000/docs`).
- El archivo OpenAPI YAML está en: `/doc.yml`.

Contacto y recursos

Para más información sobre NestJS visita: https://docs.nestjs.com

---

Archivo del proyecto (frontend, docker-compose y archivos auxiliares) se encuentran en la raíz del workspace. Esta sección documenta únicamente la API del backend y cómo consumirla.
