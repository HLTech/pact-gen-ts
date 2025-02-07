# Pact-gen-ts

Pact-gen-ts is a tool for generating contracts using TypeScript type definitions and custom JSDoc tags.

It's an alternative to the [pact-js](https://github.com/pact-foundation/pact-js) package but without the necessity for writing separate tests.
It provides automated, low maintenance and more flexible way to generate contracts according to [Pact specification version 2](https://github.com/pact-foundation/pact-specification).

## Installation and usage

You can install pact-gen-ts using npm:

```bash
npm install pact-gen-ts --save-dev
```

or yarn:

```bash
yarn add --dev pact-gen-ts
```

Next you should create a minimal `pacts.config.js` or `pacts.config.cjs` configuration file in the root directory:

```js
module.exports = {
    consumer: 'consumer-name',
    providers: [
        {
            provider: 'some-provider',
            files: ['src/api/**/*.ts'],
        },
    ],
};
```

where `files` property will be an array of glob patterns pointing to API functions definitions.

After that pact-gen-ts is ready, now you need to mark all API functions which will be analysed:

```ts
/**
 * @pact
 */
function fetchComments() {
    // ...
}
```

The last thing is to execute the command:

```bash
pact-gen-ts
```

which does the analysis and generates pacts in JSON format inside (by default) `./pacts` directory.

## Compatibility with TypeScript

Due to TypeScript's occasional changes to its compiler API and not following semantic versioning in their releases, the latest versions of pact-gen-ts can only guarantee compatibility with the latest versions of TypeScript.

If you're limited to historical versions of TypeScript, you should install a corresponding version of pact-gen-ts. The below table presents what TS versions pact-gen-ts will work with:

| pact-gen-ts     | TypeScript |
| --------------- | ---------- |
| 0.8             | 4.1 - 4.2  |
| 0.9 - 0.9.3     | 4.5 - 4.6  |
| 0.9.4 - 0.10.0  | 4.7 - 4.8  |
| 0.11.0          | 4.9        |
| 0.12.0          | 5.0        |
| 0.13.0          | 5.1        |
| 0.14.0          | 5.2 - 5.3  |
| 0.15.0          | 5.4        |
| 0.16.0          | 5.5 - 5.6  |
| 0.17.0 - 0.18.0 | \>=5.7     |

## Configuration

Pact-gen-ts uses configuration stored in `pacts.config.js` file in project's root directory:

```js
module.exports = {
    consumer: 'consumer-name',
    buildDir: 'pacts',
    verbose: true,
    providers: [
        {
            provider: 'provider-name',
            files: ['src/api/firstProvider/*.ts'],
            queryArrayFormat: 'indices',
            requestHeaders: {
                authorization: 'auth',
            },
            responseHeaders: {
                'Content-Type': 'application/json',
            },
        },
    ],
};
```

### Options

| Option                         | Required |   Default    | Description                                                                                                                                                                                          |
| ------------------------------ | :------: | :----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `consumer`                     |   Yes    |      -       | Consumer's name                                                                                                                                                                                      |
| `providers[].provider`         |   Yes    |      -       | Provider's name                                                                                                                                                                                      |
| `providers[].files`            |   Yes    |      -       | Array of glob patterns where API functions are defined                                                                                                                                               |
| `providers[].requestHeaders`   |    No    |      -       | Request headers shared across all requests                                                                                                                                                           |
| `providers[].responseHeaders`  |    No    |      -       | Response headers shared across all responses                                                                                                                                                         |
| `providers[].queryArrayFormat` |    No    | `"brackets"` | Sets separator for array in query - possible options are `"indices"`, `"brackets"`, `"comma"` and `"repeat"` [(source)](https://github.com/ljharb/qs#stringifying). The default value is `brackets`. |
| `buildDir`                     |    No    |  `./pacts`   | Directory where generated pacts will be placed                                                                                                                                                       |
| `verbose`                      |    No    |   `false`    | If set to `true` additional information during pacts generating process will be logged                                                                                                               |

You can specify common config shared between providers in **pacts.config.js**:

```js
module.exports = {
    commonConfigForProviders: {
        queryArrayFormat: 'indices',
        requestHeaders: {
            authorization: 'auth',
        },
        responseHeaders: {
            'Content-Type': 'application/json',
        },
    },
    providers: [
        {
            provider: 'first-provider',
            files: ['src/api1/**/*.ts'],
        },
        {
            provider: 'second-provider',
            files: ['src/api2/**/*.ts'],
        },
        {
            provider: 'third-provider',
            files: ['src/api3/**/*.ts'],
            // you can override common config in provider config
            queryArrayFormat: 'comma',
        },
    ],
};
```

## Integrations

#### Axios - `@pact-axios`

Sets REST method, expected body for the current response, expected body for current request and query based on axios definitions.

```ts
/**
 * @pact
 * @pact-axios
 * @pact-path /api
 */
async function fetchComments(commentId: string) {
    const {data} = await axios.post<string>('/api', {commentId});
    // ...
}
```

**IMPORTANT** - If axios function does not return any type explicitly it is needed to set `<void>` as an axios return type

```ts
/**
 * @pact
 * @pact-axios
 * @pact-path /api
 */
async function fetchComments(commentId: string) {
    await axios.post<void>('/api', {commentId});
}
```

## Pact interaction options

These JSDoc custom tags are used to adjust generated pact interactions.

#### `@pact-method`

Sets REST method (GET, POST, PUT, PATCH, DELETE etc.).

```ts
/**
 * @pact
 * @pact-method GET
 */
function fetchComments() {
    // ...
}
```

#### `@pact-path`

Sets path.

```ts
/**
 * @pact
 * @pact-path /api/images/100
 */
function fetchImage(imageId: number) {
    // ...
}
```

#### `@pact-description`

Sets description, if not provided, description is set using name of the function / variable / property.

```ts
/**
 * @pact
 * @pact-description "request to get comments"
 */
function fetchComments() {
    // ...
}
```

#### `@pact-response-status`

Sets response status, if not provided, it is set based on given HTTP method.

```ts
/**
 * @pact
 * @pact-response-status 200
 */
function fetchComments() {
    // ...
}
```

#### `@pact-request-header`

Adds a header to the current request, can override option defined in `pacts.config.js`.

```ts
/**
 * @pact
 * @pact-request-header "Content-Type" "application/pdf"
 */
function fetchImage(imageId: number) {
    // ...
}
```

#### `@pact-response-header`

Adds a header to the current response, can override option defined in `pacts.config.js`.

```ts
/**
 * @pact
 * @pact-response-header "Content-Type" "application/pdf"
 */
function fetchImage(imageId: number) {
    // ...
}
```

#### `@pact-response-body`

Sets expected body for the current response.

```ts
/**
 * @pact
 */
async function fetchComments() {
    // ...
    const response = await axios.get<string>('/api');
    /** @pact-response-body */
    const data = response.data;
    // ...
}
```

**IMPORTANT** - JSDoc has to be applied to separate variable - **not** directly to axios response

```ts
async function fetchComments() {
    // ...
    /** @pact-response-body */ -WRONG!;
    const response = await axios.get<string>('/api');

    /** @pact-response-body */ -CORRECT;
    const data = response.data;
    // ...
}
```

#### `@pact-request-body`

Sets expected body for current request.

```ts
function addComment(/** @pact-request-body */ newComment: NewComment) {
    // ...
}

interface NewComment {
    content: string;
    postId: string;
}
```

or

```js
function addComment(postId: string, commentContent: string) {
    /** @pact-request-body */
    const newComment = {
        postId,
        commentContent,
    };
    // ...
}
```

#### `@pact-query`

Sets query, **IMPORTANT** - JSDoc tag has to be applied to an object - not a primitive value.

Array separator format can be set using `queryArrayFormat` in providers options.

```ts
function fetchComments(/** @pact-query */ query: Query) {
    // ...
}

interface Query {
    fromUser: string;
    postId: string;
}
```

or

```ts
function fetchComments(pageNo: string) {
    /** @pact-query */
    const params = {
        pageNo,
    };
    // ...
}
```

### Pact matchers

Typescript types can describe the shape of the data and define possible values a variable can store. Pacts definition require specific values, that's why for some individual cases additional information needs to be added.

For example a type `string` without any modifications will be replaced with simple `text` which can be later matched by type. Sometimes that's not enough - the matcher needs to be more specific, for instance instead of simple `text` we need a string in a particular format like `name@example.com` - that's where a `@pact-matcher` tag is used.

Pact-matchers are used in the type/interface definition:

```ts
interface CommentDTO {
    id: number;
    /** @pact-matcher email */
    user: string;
}
```

Provided common matchers:

| Pact matcher                                    | Result                              |
| ----------------------------------------------- | ----------------------------------- |
| `/** @pact-matcher email */`                    | email@example.com                   |
| `/** @pact-matcher iso-date */`                 | 2021-04-13                          |
| `/** @pact-matcher iso-datetime */`             | 2021-04-13T10:14:53+01:00           |
| `/** @pact-matcher iso-datetime-with-millis */` | 2021-04-13T10:14:53.123+01:00       |
| `/** @pact-matcher iso-time */`                 | T10.14.53.342Z                      |
| `/** @pact-matcher timestamp */`                | Tue, 13 Apr 2021 10:14:53 -0400     |
| `/** @pact-matcher uuid */`                     | ce11b6e-d8e1-11e7-9296-cec278b6b50a |
| `/** @pact-matcher ipv4 */`                     | 127.0.0.13                          |
| `/** @pact-matcher ipv6 */`                     | ::ffff:192.0.2.128                  |
| `/** @pact-matcher hex */`                      | A4C3Ff                              |

If that's not enough you can easily provide own value using `/** @pact-example */`:

```ts
interface Address {
    city: string;
    address: string;
    /** @pact-example 99-400 */
    postCode: string;
    /** @pact-example 45 */
    age: number;
}
```
