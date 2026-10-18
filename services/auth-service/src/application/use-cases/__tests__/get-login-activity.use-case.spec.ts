import { GetLoginActivityUseCase } from '../get-login-activity.use-case';
import { ILoginEventRepository } from '../../ports/output/i-login-event.repository';

describe('GetLoginActivityUseCase', () => {
  const now = new Date('2026-10-18T12:00:00.000Z');

  it('devuelve el último ingreso y la cantidad de los últimos 30 días', async () => {
    const repo: jest.Mocked<ILoginEventRepository> = {
      save: jest.fn(),
      summarize: jest.fn().mockResolvedValue({
        lastLoginAt: new Date('2026-10-17T08:00:00.000Z'),
        count: 9,
      }),
    };

    const result = await new GetLoginActivityUseCase(repo).execute('user-1', now);

    expect(result).toEqual({
      lastLoginAt: '2026-10-17T08:00:00.000Z',
      loginCountLast30Days: 9,
    });
    expect(repo.summarize).toHaveBeenCalledWith('user-1', new Date('2026-09-18T12:00:00.000Z'));
  });

  it('devuelve null y cero si el usuario nunca ingresó', async () => {
    const repo: jest.Mocked<ILoginEventRepository> = {
      save: jest.fn(),
      summarize: jest.fn().mockResolvedValue({ lastLoginAt: null, count: 0 }),
    };

    await expect(new GetLoginActivityUseCase(repo).execute('user-2', now)).resolves.toEqual({
      lastLoginAt: null,
      loginCountLast30Days: 0,
    });
  });
});