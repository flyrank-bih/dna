import { describe, expect, it } from '@rstest/core';
import { formatTokens } from '../token-formatter.helper';

describe('formatTokens', () => {
  it('formats design system input into DTCG-like token JSON', () => {
    const output = formatTokens({
      colors: {
        primary: { hex: '#0055ff' },
        secondary: { hex: '#ff5500' },
        accent: { hex: '#22cc88' },
        neutrals: [{ hex: '#f5f5f5' }, { hex: '#1a1a1a' }],
        backgrounds: ['#ffffff'],
        text: ['#111111'],
      },
      typography: {
        families: [
          { name: 'Inter', usage: 'body' },
          { name: 'Merriweather', usage: 'headings' },
        ],
        scale: [{ size: 14 }, { size: 16 }],
      },
      spacing: {
        tokens: {
          sm: '8px',
          md: '16px',
        },
      },
      borders: {
        radii: [{ label: 'md', value: 6 }],
      },
      shadows: {
        values: [{ label: 'soft', raw: '0 2px 8px rgba(0, 0, 0, 0.2)' }],
      },
      breakpoints: [{ label: 'lg', value: 1024 }],
    });

    const parsed = JSON.parse(output) as Record<string, Record<string, { $type: string; $value: string }>>;

    expect(parsed.color.primary).toEqual({ $value: '#0055ff', $type: 'color' });
    expect(parsed.color['neutral-0']).toEqual({ $value: '#f5f5f5', $type: 'color' });
    expect(parsed.fontFamily.body).toEqual({ $value: 'Inter', $type: 'fontFamily' });
    expect(parsed.fontFamily.heading).toEqual({ $value: 'Merriweather', $type: 'fontFamily' });
    expect(parsed.fontSize['16']).toEqual({ $value: '16px', $type: 'dimension' });
    expect(parsed.spacing.md).toEqual({ $value: '16px', $type: 'dimension' });
    expect(parsed.borderRadius.md).toEqual({ $value: '6px', $type: 'dimension' });
    expect(parsed.shadow.soft).toEqual({ $value: '0 2px 8px rgba(0, 0, 0, 0.2)', $type: 'shadow' });
    expect(parsed.breakpoint.lg).toEqual({ $value: '1024px', $type: 'dimension' });
  });
});
