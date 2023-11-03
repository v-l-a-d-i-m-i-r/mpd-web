import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { JSONRPCBaseRequest } from './json-rpc-base.dto';

export class GetExtendedStatusRequestParams {
  @IsInt()
  @Min(0)
  @IsOptional()
  public songpos?: number;
}

export class GetExtendedStatusRequest extends JSONRPCBaseRequest {
  @ValidateNested()
  @Type(() => GetExtendedStatusRequestParams)
  public params: GetExtendedStatusRequestParams;
}
