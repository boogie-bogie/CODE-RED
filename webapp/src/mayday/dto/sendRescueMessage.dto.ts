import { IsNotEmpty, IsString } from 'class-validator';

export class SendRescueMessageDto {
  @IsString()
  @IsNotEmpty({ message: '어떠한 도움이 필요한지 적어주세요!' })
  context: string;
}
