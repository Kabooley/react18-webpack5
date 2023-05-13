import "./styles.css";

import path from "path";
import { createStore, set as setItem, get as getItem } from "idb-keyval";
import ts from "typescript";

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;

// self.importScripts(
//   "https://cdnjs.cloudflare.com/ajax/libs/typescript/2.4.2/typescript.min.js"
// );

const ROOT_URL = `https://cdn.jsdelivr.net/`;

const store = createStore(
  "typescript-definitions-cache-v1",
  "typescript-definitions-cache-v1"
);
const fetchCache = new Map();

/****
 * 
 *  */
const doFetch = (url) => {
  const cached = fetchCache.get(url);

  if (cached) {
    return cached;
  }

  const promise = fetch(url)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }

      const error = new Error(response.statusText || response.status);

      return Promise.reject(error);
    })
    .then((response) => response.text());

  fetchCache.set(url, promise);

  return promise;
};

/****
 * 
 *  */
const fetchFromDefinitelyTyped = (dependency, version, fetchedPaths) =>
{  
  // DEBUG:
  console.log(`[fetchFromDefinitleTyped] fetch ${ROOT_URL}npm/@types/${dependency
    .replace("@", "")
    .replace(/\//g, "__")}/index.d.ts`);

  return doFetch(
    `${ROOT_URL}npm/@types/${dependency
      .replace("@", "")
      .replace(/\//g, "__")}/index.d.ts`
  ).then((typings) => {
    fetchedPaths[`node_modules/${dependency}/index.d.ts`] = typings;
  });
};

/****
 * 
 *  */
const getRequireStatements = (title, code) => {
  const requires = [];

  const sourceFile = ts.createSourceFile(
    title,
    code,

    ts.ScriptTarget.Latest,
    true,

    ts.ScriptKind.TS
  );

  ts.forEachChild(sourceFile, (node) => {
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
 *  */
const tempTransformFiles = (files) => {
  const finalObj = {};

  files.forEach((d) => {
    finalObj[d.name] = d;
  });

  return finalObj;
};

/****
 * 
 *  */
const transformFiles = (dir) =>
  dir.files
    ? dir.files.reduce((prev, next) => {
        if (next.type === "file") {
          return { ...prev, [next.path]: next };
        }

        return { ...prev, ...transformFiles(next) };
      }, {})
    : {};

/****
 * 
 *  */
const getFileMetaData = (dependency, version, depPath) =>
  doFetch(
    `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`
  )
    .then((response) => JSON.parse(response))
    .then((response) => {
      
      // DEBUG:
      console.log("[getFileMetaData] JSON.pars(response):");
      console.log(response);

      return response.files.filter((f) => f.name.startsWith(depPath))
    })
    .then(tempTransformFiles);

/****
 * 
 *  */
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
 *  */
const getFileTypes = (
  depUrl,
  dependency,
  depPath,
  fetchedPaths,
  fileMetaData
) => {
  const virtualPath = path.join("node_modules", dependency, depPath);

  if (fetchedPaths[virtualPath]) return null;

  return doFetch(`${depUrl}/${depPath}`).then((typings) => {
    if (fetchedPaths[virtualPath]) return null;

    fetchedPaths[virtualPath] = typings;

    // Now find all require statements, so we can download those types too
    return Promise.all(
      getRequireStatements(depPath, typings)
        .filter(
          // Don't add global deps
          (dep) => dep.startsWith(".")
        )
        .map((relativePath) => path.join(path.dirname(depPath), relativePath))
        .map((relativePath) =>
          resolveAppropiateFile(fileMetaData, relativePath)
        )
        .map((nextDepPath) =>
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
 *  */
function fetchFromMeta(dependency, version, fetchedPaths) {
  const depUrl = `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`;

  // DEBUG:
  console.log(`[fetchFromMeta] fetch ${depUrl}`);

  return doFetch(depUrl)
    .then((response) => JSON.parse(response))
    .then((meta) => {
      
      // DEBUG:
      console.log(`[fetchFromMeta] meta:`);
      console.log(meta);

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

      dtsFiles.forEach((file) => {
        doFetch(`https://cdn.jsdelivr.net/npm/${dependency}@${version}${file}`)
          .then((dtsFile) => {
            fetchedPaths[`node_modules/${dependency}${file}`] = dtsFile;
          })
          .catch(() => {});
      });
    });
}

/****
 * 
 *  */
function fetchFromTypings(dependency, version, fetchedPaths) {

  const depUrl = `${ROOT_URL}npm/${dependency}@${version}`;

  // DEBUG:
  console.log(`[fetchFromTypings] fetch ${depUrl}`);

  return doFetch(`${depUrl}/package.json`)
    .then((response) => JSON.parse(response))
    .then((packageJSON) => {
      // DEBUG:
      console.log("[fetchFromTypings] packageJSON: ");
      console.log(packageJSON);

      const types = packageJSON.typings || packageJSON.types;
      if (types) {
        // Add package.json, since this defines where all types lie
        fetchedPaths[
          `node_modules/${dependency}/package.json`
        ] = JSON.stringify(packageJSON);

        // get all files in the specified directory
        return getFileMetaData(
          dependency,
          version,
          path.join("/", path.dirname(types))
        ).then((fileData) =>
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
 * 
 *  */ 
function fetchDefinitions(name, version) {
  if (!version) {
    return Promise.reject(new Error(`No version specified for ${name}`));
  }

  // DEBUG:
  console.log("[fetchDefinitions] " + name + "@ " + version);

  // Query cache for the defintions
  const key = `${name}@${version}`;

  return getItem(key, store)
    .catch((e) => {
      console.error("An error occurred when getting definitions from cache", e);
    })
    .then((result) => {
      if (result) {
        return result;
      }

      // If result is empty, fetch from remote
      const fetchedPaths = {};

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

// self.addEventListener("message", (event) => {
//   const { name, version } = event.data;

//   cl("onmessage" + name + version);

//   fetchDefinitions(name, version).then(
//     (result) =>
//
//       self.postMessage({
//         name,
//         version,
//         typings: result
//       }),
//     (error) => {
//       if (process.env.NODE_ENV !== "production") {
//         console.error(error);
//       }
//     }
//   );
// });

const _worker = (e) => {
  const { name, version } = e;

  console.log(`[_worker] ${name} ${version}`);

  return fetchDefinitions(name, version).then(
    (result) => {
      return { name, version, typings: result };
    },
    (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    }
  );
};

function mainthread() {
  console.log("Hell?");

  const results = [];

  // Fetch some definitions
  const dependencies = {
    expo: "29.0.0",
    react: "16.3.1",
    "react-native": "0.55.4"
  };

  Object.keys(dependencies).forEach((name) =>
    _worker({
      name,
      version: dependencies[name]
    })
      .then((r) => {
        console.log("solved:");
        return console.log(r);
      })
      .catch((e) => {
        console.log("Unsolved:");
        return console.error(e);
      })
  );

  console.log(results);
};

mainthread();