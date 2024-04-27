import { IsOptional } from 'class-validator';

export class FindPostQueryDto {
  @IsOptional()
  page: number = 1;

  @IsOptional()
  pageSize: number = 10;

  @IsOptional()
  search: string;
}
