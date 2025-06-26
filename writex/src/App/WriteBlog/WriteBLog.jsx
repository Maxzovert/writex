import React from 'react'
import Navbar from "../Components/Navbar"
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from "../../components/ui/button"

const WriteBLog = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-row flex-1 min-h-0">
        <div className="w-1/2 bg-gray-300 mt-20 rounded-r-4xl">

        </div>
        {/* Editor */}
        <div className="w-1/2 flex flex-col">
          <h1 className="text-center font-bold text-3xl mt-5 mb-2">Start Writing</h1>
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            <SimpleEditor />
            <div className="flex justify-center mt-4 mb-4">
              <Button className="text-center">Publish Now</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WriteBLog;
