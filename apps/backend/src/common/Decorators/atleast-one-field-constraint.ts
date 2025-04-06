// validators/at-least-one-field.decorator.ts
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneField', async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    const [fields] = args.constraints as [string[]];
    return fields.some(
      (field) => object[field] !== undefined && object[field] !== '',
    );
  }

  defaultMessage(args: ValidationArguments) {
    const [fields] = args.constraints as [string[]];
    return `At least one of the following fields must be provided: ${fields.join(', ')}`;
  }
}

export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'AtLeastOneField',
      target: object.constructor,
      propertyName,
      constraints: [fields],
      options: validationOptions,
      validator: AtLeastOneFieldConstraint,
    });
  };
}
