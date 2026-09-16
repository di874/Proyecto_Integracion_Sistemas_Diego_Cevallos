# Bitácora de Práctica - Semana 2: CRUD Completo REST en NestJS

## 1. Contrato de la API de Productos (`/api/v1/productos`)

| Operación | Verbo HTTP | URI | Código de Éxito | Códigos de Error |
| :--- | :--- | :--- | :--- | :--- |
| Listar todos | GET | `/api/v1/productos` | 200 OK | 500 Internal Server Error |
| Obtener detalle | GET | `/api/v1/productos/{id}` | 200 OK (con `_links` HATEOAS) | 400 Bad Request, 404 Not Found |
| Crear producto | POST | `/api/v1/productos` | 201 Created (+ header `Location`) | 400 Bad Request |
| Reemplazar completo | PUT | `/api/v1/productos/{id}` | 204 No Content | 400 Bad Request, 404 Not Found |
| Actualizar parcial | PATCH | `/api/v1/productos/{id}` | 200 OK | 400 Bad Request, 404 Not Found |
| Eliminar producto | DELETE | `/api/v1/productos/{id}` | 204 No Content | 404 Not Found |

---

## 2. Justificación Técnica de Códigos de Estado HTTP

### A. ¿Por qué `201 Created` y encabezado `Location` en `POST`?
El método `POST` crea un nuevo recurso subordinado en la colección. La especificación RFC 9110 indica que cuando una solicitud resulta en la creación de un recurso identifiable, el servidor debe responder `201 Created` e incluir el encabezado `Location` indicando la URI canónica del nuevo recurso (`/api/v1/productos/{id}`). Esto permite al cliente acceder inmediatamente al recurso creado sin necesidad de adivinar su URI.

### B. ¿Por qué `204 No Content` en `PUT` y `DELETE`?
- **PUT:** Al reemplazar completamente la representación del recurso, si la acción se completa satisfactoriamente y el cliente ya posee el estado que acaba de enviar, no es necesario enviar el cuerpo de vuelta, ahorrando ancho de banda.
- **DELETE:** Al eliminar exitosamente un recurso, el recurso ya no existe. Devolver un cuerpo sería contradictorio o redundante; `204 No Content` confirma la eliminación sin contenido adicional.

### C. ¿Por qué el segundo `DELETE` sobre el mismo ID responde `404 Not Found` en lugar de `500`?
El verbo `DELETE` es idempotente a nivel de estado final del servidor (el recurso queda eliminado tanto tras una como tras múltiples llamadas). Sin embargo, a nivel de código de respuesta HTTP, cuando el recurso ya no existe en el sistema, la excepción `NotFoundException` de NestJS genera un `404 Not Found`, informando al cliente de manera precisa que el recurso solicitado no fue encontrado, evitando en todo momento generar un error no controlado de servidor `500`.

### D. ¿Por qué `400 Bad Request` en validaciones de DTO?
Gracias al `ValidationPipe` global con `whitelist: true` y `forbidNonWhitelisted: true`, cualquier carga útil que no cumpla con los decoradores de `class-validator` (como `nombre` vacío o `precio` negativo) es interceptada antes de llegar al controlador, devolviendo un `400 Bad Request` estructurado con la lista exacta de restricciones incumplidas.

---

## 3. Resultados de la Matriz de Pruebas Sistemáticas (Paso 7 y 8)

| # | Prueba | Verbo | Endpoint | Esperado | Obtenido | Resultado |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: |
| 1 | POST con nombre vacío | POST | `/api/v1/productos` | 400 | 400 | ✅ PASS |
| 2 | POST válido (+ header Location) | POST | `/api/v1/productos` | 201 | 201 | ✅ PASS |
| 3 | GET con id inexistente | GET | `/api/v1/productos/999` | 404 | 404 | ✅ PASS |
| 4 | PUT con precio negativo | PUT | `/api/v1/productos/1` | 400 | 400 | ✅ PASS |
| 5 | PUT válido (reemplazo completo) | PUT | `/api/v1/productos/1` | 204 | 204 | ✅ PASS |
| 6 | PATCH de precio válido | PATCH | `/api/v1/productos/1` | 200 | 200 | ✅ PASS |
| 7 | DELETE existente | DELETE | `/api/v1/productos/2` | 204 | 204 | ✅ PASS |
| 8 | DELETE repetido | DELETE | `/api/v1/productos/2` | 404 | 404 | ✅ PASS |
| 9 | GET con HATEOAS (`_links`) | GET | `/api/v1/productos/1` | 200 | 200 | ✅ PASS |
| 10 | Swagger UI interactivo | GET | `/swagger/` | 200 | 200 | ✅ PASS |

---

## 4. Reto HATEOAS Implementado (Paso 8)
El endpoint `GET /api/v1/productos/:id` incluye enlaces de hipermedios para guiar al cliente sobre las acciones disponibles sobre el recurso:
```json
{
  "id": 1,
  "nombre": "Teclado mecánico RGB",
  "precio": 60,
  "_links": {
    "self": { "href": "/api/v1/productos/1" },
    "actualizar": { "href": "/api/v1/productos/1", "method": "PUT" },
    "eliminar": { "href": "/api/v1/productos/1", "method": "DELETE" }
  }
}
```

---

## 5. Declaración de Uso de IA
- **Herramienta(s):** Antigravity / Gemini 3.8
- **Nivel de uso:** Nivel 2–3 (Asistente de desarrollo e integración guiada paso a paso)
- **Qué se le pidió:** Generar la arquitectura completa según la guía de la Semana 2: módulo, DTOs de validación con class-validator, controlador REST con ValidationPipe global, Swagger, códigos de estado HTTP precisos, HATEOAS y matriz de pruebas automatizada.
- **Qué se modificó/verificó manualmente:** 
  1. Resolución de compatibilidad de tipos TypeScript con Express (`import type { Response } from 'express'`).
  2. Implementación de fallback resiliente de puertos (`3000 -> 3001`) al detectar exclusión por parte del sistema operativo en el puerto 3000.
  3. Ejecución y validación del 100% de la matriz de pruebas contra el servidor en vivo.
