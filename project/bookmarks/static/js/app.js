var BookmarksPage = {
  view: function(ctrl) {
    return [
      m.component(AlertPanel),
      m.component(Toolbar),
      m.component(BookmarksTable),
      m.component(RegisterBookmarkDialog),
      m.component(DeleteBookmarkDialog)
    ];
  }
};

var AlertPanel = {
  view: function(ctrl) {
    return m("[id='alerts']");
  }
};

var Toolbar = {
  view: function(ctrl) {
    return m("[id='toolbar']", [
      m("button.btn.btn-default[data-target='#addDialog'][data-toggle='modal'][id='addButton']", "追加"),
      m("button.btn.btn-default.disabled[data-target='#deleteDialog'][data-toggle='modal'][id='deleteButton']", "削除")
    ]);
  }
};

var BookmarksTable = {
  view: function(ctrl) {
    return m("table.bookmarks-table[data-click-to-select='true'][data-page-list='[10, 25, 50, 100]'][data-pagination='true'][data-query-params='saveBrowserHistory'][data-search='true'][data-show-columns='true'][data-show-toggle='true'][data-side-pagination='server'][data-striped='true'][data-toggle='table'][data-toolbar='#toolbar'][data-url='/api/v1/bookmarks/'][id='table']", [
      m("colgroup", [
        m("col.bookmarks-table-select-column"),
        m("col.bookmarks-table-id-column"),
        m("col.bookmarks-table-title-column"),
        m("col.bookmarks-table-url-column"),
        m("col.bookmarks-table-bookmarked-at-column")
      ]),
      m("thead", [
        m("tr", [
          m("th[data-field='state'][data-radio='true']"),
          m("th[data-field='id'][data-sortable='true']", "ID"),
          m("th[data-field='url'][data-formatter='urlFormatter'][data-sortable='true']", "URL"),
          m("th[data-field='title'][data-sortable='true']", "タイトル"),
          m("th[data-field='bookmarked_at'][data-formatter='datetimeFormatter'][data-sortable='true']", "作成日時")
        ])
      ])
    ]);
  }
};

var RegisterBookmarkDialog = {
  view: function(ctrl) {
    return m(".modal.fade[id='addDialog']", [
      m(".modal-dialog", [
        m(".modal-content", [
          m(".modal-header", [
            m("button.close[aria-label='Close'][data-dismiss='modal'][type='button']", [
              m("span[aria-hidden='true']", "×")
            ]),
            m("h4.modal-title", "ブックマークの登録")
          ]),
          m(".modal-body", [
            m(".alerts-container"),
            m("form", [
              m(".form-group", [
                m("label[for='addDialogURL']", "URL"),
                m("input.form-control[id='addDialogURL'][type='text']")
              ]),
              m(".form-group", [
                m("label[for='addDialogTitle']", "タイトル"),
                m("input.form-control[id='addDialogTitle'][type='text']")
              ])
            ])
          ]),
          m(".modal-footer", [
            m("button.btn.btn-default[data-dismiss='modal'][type='button']", "キャンセル"),
            m("button.btn.btn-primary[id='addDialogAddButton'][type='button']", "追加")
          ])
        ])
      ])
    ]);
  }
};

var DeleteBookmarkDialog = {
  view: function(ctrl) {
    return m(".modal.fade[id='deleteDialog']", [
      m(".modal-dialog", [
        m(".modal-content", [
          m(".modal-header", [
            m("button.close[aria-label='Close'][data-dismiss='modal'][type='button']", [m("span[aria-hidden='true']", "×")]),
            m("h4.modal-title", "ブックマークを削除しますか？")
          ]),
          m(".modal-body", [
            m(".alerts-container"),
            m("dl", [
              m("dt", "URL"),
              m("dd[id='deleteDialogBookmarkURL']"),
              m("dt", "タイトル"),
              m("dd[id='deleteDialogBookmarkTitle']")
            ])
          ]),
          m(".modal-footer", [
            m("button.btn.btn-default[data-dismiss='modal'][type='button']", "キャンセル"),
            m("button.btn.btn-primary[id='deleteDialogDeleteButton'][type='button']", "削除")
          ])
        ])
      ])
    ]);
  }
};

m.mount(document.getElementById('componentContainer'), BookmarksPage);

var $table = $('#table');

function addSortOptions(options) {
  var uri = new URI(),
      paramsInURI = uri.query(true),
      sort = paramsInURI.sort,
      order = paramsInURI.order;
  if ($.inArray(sort, ['id', 'url', 'title', 'bookmarked_at']) !== -1) {
    options.sortName = sort;
  }
  if ($.inArray(order, ['asc', 'desc']) !== -1) {
    options.sortOrder = order;
  }
  return options;
}

$table.bootstrapTable(addSortOptions({
  onCheck: function() {
    $('#deleteButton').removeClass('disabled');
  }
}));

function saveBrowserHistory(params) {
  var uri = new URI(),
      newURL;
  uri.query(params);
  newURL = '' + uri;
  if (newURL !== window.location.href) {
    window.history.pushState(undefined, document.title, '' + uri);
  }
  return params;
}

$('#addButton').on('click', function(e) {
  $('#addDialogURL').val('');
  $('#addDialogTitle').val('');
});

$('#addDialogAddButton').on('click', function(e) {
  var apiURL = '/api/v1/bookmarks/',
      url = $('#addDialogURL').val(),
      title = $('#addDialogTitle').val();
  $.ajax({
    url: apiURL,
    method: 'POST',
    headers: {
      'X-CSRFToken': $.cookie('csrftoken')
    },
    data: {
      url: url,
      title: title
    }
  })
  .done(function(data, textStatus, jqXHR) {
    $('#addDialog').modal('hide');
    showSuccessFlashMessage('ブックマークが登録されました');
    refreshTable();
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    showErrorInDialog('addDialog', jqXHR);
  });
})

$('#deleteButton').on('click', function(e) {
  var row = getSelectedRow();
  $('#deleteDialogBookmarkURL').html(row.url);
  $('#deleteDialogBookmarkTitle').html(row.title);
});

$('#deleteDialogDeleteButton').on('click', function(e) {
  var row = getSelectedRow();
  var apiURL= '/api/v1/bookmarks/' + row.id + '/';
  $.ajax({
    url: apiURL,
    method: 'DELETE',
    headers: {
      'X-CSRFToken': $.cookie('csrftoken')
    },
  })
  .done(function(data, textStatus, jqXHR) {
    $('#deleteDialog').modal('hide');
    deleteSelectedRows();
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    showErrorInDialog('deleteDialog', jqXHR);
  });
});

function showSuccessFlashMessage(message) {
  $('#alerts').prepend(
    '<div class="alert alert-success" role="alert">' + message + '</div>'
  );
  setTimeout(function() {
    $('#alerts').empty();
  }, 5000);
}

function showErrorInDialog(dialogID, jqXHR) {
  var message = jqXHR.responseJSON ? jqXHR.responseJSON.errors[0].title : jqXHR.statusText;
  $('#' + dialogID + ' .alerts-container').prepend(
    '<div class="alert alert-danger" role="alert">' + message + '</div>'
  );
  $('#' + dialogID).one('hidden.bs.modal', function() {
    $('#' + dialogID + ' .alerts-container').empty();
  });
}

function refreshTable() {
  $table.bootstrapTable('refresh');
  $('#deleteButton').addClass('disabled');
}

function getSelectedRow() {
  return $table.bootstrapTable('getSelections')[0];
}

function deleteSelectedRows() {
  var ids = $.map($table.bootstrapTable('getSelections'), function (row) {
    return row.id;
  });
  $table.bootstrapTable('remove', {
    field: 'id',
    values: ids
  });
}

function urlFormatter(value) {
  if (/^https?:\/\//.test(value)) {
    return '<a href="' + value + '" target="_blank">' + value + '</a>';
  } else if (/^smb:\/\//.test(value)) {
    return value.substr('smb:'.length).replace(/\//g, '\\');
  } else {
    return value;
  }
}
function datetimeFormatter(value) {
  var dt = new Date(Date.parse(value));
  return dt.getFullYear() + '/' + format2digit(dt.getMonth() + 1) + '/' + format2digit(dt.getDay()) + ' ' +
    format2digit(dt.getHours()) + ':' + format2digit(dt.getMinutes()) + ':' + format2digit(dt.getSeconds());
}
function format2digit(value) {
  return value < 10 ? '0' + value : '' + value;
}
