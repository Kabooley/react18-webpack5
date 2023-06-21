import React from 'react';
import { StrictModeDroppable } from '../strictMode/StrictModeDroppable';
// import { Droppable } from 'react-beautiful-dnd';
// import type * as rdbnd from 'react-beautiful-dnd';

interface iDropProps {
    droppableId: string;
    type?: string;
    children: React.ReactNode;
};

const Drop: React.FC<iDropProps> = ({droppableId, type, children, ...props}) => {
    return (
        <StrictModeDroppable droppableId={droppableId}>
            {(provided) => (
                <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps} 
                    {...props}
                >
                    {children}
                    {provided.placeholder}
                </div>
            )}
        </StrictModeDroppable>
    );
};

export default Drop;