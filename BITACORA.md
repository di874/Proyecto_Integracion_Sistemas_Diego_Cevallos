# Bitácora de Práctica - Semana 2 (Extensión): Persistencia en Base de Datos Relacional con PostgreSQL y TypeORM

## 1. Arquitectura de Persistencia

Se sustituyó el almacenamiento volátil en memoria por una **base de datos relacional PostgreSQL 16**, orquestada mediante un contenedor Docker (`pg-productos`) e integrada con **TypeORM** utilizando el patrón **Repository**.

- **Motor de Base de Datos:** PostgreSQL 16 (puerto 5432)
- **ORM:** TypeORM con `@nestjs/typeorm`
- **Configuración:** `@nestjs/config` cargando variables desde `.env`
- **Entidad:** `Producto` mapeada a la tabla `productos` con transformador numérico para `precio`.

---

## 2. El Paso Clave: Análisis de Persistencia Real (Paso 8)

### ¿Por qué los datos sobreviven al reinicio del servidor de Node.js?
En la arquitectura inicial en memoria, los datos residían exclusivamente en el espacio de memoria RAM asignado al proceso de **Node.js**. Por tanto, cualquier reinicio, caída o despliegue destruía el proceso y borraba todo el estado.

Al integrar **PostgreSQL**:
1. El proceso de la aplicación NestJS actúa únicamente como una capa sin estado (*stateless*).
2. Cada operación (`crear`, `reemplazar`, `actualizarPrecio`, `eliminar`) se traduce a sentencias SQL (`INSERT`, `UPDATE`, `DELETE`) ejecutadas sobre el motor de Postgres.
3. El motor de base de datos escribe los registros en un almacenamiento físico no volátil con garantías **ACID** (Write-Ahead Logging / WAL y archivos en disco).
4. Al detener y reiniciar el servidor de Node (`Ctrl+C` y posterior `npm run start:dev`), la aplicación vuelve a iniciar, se reconecta al pool de PostgreSQL y recupera inmediatamente todas las filas existentes intactas.

---

## 3. Reto Implementado: Búsqueda con `ILike` (Paso 9)

Se implementó el filtrado no sensible a mayúsculas utilizando el operador nativo de PostgreSQL `ILike`:
```typescript
findAll(nombre?: string): Promise<Producto[]> {
  if (!nombre) {
    return this.productosRepository.find();
  }
  return this.productosRepository.find({
    where: { nombre: ILike(`%${nombre}%`) },
  });
}
```
Petición: `GET /api/v1/productos?nombre=teclado` $
ightarrow$ filtra coincidencias sin distinguir entre 'Teclado', 'TECLADO' o 'teclado'.

---

## 4. Matriz de Verificación de Endpoints y Tests E2E

- **Test Suite E2E (`npm run test:e2e`):** 4/4 pruebas ejecutadas directamente contra la base de datos PostgreSQL:
  - `GET /` $
ightarrow$ 200 OK
  - `GET /api/v1/productos` $
ightarrow$ 200 OK (arreglo de productos)
  - `POST /api/v1/productos` $
ightarrow$ 201 Created (+ header `Location`)
  - `GET /api/v1/productos/:id` $
ightarrow$ 200 OK con hipermedios HATEOAS (`_links`)
- **Compilación de Producción (`npm run build`):** 0 errores.
- **Unit Tests (`npm test`):** 1/1 aprobado.

---

## 5. Guía de Despliegue en Render y CI en GitHub Actions (Pasos 11 y 12)

### A. Subir a GitHub
1. Crear repositorio en GitHub (ej. `https://github.com/<usuario>/<repo>.git`).
2. Vincular y enviar:
   ```bash
   git remote add origin https://github.com/<usuario>/<repo>.git
   git branch -M main
   git push -u origin main
   ```
3. El archivo `.github/workflows/tests.yml` ya incluido ejecutará automáticamente un contenedor de PostgreSQL y correrá las pruebas en cada `push`.

### B. Despliegue en Render
1. En [Render.com](https://render.com), crear una nueva base de datos **PostgreSQL** gratuita.
2. Copiar la **Internal Database URL**.
3. Crear un **Web Service** conectado al repositorio:
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Environment Variables:**
     - `DATABASE_URL`: Pegar la URL interna copiada de Postgres.
     - `NODE_ENV`: `production`

---

## 6. Declaración de Uso de IA
- **Herramienta(s):** Antigravity / Gemini 3.8
- **Nivel de uso:** Nivel 2–3 (Asistente de desarrollo e integración guiada paso a paso)
- **Qué se le pidió:** Configuración de la persistencia relacional completa: imagen y contenedor Docker de PostgreSQL 16, módulo e integración de TypeORM con variables de entorno, entidad relacional con transformer de precios, Repository con búsquedas insensibles a mayúsculas (`ILike`), suite de pruebas E2E y workflow de CI con GitHub Actions.
- **Qué se modificó/verificó manualmente:** 
  1. Resolución de compatibilidad entre `@nestjs/config`, `@nestjs/typeorm` y Jest para ejecutar tests en entornos CommonJS.
  2. Comprobación directa vía `psql` dentro del contenedor `pg-productos` de la creación de la tabla y la persistencia de los registros.
  3. Verificación de exclusión de `.env` en Git y disponibilidad de `.env.example`.
