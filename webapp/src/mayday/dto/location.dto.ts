import { IsNumber, IsString } from 'class-validator';

export class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  userName: string;
}
