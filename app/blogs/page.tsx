"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_BLOGS = gql`
  query GetBlogs {
    blogs {
      id
      title
      content
      author
      date
      slug
    }
  }
`;

export default function BlogsPage() {
    const { loading, error, data } = useQuery<any>(GET_BLOGS);

    if (loading) return <p className="p-8">Loading blogs...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Blogs</h1>
            <div className="grid gap-6">
                {data.blogs.map((blog: any) => (
                    <div key={blog.id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
                        <h2 className="text-xl font-semibold">{blog.title}</h2>
                        <p className="text-sm text-gray-500 mb-2">
                            By {blog.author} on {blog.date}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">{blog.content.substring(0, 100)}...</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
