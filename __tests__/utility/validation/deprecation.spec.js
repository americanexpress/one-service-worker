import {
  createDeprecationMessage,
  deprecationNotice,
} from '../../../src/utility/validation/deprecation';

describe('createDeprecationMessage', () => {
  test('returns string with deprecation message', () => {
    expect.assertions(1);

    expect(createDeprecationMessage()).toEqual(
      '[One Service Worker]: Deprecation Notice - %s is marked for deprecation and will not be accessible in the next major release.',
    );
  });

  test('returns string with deprecation message and extra input message', () => {
    expect.assertions(1);

    const extraInputMessage = 'Use this shiny new API instead.';

    expect(createDeprecationMessage(extraInputMessage)).toEqual(
      [
        '[One Service Worker]: Deprecation Notice - %s is marked for deprecation and will not be accessible in the next major release.',
        extraInputMessage,
      ]
        .join('\n')
        .trim(),
    );
  });
});

describe('deprecationNotice', () => {
  const { warn } = console;

  beforeAll(() => {
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = warn;
  });

  const deprecatedOutput = "I'm deprecated now";
  function deprecatedMember() {
    return deprecatedOutput;
  }

  test('calls the deprecated member and warns about deprecation', () => {
    expect.assertions(3);

    const deprecatedWrapper = deprecationNotice(deprecatedMember);

    expect(deprecatedWrapper()).toEqual(deprecatedOutput);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(createDeprecationMessage(), deprecatedMember.name);
  });
});
