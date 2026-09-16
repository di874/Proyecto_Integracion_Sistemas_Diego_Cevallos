import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API de Productos (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/v1/productos (GET) - listar productos', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/productos')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/api/v1/productos (POST) - crear producto con Location', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/productos')
      .send({ nombre: 'Mouse Gamer', precio: 35.5 })
      .expect(201);
    expect(res.header.location).toContain('/api/v1/productos/');
    expect(res.body.nombre).toBe('Mouse Gamer');
  });

  it('/api/v1/productos/:id (GET) - con HATEOAS _links', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/productos')
      .send({ nombre: 'Laptop Stand', precio: 22.0 })
      .expect(201);

    const id = createRes.body.id;
    const res = await request(app.getHttpServer())
      .get(`/api/v1/productos/${id}`)
      .expect(200);

    expect(res.body._links).toBeDefined();
    expect(res.body._links.self.href).toBe(`/api/v1/productos/${id}`);
  });
});

