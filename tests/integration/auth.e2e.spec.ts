import request from 'supertest';
import app from '../../src/app';
import { pool } from '../../src/database/pool';
import { runMigrations } from '../../src/database/migrate';

const credentials = { email: 'samuel@email.com', password: 'senha-forte-123' };

describe('Auth (e2e)', () => {
  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE users CASCADE');
    await request(app).post('/users').send({ name: 'Samuel Ramos', ...credentials });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('POST /auth/login retorna accessToken e define cookie httpOnly', async () => {
    const res = await request(app).post('/auth/login').send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).not.toHaveProperty('passwordHash');

    const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
    expect(cookies.some((c) => c.startsWith('refreshToken=') && c.includes('HttpOnly'))).toBe(true);
  });

  it('POST /auth/login retorna 401 com senha errada', async () => {
    const res = await request(app).post('/auth/login').send({ ...credentials, password: 'errada-123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('E-mail ou senha inválidos');
  });

  it('POST /auth/login retorna 401 com e-mail inexistente (mesma mensagem)', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'nao@existe.com', password: 'qualquer' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('E-mail ou senha inválidos');
  });

  it('POST /auth/refresh gera novo accessToken e rotaciona o cookie', async () => {
    const agent = request.agent(app);
    await agent.post('/auth/login').send(credentials);

    const res = await agent.post('/auth/refresh');

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it('POST /auth/refresh retorna 401 sem cookie', async () => {
    const res = await request(app).post('/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('POST /auth/logout revoga a sessão: refresh depois do logout falha', async () => {
    const agent = request.agent(app);
    const login = await agent.post('/auth/login').send(credentials);
    const oldCookie = ([] as string[]).concat(login.headers['set-cookie'] ?? []);

    const logout = await agent.post('/auth/logout');
    expect(logout.status).toBe(204);

    // reenvia manualmente o cookie antigo (já revogado)
    const res = await request(app).post('/auth/refresh').set('Cookie', oldCookie);
    expect(res.status).toBe(401);
  });
});