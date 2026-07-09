import React, { useRef, useState, useEffect, useCallback } from "react";
import Navbar from "../Components/Navbar";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "../../components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "../../lib/axiosConfig";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  PanelLeftOpen,
  PanelLeftClose,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  PenLine,
  Code2,
  Type,
} from "lucide-react";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { HtmlCanvasEditor } from "@/components/write/HtmlCanvasEditor";
import { applyHtmlToEditor, getHtmlFromEditor } from "@/lib/sync-editor-html";
import { useAuth } from "../../context/authContext";
import { BookmarkSidebar } from "@/components/bookmarks/BookmarkSidebar";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { getAnchorFromEditor, migrateBookmarks } from "@/lib/bookmarks";
import "@/components/bookmarks/bookmarks.scss";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

const AUTO_SAVE_DELAY_MS = 1000;
const DRAFT_BACKUP_KEY = "writex_draft_backup";
const DRAFT_BACKUP_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const PRIVATE_BLOG_STATUSES = ["published", "personal"];

const EMPTY_EDITOR_CONTENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const parseBlogContent = (content) => {
  if (!content) return EMPTY_EDITOR_CONTENT;
  try {
    return typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    if (typeof content === "string") {
      return {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
      };
    }
    return EMPTY_EDITOR_CONTENT;
  }
};

const normalizeTags = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
};

const isEditorContentEmpty = (content) => {
  if (!content || content.type !== "doc") return true;
  if (!content.content || content.content.length === 0) return true;
  if (content.content.length === 1) {
    const node = content.content[0];
    if (node.type === "paragraph" && (!node.content || node.content.length === 0)) {
      return true;
    }
  }
  return false;
};

const formatCategory = (category) =>
  category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

const isMeaningfulSnapshot = (snapshot) => {
  if (!snapshot) return false;
  return Boolean(
    (snapshot.title?.trim() && snapshot.title !== "Untitled Draft") ||
    (snapshot.description?.trim() && snapshot.description !== "No description") ||
    !isEditorContentEmpty(snapshot.content)
  );
};

const persistDraftBackup = (snapshot, editBlogId) => {
  if (!isMeaningfulSnapshot(snapshot)) return;
  localStorage.setItem(
    DRAFT_BACKUP_KEY,
    JSON.stringify({ snapshot, editBlogId, savedAt: Date.now() })
  );
};

const clearDraftBackup = () => {
  localStorage.removeItem(DRAFT_BACKUP_KEY);
};

const saveDraftWithKeepalive = (draftData, editBlogId) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = editBlogId
    ? `${baseUrl}/blog/updateblog/${editBlogId}`
    : `${baseUrl}/blog/addblog`;

  fetch(url, {
    method: editBlogId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(draftData),
    keepalive: true,
    credentials: "include",
  }).catch(() => {
    // Best-effort save while the page is closing
  });
};

const WriteBlog = () => {
  const editorRef = useRef(null);
  const { user } = useAuth();
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
  const [editorRevision, setEditorRevision] = useState(0);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [editorInitialContent, setEditorInitialContent] = useState(EMPTY_EDITOR_CONTENT);
  const [editorSessionKey, setEditorSessionKey] = useState("new");
  const [publishStatus, setPublishStatus] = useState("published");
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [aiMessage, setAiMessage] = useState("");
  const [canvasMode, setCanvasMode] = useState("normal");
  const [htmlSource, setHtmlSource] = useState("");
  const htmlSourceRef = useRef("");
  const bookmarkDocumentId = editBlogId ? `blog-${editBlogId}` : "write-new-draft";
  const userId = user?._id || user?.id;
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    goToBookmark,
  } = useBookmarks(userId, bookmarkDocumentId);

  useEffect(() => {
    if (editBlogId && userId) {
      migrateBookmarks(userId, "write-new-draft", `blog-${editBlogId}`);
    }
  }, [editBlogId, userId]);

  const handleBookmarkAdd = (color) => {
    const editor = editorRef.current;
    if (!editor) return;
    const result = getAnchorFromEditor(editor);
    if (!result) {
      toast.warning("Select text to bookmark");
      return;
    }
    addBookmark(result.anchor, color, result.label);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setAiPanelOpen(false);
    }
  }, []);

  const { isFocusMode, toggleFocusMode } = useFocusMode();

  const handleToggleFocusMode = () => {
    if (!isFocusMode) {
      setAiPanelOpen(false);
    }
    toggleFocusMode();
  };
  const [aiSuggestions, setAiSuggestions] = useState([
    "Improve your blog title to be more engaging",
    "Add more descriptive content to your introduction",
    "Consider adding relevant images to support your points",
    "Break down complex ideas into smaller paragraphs",
    "End with a strong conclusion that summarizes your main points"
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const lastSavedSnapshotRef = useRef(null);
  const autoSaveReadyRef = useRef(false);
  const isSavingRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  const latestSnapshotRef = useRef(null);
  const editBlogIdRef = useRef(null);
  const formStateRef = useRef({
    title: "",
    description: "",
    tags: "",
    category: "General",
    mainImage: null,
  });

  useEffect(() => {
    editBlogIdRef.current = editBlogId;
  }, [editBlogId]);

  useEffect(() => {
    formStateRef.current = { title, description, tags, category, mainImage };
  }, [title, description, tags, category, mainImage]);

  useEffect(() => {
    htmlSourceRef.current = htmlSource;
  }, [htmlSource]);

  const resolveEditorContent = useCallback(() => {
    const editor = editorRef.current;
    if (canvasMode === "html" && editor) {
      applyHtmlToEditor(editor, htmlSourceRef.current, { emitUpdate: false });
    }
    return editor?.getJSON() ?? EMPTY_EDITOR_CONTENT;
  }, [canvasMode]);

  const handleMainImageChange = React.useCallback((imageUrl) => {
    setMainImage(imageUrl);
  }, []);

  const getLiveSnapshot = useCallback(() => {
    const editorContent = resolveEditorContent();
    const { title: t, description: d, tags: tg, category: c, mainImage: img } = formStateRef.current;
    return {
      title: t.trim() || "Untitled Draft",
      mainImage: img || null,
      content: editorContent,
      category: formatCategory(c),
      tags: tg.trim(),
      description: d.trim() || "No description",
    };
  }, [resolveEditorContent]);

  const handleEditorContentChange = useCallback(() => {
    setEditorRevision((revision) => revision + 1);
    if (autoSaveReadyRef.current) {
      const snapshot = getLiveSnapshot();
      latestSnapshotRef.current = snapshot;
      persistDraftBackup(snapshot, editBlogIdRef.current);
    }
  }, [getLiveSnapshot]);

  const buildDraftSnapshot = useCallback(() => getLiveSnapshot(), [getLiveSnapshot]);

  const snapshotsMatch = useCallback((left, right) => {
    if (!left || !right) return false;
    return (
      left.title === right.title &&
      left.mainImage === right.mainImage &&
      left.category === right.category &&
      left.tags === right.tags &&
      left.description === right.description &&
      JSON.stringify(left.content) === JSON.stringify(right.content)
    );
  }, []);

  const hasMeaningfulContent = useCallback(() => {
    if (canvasMode === "html") {
      return Boolean(title.trim() || description.trim() || htmlSourceRef.current.trim());
    }
    const editorContent = editorRef.current?.getJSON() ?? EMPTY_EDITOR_CONTENT;
    return Boolean(title.trim() || description.trim() || !isEditorContentEmpty(editorContent));
  }, [title, description, editorRevision, canvasMode, htmlSource]);

  const handleHtmlSourceChange = useCallback((value) => {
    setHtmlSource(value);
    htmlSourceRef.current = value;
    setEditorRevision((revision) => revision + 1);
    if (autoSaveReadyRef.current) {
      const editor = editorRef.current;
      if (editor) {
        applyHtmlToEditor(editor, value, { emitUpdate: false });
      }
      const snapshot = getLiveSnapshot();
      latestSnapshotRef.current = snapshot;
      persistDraftBackup(snapshot, editBlogIdRef.current);
    }
  }, [getLiveSnapshot]);

  const handleCanvasModeChange = useCallback((nextMode) => {
    if (nextMode === canvasMode) return;

    if (nextMode === "html") {
      const exportedHtml = getHtmlFromEditor(editorRef.current);
      setHtmlSource(exportedHtml);
      htmlSourceRef.current = exportedHtml;
      setCanvasMode("html");
      return;
    }

    const result = applyHtmlToEditor(editorRef.current, htmlSourceRef.current, {
      emitUpdate: true,
    });

    if (!result.ok && htmlSourceRef.current.trim()) {
      toast.error("Could not parse HTML. Fix the markup before switching to Normal.");
      return;
    }

    setCanvasMode("normal");
    setEditorRevision((revision) => revision + 1);
    handleEditorContentChange();
  }, [canvasMode, handleEditorContentChange]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setCategory("General");
    setMainImage(null);
    setIsEditMode(false);
    setEditBlogId(null);
    editBlogIdRef.current = null;
    setOriginalStatus("draft");
    setPublishStatus("published");
    setAiMessage("");
    setEditorInitialContent(EMPTY_EDITOR_CONTENT);
    setEditorSessionKey("new");
    setSaveStatus("idle");
    lastSavedSnapshotRef.current = null;
    autoSaveReadyRef.current = false;
    latestSnapshotRef.current = null;
    clearDraftBackup();
    setCanvasMode("normal");
    setHtmlSource("");
    htmlSourceRef.current = "";
    
    if (editorRef.current) {
      editorRef.current.commands.clearContent();
    }
  };

  const hasUnsavedChanges = useCallback(() => {
    const currentSnapshot = buildDraftSnapshot();

    if (lastSavedSnapshotRef.current) {
      return !snapshotsMatch(currentSnapshot, lastSavedSnapshotRef.current);
    }

    return hasMeaningfulContent();
  }, [buildDraftSnapshot, snapshotsMatch, hasMeaningfulContent]);

  const performDraftSave = useCallback(async ({ silent = false, navigateAfter = false } = {}) => {
    if (!hasMeaningfulContent()) {
      if (!silent) {
        toast.warning("Please add at least a title or description to save as draft");
      }
      return false;
    }

    const draftSnapshot = buildDraftSnapshot();
    if (snapshotsMatch(draftSnapshot, lastSavedSnapshotRef.current)) {
      if (!silent) {
        toast.info("Draft is already up to date");
      }
      setSaveStatus("saved");
      return true;
    }

    if (isSavingRef.current) {
      return false;
    }

    const currentBlogId = editBlogIdRef.current;

    isSavingRef.current = true;
    setSaveStatus("saving");

    const draftData = {
      ...draftSnapshot,
      status: "draft",
      tags: draftSnapshot.tags || [],
    };

    try {
      let response;

      if (currentBlogId) {
        response = await axiosInstance.put(
          `/blog/updateblog/${currentBlogId}`,
          draftData,
          { withCredentials: true }
        );
        if (!silent) {
          toast.success("Draft updated successfully!");
        }
      } else {
        response = await axiosInstance.post(
          `/blog/addblog`,
          draftData,
          { withCredentials: true }
        );
        const newBlogId = response.data?.post?._id;
        if (newBlogId) {
          editBlogIdRef.current = newBlogId;
          setEditBlogId(newBlogId);
          setIsEditMode(true);
        }
        if (!silent) {
          toast.success("Draft saved successfully!");
        }
      }

      lastSavedSnapshotRef.current = draftSnapshot;
      const savedBlogId = editBlogIdRef.current ?? response.data?.post?._id;
      persistDraftBackup(draftSnapshot, savedBlogId);
      setSaveStatus("saved");

      if (navigateAfter) {
        navigate("/myblogs");
      }

      if (!silent) {
        setDraftDialogOpen(false);
      }

      return true;
    } catch (error) {
      console.error("Saving draft error:", error);
      setSaveStatus("error");
      if (!silent) {
        toast.error(`Failed to save draft: ${error.response?.data?.message || error.message}`);
      }
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [
    buildDraftSnapshot,
    snapshotsMatch,
    hasMeaningfulContent,
    editBlogId,
    navigate,
  ]);

  const handleSaveDraft = async () => {
    await performDraftSave({ silent: false, navigateAfter: Boolean(editBlogId) });
  };

  const flushPendingSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    performDraftSave({ silent: true });
  }, [performDraftSave]);

  const emergencyFlushSave = useCallback(() => {
    if (!autoSaveReadyRef.current) return;

    const snapshot = getLiveSnapshot();
    if (!isMeaningfulSnapshot(snapshot)) return;

    // Always write to localStorage synchronously so tab close never loses data
    persistDraftBackup(snapshot, editBlogIdRef.current);
    latestSnapshotRef.current = snapshot;

    if (snapshotsMatch(snapshot, lastSavedSnapshotRef.current)) return;

    const draftData = {
      ...snapshot,
      status: "draft",
      tags: snapshot.tags || [],
    };

    if (!isSavingRef.current) {
      saveDraftWithKeepalive(draftData, editBlogIdRef.current);
    }
  }, [getLiveSnapshot, snapshotsMatch]);

  const handleCancelEdit = () => {
    if (hasUnsavedChanges()) {
      if (window.confirm("You have unsaved changes. Save your draft first, or leave anyway?")) {
        resetForm();
        navigate("/myblogs");
      }
    } else {
      resetForm();
      navigate("/myblogs");
    }
  };

  const handleNavigateAway = () => {
    if (hasUnsavedChanges()) {
      if (window.confirm("You have unsaved changes. Save your draft first, or leave anyway?")) {
        resetForm();
        navigate("/myblogs");
      }
    } else {
      navigate("/myblogs");
    }
  };

  const handleNewBlog = () => {
    if (hasUnsavedChanges()) {
      if (
        !window.confirm(
          "Start a new blog? Save your draft first, or continue to discard unsaved changes."
        )
      ) {
        return;
      }
    }
    resetForm();
    autoSaveReadyRef.current = true;
    navigate("/write", { replace: true, state: {} });
  };

  // Restore a local backup when reopening after an accidental close
  useEffect(() => {
    if (location.state?.editBlog) return;

    const backupRaw = localStorage.getItem(DRAFT_BACKUP_KEY);
    if (!backupRaw) {
      autoSaveReadyRef.current = true;
      return;
    }

    try {
      const { snapshot, editBlogId: backupBlogId, savedAt } = JSON.parse(backupRaw);
      if (!snapshot || Date.now() - savedAt > DRAFT_BACKUP_MAX_AGE_MS) {
        clearDraftBackup();
        autoSaveReadyRef.current = true;
        return;
      }

      setTitle(snapshot.title === "Untitled Draft" ? "" : snapshot.title);
      setDescription(snapshot.description === "No description" ? "" : snapshot.description);
      setTags(snapshot.tags || "");
      setCategory(snapshot.category || "General");
      setMainImage(snapshot.mainImage || null);
      setEditorInitialContent(snapshot.content || EMPTY_EDITOR_CONTENT);
      setEditorSessionKey(backupBlogId || "restored");

      if (backupBlogId) {
        editBlogIdRef.current = backupBlogId;
        setEditBlogId(backupBlogId);
        setIsEditMode(true);
      }

      latestSnapshotRef.current = snapshot;
      lastSavedSnapshotRef.current = null;
      autoSaveReadyRef.current = true;
      setSaveStatus("saved");
      toast.info("Restored your draft from the last session");
    } catch (error) {
      console.error("Failed to restore draft backup:", error);
      clearDraftBackup();
      autoSaveReadyRef.current = true;
    }
  }, [location.state?.editBlog?._id]);

  // Handle edit mode when component mounts
  useEffect(() => {
    const editBlog = location.state?.editBlog;
    if (!editBlog) {
      return;
    }

    autoSaveReadyRef.current = false;
    clearDraftBackup();
    const parsedContent = parseBlogContent(editBlog.content);

    setIsEditMode(true);
    setEditBlogId(editBlog._id);
    setTitle(editBlog.title || "");
    setCategory(editBlog.category || "General");
    setMainImage(editBlog.mainImage || null);
    setDescription(editBlog.description || "");
    setTags(normalizeTags(editBlog.tags));
    setOriginalStatus(editBlog.status || "draft");
    setPublishStatus(
      PRIVATE_BLOG_STATUSES.includes(editBlog.status) ? editBlog.status : "published"
    );
    setEditorInitialContent(parsedContent);
    setEditorSessionKey(editBlog._id);

    const readyTimer = setTimeout(() => {
      lastSavedSnapshotRef.current = {
        title: editBlog.title?.trim() || "Untitled Draft",
        mainImage: editBlog.mainImage || null,
        content: parsedContent,
        category: formatCategory(editBlog.category || "General"),
        tags: normalizeTags(editBlog.tags),
        description: editBlog.description?.trim() || "No description",
      };
      autoSaveReadyRef.current = true;
      setSaveStatus("saved");
    }, 150);

    return () => clearTimeout(readyTimer);
  }, [location.state?.editBlog?._id]);

  // Keep local backup in sync on every change (instant, not debounced)
  useEffect(() => {
    if (!autoSaveReadyRef.current) return;

    const snapshot = getLiveSnapshot();
    latestSnapshotRef.current = snapshot;

    if (isMeaningfulSnapshot(snapshot)) {
      persistDraftBackup(snapshot, editBlogIdRef.current);
    }
  }, [title, description, tags, category, mainImage, editorRevision, getLiveSnapshot, editBlogId]);

  // Debounced auto-save while writing (1s after typing stops)
  useEffect(() => {
    if (!autoSaveReadyRef.current || isPublishing) {
      return;
    }

    if (!hasMeaningfulContent()) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performDraftSave({ silent: true });
      autoSaveTimerRef.current = null;
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [
    title,
    description,
    tags,
    category,
    mainImage,
    editorRevision,
    isPublishing,
    hasMeaningfulContent,
    performDraftSave,
  ]);

  // Save when the tab is hidden; warn before closing if changes are not saved
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushPendingSave();
        emergencyFlushSave();
      }
    };

    const handlePageHide = () => {
      emergencyFlushSave();
    };

    const handleBeforeUnload = (e) => {
      emergencyFlushSave();

      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Please save your draft before leaving.";
        return e.returnValue;
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushPendingSave, emergencyFlushSave, hasUnsavedChanges]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        if (window.confirm("You have unsaved changes. Save your draft first, or leave anyway?")) {
          resetForm();
          navigate("/myblogs");
        } else {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges, navigate]);

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
      const editorContent = resolveEditorContent();
      
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
        category: formatCategory(category),
        status: publishStatus,
        tags: tags.trim() || [],
        description: description.trim(),
      };

      let response;
      
      if (editBlogId) {
        response = await axiosInstance.put(
          `/blog/updateblog/${editBlogId}`,
          blogData,
          { withCredentials: true }
        );
        toast.success(
          publishStatus === "personal"
            ? "Personal blog updated successfully!"
            : "Blog updated successfully!"
        );
      } else {
        response = await axiosInstance.post(
          `/blog/addblog`,
          blogData,
          { withCredentials: true }
        );
        toast.success(
          publishStatus === "personal"
            ? "Personal blog saved successfully!"
            : "Blog published successfully!"
        );
      }

      if (response.data) {
        clearDraftBackup();
        setDialogOpen(false);
        
        if (isEditMode) {
          // Navigate back to MyBlog page after successful edit
          navigate("/myblogs");
        } else {
          // Reset form for new blog
          setTitle("");
          setDescription("");
          setTags("");
          setCategory("General");
          setMainImage(null);
          lastSavedSnapshotRef.current = null;
          setSaveStatus("idle");
          
          // Clear editor content
          if (editorRef.current) {
            editorRef.current.commands.clearContent();
          }
        }
      }
    } catch (error) {
      console.error("Publishing error:", error);
      
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || error.response.data?.error || "Server error occurred";
        toast.error(`${isEditMode ? 'Updating' : 'Publishing'} failed: ${errorMessage}`);
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

  const renderCategorySelect = () => (
    <Select value={category} onValueChange={(value) => setCategory(value)}>
      <SelectTrigger className="w-full bg-gray-50 border-gray-300">
        <SelectValue placeholder="Select category" />
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
  );

  const saveStatusConfig = {
    saving: {
      label: "Saving draft...",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Loader2,
    },
    saved: {
      label: "Draft saved",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    error: {
      label: "Save failed",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
    },
  };

  const currentSaveStatus = saveStatusConfig[saveStatus];

  return (
    <div
      className={
        isFocusMode
          ? "fixed inset-0 z-[60] flex flex-col overflow-hidden bg-white"
          : "flex h-screen flex-col overflow-hidden bg-gray-50"
      }
    >
      {!isFocusMode && <Navbar />}

      <div
        className={
          isFocusMode
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden px-4 pb-4 pt-4 sm:px-6"
        }
      >
        <div
          className={
            isFocusMode
              ? "flex min-h-0 flex-1 overflow-hidden"
              : "flex min-h-0 flex-1 gap-4 overflow-hidden lg:gap-5"
          }
        >
          {/* Mobile AI overlay */}
          {!isFocusMode && aiPanelOpen && (
            <button
              type="button"
              aria-label="Close AI panel"
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
              onClick={() => setAiPanelOpen(false)}
            />
          )}

          {/* AI Assistant Sidebar */}
          {!isFocusMode && (
          <aside
            className={`
              fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2rem,20rem)] flex-col overflow-hidden
              border border-gray-200 bg-white shadow-xl transition-transform duration-300
              lg:relative lg:z-0 lg:w-72 lg:shrink-0 lg:rounded-2xl lg:shadow-sm
              ${aiPanelOpen ? "translate-x-4" : "-translate-x-[110%] lg:translate-x-0"}
              ${!aiPanelOpen ? "lg:hidden" : ""}
              top-[5.5rem] bottom-4 rounded-2xl lg:top-auto lg:bottom-auto lg:h-auto
            `}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 shadow-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">AI Assistant</h2>
                  <p className="text-xs text-gray-500">Writing companion</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setAiPanelOpen(false)}
                aria-label="Close panel"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Writing tips</h3>
                <div className="space-y-2">
                  {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100"
                      onClick={() => handleAiSuggestion(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Ask AI</h3>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Ask about your blog..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    className="min-h-[88px] resize-none border-gray-200 bg-white text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAiMessageSend();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAiMessageSend}
                    disabled={!aiMessage.trim()}
                    className="w-full bg-gray-900 text-white hover:bg-gray-800"
                    size="sm"
                  >
                    Send
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick actions</h3>
                <div className="space-y-2">
                  {[
                    ["Generate Title", "Generate a compelling title for my blog"],
                    ["Improve Intro", "Help me improve my blog's introduction"],
                    ["Suggest Tags", "Suggest relevant tags for my blog"],
                  ].map(([label, prompt]) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-gray-200 text-gray-700"
                      onClick={() => handleAiSuggestion(prompt)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          )}

          {/* Editor Section */}
          <main
            className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white ${
              isFocusMode
                ? "rounded-none border-0 shadow-none"
                : "rounded-2xl border border-gray-200 shadow-sm"
            }`}
          >
            {/* Fixed header — writing area below scrolls independently */}
            <header className="z-20 shrink-0 border-b border-gray-100 bg-white px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  {!isFocusMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-gray-600 hover:bg-gray-100"
                      onClick={() => setAiPanelOpen((open) => !open)}
                      aria-label={aiPanelOpen ? "Hide AI panel" : "Show AI panel"}
                    >
                      {aiPanelOpen ? (
                        <PanelLeftClose className="h-4 w-4" />
                      ) : (
                        <PanelLeftOpen className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  {!isFocusMode && (isEditMode || hasMeaningfulContent()) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={isEditMode ? handleNavigateAway : () => navigate("/myblogs")}
                      className="h-8 w-8 shrink-0 text-gray-600 hover:bg-gray-100"
                      aria-label="Back"
                      title="Back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="min-w-0 flex-1 md:flex-none">
                    <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                      {isEditMode ? "Edit Blog" : "Write New Blog"}
                    </h1>
                    <p className="hidden text-xs text-gray-500 lg:block">
                      {isFocusMode
                        ? "Fullscreen writing · Press Esc to exit"
                        : isEditMode
                          ? "Update and publish your post"
                          : "Draft auto-saves as you type"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
                  <div className="mr-1 flex items-center rounded-lg border border-gray-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => handleCanvasModeChange("normal")}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        canvasMode === "normal"
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title="Visual editor"
                    >
                      <Type className="h-3.5 w-3.5" />
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCanvasModeChange("html")}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        canvasMode === "html"
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title="Full HTML source editor"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      HTML
                    </button>
                  </div>

                  {currentSaveStatus && (
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${currentSaveStatus.className}`}
                      title={currentSaveStatus.label}
                      aria-label={currentSaveStatus.label}
                    >
                      <currentSaveStatus.icon
                        className={`h-4 w-4 ${saveStatus === "saving" ? "animate-spin" : ""}`}
                      />
                    </span>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 border-gray-200"
                    onClick={handleNewBlog}
                    title="New blog"
                    aria-label="New blog"
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 border-gray-200"
                    onClick={handleToggleFocusMode}
                    title={isFocusMode ? "Exit fullscreen (Esc)" : "Enter fullscreen writing mode"}
                    aria-label={isFocusMode ? "Exit focus mode" : "Focus mode"}
                  >
                    {isFocusMode ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>

                  <Dialog open={draftDialogOpen} onOpenChange={setDraftDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0 border-gray-200 px-2.5 text-xs sm:px-3 sm:text-sm"
                      >
                        <span className="sm:hidden">Draft</span>
                        <span className="hidden sm:inline">Save Draft</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[560px]">
                      <DialogHeader>
                        <DialogTitle>Save as Draft</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="draft-title">Blog Title</Label>
                          <Input
                            id="draft-title"
                            placeholder="Enter your blog title (optional)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="draft-description">Short Description</Label>
                          <Input
                            id="draft-description"
                            placeholder="Enter a brief description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="draft-tags">Tags (Optional)</Label>
                          <Input
                            id="draft-tags"
                            placeholder="Enter tags separated by commas"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="draft-category">Category</Label>
                          {renderCategorySelect()}
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSaveDraft} className="bg-gray-900 text-white hover:bg-gray-800">
                          {isEditMode ? "Update Draft" : "Save Draft"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        disabled={isPublishing}
                        size="sm"
                        className="h-8 shrink-0 bg-gray-900 px-3 text-xs text-white hover:bg-gray-800 sm:text-sm"
                      >
                        {isPublishing
                          ? isEditMode
                            ? "Updating..."
                            : "Publishing..."
                          : isEditMode
                            ? "Update"
                            : "Publish"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[560px]">
                      <DialogHeader>
                        <DialogTitle>Complete Your Blog Details</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">Blog Title *</Label>
                          <Input
                            id="title"
                            placeholder="Enter your blog title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Short Description *</Label>
                          <Input
                            id="description"
                            placeholder="Enter a brief description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tags">Tags (Optional)</Label>
                          <Input
                            id="tags"
                            placeholder="Enter tags separated by commas"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category *</Label>
                          {renderCategorySelect()}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="visibility">Visibility</Label>
                          <Select value={publishStatus} onValueChange={setPublishStatus}>
                            <SelectTrigger className="w-full bg-gray-50 border-gray-300">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="personal">Personal (private)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          onClick={handlePublish}
                          disabled={isPublishing || !title.trim() || !description.trim()}
                          className="bg-gray-900 text-white hover:bg-gray-800"
                        >
                          {isPublishing
                            ? isEditMode
                              ? "Updating..."
                              : "Publishing..."
                            : isEditMode
                              ? publishStatus === "personal"
                                ? "Update Personal"
                                : "Update Blog"
                              : publishStatus === "personal"
                                ? "Save Personal"
                                : "Publish Blog"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </header>

            {/* Editor */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
              <div
                className={
                  canvasMode === "html"
                    ? "hidden"
                    : "flex min-h-0 flex-1 flex-col overflow-hidden"
                }
                aria-hidden={canvasMode === "html"}
              >
                <SimpleEditor
                  key={editorSessionKey}
                  className="min-h-0 flex-1"
                  wide={isFocusMode}
                  getEditorInstance={(editor) => (editorRef.current = editor)}
                  onMainImageChange={handleMainImageChange}
                  initialContent={editorInitialContent}
                  onContentChange={handleEditorContentChange}
                  bookmarks={bookmarks}
                  onBookmarkAdd={handleBookmarkAdd}
                />
              </div>

              {canvasMode === "html" && (
                <HtmlCanvasEditor
                  value={htmlSource}
                  onChange={handleHtmlSourceChange}
                  wide={isFocusMode}
                  className="min-h-0 flex-1"
                />
              )}
            </div>
          </main>

          {!isFocusMode && canvasMode === "normal" && (
            <aside className="hidden w-72 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:flex xl:flex-col">
              <BookmarkSidebar
                variant="panel"
                bookmarks={bookmarks}
                onSelect={goToBookmark}
                onRemove={removeBookmark}
              />
            </aside>
          )}

          {isFocusMode && canvasMode === "normal" && (
            <aside className="hidden w-72 shrink-0 overflow-hidden border-l border-border bg-card lg:flex lg:flex-col">
              <BookmarkSidebar
                variant="panel"
                bookmarks={bookmarks}
                onSelect={goToBookmark}
                onRemove={removeBookmark}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
