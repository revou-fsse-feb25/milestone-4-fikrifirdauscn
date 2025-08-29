import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser, JwtUser } from 'src/common/decorators/current-user.decorator';
import { AccountsService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private service: AccountsService) {}

  @Post()
  @ApiOkResponse({ description: 'Create account' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateAccountDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOkResponse({ description: 'List my accounts' })
  mine(@CurrentUser() user: JwtUser) {
    return this.service.findMine(user.id);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Get one of my accounts' })
  async getOne(@CurrentUser() user: JwtUser, @Param('id', ParseIntPipe) id: number) {
    // ensureOwner will throw if bukan milik user
    await this.service.ensureOwner(id, user.id);
    return this.service.findByIdOrThrow(id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtUser, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAccountDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id, user.id);
  }
}
