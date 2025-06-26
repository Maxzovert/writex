import React, { useState } from 'react'
import Navbar from "../Components/Navbar"

const INITIAL_DATA = {
  blocks :[

  ]
}
const WriteBLog = () => {
  // const [data , setData] = useState(INITIAL_DATA);
  return (
    <div>
        <Navbar/>
      Write Blog
        {/* <Editor data={data} onChange={setData} editorBlock="editorjs"/> */}
    </div>
  )
}

export default WriteBLog;
