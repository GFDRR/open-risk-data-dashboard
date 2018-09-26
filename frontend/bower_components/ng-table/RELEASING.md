RELEASING
============

1. Update [semver](http://semver.org/) version number in:
    - package.json
    - bower.json

2. Minify source files: `grunt`

3. Make the test pass: `npm test`

4. Update CHANGELOG.md: 
    1. `node changelog.js n.n.n` where `n.n.n` is the version number used in step 1. above
    2. copy-paste the generated text into the top of CHANGELOG.md
    3. as required, modify the generated text pasted into CHANGELOG.md

5. Check in the following updated files to git:
    - dist/*.*
    - bower.json 
    - package.json
    - CHANGELOG.md

6. Commit and push to master:
    - use the commit message 'chore(release): n.n.n distribution files' where 'n.n.n' is the version number used in step 1

7. Create a [github release](https://help.github.com/articles/creating-releases/) with same version used in steps above
    - copy-paste the text just added to CHANGELOG.md as release notes
