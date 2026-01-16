"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      date
      location
      slug
    }
  }
`;

export default function EventsPage() {
    const { loading, error, data } = useQuery<any>(GET_EVENTS);

    if (loading) return <p className="p-8">Loading events...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Events</h1>
            <div className="grid gap-6">
                {data.events.map((event: any) => (
                    <div key={event.id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
                        <h2 className="text-xl font-semibold">{event.title}</h2>
                        <p className="text-sm text-gray-500 mb-1">{event.date}</p>
                        <p className="text-sm text-gray-500 mb-2">{event.location}</p>
                        <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
