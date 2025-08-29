import { Module } from '@nestjs/common';
import { AccountsService } from './account.service';
import { AccountsController } from './account.controller';

@Module({
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountModule {}
