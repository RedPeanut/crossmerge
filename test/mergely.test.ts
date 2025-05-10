// import fs from 'fs';

import Diff from "../src/lib/mergely/Diff";
import DiffParser from "../src/lib/mergely/DiffParser";

describe('#mergely', function() {
  it('default ', function() {
    const compare = new Diff('abcabba', 'cbabac', { split: 'chars' });
    // const compare = new Diff('the quick red fox\njumped over the hairy dog',
    //   'the quick brown fox\njumped over the lazy dog', { split: 'lines' });
    console.log('compare.normal_form =', compare.normal_form());
    const changes = new DiffParser(compare.normal_form());
    console.log('changes =', changes);
  });

});
