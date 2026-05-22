# IotArqComputadorasFront

Front Angular para controlar un ESP32 a través de la API Nest.

Resumen rápido

- Rutas importantes consumidas por el front (proxy `/api`):
	- `POST /api/auth/register` — Registrar usuario.
	- `POST /api/auth/login` — Login, devuelve `accessToken`.
	- `GET /api/auth/me` — Verificar token y obtener usuario.
	- `GET /api/esp/rele?state=on|off` — Encender/apagar el relé (protegido).
	- `GET /api/esp/logs` — Obtener historial (protegido).
	- `POST /api/esp/receive-state` — Endpoint que usa el ESP para notificar eventos (público en el backend).

Autenticación y sesión

- El front guarda el token JWT en `localStorage` bajo la clave `auth_token`.
- Las rutas protegidas usan un guard que valida el token llamando a `GET /api/auth/me`. Si el backend responde `401`, el front limpia la sesión y redirige a `/login`.

Estructura del servidor SSR y proxy `/api`

- El servidor SSR (archivo `src/server.ts`) reenvía todas las peticiones que comienzan por `/api` al backend definido por la variable de entorno `BACKEND_URL`.
- Valor por defecto en producción/Docker: `http://backend:3000`.
- Para desarrollo local, exporta `BACKEND_URL=http://localhost:3000` antes de arrancar el servidor SSR.

Comandos útiles

- Desarrollo (Angular dev server):

```bash
npm install
npm run start   # ng serve
```

- Compilar bundles (client + server):

```bash
npm run build
```

- Servir la versión SSR compilada (asegúrate de establecer `BACKEND_URL` si el backend está en localhost):

```bash
# desde la raíz del frontend
BACKEND_URL=http://localhost:3000 node dist/iot_arq_computadoras_front/server/server.mjs
```

- Si corres con Docker Compose (recomendado para entorno integrado), utiliza el `docker-compose.yml` en la raíz del workspace:

```bash
docker-compose up --build
```

ReDoc / Documentación de la API
- La especificación OpenAPI y la UI de ReDoc están expuestas por el backend en:
	- `http://<backend-host>:3000/esp/doc.yml` (spec YAML)
	- `http://<backend-host>:3000/esp/docs` (UI ReDoc)

Buenas prácticas para desarrollo y producción
- No guardes secretos en el repositorio. Para el backend usa variables de entorno: `JWT_SECRET`, `MONGO_URI`, etc.
- Para desarrollo local puedes usar un `.env` (NO commitearlo). Para producción usa un gestor de secretos o las variables del orquestador.

Comportamiento al recargar la página
- El guard del front comprueba la validez del JWT con `GET /api/auth/me` al activar rutas protegidas. Si el token es inválido o expirado, el usuario será expulsado a la pantalla de login.

Errores comunes y soluciones
- 404 al cargar la documentación ReDoc: asegúrate de que el backend está corriendo y que `doc.yml` está disponible en `http://localhost:3000/esp/doc.yml`.
- El frontend muestra sesión activa pero al recargar no funciona: revisa `localStorage` y el valor de `BACKEND_URL` si usas SSR.
