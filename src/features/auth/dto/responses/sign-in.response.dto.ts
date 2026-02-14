import { ApiProperty } from "@nestjs/swagger";

export class SignInResponseDto {
	@ApiProperty({
		example:
			"eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6Ikphd"
	})
	accessToken: string;
}
