import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/PageMeta";
import { BookOpen, Calendar, User, ArrowRight, Loader2 } from "lucide-react";
import api from "../../services/api";
import "./blogs.css";

const BlogsList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/blogs");
        const blogList = res.data?.data || res.data || [];
        setBlogs(blogList);
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="blogs-page">
      <PageMeta 
        title="Kamigami Archives — Blog & Manifestos" 
        description="Explore articles, styling guides, and cultural manifestos from the creators of Kamigami Shinto street vestments." 
      />
      <div className="blogs-container">
        <header className="blogs-header">
          <BookOpen size={36} className="text-red-500 animate-pulse" />
          <h1 className="blogs-title">TEMPLE ARCHIVES</h1>
          <p className="blogs-subtitle">Articles, Manifestos, & Shinto Design Musings</p>
        </header>

        {loading ? (
          <div className="blogs-loading">
            <Loader2 className="animate-spin text-red-600" size={36} />
            <p>RECALLING SCROLLS...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="blogs-empty-state">
            <p>The archives are currently sealed. No articles have been published in this realm yet.</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map(post => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-content">
                  <span className="blog-tag">CULTURE</span>
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-summary">
                    {post.summary || (post.content.length > 120 ? post.content.substring(0, 120) + "..." : post.content)}
                  </p>
                  
                  <div className="blog-card-meta">
                    <span>
                      <Calendar size={12} /> 
                      {new Date(post.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>
                      <User size={12} />
                      {post.author ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() : "Kamigami scribe"}
                    </span>
                  </div>
                </div>
                
                <Link to={`/blogs/${post.slug}`} className="blog-read-link">
                  READ MANIFESTO <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsList;
