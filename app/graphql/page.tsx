import { redirect } from "next/navigation";

/**
 * GraphQL playground redirect page
 * Redirects to the GraphQL API endpoint
 * @returns {never} Redirects to /api/graphql
 */
export default function GraphQLPage() {
    redirect("/api/graphql");
}
