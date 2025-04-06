import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validator constraint that checks if at least one of the specified fields
 * on an object has a non-empty value.
 *
 * This constraint is used with the `AtLeastOneField` decorator to ensure that
 * at least one of the provided fields (e.g. 'email' or 'username') is defined.
 */
@ValidatorConstraint({ name: 'AtLeastOneField', async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    const fields = args.constraints[0] as string[];
    return fields.some(
      (field) => object[field] !== undefined && object[field] !== '',
    );
  }

  defaultMessage(args: ValidationArguments) {
    const fields = args.constraints[0] as string[];
    return `At least one of the following fields must be provided: ${fields.join(', ')}`;
  }
}

export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (constructor: Function) {
    registerDecorator({
      name: 'AtLeastOneField',
      target: constructor,
      propertyName: 'dummy',
      constraints: [fields],
      options: validationOptions,
      validator: AtLeastOneFieldConstraint,
    });
  };
}
