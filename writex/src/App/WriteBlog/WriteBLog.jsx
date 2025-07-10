import React, { useRef, useState } from 'react'
import Navbar from "../Components/Navbar"
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from "../../components/ui/button"
import axios from 'axios';
import { toast } from "react-toastify";

const WriteBlog = () => {
  const editorRef = useRef(null)
  const [title, setTitle] = React.useState('')
  const [category, setCategory] = React.useState('general')
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async(e)=> {
    e.preventDefault();
    
    if(!editorRef.current){
      toast.warning("Editor Not initailize, Please Refresh");
      return;
    }
    
    setIsPublishing(true);

    try {
      const editorContent = editorRef.current.getJSON(); //You use editorRef.current.getJSON() to get the entire content of the TipTap editor in structured JSON format.
      if(!title){
        toast.warning("Please Enter Title Before Publishing")
      }
      const respnse = await axios.post('/api/blog/addblog',{
        title,
        content: editorContent,
        category,
        status : 'published'
      })
      toast.success("Blog published Sucessfully");
    } catch (error) {
      toast.error("Error in plublishing blog" , error);      
    }finally{
      setIsPublishing(false)
    }
  }

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
            <input
              type="text"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-center bg-transparent border-none focus:outline-none"
            />
          </h1>
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            <SimpleEditor getEditorInstance={(editor) => (editorRef.current = editor)} />
            <div className="flex justify-center mt-4 mb-4 gap-4">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 border rounded bg-gray-200"
              >
                <option value="general" className="rounded-md">General</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="personal">Personal</option>
              </select>
              <Button 
                onClick={handlePublish} 
                disabled={isPublishing}
                className="text-center"
              >
                {isPublishing ? 'Publishing...' : 'Publish Now'}
              </Button>
              <Button 
                className="p-2 border rounded bg-gray-200 text-black hover:text-white"
                >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WriteBlog