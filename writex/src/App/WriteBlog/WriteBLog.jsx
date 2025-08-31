import React, { useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "../../components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const WriteBlog = () => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [isPublishing, setIsPublishing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleMainImageChange = React.useCallback((imageUrl) => {
    setMainImage(imageUrl);
  }, []);

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

      console.log("Publishing blog with data:", blogData);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/blog/addblog`, 
        blogData,
        { withCredentials: true }
      );

      if (response.data) {
        toast.success("Blog published successfully!");
        setDialogOpen(false);
        
        // Reset form
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
    } catch (error) {
      console.error("Publishing error:", error);
      
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || error.response.data?.error || "Server error occurred";
        toast.error(`Publishing failed: ${errorMessage}`);
      } else if (error.request) {
        // Network error
        toast.error("Network error: Please check your internet connection");
      } else {
        // Other error
        toast.error(`Publishing failed: ${error.message}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !description.trim()) {
      toast.warning("Please add at least a title or description to save as draft");
      return;
    }

    try {
      const editorContent = editorRef.current ? editorRef.current.getJSON() : {};
      
      const draftData = {
        title: title.trim() || "Untitled Draft",
        mainImage: mainImage || null,
        content: editorContent,
        category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        status: "draft",
        tags: tags.trim() || [],
        description: description.trim() || "No description",
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/blog/addblog`, 
        draftData,
        { withCredentials: true }
      );

      if (response.data) {
        toast.success("Draft saved successfully!");
      }
    } catch (error) {
      console.error("Saving draft error:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-row flex-1 min-h-0">
        <div className="w-1/2 bg-gray-300 mt-20 rounded-r-4xl">
          {/* Preview area */}
        </div>
        {/* Editor */}
        <div className="w-1/2 flex flex-col">
          <h1 className="text-center font-bold text-3xl mt-14 mb-2">
            Write Your Blog
          </h1>
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            <SimpleEditor
              getEditorInstance={(editor) => (editorRef.current = editor)}
              onMainImageChange={handleMainImageChange}
            />
            <div className="flex justify-center mt-4 mb-4 gap-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={isPublishing}
                    className="text-center"
                    onClick={() => setDialogOpen(true)}
                  >
                    {isPublishing ? "Publishing..." : "Publish Now"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[650px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-medium">
                      Complete Your Blog Details
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="title">
                        Blog Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        className="bg-gray-200"
                        placeholder="Enter your blog title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="description">
                        Short Description *
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        className="bg-gray-200"
                        placeholder="Enter a brief description of your blog"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="tags">
                        Tags (Optional)
                      </Label>
                      <Input
                        id="tags"
                        name="tags"
                        className="bg-gray-200"
                        placeholder="Enter tags separated by commas"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="category">
                        Category *
                      </Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value)}
                      >
                        <SelectTrigger className="w-full bg-gray-200">
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

                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || !title.trim() || !description.trim()}
                    >
                      {isPublishing ? "Publishing..." : "Publish Blog"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                className="text-center" 
                variant="outline"
                onClick={handleSaveDraft}
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
