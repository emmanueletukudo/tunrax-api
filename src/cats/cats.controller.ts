import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './interfaces/cat.interface';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateCatDto } from './dto/update-cat.dto';

@UseGuards(RolesGuard)
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @Roles(['admin'])
  async create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseIntPipe())
    id: number
  ) {
    return this.catsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(['admin'])
  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateCatDto: UpdateCatDto
  ) {
    const updatedCat = await this.catsService.update(id, updateCatDto);
    if (updatedCat.affected === 0)
      throw new HttpException(
        'Cat update did not succeed!',
        HttpStatus.NOT_MODIFIED
      );
    return { message: 'Cat successfully updated', id };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    await this.catsService.remove(id);
    return { message: 'Cat successfully deleted', id };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  favorite(@Param('id', new ParseIntPipe()) id: number, @Req() req: any) {
    const userId = req.user.id;
    return this.catsService.favoriteCat(userId, id);
  }
}
