import request from 'supertest';
import app from '../../src/app';
import { pool } from '../../src/database/pool';
import { runMigrations } from '../../src/database/migrate';


const  validUser = { name: 'Samuel Ramos', email: 'samuel@email.com', password: 'senha-forte-123' };

describe('Users (e2e)', () => {
    beforeAll(async () => {
        await runMigrations();
    });

    beforeEach(async () => {
        await pool.query('TRUNCATE users CASCADE');
    });

    afterAll(async () => {
        await pool.end();
    });

    it('POST /users cadastra e não expõe a senha', async () => {
        const res = await request(app).post('/users').send(validUser);

        expect(res.status).toBe(201);
        expect(res.body.user.email).toBe(validUser.email);
        expect(res.body.user).not.toHaveProperty('passwordHash');
        expect(res.body.user).not.toHaveProperty('password');
    });

    it('POST /users retorna 400 para e-mail duplicado', async () => {
        await request(app).post('/users').send(validUser);
        const res = await request(app).post('/users').send(validUser);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/já existe/i);
    });

    it('POST /users retorna 400 para dados inválidos', async () => {
        const res = await request(app).post('/users').send({ name: 'A', email: 'ruim', password: '123' });

        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('GET /users/me retorna 401 sem token', async () => {
        const res = await request(app).get('/users/me');
        expect(res.status).toBe(401);
    });

    it('GET /users/me retorna o perfil com token válido', async () => {
        await request(app).post('/users').send(validUser);
        const login = await request(app)
         .post('/auth/login')
         .send({ email: validUser.email, password: validUser.password });

         const res = await request(app)
          .get('/users/me')
          .set('Authorization', `Bearer ${login.body.accessToken}`);

          expect(res.status).toBe(200);
          expect(res.body.user.email).toBe(validUser.email);
    });
});