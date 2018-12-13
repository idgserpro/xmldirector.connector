function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

function name_renderer(cell, formatterParams, onRendered) {
    var data = cell.getData();
    if (data.is_dir) 
        return `<a href="${data.view_url}">${data.name}</a>`;
    else
        return `<a href="${data.raw_url}">${data.name}</a>`;
}

function type_renderer(cell, formatterParams, onRendered) {
    var data = cell.getData();
    if (data.is_dir) {
        return "DIR";
    } else {
        return "FILE";
    }
}

function user_renderer(cell, formatterParams, onRendered) {
    var data = cell.getData();
    return data.user + "." + data.group;
}

function modified_renderer(cell, formatterParams, onRendered) {
    var data = cell.getData();
    return moment(data.modified * 1000).fromNow();
}

function size_renderer(cell, formatterParams, onRendered) {
    var data = cell.getData();
    if (data.is_file) {
        return bytesToSize(data.size);
    } else {
        return '';
    }
}

function actions_renderer(cell, formatterParams, onRendered) {
    var data = cell.getData();
    var s = '';
    if (data.is_file) {
        s += `<a class="download-link" href="${data.raw_url}">[Download]</a>`; 
        s += ' ';
        s += `<a class="raw-link" href="${data.highlight_url}">[View]</a>`;
    }
    return s;
}


function build_table() {        
    var columns = [ 
        {title:"Name", field:"name", width:150, formatter: name_renderer, headerFilter: true},
        {title:"Type", field:"is_dir", align:"left", formatter: type_renderer, headerFilter: true},
        {title:"User", field:"user", formatter: user_renderer, headerFilter: true},
        {title:"Modified", field:"modified", formatter: modified_renderer},
        {title:"Size", field:"size", formatter: size_renderer},
        {title:"Actions", field:"actions", formatter: actions_renderer},
    ];

    var url = URL + '/@@connector-folder-contents?subpath=' + SUBPATH;

    $.ajax({
        url: url,
        dataType: 'json',
        async: false,
        method: 'GET',
        success: function(result) {

        var table = new Tabulator("#files-table", {
            height:450,
            data:result, //assign data to table
            layout:"fitColumns", //fit columns to width of table (optional)
            pagination:"local",
            paginationSize:12,
            movableColumns:true,
            columns: columns,
        });
        } 
    });
}



$(document).ready(function() {

    build_table();

    new Clipboard('.clipboard');

    $('.modified').each(function(index, item) {
        var modified = $(item).data('modified');
        var modified_str = moment(modified).fromNow();
        $(item).html(modified_str);
    });

    $('.size').each(function(index, item) {
        var size= $(item).data('size');
        $(item).html(bytesToSize(size));
    });
});