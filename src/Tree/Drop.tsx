import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
// import type * as rdbnd from 'react-beautiful-dnd';

interface iDropProps {
    droppableId: string;
    type: string;
}

// TODO: how to pass children to this Drop compnent
const Drop = ({droppableId, type, ...props}: iDropProps) => {
    return (
        <Droppable droppableId={droppableId}>
            {(provided) => (
                <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps} 
                    {...props}
                >
                    {props.children}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default Drop;