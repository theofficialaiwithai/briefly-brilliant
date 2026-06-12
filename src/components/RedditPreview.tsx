import { useRedditPosts } from "@/lib/useRedditPosts";

const RedditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="#FF4500" />
    <text
      x="10"
      y="14"
      textAnchor="middle"
      fill="white"
      fontSize="9"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      r/
    </text>
  </svg>
);

export const RedditPreview = ({ query }: { query: string }) => {
  const { posts, loading } = useRedditPosts(query);

  if (loading) {
    return (
      <div className="mt-4 border-t border-[#E5E7EB] pt-3">
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="mt-4 border-t border-[#E5E7EB] pt-3">
      {/* Header */}
      <div className="mb-2 flex items-center gap-1.5">
        <RedditIcon />
        <span
          style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4B5563" }}
        >
          What Reddit says
        </span>
      </div>

      {/* Posts */}
      <div className="space-y-1">
        {posts.map((post) => (
          <a
            key={post.permalink}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-2 py-1.5 transition-colors hover:bg-[#F9FAFB]"
          >
            <p
              className="truncate font-medium"
              style={{ fontSize: "0.8rem", color: "#1A1A2E" }}
            >
              {post.title}
            </p>
            <div
              className="mt-0.5 flex items-center gap-3"
              style={{ fontSize: "0.75rem" }}
            >
              <span style={{ color: "#0D9488" }}>▲ {post.score.toLocaleString()}</span>
              <span style={{ color: "#6B7280" }}>{post.num_comments} comments</span>
            </div>
          </a>
        ))}
      </div>

      {/* See more */}
      <a
        href={`https://www.reddit.com/r/LSAT/search/?q=${encodeURIComponent(query)}&sort=top`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block transition-opacity hover:opacity-80"
        style={{ fontSize: "0.75rem", color: "#0D9488", fontWeight: 500 }}
      >
        See more on Reddit →
      </a>
    </div>
  );
};
