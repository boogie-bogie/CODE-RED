import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9||d!@#$]{8,16}$/, {
    // 영어 소문자, 대문자, !@#$ 로만 구성되며, 8~16자 길이 제한
    message:
      '비밀번호는 영어, 숫자, !@#$ 만 포함이 가능하며 8~16자리여야 합니다.',
  })
  @IsNotEmpty({ message: '패스워드를 입력해주세요.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '패스워드 확인을 입력해주세요.' })
  passwordConfirm: string;

  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '별명을 입력해주세요.' })
  nickname: string;

  @IsString()
  @Matches(/^01(0|1|[6-9])-\d{3,4}-\d{4}$/, {
    //010, 011, 016, 017, 018, 019 가능
    message:
      '올바른 전화번호 형식이 아닙니다. 형식에 맞춰 입력해주세요. ex) 010-0000-0000',
  })
  @IsNotEmpty({ message: '핸드폰 번호를 입력해주세요.' })
  phone_number: string;

  @IsString()
  @IsOptional()
  profile_image: string;
}
