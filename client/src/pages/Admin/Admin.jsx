import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./module.css";
import { ProductDataContext }  from "../../Context/ProductDataContext";
import { customAlphabet } from "nanoid";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, Check, X, FileText, HelpCircle, ShoppingBag } from "lucide-react";

const Admin = () => {
  const { productData, setProductData } = useContext(ProductDataContext);
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
  const [loading, setLoading] = useState(false);

  // Tab State: "products", "blogs", "faqs", "returns"
  const [activeTab, setActiveTab] = useState("products");

  // CMS Data States
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  // React Hook Form for Add Product
  const { register, handleSubmit, reset } = useForm();

  // Custom states for Blog Form
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSummary, setBlogSummary] = useState("");
  const [blogContent, setBlogContent] = useState("");

  // Custom states for FAQ Form
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("General");

  // Fetch CMS data on tab changes
  useEffect(() => {
    if (activeTab === "blogs") {
      fetchBlogs();
    } else if (activeTab === "faqs") {
      fetchFaqs();
    } else if (activeTab === "returns") {
      fetchReturns();
    }
  }, [activeTab]);

  const fetchBlogs = async () => {
    try {
      setFetchingData(true);
      const res = await api.get("/blogs");
      setBlogs(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      toast.error("Failed to load blog archives.");
    } finally {
      setFetchingData(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      setFetchingData(true);
      const res = await api.get("/faqs");
      setFaqs(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
      toast.error("Failed to load FAQs archives.");
    } finally {
      setFetchingData(false);
    }
  };

  const fetchReturns = async () => {
    try {
      setFetchingData(true);
      const res = await api.get("/returns/admin");
      setReturnRequests(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch returns:", err);
      toast.error("Failed to load return requests.");
    } finally {
      setFetchingData(false);
    }
  };

  // Submit Product (Existing logic)
  const submitProductHandler = async (data) => {
    try {
      setLoading(true);
      const specMetadata = {
        specifications: {
          fit: data.fit || "Modern Relaxed / Oversized Silhouette",
          fabric: data.fabric || "240+ GSM Heavyweight Combed Cotton",
          print: data.print || "High-Fidelity Screen Print / Deity Graphic",
          origin: data.origin || "Kamigami Official Sanctum Archives",
          care: data.care || "Machine Wash Cold, Reverse Side Ironing"
        }
      };

      const localProduct = {
        id: nanoid(),
        title: data.title,
        image: data.image,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        size: data.size,
        discount: Number(data.discount),
        metadata: specMetadata
      };

      try {
        const payload = {
          name: data.title,
          slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(1000 + Math.random() * 9000),
          description: data.description,
          basePrice: Number(data.price),
          isDrop: false,
          status: "PUBLISHED",
          metadata: specMetadata,
          variants: [
            {
              sku: `${data.title.toUpperCase().slice(0, 3).replace(/[^A-Z]/g, "AW")}-${data.size.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
              attributes: { size: data.size.toUpperCase(), color: "Black" },
              initialStock: 100
            }
          ]
        };

        const res = await api.post("/products", payload);
        const serverProduct = res.data?.data?.product;
        if (serverProduct) {
          toast.success("Product created in database sanctum!");
          localProduct.id = serverProduct.id;
        }
      } catch (err) {
        console.warn("Backend API sync failed, saving locally:", err.message);
        toast.error("Database sync failed, saved locally.");
      }

      const copyData = [...productData];
      copyData.push(localProduct);
      setProductData(copyData);
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Blog Post
  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) {
      toast.error("Title and content are required.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/blogs", {
        title: blogTitle,
        summary: blogSummary,
        content: blogContent
      });
      toast.success("Manifesto published to the archives!");
      setBlogTitle("");
      setBlogSummary("");
      setBlogContent("");
      fetchBlogs();
    } catch (err) {
      console.error("Add blog error:", err);
      toast.error(err.response?.data?.message || "Failed to publish blog post.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Blog Post
  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to retract this blog post?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Blog post retracted successfully.");
      fetchBlogs();
    } catch (err) {
      console.error("Delete blog error:", err);
      toast.error("Failed to delete blog post.");
    }
  };

  // Submit FAQ
  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer) {
      toast.error("Question and answer are required.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/faqs", {
        question: faqQuestion,
        answer: faqAnswer,
        category: faqCategory
      });
      toast.success("FAQ logged in archives.");
      setFaqQuestion("");
      setFaqAnswer("");
      setFaqCategory("General");
      fetchFaqs();
    } catch (err) {
      console.error("Add FAQ error:", err);
      toast.error(err.response?.data?.message || "Failed to log FAQ.");
    } finally {
      setLoading(false);
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await api.delete(`/faqs/${id}`);
      toast.success("FAQ deleted successfully.");
      fetchFaqs();
    } catch (err) {
      console.error("Delete FAQ error:", err);
      toast.error("Failed to delete FAQ.");
    }
  };

  // Approve/Reject Returns
  const handleUpdateReturnStatus = async (id, status) => {
    try {
      await api.put(`/returns/admin/${id}`, { status });
      toast.success(`Return request marked as ${status}`);
      fetchReturns();
    } catch (err) {
      console.error("Update return status error:", err);
      toast.error("Failed to update return status.");
    }
  };

  return (
    <div className="admin-page-root">
      <div className="admin-tabs-nav">
        <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>PRODUCTS</button>
        <button className={activeTab === "blogs" ? "active" : ""} onClick={() => setActiveTab("blogs")}>BLOG ARCHIVES</button>
        <button className={activeTab === "faqs" ? "active" : ""} onClick={() => setActiveTab("faqs")}>FAQS</button>
        <button className={activeTab === "returns" ? "active" : ""} onClick={() => setActiveTab("returns")}>RETURN REQUESTS</button>
      </div>

      <div className="admin-tab-content">
        
        {/* VIEW: PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="admin-view-panel">
            <h2>Add Product Offering</h2>
            <form onSubmit={handleSubmit(submitProductHandler)} className="admin-form">
              <input {...register("image")} type="url" placeholder="Product Image URL" required />
              <input {...register("title")} type="text" placeholder="Product Title" required />
              <textarea {...register("description")} placeholder="Product Description" required />
              <input {...register("price")} type="number" placeholder="Price ₹" required />
              
              <select {...register("category")} required>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </select>

              <select {...register("size")} required>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
              </select>

              <input {...register("discount")} type="number" placeholder="Discount %" />

              <div className="specifications-section-header" style={{ width: "100%", margin: "10px 0 5px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "5px" }}>
                <h4 style={{ color: "#ff1a1a", fontSize: "0.85rem", letterSpacing: "1px" }}>GARMENT SPECIFICATIONS</h4>
              </div>

              <input {...register("fit")} type="text" placeholder="Fit Type (E.g. Modern Relaxed)" />
              <input {...register("fabric")} type="text" placeholder="Fabric (E.g. 240+ GSM Heavyweight Cotton)" />
              <input {...register("print")} type="text" placeholder="Print (E.g. Screen Print)" />
              <input {...register("origin")} type="text" placeholder="Origin (E.g. Kamigami Archives)" />
              <input {...register("care")} type="text" placeholder="Care (E.g. Machine Wash Cold)" />

              <button disabled={loading}>
                {loading ? "Creating Offering..." : "Add Product"}
              </button>
            </form>
          </div>
        )}

        {/* VIEW: BLOGS TAB */}
        {activeTab === "blogs" && (
          <div className="admin-split-layout">
            <div className="admin-left-col">
              <h2>Publish Manifesto</h2>
              <form onSubmit={handleAddBlog} className="admin-form">
                <input 
                  type="text" 
                  placeholder="Manifesto Title" 
                  value={blogTitle} 
                  onChange={(e) => setBlogTitle(e.target.value)} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Summary (short description)" 
                  value={blogSummary} 
                  onChange={(e) => setBlogSummary(e.target.value)} 
                />
                <textarea 
                  placeholder="Content body..." 
                  value={blogContent} 
                  onChange={(e) => setBlogContent(e.target.value)} 
                  style={{ minHeight: "220px" }}
                  required 
                />
                <button disabled={loading}>
                  {loading ? "Publishing..." : "Publish Article"}
                </button>
              </form>
            </div>
            
            <div className="admin-right-col">
              <h2>Published Manifestos</h2>
              {fetchingData ? (
                <div className="admin-loading-spinner"><Loader2 className="animate-spin" /></div>
              ) : blogs.length === 0 ? (
                <p className="empty-text">No articles logged in this realm.</p>
              ) : (
                <div className="cms-list">
                  {blogs.map(post => (
                    <div key={post.id} className="cms-list-card">
                      <div className="card-info">
                        <h4>{post.title}</h4>
                        <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button className="delete-btn" onClick={() => handleDeleteBlog(post.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: FAQS TAB */}
        {activeTab === "faqs" && (
          <div className="admin-split-layout">
            <div className="admin-left-col">
              <h2>Log FAQ</h2>
              <form onSubmit={handleAddFaq} className="admin-form">
                <input 
                  type="text" 
                  placeholder="Question" 
                  value={faqQuestion} 
                  onChange={(e) => setFaqQuestion(e.target.value)} 
                  required 
                />
                <textarea 
                  placeholder="Answer..." 
                  value={faqAnswer} 
                  onChange={(e) => setFaqAnswer(e.target.value)} 
                  required 
                />
                <select value={faqCategory} onChange={(e) => setFaqCategory(e.target.value)}>
                  <option value="General">General</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Refunds">Refunds</option>
                  <option value="Drops">Drops</option>
                </select>
                <button disabled={loading}>
                  {loading ? "Logging FAQ..." : "Log FAQ"}
                </button>
              </form>
            </div>

            <div className="admin-right-col">
              <h2>FAQ Archives</h2>
              {fetchingData ? (
                <div className="admin-loading-spinner"><Loader2 className="animate-spin" /></div>
              ) : faqs.length === 0 ? (
                <p className="empty-text">No FAQs documented in this realm.</p>
              ) : (
                <div className="cms-list">
                  {faqs.map(faq => (
                    <div key={faq.id} className="cms-list-card">
                      <div className="card-info">
                        <h4>{faq.question}</h4>
                        <p className="badge">{faq.category}</p>
                      </div>
                      <button className="delete-btn" onClick={() => handleDeleteFaq(faq.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: RETURN REQUESTS TAB */}
        {activeTab === "returns" && (
          <div className="admin-view-panel full-width">
            <h2>Customer Return Requests</h2>
            {fetchingData ? (
              <div className="admin-loading-spinner"><Loader2 className="animate-spin" size={32} /></div>
            ) : returnRequests.length === 0 ? (
              <p className="empty-text">No return requests currently filed.</p>
            ) : (
              <div className="admin-returns-table-wrapper">
                <table className="admin-returns-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer Email</th>
                      <th>Reason</th>
                      <th>Items claimed</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnRequests.map(req => (
                      <tr key={req.id}>
                        <td className="bold">{req.order?.orderNumber}</td>
                        <td>{req.user?.email || "N/A"}</td>
                        <td><p className="reason-text">{req.reason}</p></td>
                        <td>
                          <div className="items-list-cell">
                            {(req.items || []).map((item, idx) => (
                              <div key={idx} className="item-mini-desc">
                                <span>{item.name}</span>
                                <span className="qty">Qty: {item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${req.status.toLowerCase()}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          {req.status === "PENDING" ? (
                            <div className="action-buttons-cell">
                              <button className="approve-icon-btn" onClick={() => handleUpdateReturnStatus(req.id, "APPROVED")}>
                                <Check size={14} /> APPROVE
                              </button>
                              <button className="reject-icon-btn" onClick={() => handleUpdateReturnStatus(req.id, "REJECTED")}>
                                <X size={14} /> REJECT
                              </button>
                            </div>
                          ) : (
                            <span className="locked-action">SETTLED</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
