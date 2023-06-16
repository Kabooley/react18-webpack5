import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
// import type * as rdbnd from 'react-beautiful-dnd';

interface iDragProps {
    draggableId: string;
    index: number;
};

export const Drag = ({ draggableId, index, ...props }: iDragProps) => {
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps} {...props}>
            <div {...provided.dragHandleProps}>Drag handle</div>
            {props.children}
          </div>
        )
      }}
    </Draggable>
  )
}