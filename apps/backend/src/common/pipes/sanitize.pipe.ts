import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import * as validator from 'validator';

/**
 * SanitizeInputPipe
 *
 * A global NestJS pipe that recursively sanitizes all incoming string values
 * in request payloads using `validator.escape()` to prevent injection attacks.
 *
 * This pipe runs **before ValidationPipe** and ensures:
 * - All string values are trimmed and HTML-escaped
 * - XSS vectors like <script> tags are neutralized
 * - Special characters like ', ", <, >, &, etc. are escaped
 * - Arrays and deeply nested objects are sanitized recursively
 *
 * URL & Avatar Exceptions:
 * Certain fields like `avatarUrl` and `website` are excluded from HTML escaping
 * to preserve their valid URL format. These fields are still trimmed and validated
 * with @IsUrl() in the DTO layer to ensure security.
 */
@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return this.sanitize(value);
  }

  private sanitize(value: any, parentKey?: string): any {
    const skipEscapeFields = ['avatarUrl', 'website'];

    if (typeof value === 'string') {
      if (parentKey && skipEscapeFields.includes(parentKey)) {
        return value.trim();
      }
      return validator.escape(value.trim());
    } else if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    } else if (typeof value === 'object' && value !== null) {
      const sanitizedObject: Record<string, any> = {};
      for (const key in value) {
        sanitizedObject[key] = this.sanitize(value[key], key);
      }
      return sanitizedObject;
    }
    return value;
  }
}
