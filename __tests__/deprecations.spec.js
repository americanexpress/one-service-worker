import * as deprecatedAPI from '../src/deprecations';
import { printExports } from './helpers';

describe('deprecations', () => {
  test('consistently exports API items to be deprecated by next major release', () => {
    expect.assertions(1);
    expect(printExports(deprecatedAPI)).toMatchSnapshot();
  });
});
