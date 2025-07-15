// @ts-check

import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist'
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
      plugins: {
        perfectionist,
      },
      rules: {
        'perfectionist/sort-classes': [
          'error',
          {
            groups: [
              'private-property',
              'static-property',
              'property',
              'accessor-property',
              'constructor',
              'static-method',
              'method',
              'unknown',
            ],
            order: 'asc',
            type: 'alphabetical',
          },
        ],
        'perfectionist/sort-interfaces': [
          'error',
          {
            groups: [
              'property',
              'method',
              'unknown',
            ],
            order: 'asc',
            type: 'alphabetical',
          },
        ],
        'perfectionist/sort-objects': [
          'error', {
            type: 'alphabetical',
          }
        ]
      },
      settings: {
        perfectionist: {
          partitionByComment: true,
          type: 'line-length',

        },

      },

    },
);