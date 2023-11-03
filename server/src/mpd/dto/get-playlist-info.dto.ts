import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator';
import { JSONRPCBaseRequest } from './json-rpc-base.dto';

export class GetPlaylistInfoRequestParams {
  @IsInt()
  @Min(0)
  @IsOptional()
  public songpos?: number;
}

export class GetPlaylistInfoRequest extends JSONRPCBaseRequest {
  @ValidateNested()
  @Type(() => GetPlaylistInfoRequestParams)
  public params: GetPlaylistInfoRequestParams;
}
