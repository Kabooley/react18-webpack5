// interface iMessage {
//     code: string;
//     err: string;
// };

// self.onmessage = (e: MessageEvent<iMessage>) => {

//     const { code, err } = e.data;

//     if(err.length || code === undefined) return;

//     self.postMessage({
//         signal: "",
//         error: "[jsx-highlighter webworker] Error: Something went wrong but there is no signal has been sent."
//       });
      
//     self.postMessage({
//       signal: "This is jsx-highlighter webworker. I've got your message.",
//       error: ""
//     });
  
  
//     setTimeout(() => {
//       self.postMessage({
//         signal: "This is jsx-highlighter webworker. Delayed message has been sent.",
//         error: ""
//       });
//     }, 10000);
  
//     setTimeout(() => {
//       self.postMessage({
//         signal: "This is jsx-highlighter webworker. Second Delayed message has been sent.",
//         error: ""
//       });
//     }, 30000);
// };

/***
 * https://github.com/codesandbox/codesandbox-client/blob/196301c919dd032dccc08cbeb48cf8722eadd36b/packages/app/src/app/components/CodeEditor/Monaco/workers/syntax-highlighter.js
 * 
 * 
 * https://cdnjs.com/libraries/typescript
 * */ 
self.importScripts(
  'https://cdnjs.cloudflare.com/ajax/libs/typescript/5.0.4/typescript.min.js',
);

function getLineNumberAndOffset(start, lines) {
  let line = 0;
  let offset = 0;
  while (offset + lines[line] < start) {
    offset += lines[line] + 1;
    line += 1;
  }

  return { line: line + 1, offset };
}

function nodeToRange(node) {
  if (
    typeof node.getStart === 'function' &&
    typeof node.getEnd === 'function'
  ) {
    return [node.getStart(), node.getEnd()];
  } else if (
    typeof node.pos !== 'undefined' &&
    typeof node.end !== 'undefined'
  ) {
    return [node.pos, node.end];
  }
  return [0, 0];
}

function getNodeType(parent, node) {
  return Object.keys(parent).find(key => parent[key] === node);
}

function getParentRanges(node) {
  const ranges = [];
  const [start, end] = nodeToRange(node);
  let lastEnd = start;

  self.ts.forEachChild(node, child => {
    const [start, end] = nodeToRange(child);

    ranges.push({
      start: lastEnd,
      end: start,
    });
    lastEnd = end;
  });

  if (lastEnd !== end) {
    ranges.push({
      start: lastEnd,
      end,
    });
  }

  return ranges;
};

interface iClassification {
  start: number;
  end: number;
  kind: ;
  parentKind: ;
  type: ;
  startLine: ;
  endLine: ;
};

function addChildNodes(node, lines, classifications) {
  const parentKind = ts.SyntaxKind[node.kind];

  self.ts.forEachChild(node, id => {
    const type = getNodeType(node, id);

    classifications.push(
      ...getParentRanges(id).map(({ start, end }) => {
        const { offset, line: startLine } = getLineNumberAndOffset(
          start,
          lines
        );
        const { line: endLine } = getLineNumberAndOffset(end, lines);

        return {
          start: start + 1 - offset,
          end: end + 1 - offset,
          kind: ts.SyntaxKind[id.kind],
          parentKind,
          type,
          startLine,
          endLine,
        };
      })
    );

    addChildNodes(id, lines, classifications);
  });
}

// Respond to message from parent thread
self.addEventListener('message', event => {
  const { code, title, version } = event.data;
  try {
    const classifications: iClassification[] = [];
    const sourceFile = self.ts.createSourceFile(
      title,
      code,
      self.ts.ScriptTarget.ES6,
      true
    );
    const lines = code.split('\n').map(line => line.length);

    addChildNodes(sourceFile, lines, classifications);

    self.postMessage({ classifications, version });
  } catch (e) {
    /* Ignore error */
  }
});