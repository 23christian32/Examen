# AguaFix — segundo parcial

Repositorio: https://github.com/23christian32/Examen
Imagen despues del primer push exitoso: https://hub.docker.com/r/<DOCKER_USER>/aguafix

## Configuracion antes de grabar y hacer push

1. Conserva tu `.env` local. Compara con `.env.example` y agrega las variables faltantes. Nunca lo agregues a Git.
2. Completa AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY; AWS_SESSION_TOKEN solo si usas credenciales temporales. Usa un bucket S3 de proposito general en esa region. La identidad AWS necesita `s3:PutObject` sobre `arn:aws:s3:::TU_BUCKET/reports/*`.
3. Para que la URL funcione en el correo, configura una politica de lectura publica SOLO para los objetos de `reports/`. Ajusta el bloqueo de acceso publico del bucket y de la cuenta para permitir esa politica. No se usan ACL. Politica (sustituye TU_BUCKET):

```json
{"Version":"2012-10-17","Statement":[{"Sid":"ReadReportPhotos","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::TU_BUCKET/reports/*"}]}
```

4. Completa SMTP y MAINTENANCE_EMAIL. Ethereal sirve para una bandeja de prueba; para entrega real usa tu proveedor SMTP. Algunos clientes requieren habilitar imagenes externas.
5. En Docker Hub crea el repositorio publico `aguafix`. Agrega tu usuario a DOCKER_USER en `.env`.
6. En GitHub > Settings > Secrets and variables > Actions crea los **Repository secrets** `DOCKER_USER` y `DOCKER_PASSWORD` (token de Docker Hub con permiso de escritura). No pongas AWS ni SMTP en el workflow: solo se necesitan al ejecutar la API.

## Verificacion local antes del push

```powershell
npm ci
npm run build
npm test -- --runInBand
docker compose up -d postgres
npm run migration:run
npm run start:dev
```

Para desarrollo local DB_HOST=localhost. Compose cambia DB_HOST a postgres dentro de los contenedores. No elimines el volumen existente: conserva usuarios y reportes del primer parcial. Si ya existe PostgreSQL, usa los mismos DB_USER, DB_PASSWORD y DB_NAME con que se inicializo.

La API conserva `/api` y los endpoints de registro/login. POST `/api/reports` ahora exige multipart/form-data: address, description, severity (low/medium/high), reporterPhone y photo (File). Foto JPEG/PNG/WebP de hasta 5 MB. Sin foto: 400. GET devuelve photoUrl y repairPhotoUrl; los reportes antiguos tienen photoUrl null y repairPhotoUrl es opcional. synchronize permanece false; una migracion nueva agrega ambas columnas sin borrar filas.

## Postman y video (orden requerido)

Importa `postman/AguaFix.postman_collection.json`. baseUrl es http://localhost:3000/api. En Crear reporte, selecciona tu foto en el campo photo de Body > form-data; deja Content-Type automatico.

1. Inicia la grabacion mostrando un cambio pequeno en el codigo (por ejemplo un texto de la plantilla). Revisa los cambios y ejecuta:

```powershell
git status
git diff --check
git add src package.json package-lock.json Dockerfile .dockerignore compose.yaml .github .gitignore .env.example README.md ENTREGA.md postman bruno
git diff --cached --stat
git commit -m "feat: fotos S3 y publicacion Docker de AguaFix"
git push origin main
```

2. Abre https://github.com/23christian32/Examen/actions y muestra el workflow ejecutandose hasta verde. Si falla el login, revisa los dos Secrets y permisos del token.
3. Abre https://hub.docker.com/r/TU_USUARIO/aguafix/tags y muestra latest con su fecha actualizada.
4. Descarga y arranca la imagen publicada:

```powershell
docker compose pull
docker compose up -d
docker compose logs migrate api
```

Deten primero la API de desarrollo si ocupa el puerto 3000. Compose espera PostgreSQL, ejecuta migraciones y luego inicia la API con node dist/main.

5. Desde Postman envia POST con foto; muestra el 201 con photoUrl. Abre GET y confirma ambas URLs. En AWS > S3 > bucket > reports/ muestra el objeto nuevo y abre su URL publica. Abre el correo recibido y muestra la imagen, direccion, descripcion, severidad y telefono.

El correo sigue siendo asincrono: si SMTP falla, el reporte queda guardado y el error aparece en logs. Un error de S3 impide guardar el reporte. Si la base falla despues de subir, puede quedar un objeto sin reporte; no hay transaccion distribuida.

## Entregables

- Repositorio: https://github.com/23christian32/Examen
- Imagen: https://hub.docker.com/r/TU_USUARIO/aguafix (se crea al terminar el workflow).
- Video: adjunta la grabacion anterior. El push, el workflow remoto y la evidencia de Docker Hub se realizan durante esa grabacion.

Referencias: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html y https://docs.docker.com/build/ci/github-actions/test-before-push/

## Verificaciones realizadas antes de entregar

- Compilacion NestJS correcta.
- Jest: 3 suites y 5 pruebas correctas (multipart, foto obligatoria, DTO invalido, carga S3 simulada, rechazo de archivo falso y contenido del correo).
- Docker: construccion local con Node 22; TypeORM carga correctamente; imagen inspeccionada sin .env, compose.yaml ni .git.
- PostgreSQL 16 temporal: migraciones iniciales, reversion de la nueva migracion, insercion de un reporte anterior y nueva migracion. El reporte se conserva y ambas URLs quedan null. Base temporal retirada al terminar.
- Compose validado; Git confirma que .env esta ignorado. Sin commit ni push.
- Pendiente de configuracion del propietario: AWS, DOCKER_USER y Secrets de GitHub. No se ha realizado carga S3 real, publicacion remota ni grabacion del video.
- npm informa vulnerabilidades en el arbol de dependencias existente; no se aplicaron actualizaciones mayores automaticas. Revisa npm audit antes de un despliegue de produccion.
