import React, { useEffect, useMemo, useRef, useState } from "react"
import Navbar from "../Components/Navbar"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/authContext"
import { fetchFollowingFeed } from "../../lib/follow-api"
import {
  blogMatchesCategory,
  filterBlogsByCategory,
  resolveCategoryFilter,
} from "../../lib/blog-categories"
import { TopicFilterRail } from "@/components/blog/TopicFilterRail"
import { PublicBlogTile } from "@/components/blogs/PublicBlogTile"
import { ArrowRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const Blog = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [feedMode, setFeedMode] = useState("all")
  const [feedLoading, setFeedLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const hasFatched = useRef(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const PAGE_LIMIT = 20

  const applyCategoryFilter = (category, sourceData = data) => {
    setActiveCategory(category)
    setFilteredData(filterBlogsByCategory(sourceData, category))
  }

  const fetchAllBlogsPage = async (pageNum = 1) => {
    const fetchData = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/public/posts/blogs/`,
      { params: { page: pageNum, limit: PAGE_LIMIT } }
    )
    const allBlogs = fetchData.data.allBlogs ?? []
    setData(allBlogs)
    setPage(fetchData.data.page ?? pageNum)
    setHasMore(Boolean(fetchData.data.hasMore))
    return allBlogs
  }

  const handleFetchAllBlogs = async () => {
    if (hasFatched.current) return
    hasFatched.current = true

    try {
      const allBlogs = await fetchAllBlogsPage(1)
      const category = resolveCategoryFilter(searchParams.get("category"))
      applyCategoryFilter(category, allBlogs)
    } catch {
      toast.error("Error loading blogs")
    }
  }

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore || feedMode !== "all") return
    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const fetchData = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/public/posts/blogs/`,
        { params: { page: nextPage, limit: PAGE_LIMIT } }
      )
      const allBlogs = fetchData.data.allBlogs ?? []
      setData((prev) => {
        const seen = new Set(prev.map((b) => b._id))
        return [...prev, ...allBlogs.filter((b) => b._id && !seen.has(b._id))]
      })
      setPage(fetchData.data.page ?? nextPage)
      setHasMore(Boolean(fetchData.data.hasMore))
    } catch {
      toast.error("Error loading more blogs")
    } finally {
      setLoadingMore(false)
    }
  }

  const handleFetchFollowingFeed = async () => {
    if (!user) {
      toast.info("Log in to see blogs from people you follow")
      navigate("/login")
      return
    }

    try {
      setFeedLoading(true)
      const { allBlogs, sharedBlogs } = await fetchFollowingFeed({
        page: 1,
        limit: PAGE_LIMIT,
      })
      const seen = new Set()
      const merged = []

      ;[...sharedBlogs, ...allBlogs].forEach((blog) => {
        if (!blog?._id || seen.has(blog._id)) return
        seen.add(blog._id)
        merged.push(blog)
      })

      setData(merged)
      setHasMore(false)
      setPage(1)
      const category = resolveCategoryFilter(searchParams.get("category"))
      applyCategoryFilter(category, merged)
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load following feed"
      )
    } finally {
      setFeedLoading(false)
    }
  }

  const handleFeedModeChange = async (mode) => {
    setFeedMode(mode)
    if (mode === "all") {
      try {
        setFeedLoading(true)
        const allBlogs = await fetchAllBlogsPage(1)
        const category = resolveCategoryFilter(searchParams.get("category"))
        applyCategoryFilter(category, allBlogs)
      } catch {
        toast.error("Error loading blogs")
      } finally {
        setFeedLoading(false)
      }
    } else {
      await handleFetchFollowingFeed()
    }
  }

  useEffect(() => {
    handleFetchAllBlogs()
  }, [])

  useEffect(() => {
    if (data.length === 0) return
    const category = resolveCategoryFilter(searchParams.get("category"))
    applyCategoryFilter(category)
  }, [searchParams, data])

  const topicCounts = useMemo(() => {
    const counts = {}
    ;[
      "General",
      "Personal",
      "Business",
      "Tech",
      "Health",
      "Education",
      "Entertainment",
      "Sports",
      "Other",
    ].forEach((type) => {
      counts[type] = data.filter((blog) =>
        blogMatchesCategory(blog, type)
      ).length
    })
    return counts
  }, [data])

  const handleCategoryFilter = (category) => {
    if (category === "All") {
      setSearchParams({})
      return
    }
    setSearchParams({ category })
  }

  return (
    <div className="wx-desk-bg wx-sans min-h-screen text-foreground">
      <Navbar />

      <section className="border-b border-border/70 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Read
          </p>
          <h1 className="wx-serif mt-2 text-4xl text-foreground sm:text-5xl">
            Discover notes
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            A calm shelf of published writing — browse topics or follow people
            you care about.
          </p>

          <div
            role="tablist"
            aria-label="Feed mode"
            className="mt-8 inline-flex w-full max-w-md gap-1 rounded-2xl bg-muted p-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={feedMode === "all"}
              onClick={() => handleFeedModeChange("all")}
              className={cn(
                "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-base font-medium transition",
                feedMode === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
              )}
            >
              All blogs
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={feedMode === "following"}
              onClick={() => handleFeedModeChange("following")}
              className={cn(
                "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-base font-medium transition",
                feedMode === "following"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              Following
            </button>
          </div>

          <div className="mt-5">
            <TopicFilterRail
              activeCategory={activeCategory}
              onSelect={(category) =>
                handleCategoryFilter(category)
              }
              counts={topicCounts}
              allCount={data.length}
              includeAll
            />
          </div>

          {feedLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading feed…</p>
          ) : null}

          {activeCategory !== "All" ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {filteredData.length} in {activeCategory}
              </span>
              <button
                type="button"
                onClick={() => handleCategoryFilter("All")}
                className="font-medium text-primary hover:underline"
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {filteredData.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-card px-6 py-24 text-center shadow-sm">
              <p className="wx-serif text-3xl text-foreground">Nothing here yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeCategory === "All"
                  ? "Be the first to publish something worth reading."
                  : `No notes in ${activeCategory} right now.`}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredData.map((blog) => (
                  <PublicBlogTile
                    key={blog._id}
                    blog={blog}
                    onOpen={() => navigate(`/blog/${blog._id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {feedMode === "all" && hasMore ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {filteredData.length > 0 ? (
        <div className="border-t border-border/70 px-4 py-14 text-center sm:px-6">
          <p className="wx-serif text-2xl text-foreground sm:text-3xl">
            Found something interesting?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Share your own note with the feed.
          </p>
          <button
            type="button"
            onClick={() => navigate("/write")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Start writing
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default Blog
