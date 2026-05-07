/**
 * @file jetpack constants
 * @description Shared generated-code snippets for Jetpack Compose formatter output.
 */

export const JETPACK_PACKAGE_NAME = "com.flyrank.visualdna.tokens";
export const JETPACK_OBJECT_NAME = "FlyRankVisualDnaTokens";
export const JETPACK_XML_HEADER = '<?xml version="1.0" encoding="utf-8"?>';

export const JETPACK_THEME_KT_TEMPLATE = `{{header}}
package {{packageName}}

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

object {{objectName}} {
{{body}}
}
`;

export const JETPACK_XML_TEMPLATE = `${JETPACK_XML_HEADER}
<resources>
{{body}}
</resources>
`;
