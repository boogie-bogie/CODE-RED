import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RescueCompleteDto {
  @IsNumber()
  @IsNotEmpty({ message: '점수를 입력해주세요.' })
  score: number;

  @IsString()
  @IsNotEmpty({ message: '점수에 대한 이유를 적어주세요.' })
  reason: string;
}
