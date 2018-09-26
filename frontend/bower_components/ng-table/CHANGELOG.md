<a name="1.0.0"></a>
# 1.0.0 (2016-06-17)


## Breaking Changes

- **ngTableParams:** due to [9b81066a](https://github.com/esvit/ng-table/commit/9b81066af8322c30a9d850063b977afce4f83f9e),
 

1) `ngTableAfterReloadData $scope` event removed

Eventing no longer makes *direct* calls to `$scope.$emit`. Instead a strongly typed pub/sub service
(`ngTableEventsChannel`) is used.

**To migrate**

*Previously:*

```js
    $scope.$on('ngTableAfterReloadData', yourHandler)
```

*Now:*

```js
    ngTableEventsChannel.onAfterReloadData(yourHandler, $scope)
```

2) `$scope` removed from `NgTableParams`

Because of 1. above, `NgTableParams` no longer requires a reference to `$scope`.

A reference to `$scope` was largely an internal requirement so there should be no code change
required on your part.

3) `getData` signature change

The `$defer` paramater supplied to your `getData` method has been removed. Instead your
`getData` method should return an array or a promise that resolves to an array.

**To migrate**

*Previously:*

```js
    var tp = new NgTableParams({}, { getData: getData });

    function getData($defer, params){
        // snip
        $defer.resolve(yourDataArray);
    }
```

*Now:*

```js
    var tp = new NgTableParams({}, { getData: getData });

    function getData(params){
        // snip
        return yourDataArrayOrPromise;
    }
```

4) `ngTableParams` renamed to `NgTableParams`

**To migrate**

*Previously:*

```js
    var tp = new ngTableParams();
```

*Now:*

```js
    var tp = new NgTableParams();
```

<a name="1.0.0-beta.9"></a>
# 1.0.0-beta.9 (2015-11-10)


## Bug Fixes

- **ngTableController:**
  - handle null data array
  ([e33e03dd](https://github.com/esvit/ng-table/commit/e33e03dd4d86efdcf0407ccf6890b3071050f69a))
  - handle null columns array
  ([be6fa198](https://github.com/esvit/ng-table/commit/be6fa19816d154c3278b4659b0d06a207dd77a43))


<a name="1.0.0-beta.8"></a>
# 1.0.0-beta.8 (2015-10-24)


## Features

- **ngTableController:** add visibleColumnCount to the the current $data array
  ([8e0b1095](https://github.com/esvit/ng-table/commit/8e0b1095611b1ce44deec0dd8c286d863874be83))


<a name="1.0.0-beta.7"></a>
# 1.0.0-beta.7 (2015-10-18)


## Bug Fixes

- **ngTableParams:** reload is never triggered once reload has failed once
  ([4369926c](https://github.com/esvit/ng-table/commit/4369926c9dcdf37defee96436e18d02544ae2587))


<a name="1.0.0-beta.6"></a>
# 1.0.0-beta.6 (2015-10-03)


## Bug Fixes

- **ngTableController:** should not show filter row when all filterable columns are hidden
  ([9ba4f473](https://github.com/esvit/ng-table/commit/9ba4f473676a94605f6e14755c7d453fa4705bce))
- **pager:** removed margin around buttons
  ([7e6919ea](https://github.com/esvit/ng-table/commit/7e6919ea6b88bfee39ea14bd975b2a21b416e286))


## Features

- **NgTableParams:** support grouping on nested properties
  ([2ec9d189](https://github.com/esvit/ng-table/commit/2ec9d18937693b8df42588aa84fa5cb74fb5037b))
- **ngTableColumn:** allow $column fields to be model bound as getter/setter's
  ([e705fd9a](https://github.com/esvit/ng-table/commit/e705fd9a930504054e00a6ed2040c9e203b97bca))
  
  
<a name="1.0.0-beta.5"></a>
# 1.0.0-beta.5 (2015-09-18)


## Bug Fixes

- **NgTableParams:** afterCreated should be the very first event to fire
  ([84d4220c](https://github.com/esvit/ng-table/commit/84d4220c1a1b61731773f5b5dc6861070dc9f99b))
- **filterRow.html:** header-class should also apply to filter row
  ([eed65436](https://github.com/esvit/ng-table/commit/eed65436acf4aa8d655492034e755dbbc5e73a1a))
- **ngTableController:** reference to $column not always available in $column getter functions
  ([adddb27d](https://github.com/esvit/ng-table/commit/adddb27de0abd4fb100ff4998ff6af83cbb6e13b))


## Features

- **ngTableController:** display the filter row by default when applicable
  ([103b2be4](https://github.com/esvit/ng-table/commit/103b2be40fc703bf30acb782118d1bf4d5a1bd8e))


## Breaking Changes

- **NgTableParams:** due to [84d4220c](https://github.com/esvit/ng-table/commit/84d4220c1a1b61731773f5b5dc6861070dc9f99b),


The order of events firing has changed.

Previously the `datasetChanged` event would fire after the `afterCreated` event. Now `afterCreated`
event will fires first.

- **filterRow.html:** due to [eed65436](https://github.com/esvit/ng-table/commit/eed65436acf4aa8d655492034e755dbbc5e73a1a),


A css class specified using the header-class will now be added to the filter row header cell and not
just the sorting row.

If you want to continue to apply the css rules *only* to the cell in the sorting header row you
will now need to qualify your css rule with the '.header' css class.

So the following:

```css
.my-customer-header {
    /* rules */
}
```

... will need to change to:

```css
.header.my-customer-header {
    /* rules */
}
```

- **ngTableController:** due to [adddb27d](https://github.com/esvit/ng-table/commit/adddb27de0abd4fb100ff4998ff6af83cbb6e13b),


A context object combines and replaces the `$scope` and `locals` argument originally supplied to
`$column` getter functions.

This context object prototypically inherits from the original `$scope` and has the fields from the
original `locals` argument as own properties.

**It change is very unlikely to affect you**

`ngTableColumn.buildColumn` now expects a third parameter - a reference to the `$columns`
array that will contain the column being built


<a name="1.0.0-beta.4"></a>
# 1.0.0-beta.4 (2015-09-13)


## Breaking Changes

- **NgTableParams:** due to [380ba21f](https://github.com/esvit/ng-table/commit/380ba21fdf5f4cd69322599a53d86e456851dcea),


* `NgTableParams.settings().data` renamed to `NgTableParams.settings().dataset`

Previously:

```js
var tp = new NgTableParams({}, {data: yourArray });
```

Now:

```js
var tp = new NgTableParams({}, {dataset: yourArray });
```


<a name="1.0.0-beta.3"></a>
# 1.0.0-beta.3 (2015-09-06)


## Bug Fixes

- **NgTableParams:** thisArg for apply on $log functions should be $log
  ([f8e0a9de](https://github.com/esvit/ng-table/commit/f8e0a9dea32ef0f73b8cf19e9928656a230d9935))
- **groupRow:** should update as group changes externally
  ([7d2965c5](https://github.com/esvit/ng-table/commit/7d2965c5bc220ec4483059cf87c6256d98132d77))


## Features

- **groupRow:** add expand/collapse toggle for group rows
  ([32f208b2](https://github.com/esvit/ng-table/commit/32f208b2bd137d57a9e91bc4c5a7e5bd2ef5c862))
- **ngTableColumnsBinding:** new directive that provide access to the $columns array
  ([e290293c](https://github.com/esvit/ng-table/commit/e290293c7cb649591ebb78d92199d164bb3f8490))


<a name="1.0.0-beta.2"></a>
# 1.0.0-beta.2 (2015-09-02)


## Bug Fixes

- **ngTableSelectFilterDs:** not binding to scope an array returned asynchronously
  ([4c063685](https://github.com/esvit/ng-table/commit/4c0636857c804f5d050dbf83698f0615ee1216f9))


<a name="1.0.0-beta.1"></a>
# 1.0.0-beta.1 (2015-08-29)


## Bug Fixes

- **NgTableParams:** filterDelay too high
  ([6a3692dc](https://github.com/esvit/ng-table/commit/6a3692dc4fc102b41d4ac80f7c90a5c327a96a31))


## Features

- **NgTableParams:** optimize filter debounce for in-memory data arrays
  ([8010e07f](https://github.com/esvit/ng-table/commit/8010e07f18faf8fde5e30e0d7233a79221317651))


## Breaking Changes

- **NgTableParams:** due to [449ab623](https://github.com/esvit/ng-table/commit/449ab6230c4b6ce39111851f3e605da3d8281786),


Move `settings().filterDelay` to `settings().filterOptions.filterDelay`


<a name="1.0.0-alpha.8"></a>
# 1.0.0-alpha.8 (2015-08-28)


## Bug Fixes

- **NgTableParams:** incorrect default sort direction applied to grouping function
  ([7b30995e](https://github.com/esvit/ng-table/commit/7b30995e2922d7367e9336d987d9e739f7f29cd3))
- **groupRow:** table columns are lost when switching between groups
  ([6d2c7358](https://github.com/esvit/ng-table/commit/6d2c735847918bd3c717f58a2f10be0fd3a01a8b))


## Features

- **ngTableController:** add visibleColumnCount to $groups data
  ([53ed583c](https://github.com/esvit/ng-table/commit/53ed583c5fd1b1dd4f147aee9ab852a90e6f17c4))


<a name="1.0.0-alpha.7"></a>
# 1.0.0-alpha.7 (2015-08-27)


## Bug Fixes

- **NgTableParams:** the url method does not URI encoded all parameter values
  ([6e7bf3a7](https://github.com/esvit/ng-table/commit/6e7bf3a733f15987b5b3aefeb738f3d5c03aaa8e))


## Features

- **NgTableParams:** improved support for grouping data
  ([1cd90cde](https://github.com/esvit/ng-table/commit/1cd90cdeb1b3720945c246e875d602ea8d30c873))
- **groupRow:** extend header with a data group picker
  ([ffa617cb](https://github.com/esvit/ng-table/commit/ffa617cb53fd02d38d02b86d4b37e52813dcec1e))
- **ngTableDefaultGetData:** allow NgTableParams to determine if sorting, filtering, and paging apply
  ([6536d734](https://github.com/esvit/ng-table/commit/6536d734f865a101021639db311648e334b649a7))


## Breaking Changes

- **NgTableParams:**
  - due to [1cd90cde](https://github.com/esvit/ng-table/commit/1cd90cdeb1b3720945c246e875d602ea8d30c873),


* `settings().groupBy` renamed and moved to `parameters().group`

Previously:

```js
var params = new NgTableParams({...}, { groupBy: 'role'});
// changing value:
params.settings({ groupBy: 'age'});

```

Now:

```js
var params = new NgTableParams({group: 'role'}, {...});
// changing value:
params.group('age');
// OR
params.parameters({ group: { age: undefined }});
```

* paging is applied after grouping

This means that groups will no longer be duplicated and split across pages.

  - due to [6e7bf3a7](https://github.com/esvit/ng-table/commit/6e7bf3a733f15987b5b3aefeb738f3d5c03aaa8e),


All parameter values are now URI encoded, thus a numerical filter value will now be returned as a quoted string


<a name="1.0.0-alpha.6"></a>
# 1.0.0-alpha.6 (2015-08-17)


## Bug Fixes

- **NgTableParams:** table not reloaded when special `$` filter field changes
  ([8c287e91](https://github.com/esvit/ng-table/commit/8c287e9179aeaa1b646d0c6d7db5b8b1363f8963))


## Features

- **ngTableDefaultGetData:** set the `this` context of the filter function to the current NgTableParams
  ([e23ce330](https://github.com/esvit/ng-table/commit/e23ce330d385ae09d1b3840e52b6369a37948696))


<a name="1.0.0-alpha.5"></a>
# 1.0.0-alpha.5 (2015-08-16)


## Features

- **NgTableParams:** set sensible defaults for filterComparator, filterFn and filterName
  ([fc2fa182](https://github.com/esvit/ng-table/commit/fc2fa182c57bcb47ea036d78c891aedb1a64bd50))
- **ngTableDefaultGetData:**
  - support filterComparator,  filterFilterName override, and filterFn
  ([a62754c9](https://github.com/esvit/ng-table/commit/a62754c9b61ee5543a52098d955a17d586f0620e))
  - support nested property filters
  ([58ee04a6](https://github.com/esvit/ng-table/commit/58ee04a6dc3da223616b85c8ad3b0c78ec4fd0d6))


<a name="1.0.0-alpha.4"></a>
# 1.0.0-alpha.4 (2015-08-15)


## Features

- **filters:** add ngTableSelectFilterDs directive
  ([c79fdd86](https://github.com/esvit/ng-table/commit/c79fdd86a718b61da0c7eab9eb2a82810881a941))


## Breaking Changes

- **filters:** due to [6e1bd3d9](https://github.com/esvit/ng-table/commit/6e1bd3d9b47ed1bf47c8daaf512ab2e9c3d9b4af),


`ngTableController` no longer adds an empty item to the array returned by `$column.filterData`.

This will only affect those apps that were using `$column.filterData` to supply data to a *custom*
filter template.

Those apps that are using the `select.html` will be unaffected as the `select.html` filter will add
this empty item.


<a name="1.0.0-alpha.3"></a>
# 1.0.0-alpha.3 (2015-08-14)


## Bug Fixes

- **ngTableController:** should be consistent about adding empty option item
  ([d2080600](https://github.com/esvit/ng-table/commit/d2080600641206d84505c54f271c1eaebee391e8))


## Features

- **filters:**
  - add filterLayout option to control position of multi-template filters
  ([d1e02ccd](https://github.com/esvit/ng-table/commit/d1e02ccd7d0e9f3f9fb882a32113cc724bcfe5f4))
  - support placeholder attribute for filter input
  ([275f1c88](https://github.com/esvit/ng-table/commit/275f1c88f46515415a43e434a65fe54b4d813637))
  - render a multi-template filter horizontally
  ([c834cc09](https://github.com/esvit/ng-table/commit/c834cc098ee2fa6ffe986ec701ceb0f3360b5680))


## Breaking Changes

- **ngTableController:** due to [d2080600](https://github.com/esvit/ng-table/commit/d2080600641206d84505c54f271c1eaebee391e8),


An empty item - `{ id: '', title: '' }` - is added to an array returned synchronously by `filterData`
function.

Implications:
* make sure to *not* add an empty option yourself as this will be a duplicate
* your array of items need to have an `id` and `title` field so as to match the empty option


<a name="1.0.0-alpha.2"></a>
# 1.0.0-alpha.2 (2015-08-12)


## Bug Fixes

- **pager.html:** don't render empty pagination UL
  ([ffbbca04](https://github.com/esvit/ng-table/commit/ffbbca0466b67e6a4b2b877282e7c7b45ad330af))


## Features

- **ngTableController:** allow $column.filterData to return a promise
  ([f90cbcb8](https://github.com/esvit/ng-table/commit/f90cbcb87de4d072f33d5813fe69132e3e51b45f))


<a name="1.0.0-alpha.1"></a>
# 1.0.0-alpha.1 (2015-08-10)


## Bug Fixes

- **ngTableController:** should not call reload twice when initial load fails
  ([a01da5bd](https://github.com/esvit/ng-table/commit/a01da5bdf9e88f27b6807458212f5c36d2390e85))


## Features

- **NgTableParams:** add hasErrorState method
  ([093ba3d9](https://github.com/esvit/ng-table/commit/093ba3d96c591faaccff6a613223629a861a1c6a))


<a name="1.0.0-alpha"></a>
# 1.0.0-alpha (2015-08-10)


## Bug Fixes

- **NgTableParams:** default page size is unreasonably small
  ([6aec41ca](https://github.com/esvit/ng-table/commit/6aec41cae47050861ade27cde71e4a6ca6252922))


## Breaking Changes

- **NgTableParams:**
  - due to [6aec41ca](https://github.com/esvit/ng-table/commit/6aec41cae47050861ade27cde71e4a6ca6252922),


Default page size has been increased from 1 to 10.

To override this behaviour set the default page size in the a run block:

```js
angular.module("yourApp").run(setRunPhaseDefaults);

setRunPhaseDefaults.$inject = ["ngTableDefaults"];

function setRunPhaseDefaults(ngTableDefaults) {
    ngTableDefaults.params.count = 1;
}
```

  - due to [6b747850](https://github.com/esvit/ng-table/commit/6b747850fdc3ca9c22ee5f5e0d9cfc26d8e462f4),


`NgTableParams` no longer exposes a `getGroups` method.

`getGroups` is now a method on the settings object only.

  - due to [1ed1a044](https://github.com/esvit/ng-table/commit/1ed1a044bf1eb411d6e051b3440d5e75007e06ee),


`NgTableParams` no longer exposes a `getData` method

- **settings:** due to [e29babf2](https://github.com/esvit/ng-table/commit/e29babf2958fb0f1ee39c48c8531cc70c110cdeb),


The `column` parameter of the `getGroups` method has been removed.

Instead the `groupBy` value on the `NgTableParams.settings()` object supplied as a parameter will
be used to determine the grouping.

Previously:

```js
var groupsFetched = tableParams.settings().getGroups('age');
```

Now:

```js
tableParams.settings({ groupBy: 'age'});
var groupsFetched = tableParams.settings().getGroups(tableParams);
```


<a name="0.8.3"></a>
# 0.8.3 (2015-08-09)


## Bug Fixes

- **ngTableDefaultGetData:** should ignore null and undefined filter values
  ([64a33a85](https://github.com/esvit/ng-table/commit/64a33a8573e913ab38849534e7cbf85a286f245c))


## Features

- **NgTableParams:**
  - filter function option to remove insignificant values
  ([2f5f3016](https://github.com/esvit/ng-table/commit/2f5f30161a9cdd2628b3e713fae922faa85db911))
  - isSortBy direction parameter now optional
  ([b3e02b92](https://github.com/esvit/ng-table/commit/b3e02b922064a73e302ad08a2b6f90678dcc18dc))
  - add response error interception
  ([5613d1e0](https://github.com/esvit/ng-table/commit/5613d1e00cca6b8027686806a341a8b64e89a552))
- **number.html:** new filter template for numbers
  ([78b02bbf](https://github.com/esvit/ng-table/commit/78b02bbfe4e00c395df70d9bef64ac0b20d01e4d))


<a name="0.8.2"></a>
# 0.8.2 (2015-08-06)


## Bug Fixes

- **NgTableParams:** datasetChanged event fires too early
  ([9706a60b](https://github.com/esvit/ng-table/commit/9706a60bc77f787afb04f01e9769c896fc63c063))
- **select-filter:** select lists should not display an empty and '-' option
  ([1ee441be](https://github.com/esvit/ng-table/commit/1ee441bebf3e1f8fac260a38b8b82122714191d2))


## Features

- **NgTableParams:** generatePagesArray can be called without arguments
  ([25fc82bd](https://github.com/esvit/ng-table/commit/25fc82bd051b07ee9b49f105e453e7a64b462bfc))


<a name="0.8.1"></a>
# 0.8.1 (2015-08-02)


## Bug Fixes

- **ngTableController:**
  - table not reloaded when new NgTableParams bound to scope
  ([d8cbd771](https://github.com/esvit/ng-table/commit/d8cbd771d11beb53cdb16e060c32cf633095d466))
  - apply filter delay only when relevant
  ([1ed42168](https://github.com/esvit/ng-table/commit/1ed42168d59933881f11ba36047459ddfe1af442))


## Features

- **NgTableController:** optimize calls to reload
  ([e94ca5f7](https://github.com/esvit/ng-table/commit/e94ca5f7873673616e15a46ab8317595331ab6e1))
- **NgTableParams:**
  - allow getData to return an array of data
  ([ab9ffdfa](https://github.com/esvit/ng-table/commit/ab9ffdfa09c64a10b4f955db21ed4de0a0bf7a9d))
  - add hasFilter function
  ([1163e22c](https://github.com/esvit/ng-table/commit/1163e22c9115515f3e9854769aa179895edfa550))
  - add isDataReloadRequired and hasFilterChanges methods
  ([95b0f2ba](https://github.com/esvit/ng-table/commit/95b0f2ba9e5073b5866c7c332c9556debe76495c))
  - better default implementation of getData that filters and sorts
  ([8d912609](https://github.com/esvit/ng-table/commit/8d912609f156d3722bba79ea53d5232576282ae8))
  - extend getData with interceptor pipeline
  ([f94c6357](https://github.com/esvit/ng-table/commit/f94c63572782b2e8a808beaf0c58a463e3fe50a4))
- **ngTableController:** automatically reload table when settings data array changes
  ([4817c203](https://github.com/esvit/ng-table/commit/4817c20359ee571c73e0edba89bf759a4f3b5aa2))
- **ngTableDefaultGetData:** new service for applying NgTableParam filters (etc) to a data array
  ([bdf5d9ee](https://github.com/esvit/ng-table/commit/bdf5d9ee3a71a441aba667d12bc5e48153fe32dc))
- **ngTableEventsChannel:** publish strongly typed events using explicit service
  ([1f3e7e4c](https://github.com/esvit/ng-table/commit/1f3e7e4cd797d6b96bb57473786eea64f805ce81))
- **ngTableFilterConfig:** setConfig now merges with previous config values
  ([155ef620](https://github.com/esvit/ng-table/commit/155ef6203baf228976d201e6757adf69a669d5c0))


<a name="0.8.0"></a>
# 0.8.0 (2015-07-25)


## Bug Fixes

- **ngTableController:** don't trigger reload whilst a reload is already in-flight
  ([97d09ca4](https://github.com/esvit/ng-table/commit/97d09ca43501ea97a30e1afcd04f6ed81df4f97d))


## Features

- **ngTableFilterConfig:** allow template urls for filters to be customized
  ([032f6ff6](https://github.com/esvit/ng-table/commit/032f6ff6aec0fcad7c4d84976aee8dc317c67a6c))


## Breaking Changes

- **header.html:** due to [47460d67](https://github.com/esvit/ng-table/commit/47460d67acb518a402a42329e6108a4e86e436d6),


The sortBy function previously declared by `ngTableController` has been moved to the new controller
- `ngTableSorterRowController`.

- **ngTableController:** due to [97d09ca4](https://github.com/esvit/ng-table/commit/97d09ca43501ea97a30e1afcd04f6ed81df4f97d),


Calls to `NgTableParams.filter`, `NgTableParams.sorting` (etc) made in the `then` method of
the promise returned by `NgTableParams.reload` will NOT trigger a subsequent call to `NgTableParams.reload`;
the call to `NgTableParams.reload` must now be explicitly be made.

Previously:

```js
tableParams.reload().then(function(){
  if (!tableParams.total() && _.size(tableParams.filter()) > 0) {
        tableParams.filter({});
  }
});
```

Now:

```js
tableParams.reload().then(function(){
  if (!tableParams.total() && _.size(tableParams.filter()) > 0) {
        tableParams.filter({});
        return tableParams.reload();
  }
});
```


<a name="0.7.1"></a>
# 0.7.1 (2015-07-20)


## Features

- **ngTableController:** add function to parse the expression used to initialise ngTableDynamic
  ([e9333f98](https://github.com/esvit/ng-table/commit/e9333f980764e48685477b93bb5031575b0963cf))


<a name="0.7.0"></a>
# 0.7.0 (2015-07-13)


## Breaking Changes

- **ngTable+ngTableDynamic:** due to [b226dec9](https://github.com/esvit/ng-table/commit/b226dec9537769aaf355bf5a908f380622feba92),


* showing/hiding columns now uses ng-if;  **ng-show is no longer supported**

Previously:

````html
<tr>
  <td ng-show="showColExpr">
</tr>
````

Now:

````html
<tr>
  <td ng-if="showColExpr">
</tr>
````


<a name="0.6.0"></a>
# 0.6.0 (2015-07-12)


## Breaking Changes

- **header.html:** due to [6bb2aba8](https://github.com/esvit/ng-table/commit/6bb2aba8ce89a5afdf36f1fe42b7bd71efcf6b81),
  anyone who relied on a specific 'position' field to order table columns will now
need to change the order items's in the column array

 Previously:
 
````
 cols[1].position = 2;
 cols[2].position = 1;
````

 Now:
 
````
var swappedCol = cols[2];
cols[2] = cols[1];
cols[1] = swappedCol;
````


<a name="0.5.5"></a>
# 0.5.5 (2015-07-09)


## Bug Fixes

- **example:** updated code due to documentation total should be a number
  ([ce15e94a](https://github.com/esvit/ng-table/commit/ce15e94ae0f71b48078e8ece6e917a7c6d9359da))


## Features

- **header.html:** allow reordering of columns
  ([23236e6f](https://github.com/esvit/ng-table/commit/23236e6f6b78e18aab29e4926110d7ad5f26432b))
- **ngTableDynamic:** add a column on the fly
  ([01682774](https://github.com/esvit/ng-table/commit/016827745bd618aeafc16f4deaa855b29452626a))
- **pagination:** add setting paginationMaxBlocks now you can define the count of pagination blocks, minimum is 6
  ([bbdfaf38](https://github.com/esvit/ng-table/commit/bbdfaf387dd8e47719be54edf1e4d2b43350d274))


<a name="v0.5.4"></a>
# v0.5.4 (2015-02-26)


## Features

- **ngTable:** added setting sortingIndicator to show sorting indicator whether near header title or to the very right
  ([10cdf358](https://github.com/esvit/ng-table/commit/10cdf358cfcab2843fcade5de4d512f3b3ab9577))


<a name="v0.5.0"></a>
# v0.5.0 (2015-02-15)


## Bug Fixes

- **ngTableController:**
  - fix regression in recent rename of ngTableParmas to NgTableParams
  ([c7f2ac89](https://github.com/esvit/ng-table/commit/c7f2ac896b78eaad67a6095c057807217bf1e318))
  - prevent "stackoverflow" exception when data items are recursive data structures
  ([4a344db0](https://github.com/esvit/ng-table/commit/4a344db05954502e6679d33f6d8946952dddee10))


## Features

- **filters:**
  - filter expression now has access to scope
  ([c2f83b98](https://github.com/esvit/ng-table/commit/c2f83b9877b23b0124885b2cd9ab1fc705970f49))
  - specify the filter template url using the filter value rather than a separate templateUrl field
  ([7955f12b](https://github.com/esvit/ng-table/commit/7955f12ba96eb8a5f047484d83f3c53a2954f1db))
- **header:**
  - add data-title-text attribute to table cells
  ([43e5c4bf](https://github.com/esvit/ng-table/commit/43e5c4bf03bfca2d5dd71d6dcfeb3f318fcfd692))
  - title and sortable expression now has access to the column definition
  ([699b2a58](https://github.com/esvit/ng-table/commit/699b2a58aeb6a85ff2ad5a4cbc70728de2b7f2fe))
  - header-title
  ([502b717b](https://github.com/esvit/ng-table/commit/502b717be88d38b75ef3be7e29da5a5da71bf5eb))
  - header-class attribute is now a data binding expression
  ([60de2066](https://github.com/esvit/ng-table/commit/60de2066b9be1a33210767783354c11004d5e042))
- **ngTable:**
  - getter methods declared on $column no longer require a $scope to be supplied
  ([f9090b47](https://github.com/esvit/ng-table/commit/f9090b47981105bb59928cc6eeb8bc1499b6d5ab))
  - add title-alt for displaying an alternative header title for responsive tables
  ([afc14234](https://github.com/esvit/ng-table/commit/afc142345aadc940ef913763fe86dc798a80f750))
- **ngTableDynamic:** new directive that accepts dynamic array of columns
  ([03854d33](https://github.com/esvit/ng-table/commit/03854d333d35fb7ebae53847c937ec45f3f58eb7))


## Breaking Changes

- **column:** due to [7e8448dc](https://github.com/esvit/ng-table/commit/7e8448dc41c4e543c8b04d9836fdd81806846d06),
 

* Binding expressions used for generating `thead>th` attributes that reference the current column will need modifying

 Previously:
````html
 <td title="getTitle(column)">
````

 Now:
 ````html
  <td title="getTitle($column)">
 ````
- **directive:** due to [3113e340](https://github.com/esvit/ng-table/commit/3113e340ad6ee348f574762ddd2de78a1fad614d),
 

* Fields previously stored directly on a column object are now only available via the prototype chain

This will affect you only if you are enumerating / specifically checking for "own properties" of the column object.
- **filters:**
  - due to [c2f83b98](https://github.com/esvit/ng-table/commit/c2f83b9877b23b0124885b2cd9ab1fc705970f49),
 

**Custom** *header.html* templates will need to pass the current scope as a parameter to column.filter.

Previously:

````html
<!-- snip -->
<div ng-repeat="(name, filter) in column.filter">
<!-- snip -->
````
... now becomes:

````html
 <!-- snip -->
 <div ng-repeat="(name, filter) in column.filter(this)">
 <!-- snip -->
````
- **filters:**
  - due to [53ec5f93](https://github.com/esvit/ng-table/commit/53ec5f931ada71be763b98a3f8d7166bc59a383f),
 

* $$name field on filter definitions is not supported.

Previously:

````html
<td filter="{'username': 'text', $$name: 'username'}"</td>
````
... now becomes:

````html
<td filter="{'username': 'text'}"</td>
````

* column.filterName has been dropped as this is no longer applicable. **Custom** filter templates will need to change.

Previously:

````html
        <input type="text" name="{{column.filterName}}"
````
... now becomes:

````html
        <input type="text" name="{{name}}"
````

* Multiple filters defined by the *same* filter definition will now render each input with a seperate name.

- **filters:**
  - due to [7955f12b](https://github.com/esvit/ng-table/commit/7955f12ba96eb8a5f047484d83f3c53a2954f1db),
 

* column.filterTemplateURL has been dropped as this is no longer applicable. **Custom** *header.html*
templates will need to change.

Previously:

````html
        <tr class="ng-table-filters" ng-init="tableParams">
            <th ng-repeat="column in columns" ng-show="column.visible" class="filter">
                <div ng-repeat="(name, filter) in column.filter">
                    <div ng-if="column.filterTemplateURL" ng-show="column.filterTemplateURL">
                        <div ng-include="column.filterTemplateURL"></div>
                    </div>
                    <div ng-if="!column.filterTemplateURL" ng-show="!column.filterTemplateURL">
                        <div ng-include="'ng-table/filters/' + filter + '.html'"></div>
                    </div>
                </div>
            </th>
        </tr>
````
... now becomes:

````html
        <tr class="ng-table-filters" ng-init="tableParams">
            <th ng-repeat="column in columns" ng-show="column.visible" class="filter">
                <div ng-repeat="(name, filter) in column.filter">
                    <div ng-if="filter.indexOf('/') !== -1" ng-include="filter"></div>
                    <div ng-if="filter.indexOf('/') === -1" ng-include="'ng-table/filters/' + filter + '.html'"></div>
                </div>
            </th>
        </tr>
````

* Specifying the url to a filter template has changed.

Previously:

````html
<td filter="{ 'name': 'text', templateURL: 'path/to/textFilter.html'}"</td>
````

... now becomes:

````html
<td filter="{ 'name': 'path/to/textFilter.html'}"</td>
````

* Multiple filters defined by the *same* filter definition will now specify their own url.

Previously:

````html
<td filter="{
    'fname': 'text',
    'lname': 'text',
    templateURL: 'path/to/textFilter.html'}"</td>
````

... now becomes:

````html
<td filter="{
    'fname': 'path/to/textFilter.html',
    'lname': 'path/to/textFilter.html'}"</td>
````
- **header:**
  - due to [699b2a58](https://github.com/esvit/ng-table/commit/699b2a58aeb6a85ff2ad5a4cbc70728de2b7f2fe),
 

parse method on the ngTable scope has been removed as it's no longer required

- **header:**
  - due to [60de2066](https://github.com/esvit/ng-table/commit/60de2066b9be1a33210767783354c11004d5e042),
 

Previously, a css class was added to TH elements thusly:

````html
<tr ng-repeat="row in $data">
	<td header-class="myHeaderClass"></td>
</tr>
````

Now:

````html
<tr ng-repeat="row in $data">
	<td header-class="'myHeaderClass'"></td>
</tr>
````

### v0.3.2 (master)
- add pagination directive ngTablePagination [(see usage)](https://github.com/esvit/ng-table/blob/master/examples/demo28.html)
- rename filter.name to filter.$$name according to issue #196
- add debugMode setting
- add defaultSort setting
- add filterDelay setting
- add multisorting (click on header with Ctrl-key)
- add css classes (ng-table-pager, ng-table-pagination, ng-table-counts)

### v0.3.1
- add support of `header-class` attribute
- add fixes for compatibility with early versions of AngularJS
- add `data` field to ngTableParams
- Allow expressions in the sortable & filter attribute (Issue #93)

### v0.3.0
- I abandoned from CoffeeScript in favor of a javascript, fully agree with http://blog.ponyfoo.com/2013/09/28/we-dont-want-your-coffee & (rus) http://habrahabr.ru/post/195944/
- added examples of table with grouping
- fully rewrited interface of ngTableParams

### v0.2.2
In functions that return data for the filters were removed `.promise`
```javascript
$scope.names = function(column) {
    ...
    def.resolve(names);
    // return def.promise; - old code
    return def;
};
```
