import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

export async function validate<T extends object>(data: unknown, RequestDtoClass: { new(): T }): Promise<T> {
  const instance = plainToInstance(RequestDtoClass, data);
  await validateOrReject(instance, { whitelist: true, forbidNonWhitelisted: true });

  return instanceToPlain<T>(instance) as T;
}
