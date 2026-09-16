# Contrato CRUD de /productos

| Operación | Verbo | URI | Éxito |
| :--- | :--- | :--- | :--- |
| Listar | GET | `/api/v1/productos` | 200 OK |
| Obtener uno | GET | `/api/v1/productos/{id}` | 200 OK / 404 Not Found |
| Crear | POST | `/api/v1/productos` | 201 Created + Location |
| Reemplazar | PUT | `/api/v1/productos/{id}` | 204 No Content |
| Actualizar parcial | PATCH | `/api/v1/productos/{id}` | 200 OK |
| Eliminar | DELETE | `/api/v1/productos/{id}` | 204 No Content / 404 Not Found |
