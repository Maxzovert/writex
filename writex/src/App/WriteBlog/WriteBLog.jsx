import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import axiosInstance from "../../lib/axiosConfig";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/** Unique title so repeated auto-saves do not collide on slug ("Untitled draft" → same slug). */
function makeDefaultDraftTitle() {
  return `Untitled draft ${Date.now()}`;
}

function parseBlogContent(raw) {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

function editorHasMeaningfulText(editor) {
  if (!editor || typeof editor.getText !== "function") return false;
  return editor.getText().trim().length > 0;
}

/** New post: only auto-save on leave if the user actually started the draft (content or any field). */
function newBlogHasDraftableChanges(editor, s) {
  if (!editor) return false;
  if (editorHasMeaningfulText(editor)) return true;
  if (s.title.trim()) return true;
  if (s.description.trim()) return true;
  if ((s.tags || "").trim()) return true;
  if (s.mainImage != null) return true;
  const cat = (s.category || "General").toLowerCase();
  if (cat !== "general") return true;
  return false;
}

const WriteBlog = () => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [isPublishing, setIsPublishing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBlogId, setEditBlogId] = useState(null);
  const [originalStatus, setOriginalStatus] = useState("draft");
  const [aiMessage, setAiMessage] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([
    "Improve your blog title to be more engaging",
    "Add more descriptive content to your introduction",
    "Consider adding relevant images to support your points",
    "Break down complex ideas into smaller paragraphs",
    "End with a strong conclusion that summarizes your main points"
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();

  /** Latest form state for unload / keepalive save (refs avoid stale closures). */
  const formStateRef = useRef({
    title: "",
    description: "",
    tags: "",
    category: "General",
    mainImage: null,
    isEditMode: false,
    editBlogId: null,
  });
  const originalEditSnapshotRef = useRef(null);
  const originalEditTextRef = useRef("");
  const autoSaveOnExitSentRef = useRef(false);
  /** Skip auto-save when leaving after a successful publish/draft save (avoid duplicate POST). */
  const suppressAutoSaveRef = useRef(false);
  /** Latest keepalive draft save impl (refs only; safe for unload / unmount). */
  const keepaliveDraftSaveRef = useRef(() => {});
  /** After first frame: ignore React Strict Mode fake unmount (no ghost drafts in dev). */
  const spaLeaveSaveReadyRef = useRef(false);

  useEffect(() => {
    formStateRef.current = {
      title,
      description,
      tags,
      category,
      mainImage,
      isEditMode,
      editBlogId,
    };
  }, [title, description, tags, category, mainImage, isEditMode, editBlogId]);

  useEffect(() => {
    if (location.state?.editBlog) {
      const blog = location.state.editBlog;
      originalEditSnapshotRef.current = {
        title: blog.title || "",
        description: blog.description || "",
        tags: blog.tags || "",
        category: blog.category || "General",
        mainImage: blog.mainImage || null,
        content: parseBlogContent(blog.content),
      };
    } else {
      originalEditSnapshotRef.current = null;
    }
  }, [location.state]);

  const handleMainImageChange = React.useCallback((imageUrl) => {
    setMainImage(imageUrl);
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setCategory("General");
    setMainImage(null);
    setIsEditMode(false);
    setEditBlogId(null);
    setOriginalStatus("draft");
    setAiMessage("");
    
    if (editorRef.current) {
      editorRef.current.commands.clearContent();
    }
  };

  const hasUnsavedChanges = () => {
    if (!isEditMode) return false;

    const originalBlog = location.state?.editBlog;
    if (!originalBlog) return false;

    let contentChanged = false;
    if (editorRef.current) {
      try {
        const currentText = editorRef.current.getText().trim();
        contentChanged = currentText !== originalEditTextRef.current;
      } catch {
        contentChanged = editorHasMeaningfulText(editorRef.current);
      }
    }

    return (
      title !== originalBlog.title ||
      category !== originalBlog.category ||
      description !== originalBlog.description ||
      tags !== originalBlog.tags ||
      mainImage !== originalBlog.mainImage ||
      contentChanged
    );
  };


  const handleCancelEdit = () => {
    if (hasUnsavedChanges()) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel editing?")) {
        navigate("/myblogs");
      }
    } else {
      navigate("/myblogs");
    }
  };

  const handleNavigateAway = () => {
    if (isEditMode && hasUnsavedChanges()) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/myblogs");
      }
    } else {
      navigate("/myblogs");
    }
  };

  // Handle edit mode when component mounts
  useEffect(() => {
    if (location.state?.editBlog) {
      const blog = location.state.editBlog;
      setIsEditMode(true);
      setEditBlogId(blog._id);
      setTitle(blog.title || "");
      setCategory(blog.category || "General");
      setMainImage(blog.mainImage || null);
      setDescription(blog.description || "");
      setTags(blog.tags || "");
      setOriginalStatus(blog.status || "draft");
      
      // Set editor content after a short delay to ensure editor is initialized
      setTimeout(() => {
        if (editorRef.current && blog.content) {
          try {
            // Handle both string and JSON content
            const content = typeof blog.content === 'string' ? JSON.parse(blog.content) : blog.content;
            editorRef.current.commands.setContent(content);
            originalEditTextRef.current = editorRef.current.getText().trim();
          } catch (error) {
            console.error("Error setting editor content:", error);
            // If parsing fails, set as plain text
            if (typeof blog.content === 'string') {
              editorRef.current.commands.setContent([{
                type: 'paragraph',
                content: [{ type: 'text', text: blog.content }]
              }]);
              originalEditTextRef.current = editorRef.current.getText().trim();
            }
          }
        }
      }, 100);
    }

    // Cleanup function to reset form when component unmounts
    return () => {
      if (isEditMode) {
        resetForm();
      }
    };
  }, [location.state, isEditMode]);

  // Warn user before leaving if they have unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditMode && hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditMode, hasUnsavedChanges]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e) => {
      if (isEditMode && hasUnsavedChanges()) {
        e.preventDefault();
        if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
          navigate("/myblogs");
        } else {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isEditMode, hasUnsavedChanges, navigate]);

  /** Tab close / refresh: keepalive save. */
  useEffect(() => {
    const onHide = () => keepaliveDraftSaveRef.current();
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
    };
  }, []);

  /**
   * In-app navigation should NOT auto-save drafts.
   * Auto-save is restricted to browser reload/close via beforeunload/pagehide.
   */
  useEffect(() => {
    let rafId = 0;
    spaLeaveSaveReadyRef.current = false;
    rafId = requestAnimationFrame(() => {
      spaLeaveSaveReadyRef.current = true;
    });
    return () => {
      cancelAnimationFrame(rafId);
      spaLeaveSaveReadyRef.current = false;
    };
  }, []);

  keepaliveDraftSaveRef.current = () => {
    if (suppressAutoSaveRef.current) return;
    if (autoSaveOnExitSentRef.current) return;
    if (!localStorage.getItem("token")) return;

    const editor = editorRef.current;
    if (!editor) return;

    const s = formStateRef.current;
    if (s.isEditMode && originalEditSnapshotRef.current) {
      const o = originalEditSnapshotRef.current;
      let contentChanged = true;
      try {
        const currentText = editor.getText().trim();
        contentChanged = currentText !== originalEditTextRef.current;
      } catch {
        contentChanged = true;
      }

      const metaChanged =
        s.title.trim() !== (o.title || "").trim() ||
        (s.category || "") !== (o.category || "") ||
        s.description.trim() !== (o.description || "").trim() ||
        (s.tags || "") !== (o.tags || "") ||
        s.mainImage !== o.mainImage;

      if (!contentChanged && !metaChanged) return;
    } else if (!s.isEditMode) {
      if (!newBlogHasDraftableChanges(editor, s)) return;
    }

    autoSaveOnExitSentRef.current = true;

    const token = localStorage.getItem("token");
    if (!token) return;

    const draftTitle = s.title.trim() || makeDefaultDraftTitle();
    const draftData = {
      title: draftTitle,
      mainImage: s.mainImage || null,
      content: editor.getJSON(),
      category:
        (s.category || "General").charAt(0).toUpperCase() +
        (s.category || "General").slice(1).toLowerCase(),
      status: "draft",
      tags: (s.tags || "").trim() || [],
      description: (s.description || "").trim() || "No description",
    };

    const base = import.meta.env.VITE_API_BASE_URL;
    const url =
      s.isEditMode && s.editBlogId
        ? `${base}/blog/updateblog/${s.editBlogId}`
        : `${base}/blog/addblog`;
    const method = s.isEditMode && s.editBlogId ? "PUT" : "POST";

    try {
      fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draftData),
        keepalive: true,
        credentials: "include",
      }).catch(() => {});
    } catch {
      autoSaveOnExitSentRef.current = false;
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!mainImage) {
      toast.warning("Please upload at least one image");
      return;
    }
    if (!description.trim()) {
      toast.warning("Please enter a short description");
      return;
    }
    if (!title.trim()) {
      toast.warning("Please enter a title");
      return;
    }
    if (!editorRef.current) {
      toast.warning("Editor not initialized, please refresh the page");
      return;
    }

    setIsPublishing(true);

    try {
      const editorContent = editorRef.current.getJSON();
      
      // Additional validation
      if (!editorContent || Object.keys(editorContent).length === 0) {
        toast.warning("Please add some content to your blog before publishing");
        setIsPublishing(false);
        return;
      }

      const blogData = {
        title: title.trim(),
        mainImage,
        content: editorContent,
        category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        status: "published",
        tags: tags.trim() || [],
        description: description.trim(),
      };

      let response;
      
      const token = localStorage.getItem("token");
      const authRequestConfig = {
        withCredentials: true,
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      };

      if (isEditMode) {
        response = await axiosInstance.put(
          `/blog/updateblog/${editBlogId}`,
          blogData,
          authRequestConfig
        );
        toast.success("Blog updated successfully!");
      } else {
        response = await axiosInstance.post(
          `/blog/addblog`,
          blogData,
          authRequestConfig
        );
        toast.success("Blog published successfully!");
      }

      if (response.data) {
        setDialogOpen(false);
        
        if (isEditMode) {
          suppressAutoSaveRef.current = true;
          navigate("/myblogs");
        } else {
          // Reset form for new blog
          setTitle("");
          setDescription("");
          setTags("");
          setCategory("General");
          setMainImage(null);
          
          // Clear editor content
          if (editorRef.current) {
            editorRef.current.commands.clearContent();
          }
        }
      }
    } catch (error) {
      console.error("Publishing error:", error);

      if (error.response?.status === 413) {
        toast.error(
          "Post is too large for the server. Try fewer or smaller images, shorten the article, or contact support."
        );
      } else if (error.response) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error || "Server error occurred";
        toast.error(`${isEditMode ? "Updating" : "Publishing"} failed: ${errorMessage}`);
      } else if (error.request) {
        // Network error
        toast.error("Network error: Please check your internet connection");
      } else {
        // Other error
        toast.error(`${isEditMode ? 'Updating' : 'Publishing'} failed: ${error.message}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const editorContent = editorRef.current ? editorRef.current.getJSON() : {};

      const draftData = {
        title: title.trim() || makeDefaultDraftTitle(),
        mainImage: mainImage || null,
        content: editorContent,
        category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        status: "draft",
        tags: tags.trim() || [],
        description: description.trim() || "No description",
      };

      const token = localStorage.getItem("token");
      const authRequestConfig = {
        withCredentials: true,
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      };

      let response;

      if (isEditMode) {
        response = await axiosInstance.put(
          `/blog/updateblog/${editBlogId}`,
          draftData,
          authRequestConfig
        );
        toast.success("Draft updated successfully!");
      } else {
        response = await axiosInstance.post(
          `/blog/addblog`,
          draftData,
          authRequestConfig
        );
        toast.success("Draft saved successfully!");
      }

      if (response.data && isEditMode) {
        suppressAutoSaveRef.current = true;
        navigate("/myblogs");
      }
      
      // Close the draft dialog after successful save
      setDraftDialogOpen(false);
    } catch (error) {
      console.error("Saving draft error:", error);
      if (error.response?.status === 413) {
        toast.error(
          "Draft is too large to save. Try fewer or smaller images or shorten the content."
        );
      } else {
        toast.error(`Failed to save draft: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleAiSuggestion = (suggestion) => {
    setAiMessage(suggestion);
  };

  const handleAiMessageSend = () => {
    if (aiMessage.trim()) {
      // Here you would typically send the message to an AI service
      // For now, we'll just show a toast
      toast.info("AI Assistant: " + aiMessage);
      setAiMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)] mt-16">
        {/* AI Assistant Sidebar */}
        <div className="w-96 bg-card border-r border-border flex flex-col text-card-foreground">
          {/* AI Header */}
          <div className="p-8 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">AI Assistant</h2>
                <p className="text-muted-foreground">Your writing companion</p>
              </div>
            </div>
          </div>

          {/* AI Content */}
          <div className="flex-1 p-8 space-y-8">
            {/* Writing Tips */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Writing Tips
              </h3>
              <div className="space-y-3">
                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleAiSuggestion(suggestion)}
                  >
                    <p className="text-sm text-foreground/90 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-border" />

            {/* AI Chat */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Ask AI
              </h3>
              <div className="space-y-3">
                <Textarea
                  placeholder="Ask me anything about your blog..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  className="min-h-[100px] text-sm bg-background border-border resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiMessageSend();
                    }
                  }}
                />
                <Button
                  onClick={handleAiMessageSend}
                  disabled={!aiMessage.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Send Message
                </Button>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-accent"
                  onClick={() => handleAiSuggestion("Generate a compelling title for my blog")}
                >
                  Generate Title
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-accent"
                  onClick={() => handleAiSuggestion("Help me improve my blog's introduction")}
                >
                  Improve Introduction
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-border text-foreground hover:bg-accent"
                  onClick={() => handleAiSuggestion("Suggest relevant tags for my blog")}
                >
                  Suggest Tags
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Section */}
        <div className="flex-1 bg-background flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-10 py-8 border-b border-border">
            <div className="flex items-center gap-6">
              {isEditMode && (
                <Button
                  variant="ghost"
                  onClick={handleNavigateAway}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditMode ? "Edit Blog" : "Write New Blog"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isEditMode ? "Make your changes and publish" : "Create something amazing"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Dialog open={draftDialogOpen} onOpenChange={setDraftDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent px-6"
                  >
                    Save Draft
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Save as Draft
                    </DialogTitle>
                    <DialogDescription>
                      Optional details for your draft. You can publish later from My blogs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="draft-title" className="text-sm font-medium">
                        Blog Title
                      </Label>
                      <Input
                        id="draft-title"
                        name="draft-title"
                        className="bg-muted/40 border-border"
                        placeholder="Enter your blog title (optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="draft-description" className="text-sm font-medium">
                        Short Description
                      </Label>
                      <Input
                        id="draft-description"
                        name="draft-description"
                        className="bg-muted/40 border-border"
                        placeholder="Enter a brief description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="draft-tags" className="text-sm font-medium">
                        Tags (Optional)
                      </Label>
                      <Input
                        id="draft-tags"
                        name="draft-tags"
                        className="bg-muted/40 border-border"
                        placeholder="Enter tags separated by commas"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="draft-category" className="text-sm font-medium">
                        Category
                      </Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value)}
                      >
                        <SelectTrigger className="w-full bg-muted/40 border-border">
                          <SelectValue placeholder="Select category"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Tech">Tech</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="gap-3">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handleSaveDraft}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isEditMode ? "Update Draft" : "Save Draft"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={isPublishing}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                  >
                    {isPublishing ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Blog" : "Publish")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Complete Your Blog Details
                    </DialogTitle>
                    <DialogDescription>
                      Add title, description, tags, and category before publishing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Blog Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        className="bg-muted/40 border-border"
                        placeholder="Enter your blog title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Short Description *
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        className="bg-muted/40 border-border"
                        placeholder="Enter a brief description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="tags" className="text-sm font-medium">
                        Tags (Optional)
                      </Label>
                      <Input
                        id="tags"
                        name="tags"
                        className="bg-muted/40 border-border"
                        placeholder="Enter tags separated by commas"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="category" className="text-sm font-medium">
                        Category *
                      </Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value)}
                      >
                        <SelectTrigger className="w-full bg-muted/40 border-border">
                          <SelectValue placeholder="Select category"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Tech">Tech</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="gap-3">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || !title.trim() || !description.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isPublishing ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Blog" : "Publish Blog")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Editor Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <SimpleEditor
              getEditorInstance={(editor) => (editorRef.current = editor)}
              onMainImageChange={handleMainImageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
