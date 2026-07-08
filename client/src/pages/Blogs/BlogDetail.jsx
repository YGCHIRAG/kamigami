import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageMeta from "../../components/PageMeta";
import { ArrowLeft, Calendar, User, Clock, Loader2 } from "lucide-react";
import api from "../../services/api";
import "./blogs.css";

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/blogs/${slug}`);
        const postData = res.data?.data || res.data;
        if (postData) {
          setBlog(postData);
        } else {
          setError("Manifesto records failed to load.");
        }
      } catch (err) {
        console.error("Failed to load blog detail:", err);
        setError("This scroll does not exist or has been archived from public archives.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="blogs-loading">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <p>DECRYPTING SCROLL CHRONICLES...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blogs-error-view">
        <div className="error-box">
          <h2>SCROLL NOT FOUND</h2>
          <p>{error}</p>
          <Link to="/blogs" className="back-blogs-btn">
            <ArrowLeft size={14} /> RETURN TO ARCHIVES
          </Link>
        </div>
      </div>
    );
  }

  // Simple reading time estimator
  const wordCount = blog.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="blog-detail-page">
      <PageMeta title={blog.title} description={blog.summary || "Explore this Kamigami manifesto."} />
      <div className="blog-detail-container">
        
        {/* Back navigation */}
        <div className="detail-back-nav">
          <Link to="/blogs" className="back-link-btn">
            <ArrowLeft size={16} /> Back to Archives
          </Link>
        </div>

        {/* Article Header */}
        <header className="blog-post-header">
          <span className="blog-tag">CULTURE MANIFESTO</span>
          <h1 className="blog-post-title">{blog.title}</h1>
          
          <div className="blog-post-meta">
            <span>
              <Calendar size={13} />
              {new Date(blog.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span>
              <User size={13} />
              {blog.author ? `${blog.author.firstName || ''} ${blog.author.lastName || ''}`.trim() : "Kamigami Creator"}
            </span>
            <span>
              <Clock size={13} />
              {readingTime} min read
            </span>
          </div>
        </header>

        {/* Divider */}
        <div className="blog-divider" />

        {/* Content Body */}
        <article className="blog-post-content">
          {blog.content.split("\n").map((paragraph, index) => {
            if (!paragraph.trim()) return null;
            return <p key={index}>{paragraph.trim()}</p>;
          })}
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
