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
 * Recommended usage:
 * app.useGlobalPipes(new SanitizeInputPipe(), new ValidationPipe(...));
 *
 * @example
 * Input:
 * {
 *   "username": "<script>alert('xss')</script> ",
 *   "profile": { "bio": "<b>Hello</b>" }
 * }
 *
 * Output:
 * {
 *   "username": "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;",
 *   "profile": { "bio": "&lt;b&gt;Hello&lt;/b&gt;" }
 * }
 */
@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return this.sanitize(value);
  }

  private sanitize(value: any): any {
    if (typeof value === 'string') {
      return validator.escape(value.trim());
    } else if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    } else if (typeof value === 'object' && value !== null) {
      const sanitizedObject: Record<string, any> = {};
      for (const key in value) {
        sanitizedObject[key] = this.sanitize(value[key]);
      }
      return sanitizedObject;
    }
    return value;
  }
}
