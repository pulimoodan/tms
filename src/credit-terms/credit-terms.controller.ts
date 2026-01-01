import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreditTermsService } from './credit-terms.service';
import { CreateCreditTermDto } from './dto/create-credit-term.dto';
import { UpdateCreditTermDto } from './dto/update-credit-term.dto';
import { ApiResponseDto, ApiListResponseDto } from '../common/dto/api-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Credit Terms')
@ApiBearerAuth('JWT-auth')
@Controller('credit-terms')
export class CreditTermsController {
  constructor(private readonly creditTermsService: CreditTermsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new credit term' })
  @ApiResponse({ status: 201, description: 'Credit term created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Credit term with this name already exists' })
  async create(
    @Body() createCreditTermDto: CreateCreditTermDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const creditTerm = await this.creditTermsService.create(createCreditTermDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: creditTerm,
      message: 'Credit term created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all credit terms with pagination' })
  @ApiResponse({ status: 200, description: 'List of credit terms retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiListResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const result = await this.creditTermsService.findAll(page, limit, currentUser.companyId);
    return {
      success: true,
      results: result.results,
      pagination: result.pagination,
      message: 'Credit terms retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a credit term by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Credit term retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Credit term not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const creditTerm = await this.creditTermsService.findOne(id, currentUser.companyId);
    return {
      success: true,
      result: creditTerm,
      message: 'Credit term retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a credit term' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Credit term updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Credit term not found' })
  @ApiResponse({ status: 409, description: 'Credit term with this name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCreditTermDto: UpdateCreditTermDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const creditTerm = await this.creditTermsService.update(
      id,
      updateCreditTermDto,
      currentUser.id,
      currentUser.companyId,
    );
    return {
      success: true,
      result: creditTerm,
      message: 'Credit term updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a credit term' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Credit term deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Credit term not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.creditTermsService.remove(id, currentUser.companyId);
  }
}
