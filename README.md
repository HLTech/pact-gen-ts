# pact-gen-ts

This project aims to create a package that can generate pact files only from TypeScript definitions (without the necessity of writing separated tests with using [pact-js](https://github.com/pact-foundation/pact-js) package).

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
            apiPath: '/src/api',
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

### [_] Description of interaction can be optional

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

### [_] Response status can be optional argument

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

### [x] @pact-email

### [x] @pact-date

### [x] @pact-datetime

### [x] @pact-datetime-with-millis

### [x] @pact-time

### [x] @pact-timestamp

### [x] @pact-ipv4

### [x] @pact-ipv6

### [x] @pact-hex

```ts
interface CommentDTO {
    id: number;
    /** @pact-email */
    user: string;
    /** @pact-datetime */
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
function addComment(/** @pact-body */ newComment: NewComment) {
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
    /** @pact-body */
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
            apiPath: '/src/api',
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
