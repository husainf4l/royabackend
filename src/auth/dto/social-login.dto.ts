import { IsString, IsIn } from 'class-validator';

export class SocialLoginDto {
  @IsString()
  token: string;

  @IsString()
  @IsIn(['google', 'apple'])
  provider: string;
}
