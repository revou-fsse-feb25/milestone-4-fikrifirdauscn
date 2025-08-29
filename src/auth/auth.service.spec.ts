import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  const jwtMock = {
    sign: jest.fn(() => 'token'),
  } as unknown as JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
  });

  it('hashes password on register', async () => {
    (prismaMock.user.create as any).mockResolvedValue({ id: 1, email: 'a@a.com', password: 'hashed' });
    await service.register({ name: 'A', email: 'a@a.com', password: 'pass123' } as any);
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  it('fails login with wrong password', async () => {
    (bcrypt.compare as any).mockResolvedValue(false);
    (prismaMock.user.findUnique as any).mockResolvedValue({ id: 1, email: 'a@a.com', password: 'hashed' });
    await expect(service.login({ email: 'a@a.com', password: 'bad' } as any)).rejects.toBeTruthy();
  });
});
