import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: './app/api/graphql/schema.graphql',
  documents: ['app/**/*.tsx'],
  generates: {
    'generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo'
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        reactApolloVersion: 3,
        documentMode: 'external',
        importDocumentNodeExternallyFrom: './graphql.tsx',
      }
    }
  }
};

export default config;