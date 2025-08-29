import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtUser = { id: number; email: string; role?: string };

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);