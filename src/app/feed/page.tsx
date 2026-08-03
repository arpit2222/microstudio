"use client";

import { useEffect, useState, useRef } from "react";

type FeedItem = {
  id: string;
  title: string;
  premise: string;
  videoUrl: string;
  creator: {
    name: string;
  };
  likeCount: number;
  commentCount: number;
};

export default function DiscoveryFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch("/api/feed");
        const data = await res.json();
        setFeed(data.feed || []);
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500"></div>
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold text-slate-400">No pilots available yet.</h2>
        <a href="/projects/create" className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold hover:scale-105 transition-transform">
          Create One
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar scroll-smooth">
      {feed.map((item, index) => (
        <FeedVideo key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}

function FeedVideo({ item, index }: { item: FeedItem, index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(item.likeCount);
  const [isLiked, setIsLiked] = useState(false);

  // Intersection Observer to autoplay/pause video based on viewport visibility
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.6, // Trigger when 60% of the video is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(e => console.log("Autoplay prevented", e));
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = async () => {
    if (isLiked) return;
    
    // Optimistic update
    setIsLiked(true);
    setLikes(l => l + 1);

    try {
      await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: item.id, type: "LIKE" }),
      });
    } catch (e) {
      console.error("Failed to like project", e);
      // Revert if failed
      setIsLiked(false);
      setLikes(l => l - 1);
    }
  };

  return (
    <div className="w-full h-screen snap-start snap-always relative bg-black flex items-center justify-center">
      {/* Video Player */}
      <video
        ref={videoRef}
        src={item.videoUrl}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        onClick={togglePlay}
        muted={false} // Depending on browser policies, might need to be true for initial load, but this is a hackathon
      />

      {/* Play/Pause indicator overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <svg className="w-24 h-24 text-white/50 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24">
             <path d="M8 5v14l11-7z" />
           </svg>
        </div>
      )}

      {/* Gradient Bottom Overlay for Text Visibility */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

      {/* Information Overlay */}
      <div className="absolute bottom-8 left-4 right-20 text-white z-10 pointer-events-auto">
        <h3 className="text-xl font-extrabold mb-1 drop-shadow-md">@{item.creator?.name || "Unknown Creator"}</h3>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">{item.title}</h2>
        <p className="text-sm font-light text-slate-200 line-clamp-3 w-11/12 drop-shadow-md">
          {item.premise}
        </p>
      </div>

      {/* Floating Action Buttons (Right Side) */}
      <div className="absolute bottom-12 right-4 flex flex-col items-center space-y-6 z-10 pointer-events-auto">
        
        {/* Like Button */}
        <button onClick={handleLike} className="flex flex-col items-center group transition-transform hover:scale-110">
          <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md border ${isLiked ? 'border-pink-500 text-pink-500' : 'border-white/20 text-white'} group-hover:bg-white/20 transition-colors`}>
            <svg className="w-8 h-8" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xs font-bold mt-1 text-white drop-shadow-md">{likes}</span>
        </button>

        {/* Comment Button (Visual Only for now) */}
        <button className="flex flex-col items-center group transition-transform hover:scale-110">
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white group-hover:bg-white/20 transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xs font-bold mt-1 text-white drop-shadow-md">{item.commentCount}</span>
        </button>

        {/* Share Button (Visual Only) */}
        <button className="flex flex-col items-center group transition-transform hover:scale-110">
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white group-hover:bg-white/20 transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="text-xs font-bold mt-1 text-white drop-shadow-md">Share</span>
        </button>
        
      </div>
    </div>
  );
}
