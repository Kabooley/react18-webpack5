import React from 'react';

interface iDropProps {
    droppableId: string;
    type?: string;
    children: React.ReactNode;

    onDragStart: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
 * 
 * まず、e.preventDefault()する
 * DOMはondragoverとondropを持つこと
 * 
 * */ 
const Drop: React.FC<iDropProps> = ({
    droppableId, type, children,
    onDragStart, onDragEnter, onDragLeave, onDrop, onDragOver,
    ...props
}) => {
    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            {children}
        </div>
    );
};

export default Drop;