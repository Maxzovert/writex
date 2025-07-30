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
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("general");
  const [isPublishing, setIsPublishing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mainImage, setMainImage] = useState(null);

  // Handle mainImage changes
  React.useEffect(() => {
    console.log('Main image updated:', mainImage);
  }, [mainImage]);

  const handleMainImageChange = React.useCallback((imageUrl) => {
    console.log('Updating main image:', imageUrl);
    setMainImage(imageUrl);
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!editorRef.current) {
      toast.warning("Editor Not initailize, Please Refresh");
      return;
    }

    setIsPublishing(true);

    try {
      const editorContent = editorRef.current.getJSON(); //You use editorRef.current.getJSON() to get the entire content of the TipTap editor in structured JSON format.
      if (!title) {
        toast.warning("Please Enter Title Before Publishing");
        setIsPublishing(false);
        return;
      }
      
      console.log("Current mainImage:", mainImage);
      if (!mainImage) {
        toast.warning("Please add at least one image to your blog");
        setIsPublishing(false);
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/blog/addblog`, {
        title,
        mainImage,
        content: editorContent,
        category,
        status: "published",
      },{withCredentials:true}
  );
      toast.success("Blog published Sucessfully");
      setDialogOpen(false); // <-- Close dialog after success
    } catch (error) {
      toast.error("Error in plublishing blog", error);
    } finally {
      setIsPublishing(false);
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
                    // onClick={handlePublish}
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
                      Select Title and Catagory.
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label>
                        Title
                      </Label>
                      <Input
                        id="name-1"
                        name="name"
                        className="bg-gray-200"
                        defaultValue="Your Blog's Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <Label>
                    Select Catogory
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value)}
                  >
                    <SelectTrigger className="w-[300px] bg-gray-200">
                      <SelectValue placeholder="Select category"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                  <DialogFooter>
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing}
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="text-center" variant={"outline"}>
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
