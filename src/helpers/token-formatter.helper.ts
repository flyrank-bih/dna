/**
 *
 * Design Token Formatter
 *
 * Formats Token Strings
 *
 * Flyrank©, 2026
 * Created by: @admirsaheta on 7/5/2026
 *
 */

// ========== Protocols ==========
export interface Token {
  $value: string;
  $type: TokenType;
}

export type TokenType =
  | 'color'
  | 'fontFamily'
  | 'dimension'
  | 'shadow';



export type TokenCategory = Record<string, Token | Record<string, Token>>;

export interface TokenFormatter {
  format(): TokenCategory;
}

export interface DesignSystem {
  colors: {
    primary?: { hex: string };
    secondary?: { hex: string };
    accent?: { hex: string };
    neutrals: Array<{ hex: string }>;
    backgrounds: string[];
    text: string[];
  };
  typography: {
    families: Array<{ name: string; usage: string }>;
    scale: Array<{ size: number }>;
  };
  spacing: {
    tokens: Record<string, string>;
  };
  borders: {
    radii: Array<{ label: string; value: number }>;
  };
  shadows: {
    values: Array<{ label: string; raw: string }>;
  };
  breakpoints: Array<{ label: string; value: number }>;
}

// ========== Token Formatters ==========
class ColorFormatter implements TokenFormatter {
  constructor(private design: DesignSystem) {}

  format(): TokenCategory {
    const tokens: TokenCategory = { color: {} };

    if (this.design.colors.primary) {
      (tokens.color as Record<string, Token>).primary = this.createToken(this.design.colors.primary.hex, 'color');
    }
    if (this.design.colors.secondary) {
      (tokens.color as Record<string, Token>).secondary = this.createToken(this.design.colors.secondary.hex, 'color');
    }
    if (this.design.colors.accent) {
      (tokens.color as Record<string, Token>).accent = this.createToken(this.design.colors.accent.hex, 'color');
    }

    this.design.colors.neutrals
      .slice(0, 10)
      .forEach((neutral, i) => {
        (tokens.color as Record<string, Token>)[`neutral-${i}`] = this.createToken(neutral.hex, 'color');
      });

    this.design.colors.backgrounds
      .forEach((bg, i) => {
        (tokens.color as Record<string, Token>)[`background-${i}`] = this.createToken(bg, 'color');
      });

    this.design.colors.text
      .slice(0, 5)
      .forEach((text, i) => {
        (tokens.color as Record<string, Token>)[`text-${i}`] = this.createToken(text, 'color');
      });

    return tokens;
  }

  private createToken(value: string, type: TokenType): Token {
    return { $value: value, $type: type };
  }
}

class TypographyFormatter implements TokenFormatter {
  constructor(private design: DesignSystem) {}

  format(): TokenCategory {
    const tokens: TokenCategory = { fontFamily: {}, fontSize: {} };

    // Font Families
    this.design.typography.families.forEach((family) => {
      const key = this.getFontFamilyKey(family);
      tokens.fontFamily[key] = this.createToken(family.name, 'fontFamily');
    });

    // Font Sizes
    this.design.typography.scale
      .slice(0, 15)
      .forEach((size) => {
        tokens.fontSize[`${size.size}`] = this.createToken(`${size.size}px`, 'dimension');
      });

    return tokens;
  }

  private getFontFamilyKey(family: { name: string; usage: string }): string {
    if (family.usage === 'headings') return 'heading';
    if (family.usage === 'body') return 'body';
    return family.name.toLowerCase().replace(/\s+/g, '-');
  }

  private createToken(value: string, type: TokenType): Token {
    return { $value: value, $type: type };
  }
}

class SpacingFormatter implements TokenFormatter {
  constructor(private design: DesignSystem) {}

  format(): TokenCategory {
    const tokens: TokenCategory = { spacing: {} };

    Object.entries(this.design.spacing.tokens).forEach(([name, value]) => {
      tokens.spacing[name] = this.createToken(value, 'dimension');
    });

    return tokens;
  }

  private createToken(value: string, type: TokenType): Token {
    return { $value: value, $type: type };
  }
}

class BorderRadiusFormatter implements TokenFormatter {
  constructor(private design: DesignSystem) {}

  format(): TokenCategory {
    const tokens: TokenCategory = { borderRadius: {} };

    this.design.borders.radii.forEach((radius) => {
      tokens.borderRadius[radius.label] = this.createToken(`${radius.value}px`, 'dimension');
    });

    return tokens;
  }

  private createToken(value: string, type: TokenType): Token {
    return { $value: value, $type: type };
  }
}

class ShadowFormatter implements TokenFormatter {
  constructor(private design: DesignSystem) {}

  format(): TokenCategory {
    const tokens: TokenCategory = { shadow: {} };

    this.design.shadows.values.forEach((shadow) => {
      tokens.shadow[shadow.label] = this.createToken(shadow.raw, 'shadow');
    });

    return tokens;
  }

  private createToken(value: string, type: TokenType): Token {
    return { $value: value, $type: type };
  }
}

class BreakpointFormatter implements TokenFormatter {
  constructor(private design: DesignSystem) {}

  format(): TokenCategory {
    const tokens: TokenCategory = { breakpoint: {} };

    this.design.breakpoints.forEach((breakpoint) => {
      tokens.breakpoint[breakpoint.label] = this.createToken(`${breakpoint.value}px`, 'dimension');
    });

    return tokens;
  }

  private createToken(value: string, type: TokenType): Token {
    return { $value: value, $type: type };
  }
}

class CompositeFormatter implements TokenFormatter {
  private formatters: TokenFormatter[];

  constructor(design: DesignSystem) {
    this.formatters = [
      new ColorFormatter(design),
      new TypographyFormatter(design),
      new SpacingFormatter(design),
      new BorderRadiusFormatter(design),
      new ShadowFormatter(design),
      new BreakpointFormatter(design),
    ];
  }

  format(): TokenCategory {
    return this.formatters.reduce((acc, formatter) => {
      const formattedTokens = formatter.format();
      return this.mergeTokens(acc, formattedTokens);
    }, {});
  }

  private mergeTokens(a: TokenCategory, b: TokenCategory): TokenCategory {
    const result: TokenCategory = { ...a };
    for (const [key, value] of Object.entries(b)) {
      if (result[key] && typeof result[key] === 'object' && typeof value === 'object') {
        result[key] = { ...result[key] as Record<string, Token>, ...value as Record<string, Token> };
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}

export function formatTokens(design: DesignSystem): string {
  const formatter = new CompositeFormatter(design);
  const tokens = formatter.format();
  return JSON.stringify(tokens, null, 2);
}



