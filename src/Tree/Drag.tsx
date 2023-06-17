import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
// import type * as rdbnd from 'react-beautiful-dnd';

interface iDragProps {
    draggableId: string;
    index: number;
    children: React.ReactNode;
};

const Drag: React.FC<iDragProps> = ({ draggableId, index, ...props }) => {
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} 
            {...provided.draggableProps} 
            {...provided.dragHandleProps}
            {...props}
          >
            {/* <div {...provided.dragHandleProps}>Drag handle</div> */}
            {props.children}
          </div>
        )
      }}
    </Draggable>
  );
};

export default Drag;