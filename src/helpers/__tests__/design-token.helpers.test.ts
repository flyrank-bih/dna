import { describe, expect, it } from '@rstest/core';
import { createReferenceResolver, DefaultTokenTree, ReferenceParser } from '../design-token.helpers';

describe('ReferenceParser', () => {
  it('parses reference strings and rejects non-reference values', () => {
    expect(ReferenceParser.parse('{color.primary}')).toBe('color.primary');
    expect(ReferenceParser.parse('color.primary')).toBeNull();
    expect(ReferenceParser.parse(42)).toBeNull();
  });
});

describe('DefaultTokenTree', () => {
  it('retrieves deeply nested token nodes by dotted path', () => {
    const tree = new DefaultTokenTree({
      color: {
        primary: { $value: '#111111' },
      },
    });

    expect(tree.getNode('color.primary')).toEqual({ $value: '#111111' });
    expect(tree.getNode('color.secondary')).toBeUndefined();
  });
});

describe('createReferenceResolver', () => {
  const tokenTree = {
    color: {
      base: { $value: '#000000' },
      primary: { $value: '{color.base}' },
      accent: '{color.primary}',
    },
  };

  it('resolves direct values and nested references', () => {
    expect(createReferenceResolver(tokenTree).resolve('color.base')).toBe('#000000');
    expect(createReferenceResolver(tokenTree).resolve('color.primary')).toBe('#000000');
    expect(createReferenceResolver(tokenTree).resolve('color.accent')).toBe('#000000');
  });

  it('returns undefined for missing paths and reference cycles', () => {
    const resolver = createReferenceResolver({
      spacing: {
        sm: '{spacing.md}',
        md: '{spacing.sm}',
      },
    });

    expect(resolver.resolve('spacing.xl')).toBeUndefined();
    expect(resolver.resolve('spacing.sm')).toBeUndefined();
  });
});
