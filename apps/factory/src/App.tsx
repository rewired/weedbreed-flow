import React from 'react'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'

export default function App() {
  return (
    <div className="h-screen w-screen">
      <ReactFlow nodes={[]} edges={[]} fitView>
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  )
}

