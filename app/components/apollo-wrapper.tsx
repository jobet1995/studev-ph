"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { ApolloProvider } from "@apollo/client/react";

/**
 * Error handling link for Apollo Client
 */
const errorLink = onError((error) => {
    const { graphQLErrors, networkError } = error as {
        graphQLErrors?: Array<{ message: string; }>; 
        networkError?: Error;
    };
    
    if (graphQLErrors && graphQLErrors.length > 0) {
        graphQLErrors.forEach((graphQLError) => {
            console.error(`GraphQL error: ${graphQLError.message}`);
        });
    }
    
    if (networkError) {
        console.error(`Network error: ${networkError}`);
    }
});

// Create HTTP link
const httpLink = new HttpLink({
    uri: "/api/graphql",
    // Include credentials for auth if needed
    credentials: 'same-origin',
});

// Configure cache with type policies for better normalization
const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                // Custom merge function for blogs query to handle pagination
                blogs: {
                    keyArgs: ['filter', 'sort'],
                    merge(existing = { items: [], totalCount: 0 }, incoming) {
                        // Merge pagination results: combine existing items with new items
                        const mergedItems = [...existing.items, ...incoming.items];
                        return {
                            ...incoming,
                            items: mergedItems,
                            totalCount: incoming.totalCount || existing.totalCount
                        };
                    },
                },
                events: {
                    keyArgs: ['filter'],
                    merge(existing = { items: [], totalCount: 0 }, incoming) {
                        // Merge pagination results: combine existing items with new items
                        const mergedItems = [...existing.items, ...incoming.items];
                        return {
                            ...incoming,
                            items: mergedItems,
                            totalCount: incoming.totalCount || existing.totalCount
                        };
                    },
                },
            },
        },
        Blog: {
            keyFields: ['id'], // Normalize by id
        },
        Event: {
            keyFields: ['id'], // Normalize by id
        },
    },
});

const client = new ApolloClient({
    link: from([errorLink, httpLink]), // Chain error link before HTTP link
    cache,
    // Default options for all queries
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network', // Fetch from cache first, then network
            errorPolicy: 'all', // Show partial results even if there are errors
        },
        query: {
            fetchPolicy: 'network-only', // Always fetch fresh data for queries
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
