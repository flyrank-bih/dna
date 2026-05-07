/**
 * @file storybook formatter
 * @description Generated/formatting utilities used by FlyRank Visual DNA.
 */

interface ComponentAnatomy {
  kind: string;
  props: {
    variant: string[];
    size: string[];
  };
  slots?: {
    icon?: boolean;
    badge?: boolean;
  };
  totalInstances?: number;
}

interface Color {
  hex: string;
}

interface BorderRadius {
  label: string;
  value: number;
}

interface Shadow {
  label: string;
  raw: string;
}

interface FontFamily {
  name: string;
}

interface DesignSystem {
  meta?: {
    url?: string;
    title?: string;
  };
  colors?: {
    primary?: Color;
    secondary?: Color;
    accent?: Color;
    backgrounds?: string[];
    text?: string[];
  };
  typography?: {
    families?: FontFamily[];
  };
  borders?: {
    radii?: BorderRadius[];
  };
  shadows?: {
    values?: Shadow[];
  };
  componentAnatomy?: ComponentAnatomy[];
}

class StorybookGenerator {
  private design: DesignSystem;
  private headerVersion: string = "7.0.0";

  constructor(design: DesignSystem) {
    this.design = design;
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private getHtmlTag(kind: string): string {
    const tagMap: Record<string, string> = {
      input: "input",
      link: "a",
      card: "div",
    };
    return tagMap[kind] || "button";
  }

  private generateStory(anatomy: ComponentAnatomy): string {
    const Name = this.capitalize(anatomy.kind);
    const variants = anatomy.props.variant.length
      ? anatomy.props.variant
      : ["default"];
    const sizes = anatomy.props.size.length ? anatomy.props.size : ["md"];
    const tag = this.getHtmlTag(anatomy.kind);
    const hasIcon = !!anatomy.slots?.icon;
    const hasBadge = !!anatomy.slots?.badge;

    const sampleLabel =
      anatomy.kind === "card"
        ? "Card content"
        : anatomy.kind === "input"
          ? ""
          : anatomy.kind === "link"
            ? "Read more"
            : "Button";

    const renderFunction = this.generateRenderFunction(
      tag,
      sampleLabel,
      hasIcon,
      hasBadge,
      variants[0],
      sizes[0],
    );

    const storyContent = [
      `import * as React from 'react';`,
      `import type { Meta, StoryObj } from '@storybook/react';`,
      ``,
      `// Extracted from a live site by \`FlyRank Visual DNA\`. No runtime library —`,
      `// these stories render inline to stay dependency-free.`,
      `const ${Name}: React.FC<{ variant?: string; size?: string }> = ${renderFunction};`,
      ``,
      `const meta: Meta<typeof ${Name}> = {`,
      `  title: 'Extracted/${Name}',`,
      `  component: ${Name},`,
      `  tags: ['autodocs'],`,
      `  argTypes: {`,
      `    variant: { control: 'select', options: [${variants.map((v) => `'${v}'`).join(", ")}] },`,
      `    size:    { control: 'select', options: [${sizes.map((s) => `'${s}'`).join(", ")}] },`,
      `  },`,
      `  parameters: {`,
      `    docs: {`,
      `      description: {`,
      `        component: '${anatomy.kind} — ${anatomy.totalInstances || 0} instances detected across the page.',`,
      `      },`,
      `    },`,
      `  },`,
      `};`,
      `export default meta;`,
      ``,
      `type Story = StoryObj<typeof ${Name}>;`,
      ``,
      ...variants.map(
        (v) =>
          `export const ${this.capitalize(v)}: Story = { args: { variant: '${v}', size: '${sizes[0]}' } };`,
      ),
      ``,
      `export const Sizes: Story = {`,
      `  render: () => React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } },`,
      `    [${sizes.map((s) => `React.createElement(${Name}, { key: '${s}', variant: '${variants[0]}', size: '${s}' })`).join(", ")}]`,
      `  ),`,
      `};`,
    ];

    return storyContent.join("\n");
  }

  private generateRenderFunction(
    tag: string,
    label: string,
    hasIcon: boolean,
    hasBadge: boolean,
    defaultVariant: string,
    defaultSize: string,
  ): string {
    const styleProperties = [
      `fontFamily: 'var(--font-sans, inherit)'`,
      `padding: args.size === 'sm' ? '6px 12px' : args.size === 'lg' ? '14px 22px' : '10px 16px'`,
      `borderRadius: 'var(--radius, 8px)'`,
      `background: args.variant === 'secondary' ? 'transparent' : args.variant === 'outline' ? 'transparent' : 'var(--color-primary, #3b82f6)'`,
      `color: args.variant === 'secondary' || args.variant === 'outline' ? 'var(--color-foreground, #111)' : '#fff'`,
      `border: args.variant === 'outline' ? '1px solid var(--color-foreground, #111)' : 'none'`,
      `fontWeight: 500`,
      `cursor: 'pointer'`,
    ];

    const children = [`'${label}'`];

    if (hasIcon) {
      children.push(
        `React.createElement('span', { style: { marginLeft: 8 } }, '→')`,
      );
    }

    if (hasBadge) {
      children.push(
        `React.createElement('span', { style: { marginLeft: 6, padding: '2px 6px', background: '#f59e0b', borderRadius: 99, color: '#fff', fontSize: 11 } }, '3')`,
      );
    }

    return `(args) => {
    const style = {
      ${styleProperties.join(",\n      ")}
    };
    return React.createElement('${tag}', { 
      style, 
      'data-variant': args.variant || '${defaultVariant}', 
      'data-size': args.size || '${defaultSize}' 
    },
      ${children.join(",\n      ")}
    );
  }`;
  }

  private generateTokensCss(): string {
    const colors = this.design.colors || {};
    const primary = colors.primary?.hex || "#3b82f6";
    const secondary = colors.secondary?.hex || "#8b5cf6";
    const accent = colors.accent?.hex || "#f59e0b";
    const bg = colors.backgrounds?.[0] || "#ffffff";
    const fg = colors.text?.[0] || "#171717";

    const radii = this.design.borders?.radii || [];
    const radius = radii.find((r) => r.label === "md")?.value ?? 8;

    const shadow =
      this.design.shadows?.values?.find((s) => s.label === "md")?.raw ||
      "0 4px 6px rgba(0,0,0,0.1)";

    const font = this.design.typography?.families?.[0]?.name || "Inter";

    return `:root {
  --color-primary: ${primary};
  --color-secondary: ${secondary};
  --color-accent: ${accent};
  --color-background: ${bg};
  --color-foreground: ${fg};
  --radius: ${radius}px;
  --shadow: ${shadow};
  --font-sans: '${font}', system-ui, sans-serif;
}
body { background: var(--color-background); color: var(--color-foreground); font-family: var(--font-sans); }
`;
  }

  private generateTokensMdx(): string {
    const colors = this.design.colors || {};
    return `import { Meta, ColorPalette, ColorItem, Typeset } from '@storybook/blocks';

<Meta title="Extracted/Tokens" />

# Design tokens

Extracted from ${this.design.meta?.url || "the target site"} by [FlyRank Visual DNA](https://github.com/flyrank-bih/visualdna).

<ColorPalette>
  <ColorItem title="primary"    colors={{ primary: '${colors.primary?.hex || "#3b82f6"}' }} />
  <ColorItem title="secondary"  colors={{ secondary: '${colors.secondary?.hex || "#8b5cf6"}' }} />
  <ColorItem title="accent"     colors={{ accent: '${colors.accent?.hex || "#f59e0b"}' }} />
  <ColorItem title="background" colors={{ background: '${colors.backgrounds?.[0] || "#ffffff"}' }} />
  <ColorItem title="foreground" colors={{ foreground: '${colors.text?.[0] || "#171717"}' }} />
</ColorPalette>
`;
  }

  private generateMainTs(): string {
    return `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-docs'],
  framework: { name: '@storybook/react-vite', options: {} },
};
export default config;
`;
  }

  private generatePreviewTs(): string {
    return `import type { Preview } from '@storybook/react';
import './../stories/tokens.css';

const preview: Preview = {
  parameters: {
    backgrounds: { default: 'paper' },
    controls: { matchers: { color: /(background|color)$/i } },
  },
};
export default preview;
`;
  }

  private generatePackageJson(): string {
    const name =
      (this.design.meta?.title || "extracted")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 40) || "extracted";

    return JSON.stringify(
      {
        name: `${name}-storybook`,
        private: true,
        version: "0.1.0",
        type: "module",
        scripts: {
          storybook: "storybook dev -p 6006",
          "build-storybook": "storybook build",
        },
        dependencies: {
          react: "^19.0.0",
          "react-dom": "^19.0.0",
        },
        devDependencies: {
          "@storybook/addon-essentials": "^8.0.0",
          "@storybook/addon-docs": "^8.0.0",
          "@storybook/blocks": "^8.0.0",
          "@storybook/react": "^8.0.0",
          "@storybook/react-vite": "^8.0.0",
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          storybook: "^8.0.0",
          typescript: "^5.0.0",
          vite: "^5.0.0",
        },
      },
      null,
      2,
    );
  }

  private generateTsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
        },
        include: ["stories/**/*", ".storybook/**/*"],
      },
      null,
      2,
    );
  }

  private generateReadme(): string {
    const anatomies = this.design.componentAnatomy || [];
    const title = this.design.meta?.title || "Extracted";

    const anatomyList =
      anatomies.length > 0
        ? anatomies
            .map(
              (a) =>
                `- **${this.capitalize(a.kind)}** — ${a.props.variant.length || 1} variant(s), ${a.props.size.length || 1} size(s), ${a.totalInstances || 0} detected`,
            )
            .join("\n")
        : "_No anatomy detected on the source page._";

    return `# ${title} · Storybook

Auto-generated by \`FlyRank Visual DNA <url> --storybook\`.

## Stories
${anatomyList}

## Run

\`\`\`
npm install
npm run storybook
\`\`\`

Opens at http://localhost:6006.
`;
  }

  public generate(): Record<string, string> {
    const files: Record<string, string> = {};
    const anatomies = this.design.componentAnatomy || [];

    // Story files
    for (const a of anatomies) {
      const Name = this.capitalize(a.kind);
      files[`stories/${Name}.stories.tsx`] = this.generateStory(a);
    }

    // Token files
    files["stories/Tokens.mdx"] = this.generateTokensMdx();
    files["stories/tokens.css"] = this.generateTokensCss();

    // Storybook config
    files[".storybook/main.ts"] = this.generateMainTs();
    files[".storybook/preview.ts"] = this.generatePreviewTs();

    // Project files
    files["package.json"] = this.generatePackageJson();
    files["tsconfig.json"] = this.generateTsConfig();
    files["README.md"] = this.generateReadme();

    return files;
  }
}

export function formatStorybook(design: DesignSystem): Record<string, string> {
  const generator = new StorybookGenerator(design);
  return generator.generate();
}
