"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { ApolloProvider } from "@apollo/client/react";

// Error handling link
const errorLink = onError((errorInfo: any) => {
    const { graphQLErrors, networkError } = errorInfo;
    
    if (graphQLErrors && graphQLErrors.length > 0) {
        graphQLErrors.forEach((graphQLError: any) => {
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
                        // For simplicity, we'll just return the incoming data
                        // In a real app, you'd implement pagination merging
                        return incoming;
                    },
                },
                events: {
                    keyArgs: ['filter'],
                    merge(existing = { items: [], totalCount: 0 }, incoming) {
                        return incoming;
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
