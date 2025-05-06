// import fs from 'fs';
import { CompareFolder } from '../src/main/compare/CompareFolder';

describe('#CompareFolder', function() {
  it('default ', async function() {
    const ret = await new CompareFolder('5e1bc080-ca56-427b-a69b-07fea86ccdde').run({
      type: 'folder',
      uid: '5e1bc080-ca56-427b-a69b-07fea86ccdde',
      path_lhs: '/Users/kimjk/workspace/electron/crossmerge-compare',
      path_rhs: '/Users/kimjk/workspace/electron/crossmerge'
    });
    console.log('ret =', ret);
  });

});
