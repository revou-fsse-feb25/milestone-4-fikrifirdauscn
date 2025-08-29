import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Post()
  create(@CurrentUser() u: { sub: number }, @Body() dto: CreateAccountDto) {
    return this.service.create(u.sub, dto);
  }

  @Get()
  listMine(@CurrentUser() u: { sub: number }) {
    return this.service.findAllMine(u.sub);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: { sub: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.service.updateMine(u.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() u: { sub: number }, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeMine(u.sub, id);
  }
}