import React from 'react';

interface iProps {
  isInputBegun: boolean;
  isNameValid: boolean;
  isNameEmpty: boolean;
}

/**
 * Valid Message for input form of New item on Explorer.
 * 
 * Appearence:
 *    - Display nothing if `isInputBegun` is false.
 *    - Display nothing if `isInputBegun` and `isNameValid` are true.
 *    - Display if `isInputBegun` is false.
 * 
 * */ 
const ValidMessage = ({
  isInputBegun, isNameValid, isNameEmpty
}: iProps) => {

  const _className = "inputContainer--validSign" + " " + (isNameValid ? "__valid" : "__invalid");

  const generateStyle = () => {
    if(!isInputBegun) {
      return { display: "none" };
    }
    else if(isInputBegun && isNameValid) {
      return { display: "none" };
    }
    else if(isInputBegun && !isNameValid) {
      return { display: "block" };
    }
  };


  const generateMessage = () => {
    if(isInputBegun && isNameEmpty) return "File or folder name is must be provided.";
    if(isInputBegun && !isNameEmpty && !isNameValid) return "File or folder name is invalid.";
    if(isInputBegun && isNameEmpty) return "File or folder name is must be provided.";
  };

  return (
    <div className={_className} style={generateStyle()}>
      {generateMessage()}
    </div>
  );
};

export default ValidMessage;