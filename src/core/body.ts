import {MatchingRules} from './create-pact-matching-rules';

export abstract class Body {
    public body: unknown;
    public matchingRules: MatchingRules | undefined;
}
