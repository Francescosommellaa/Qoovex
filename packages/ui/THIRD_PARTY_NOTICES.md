# Third-party notices

## Kiranism / next-shadcn-dashboard-starter

The Qoovex design-system direction and portions of its open-code component foundation are derived from:

- Repository: https://github.com/Kiranism/next-shadcn-dashboard-starter
- Pinned commit: `0edc5cf631ac7a8280112fd2bcb80312597bafdf`
- License: MIT

Copyright (c) 2023 Kiranism

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## shadcn/ui

The open-code component sources were generated from and adapted from the shadcn/ui registry: https://github.com/shadcn-ui/ui. shadcn/ui is distributed under the MIT License. Qoovex owns its checked-in adaptations and retains upstream attribution here.

For the authentication redesign, the official `base-nova` `login-04` block was inspected with shadcn CLI `4.13.1`. Its responsive split-card hierarchy was used as a composition reference only: the registry block was not applied because its dry run would overwrite approved Qoovex primitives.

## Base UI

The shared `OtpInput` composes the stable `OTPField` primitive from `@base-ui/react` `1.6.0`: https://base-ui.com/react/components/otp-field. Base UI is distributed under the MIT License and remains an existing approved dependency of `@qoovex/ui`.
