import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedtype }) => {
  const getPosts = () => {
    switch (feedtype) {
      case "forYou":
        return "/api/post/all";
      case "following":
        return "/api/post/following";
      default:
        return "/api/post/all";
    }
  };

  const getPostsData = getPosts();

  const {
    data: Posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(getPostsData);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedtype, refetch]);

  return (
    <>
      {isLoading ||
        (isRefetching && (
          <div className="flex flex-col justify-center">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ))}
      {!isLoading && !isRefetching && Posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && Posts && (
        <div>
          {Posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
