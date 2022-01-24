# pact-gen-ts

This project aims to create a package that can generate pact files only from TypeScript definitions (without the necessity of writing separated tests with using [pact-js](https://github.com/pact-foundation/pact-js) package).

## Compatibility with TypeScript

Due to TypeScript's occasional changes to its compiler API and not following semantic versioning in their releases, latest versions of pact-gen-ts can only guarantee compatibility with latest versions of TypeScript.

If you're limited to historical versions of TypeScript, you should install a corresponding version of pact-gen-ts. Below table presents what TS versions pact-gen-ts will work with:

| pact-gen-ts | TypeScript |
| ----------- | ---------- |
| 0.8         | 4.1 - 4.2  |
| 0.9 - x     | \>= 4.5    |

# Work progress

All these points are only an early version of implementation for that package.

## [x] Generating information about consumer in pacts

In **pacts.config.js**:

```js
module.exports = {
    consumer: 'some-consumer',
};
```

## [x] Generating information about provider in pacts

In **pacts.config.js**:

```js
module.exports = {
    providers: [
        {
            provider: 'some-provider',
            files: ['src/api/**/*.ts'],
        },
    ],
};
```

### [x] Specify multiple providers

## [x] Add metadata and pact specification into pacts

Pact Specification in version 2.0.0

## [x] Specify build dir for output pacts

In **pacts.config.js**:

```js
module.exports = {
    buildDir: '/pacts',
};
```

## [x] Specify API function in code

```ts
/**
 * @pact
 */
function fetchComments() {
    // ...
}
```

## [x] Specify description of interaction

```ts
/**
 * @pact
 * @pact-description "request to get comments"
 */
function fetchComments() {
    // ...
}
```

### [X] Description of interaction can be optional

If we do not specify description of interaction by `@pact-description`, the description is set from the name of function / variable / property.

## [x] Specify REST method of interaction

```ts
/**
 * @pact
 * @pact-method GET
 */
function fetchComments() {
    // ...
}
```

## [x] Specify response status of interaction

```ts
/**
 * @pact
 * @pact-response-status 200
 */
function fetchComments() {
    // ...
}
```

### [X] Response status can be optional argument

If we do not use `@pact-response-status`, the proper response status is set based on given HTTP method.

## [x] Specify api path of interaction

```ts
/**
 * @pact
 * @pact-path /api/images/100
 */
function fetchImage(imageId: number) {
    // ...
}
```

## [x] Create response body in pacts from returned type of function

```ts
/**
 * @pact
 */
function fetchComments() {
    // ...
    return data;
}
```

Pact-gen-ts recognizes response body type of interaction from returned object.

## [x] Set manually what is response body

```ts
/**
 * @pact
 */
function fetchComments() {
    // ...
    /** @pact-response-body */
    const data = response.body;
    // ...
}
```

## Analyze and recognize types

### [x] Read boolean type

### [x] Read number type

### [x] Read string type

### [x] Read nested object

### [x] Read intersection types

### [x] Read union types

### [x] Read enum type

### [x] Read type aliases

### [x] Read arrays

## Create matching rules in pacts

### [x] For enums

### [x] For unions

### [x] For matchers

## Specify common matcher formats

### [x] @pact-matcher email

### [x] @pact-matcher iso-date

ISO8601 Date

Example: `2021-04-13`

### [x] @pact-matcher iso-datetime

ISO8601 Date and Time string

Example: `2021-04-13T10:14:53+01:00`

### [x] @pact-matcher iso-datetime-with-millis

ISO8601 DateTime with millisecond precision

Example: `2021-04-13T10:14:53.123+01:00`

### [x] @pact-matcher iso-time

ISO8601 Time, matches a pettern of the format "'T'HH:mm:ss"

Example: `T10.14.53.342Z`

### [x] @pact-matcher timestamp

RFC3339 Timestamp

Example: `Tue, 13 Apr 2021 10:14:53 -0400`

### [x] @pact-matcher uuid

UUID v4

Example: `ce11b6e-d8e1-11e7-9296-cec278b6b50a`

### [x] @pact-matcher ipv4

Example: `127.0.0.13`

### [x] @pact-matcher ipv6

Example: `::ffff:192.0.2.128`

### [x] @pact-matcher hex

Example: `A4C3Ff`

---

```ts
interface CommentDTO {
    id: number;
    /** @pact-matcher email */
    user: string;
    /** @pact-matcher iso-datetime */
    datetime: string;
    comment: string;
}
```

## Specify example representation of type

```ts
interface Address {
    city: string;
    address: string;
    /** @pact-example "99-400" */
    postCode: string;
}
```

## Create the concept of using JavaScript decorators to get information about interaction path

```ts
@BaseUrl('/api/v1/posts/:postId')
class PostsApi extends ApiClass {
    getPost(postId: string) {
        const url = this.endpoint(postId);
        return axios.get(url);
    }

    deletePost(postId: string) {
        const url = this.endpoint(postId);
        return axios.delete(url);
    }

    @PathApi('/comments')
    getCommentsForPost(postId: string) {
        const url = this.endpoint(postId);
        return axios.get(url);
    }

    @PathApi('/comments/:commentId')
    deleteCommentsForPost(postId: string, commentId: string) {
        const url = this.endpoint(postId, commentId);
        return axios.get(url);
    }
}
```

## [X] Create the concept how to get information about query string params of interaction

```ts
function fetchComments(/** @pact-query */ query: Query) {
    // ...
}

interface Query {
    fromUser: string;
    postId: string;
}
```

## [X] Create the concept how to get information about request body of interaction

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

```ts
function addComment(postId: string, commentContent: string) {
    /** @pact-request-body */
    const newComment = {
        postId,
        commentContent,
    };
    // ...
}
```

## [X] Create the concept how to get information about headers of interaction

In **pacts.config.js** you can specify common headers for request or response in the range of provider:

```js
module.exports = {
    providers: [
        {
            provider: 'some-provider',
            files: ['src/api/**/*.ts'],
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

You can also add headers by jsDocs:

```ts
/**
 * @pact
 * @pact-request-header "Content-Type" "application/pdf"
 * @pact-response-header "Content-Type" "application/pdf"
 */
function updateReport() {
    // ...
}
```

## [X] Create verbose flag

Add the "verbose" flag if you want the created interactions to be displayed in the console.

In **pacts.config.js**:

```js
module.exports = {
    verbose: true,
};
```

## [X] Handle different query array formats

Arrays in query parameters could be formatted in four different ways: `indices`, `brackets`, `comma` and `repeat` (source: https://github.com/ljharb/qs#stringifying).

Default value is `brackets`.

There is possibility to set query array format for output pact.

In **pacts.config.js**:

```js
module.exports = {
    // ...
    providers: [
        {
            provider: 'some-provider',
            queryArrayFormat: 'indices',
        },
    ],
};
```

## [X] Specify common config for providers

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
