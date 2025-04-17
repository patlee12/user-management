import { SanitizeInputPipe } from './sanitize.pipe';

describe('SanitizeInputPipe', () => {
  let pipe: SanitizeInputPipe;

  beforeEach(() => {
    pipe = new SanitizeInputPipe();
  });

  it('should escape basic HTML tags in a flat object', () => {
    const input = { username: '<script>alert("xss")</script>' };
    const result = pipe.transform(input, { type: 'body' });
    expect(result.username).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('should trim and escape strings', () => {
    const input = { email: ' <b>user@example.com</b> ' };
    const result = pipe.transform(input, { type: 'body' });
    expect(result.email).toBe('&lt;b&gt;user@example.com&lt;/b&gt;');
  });

  it('should handle deeply nested objects', () => {
    const input = {
      profile: {
        bio: '<img src=x onerror=alert(1)>',
        nested: {
          comment: 'Hello <script>bad()</script>',
        },
      },
    };
    const result = pipe.transform(input, { type: 'body' });
    expect(result.profile.bio).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(result.profile.nested.comment).toBe(
      'Hello &lt;script&gt;bad()&lt;/script&gt;',
    );
  });

  it('should sanitize arrays of strings', () => {
    const input = { tags: ['<b>tag1</b>', '<script>x</script>'] };
    const result = pipe.transform(input, { type: 'body' });
    expect(result.tags).toEqual([
      '&lt;b&gt;tag1&lt;/b&gt;',
      '&lt;script&gt;x&lt;/script&gt;',
    ]);
  });

  it('should sanitize arrays of objects', () => {
    const input = {
      comments: [{ text: '<img>' }, { text: '<iframe>' }],
    };
    const result = pipe.transform(input, { type: 'body' });
    expect(result.comments[0].text).toBe('&lt;img&gt;');
    expect(result.comments[1].text).toBe('&lt;iframe&gt;');
  });

  it('should return numbers and booleans unchanged', () => {
    const input = { age: 25, isAdmin: true };
    const result = pipe.transform(input, { type: 'body' });
    expect(result.age).toBe(25);
    expect(result.isAdmin).toBe(true);
  });

  it('should handle null and undefined safely', () => {
    const input = {
      nullable: null,
      optional: undefined,
    };
    const result = pipe.transform(input, { type: 'body' });
    expect(result).toEqual({
      nullable: null,
      optional: undefined,
    });
  });
});
