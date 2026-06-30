---
'anti-trojan-source': patch
---

Detect the Mongolian free variation selectors (U+180B, U+180C, U+180D, U+180F) in the default scan.

These are variation selectors, like the already-detected VS1-VS256 (U+FE00-U+FE0F and U+E0100-U+E01EF), and carry the `Default_Ignorable_Code_Point` property, so they render invisibly and can hide a payload the same way the existing zero-width and variation-selector entries do.
