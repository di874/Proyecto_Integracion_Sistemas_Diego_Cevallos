import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarPrecioDto } from './dto/actualizar-precio.dto';

@Controller('api/v1/productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  listar(@Query('nombre') nombre?: string) {
    return this.productosService.findAll(nombre);
  }

  @Get(':id')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.findOne(id);
    return {
      ...producto,
      _links: {
        self: { href: `/api/v1/productos/${producto.id}` },
        actualizar: { href: `/api/v1/productos/${producto.id}`, method: 'PUT' },
        eliminar: { href: `/api/v1/productos/${producto.id}`, method: 'DELETE' },
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearProductoDto, @Res({ passthrough: true }) res: Response) {
    const nuevo = await this.productosService.crear(dto);
    res.setHeader('Location', `/api/v1/productos/${nuevo.id}`);
    return nuevo;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reemplazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearProductoDto,
  ) {
    await this.productosService.reemplazar(id, dto);
  }

  @Patch(':id')
  async actualizarPrecio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPrecioDto,
  ) {
    return this.productosService.actualizarPrecio(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.productosService.eliminar(id);
  }
}
