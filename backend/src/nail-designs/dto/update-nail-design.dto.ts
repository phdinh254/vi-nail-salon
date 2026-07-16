import { PartialType } from '@nestjs/mapped-types';
import { CreateNailDesignDto } from './create-nail-design.dto';

export class UpdateNailDesignDto extends PartialType(CreateNailDesignDto) {}
