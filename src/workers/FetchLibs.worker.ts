type iOrder = "lint" | "tokenize" | "fetchLibs";

interface iMessage {
    order: iOrder;
};

/**
 * @property {string} name - module name like 'react' of "import React from 'react'";
 * @property {string} url? - 
 * @property {string} version - version of module to be fetched.
 * */ 
interface iMessageFetchLibs extends iMessage {
    name: string;
    version: number;
    url?: string;
};

self.onmessage = (e: MessageEvent<iMessageFetchLibs>) => {
    const { name, url, order, version } = e.data;

    if(order !== "fetchLibs") return;


};


// ---

/**
 * Worker to fetch typescript definitions for dependencies.
 * Credits to @CompuIves
 * https://github.com/CompuIves/codesandbox-client/blob/dcdb4169bcbe3e5aeaebae19ff1d45940c1af834/packages/app/src/app/components/CodeEditor/Monaco/workers/fetch-dependency-typings.js
 *
 * global ts
 * @flow
 * 
 * NOTE: self.ts  --> ts
 */

import path from 'path';
import { createStore, set as setItem, get as getItem } from 'idb-keyval';
import type * as TypeScriptType from 'typescript';

self.importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/typescript/5.0.4/typescript.min.js',
);

declare const ts: typeof TypeScriptType;

const ROOT_URL = `https://cdn.jsdelivr.net/`;

const store = createStore('typescript-definitions-cache-v1', 'typescript-definitions-cache-storename-v1');
const fetchCache = new Map();

interface iFetchedPath {
  [path: string]: string
};

// type iFetchedPath = Array<string>;
/**** 
 * 
 * */
const doFetch = (url: string): Promise<string> => {
  const cached = fetchCache.get(url);

  if (cached) {
    return cached;
  }

  const promise: Promise<string> = fetch(url)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }

      const error = new Error(response.statusText || String(response.status));

      return Promise.reject(error);
    })
    .then(response => response.text());

  fetchCache.set(url, promise);

  return promise;
};



/**** 
 * 
 * */
const fetchFromDefinitelyTyped = (dependency: string, version: string, fetchedPaths: iFetchedPath) =>
  doFetch(
    `${ROOT_URL}npm/@types/${dependency
      .replace('@', '')
      .replace(/\//g, '__')}/index.d.ts`
  ).then(typings => {
    fetchedPaths[`node_modules/${dependency}/index.d.ts`] = typings;
  });

  
/**** 
 * 
 * */
const getRequireStatements = (title: string, code: string) => {
  const requires: string[] = [];

  const sourceFile = ts.createSourceFile(
    title,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  ts.forEachChild(sourceFile, node => {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration: {
        requires.push(node.moduleSpecifier.text);
        break;
      }
      case ts.SyntaxKind.ExportDeclaration: {
        // For syntax 'export ... from '...'''
        if (node.moduleSpecifier) {
          requires.push(node.moduleSpecifier.text);
        }
        break;
      }
      default: {
        /* */
      }
    }
  });

  return requires;
};


/**** 
 * 
 * */
const tempTransformFiles = (files) => {
  const finalObj = {};

  files.forEach(d => {
    finalObj[d.name] = d;
  });

  return finalObj;
};


/**** 
 * 
 * */
const transformFiles = dir =>
  dir.files
    ? dir.files.reduce((prev, next) => {
        if (next.type === 'file') {
          return { ...prev, [next.path]: next };
        }

        return { ...prev, ...transformFiles(next) };
      }, {})
    : {};

    
/**** 
 * 
 * */
interface iFileHasName {
  name: string;
};

const getFileMetaData = (dependency: string, version: string, depPath: string) =>
  doFetch(
    `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`
  )
    .then(response => JSON.parse(response))
    .then(response => response.files.filter((f: iFileHasName) => f.name.startsWith(depPath)))
    .then(tempTransformFiles);

const resolveAppropiateFile = (fileMetaData, relativePath) => {
  const absolutePath = `/${relativePath}`;

  if (fileMetaData[`${absolutePath}.d.ts`]) return `${relativePath}.d.ts`;
  if (fileMetaData[`${absolutePath}.ts`]) return `${relativePath}.ts`;
  if (fileMetaData[absolutePath]) return relativePath;
  if (fileMetaData[`${absolutePath}/index.d.ts`])
    return `${relativePath}/index.d.ts`;

  return relativePath;
};


/**** 
 * 
 * */
const getFileTypes = (
  depUrl: string,
  dependency: string,
  depPath: string,
  fetchedPaths: iFetchedPath,
  fileMetaData: any
) => {
  const virtualPath: string = path.join('node_modules', dependency, depPath);

  // キャッシュ済なら戻る
  if (fetchedPaths.hasOwnProperty(virtualPath) && fetchedPaths[virtualPath]) return null;

  return doFetch(`${depUrl}/${depPath}`).then((typings: string) => {
    if (fetchedPaths.hasOwnProperty(virtualPath) && fetchedPaths[virtualPath]) return null;

    fetchedPaths[virtualPath] = typings;

    // Now find all require statements, so we can download those types too
    // 
    // 再帰呼び出し
    return Promise.all(
      getRequireStatements(depPath, typings)
        .filter(
          // Don't add global deps
          dep => dep.startsWith('.')
        )
        .map(relativePath => path.join(path.dirname(depPath), relativePath))
        .map(relativePath => resolveAppropiateFile(fileMetaData, relativePath))
        .map(nextDepPath =>
          getFileTypes(
            depUrl,
            dependency,
            nextDepPath,
            fetchedPaths,
            fileMetaData
          )
        )
    );
  });
};


/**** 
 * 
 * */
function fetchFromMeta(dependency: string, version: string, fetchedPaths: iFetchedPath) {
  const depUrl = `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`;

  return doFetch(depUrl)
    // JSON.parse() converts text to JS Object
    .then((response: string) => JSON.parse(response))
    // 
    .then((meta) => {
      const filterAndFlatten = (files, filter) =>
        files.reduce((paths, file) => {
          if (filter.test(file.name)) {
            paths.push(file.name);
          }
          return paths;
        }, []);

      let dtsFiles = filterAndFlatten(meta.files, /\.d\.ts$/);
      if (dtsFiles.length === 0) {
        // if no .d.ts files found, fallback to .ts files
        dtsFiles = filterAndFlatten(meta.files, /\.ts$/);
      }

      if (dtsFiles.length === 0) {
        throw new Error(`No inline typings found for ${dependency}@${version}`);
      }

      dtsFiles.forEach(file => {
        doFetch(`https://cdn.jsdelivr.net/npm/${dependency}@${version}${file}`)
          .then(dtsFile => {
            fetchedPaths[`node_modules/${dependency}${file}`] = dtsFile;
          })
          .catch(() => {});
      });
    });
}


/**** 
 * Phase 1:
 * 
 * `ROOT_URL`npm/`dependency`@`version`でモジュールをfetchする
 * 要約：
 * fetch(`https://cdn.jsdelivr.net/npm/react@18.2.0`)
 * .then(json => {
 *  fetchedPathsへjsonをキャッシュ
 *  
 * })
 * 
 * */
function fetchFromTypings(
  dependency: string, 
  version: string, 
  fetchedPaths: iFetchedPath) 
{
  const depUrl = `${ROOT_URL}npm/${dependency}@${version}`;

  return doFetch(`${depUrl}/package.json`)
    .then((response: string) => JSON.parse(response))
    // packageJSON: JS Object
    .then((packageJSON) => {
      const types = packageJSON.typings || packageJSON.types;
      if (types) {
        // Add package.json, since this defines where all types lie
        // 
        // 正しいJSONファイルだった場合、fetchedPathsへキャッシュする
        fetchedPaths[
          `node_modules/${dependency}/package.json`
        ] = JSON.stringify(packageJSON);

        // get all files in the specified directory
        // 
        // 
        return getFileMetaData(
          dependency,
          version,
          path.join('/', path.dirname(types))
        ).then(fileData =>
          getFileTypes(
            depUrl,
            dependency,
            resolveAppropiateFile(fileData, types),
            fetchedPaths,
            fileData
          )
        );
      }

      throw new Error(
        `No typings field in package.json for ${dependency}@${version}`
      );
    });
}


/**** 
 * モジュールの定義を返す大元。
 * */
function fetchDefinitions(name: string, version: string) {
  if (!version) {
    return Promise.reject(new Error(`No version specified for ${name}`));
  }

  // Query cache for the defintions
  const key: string = `${name}@${version}`;

  // get a value by its key
  return getItem(key, store)
    .catch(e => {
      console.error('An error occurred when getting definitions from cache', e);
    })
    .then((result: string) => {
      // If it's cached, then return.
      if (result) {
        return result;
      }

      // If result is empty, fetch from remote
      const fetchedPaths: iFetchedPath = {};

      /**** 
       * 
       * 
       * */ 
      return fetchFromTypings(name, version, fetchedPaths)
        .catch(() =>
          // not available in package.json, try checking meta for inline .d.ts files
          fetchFromMeta(name, version, fetchedPaths)
        )
        .catch(() =>
          // Not available in package.json or inline from meta, try checking in @types/
          fetchFromDefinitelyTyped(name, version, fetchedPaths)
        )
        .then(() => {
          if (Object.keys(fetchedPaths).length) {
            // Also cache the definitions
            setItem(key, fetchedPaths, store);

            return fetchedPaths;
          } else {
            throw new Error(`Type definitions are empty for ${key}`);
          }
        });
    });
}

self.addEventListener('message', event => {
  const { name, version } = event.data;

  fetchDefinitions(name, version).then(
    (result: string) =>
      self.postMessage({
        name,
        version,
        typings: result,
      }),
    (error: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
    }
  );
});
