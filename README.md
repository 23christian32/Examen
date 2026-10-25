# AguaFix

API NestJS + TypeORM + PostgreSQL para reportes de fugas, con fotos en S3 y avisos por correo.

Consulta **[ENTREGA.md](ENTREGA.md)** para configurar AWS, correo, Docker Hub y GitHub Secrets, ejecutar migraciones, probar en Postman y grabar el video.

Requiere Node.js 22 y Docker. Copia `.env.example` a `.env` solo si aun no tienes uno; completa los valores locales. `.env` esta ignorado por Git y excluido de Docker.

```powershell
npm ci
npm run build
npm test -- --runInBand
docker compose up -d postgres
npm run migration:run
npm run start:dev
```

| Metodo | Ruta | Entrada |
| --- | --- | --- |
| POST | /api/auth/register | JSON: name, email, password |
| POST | /api/auth/login | JSON: email, password |
| POST | /api/reports | multipart: address, description, severity, reporterPhone, photo (archivo obligatorio) |
| GET | /api/reports | Lista de reportes, incluyendo photoUrl y repairPhotoUrl |

severity: low, medium o high. Fotos: JPEG, PNG o WebP, maximo 5 MB. La migracion nueva conserva reportes anteriores con URLs null. synchronize: false.

La imagen usa node:22-alpine y node dist/main. Compose ejecuta primero migraciones y usa la imagen publicada `${DOCKER_USER}/aguafix:latest`. El workflow publica en cada push a main usando exclusivamente secrets.DOCKER_USER y secrets.DOCKER_PASSWORD.
