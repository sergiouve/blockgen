#!/usr/bin/env node

var fs = require('fs');
var eol = require('os').EOL;
var program = require('commander');

program
    .option('-f, --folder <blocks_folder>', 'Relative path to blocks folder')
    .parse(process.argv);

var blocks_folder = program.folder;
var blockConfig = JSON.parse(fs.readFileSync('block.conf', 'utf8'));
var block_name = blockConfig['block-id'];

if (typeof blocks_folder == 'undefined') {
    blocks_folder = '.';
}

var generateBlockFileTree = function(block_name) {
    fs.mkdirSync(blocks_folder + '/' + block_name);
    fs.mkdirSync(blocks_folder + '/' + block_name + '/lang');
    fs.writeFile(blocks_folder + '/' + block_name + '/block-form.template');
    fs.writeFile(blocks_folder + '/' + block_name + '/block.conf');
    fs.writeFile(blocks_folder + '/' + block_name + '/setup.php');
    fs.writeFile(blocks_folder + '/' + block_name + '/lang/lang_es.php');
}

var populateBlockConfigFile = function(block_name) {
    fs.createReadStream('block.conf').pipe(fs.createWriteStream(block_name + '/block.conf'));
}

var populateBlockLangFile = function(block_name, blockConfigObject) {
    var widgetsObject = blockConfigObject['widgets'];
    var block_desc = blockConfigObject['block-id'].toUpperCase();

    var lang_file_template_ini = '<?php' + eol + eol +
        '$block_specific_lang_ed = array("desc" => "' + block_desc + '", "txt" => array(' + eol + eol;

    var lang_file_template_end = '));' + eol + eol +
        '$block_specific_lang = $block_specific_lang_ed["txt"];' + eol +
        'unset($block_specific_lang_ed);' + eol;
    var lang_file_content = '';
    var final_file_content = '';

    for (var entry in widgetsObject) {
        for (var widget in widgetsObject[entry]) {
            var currentObj = widgetsObject[entry][widget];
            if (typeof currentObj == 'object') {
                widget_label = widgetsObject[entry][widget]['lang']['label'];
                widget_explanation = widgetsObject[entry][widget]['lang']['explanation'];
                widget_err = widgetsObject[entry][widget]['lang']['err'];

                lang_file_content += '"' + widget_label + '" => "",' + eol;
                lang_file_content += '"' + widget_explanation + '" => "",' + eol;
                lang_file_content += '"' + widget_err + '" => "",' + eol;

                lang_file_content += eol;
            }
        }
    }

    final_file_content = lang_file_template_ini + lang_file_content + lang_file_template_end;
    fs.writeFile(block_name + '/lang/lang_es.php', final_file_content);
}

var populateSetupFile = function(block_name, blockConfigObject) {
    var widgetsObject = blockConfigObject['widgets'];
    var block_desc = blockConfigObject['block-id'].toUpperCase();

    var setup_file_template_ini = '<?php' + eol + eol +
        '$block_lang = array(' + eol + eol;

    var setup_file_template_end = ');' + eol + eol;
    var setup_file_content = '';
    var final_file_content = '';

    for (var entry in widgetsObject) {
        for (var widget in widgetsObject[entry]) {
            var currentObj = widgetsObject[entry][widget];
            if (typeof currentObj == 'object') {
                widget_label = widgetsObject[entry][widget]['lang']['label'];
                widget_explanation = widgetsObject[entry][widget]['lang']['explanation'];
                widget_err = widgetsObject[entry][widget]['lang']['err'];

                setup_file_content += '"' + widget_label + '" => $block_specific_lang["' + widget_label + '"],' + eol;
                setup_file_content += '"' + widget_explanation + '" => $block_specific_lang["' + widget_explanation + '"],' + eol;
                setup_file_content += '"' + widget_err + '" => $block_specific_lang["' + widget_err + '"],' + eol;

                setup_file_content += eol;
            }
        }
    }

    final_file_content = setup_file_template_ini + setup_file_content + setup_file_template_end;
    fs.writeFile(block_name + '/setup.php', final_file_content);
}

var populateTemplateFile = function(block_name, blockConfigObject) {
    var widgetsObject = blockConfigObject['widgets'];
    var template_file_template_ini = '<div class="row-fluid">' + eol;
    var template_file_template_end = '</div>' + eol;
    var template_file_content = '';
    var final_file_content = '';

    for (widget in widgetsObject) {
        widget_id = widgetsObject[widget]['widget-id'];
        template_file_content += '{{label:' + widget_id + '}}{{field:' + widget_id + '}}{{help:' + widget_id + '}}' + eol;
    }

    final_file_content = template_file_template_ini + template_file_content + template_file_template_end;
    fs.writeFile(block_name + '/block-form.template', final_file_content);
}

generateBlockFileTree(block_name);
populateBlockConfigFile(block_name);
populateBlockLangFile(block_name, blockConfig);
populateSetupFile(block_name, blockConfig);
populateTemplateFile(block_name, blockConfig);