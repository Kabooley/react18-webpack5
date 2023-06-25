import React from 'react';

interface iDragProps {
    index: number;
    children: React.ReactNode;

    id: string;
    isDraggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
};

const DragNDrop: React.FC<iDragProps> = ({ 
  id, index, isDraggable,
  onDragStart, onDragEnter, onDragLeave, onDrop,
  ...props 
}) => {
  return (
    <div 
      draggable={isDraggable}
      key={index}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {props.children}
    </div>
  );
};

export default DragNDrop;