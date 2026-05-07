import { describe, expect, it } from '@rstest/core';
import { WidgetSelector } from '../widget.elements';

describe('WidgetSelector', () => {
  it('contains critical third-party widget selectors', () => {
    expect(WidgetSelector.INTERCOM_CONTAINER).toBe('#intercom-container');
    expect(WidgetSelector.DRIFT_WIDGET).toBe('#drift-widget');
    expect(WidgetSelector.HUBSPOT_MESSAGES).toBe('#hubspot-messages-iframe-container');
    expect(WidgetSelector.ZENDESK_WIDGET).toBe('[data-product="web_widget"]');
    expect(WidgetSelector.COOKIEBOT_DIALOG).toBe('#CybotCookiebotDialog');
  });

  it('keeps enum values unique to avoid accidental selector collisions', () => {
    const values = Object.values(WidgetSelector);
    const unique = new Set(values);

    expect(unique.size).toBe(values.length);
  });
});
