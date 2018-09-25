var Package = require('dgeni').Package;
var path = require('canonical-path');
var _ = require('lodash');
var projectPath = path.resolve(__dirname, '../');
var packagePath = __dirname;

module.exports = new Package('ng-table', [
    require('dgeni-packages/ngdoc'),
    require('dgeni-packages/nunjucks')
])

    .processor(require('./processors/indexPage'))
    .processor(require('./processors/componentsData'))

    .config(function (log, templateEngine, templateFinder) {
        templateEngine.config.tags = {
            variableStart: '{$',
            variableEnd: '$}'
        };

        templateFinder.templateFolders = [
            path.resolve(packagePath, 'template'),
            path.resolve(packagePath, 'template/ngdoc')
        ]
    })

    .config(function(readFilesProcessor, writeFilesProcessor){
        readFilesProcessor.basePath = projectPath;
        readFilesProcessor.sourceFiles = [
            { include:'dist/ng-table.js', basePath:'dist' }
        ];
        writeFilesProcessor.outputFolder = 'dist/docs'
    })
    .config(function(computeIdsProcessor, computePathsProcessor){
        computeIdsProcessor.idTemplates.push({
            docTypes: ['parameters'],
            idTemplate: 'parameters-${fileInfo.relativePath.replace("/","-")}',
            getAliases: function(doc) { return [doc.id]; }
        });

        computePathsProcessor.pathTemplates.push({
            docTypes: ['parameters'],
            getPath: function(doc) {
                var docPath = path.dirname(doc.fileInfo.relativePath);
                if ( doc.fileInfo.baseName !== 'index' ) {
                    docPath = path.join(docPath, doc.fileInfo.baseName);
                }
                return docPath;
            },
            getOutputPath: function(doc) {
                return path.join(
                        'partials',
                        path.dirname(doc.fileInfo.relativePath),
                        doc.fileInfo.baseName) + '.html';
            }
        });
    })
    .config(function(generateComponentGroupsProcessor){
        generateComponentGroupsProcessor.$enabled = false;
    });

