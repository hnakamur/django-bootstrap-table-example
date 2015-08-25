var BookmarksPage = {
  controller: function() {
    this.selectedRow = m.prop({});
  },
  view: function(ctrl) {
    return [
      m.component(AlertPanel),
      m.component(Toolbar, { selectedRow: ctrl.selectedRow }),
      m.component(BookmarksTable, { selectedRow: ctrl.selectedRow }),
      m.component(AddBookmarkDialog),
      m.component(DeleteBookmarkDialog)
    ];
  }
};

var AlertPanel = {
  controller: function() {
    var ctrl = this;
    this.message = m.prop('');
    this.visible = m.prop(false);
    this.showSuccessFlashMessage = function(msg, data) {
      ctrl.message(data.message);
      ctrl.visible(true);
      m.redraw();
      setTimeout(function() {
        ctrl.visible(false);
        m.redraw();
      }, 5000);
    };
    PubSub.subscribe('BookmarksTable.showSuccessFlashMessage', this.showSuccessFlashMessage);
  },
  view: function(ctrl) {
    return m("[id='alerts']", [
      ctrl.visible() ?
        m(".alert.alert-success[role='alert']", ctrl.message()) : ''
    ]);
  }
};

var Toolbar = {
  controller: function(args) {
    var ctrl = this;
    this.selectedRow = args.selectedRow;
    this.onClickAddButton = function() {
      PubSub.publish('AddBookmarkDialog.show');
    };
    this.onClickDeleteButton = function() {
      var row = ctrl.selectedRow();
      PubSub.publish('DeleteBookmarkDialog.show', {
        id: row.id,
        url: row.url,
        title: row.title
      });
    };
  },
  view: function(ctrl) {
    var deleteButtonAttrs = { onclick: ctrl.onClickDeleteButton };
    if (ctrl.selectedRow().id === undefined) {
      deleteButtonAttrs['class'] = 'disabled';
    }
    return m("[id='toolbar']", [
      m("button.btn.btn-default[data-toggle='modal']", { onclick: ctrl.onClickAddButton }, "追加"),
      m("button.btn.btn-default[data-toggle='modal']", deleteButtonAttrs, "削除")
    ]);
  }
};

var BookmarksTable = {
  controller: function(args) {
    this.selectedRow = args.selectedRow
    var ctrl = this;
    this.updateSelectedRow = function(row) {
      ctrl.selectedRow(row);
      m.redraw();
    };
    this.configTable = function(elem, isInitialized, context) {
      if (!isInitialized) {
        ctrl.tableElem = elem;

        function addSortOptions(options) {
          var uri = new URI(),
              paramsInURI = uri.query(true),
              sort = paramsInURI.sort,
              order = paramsInURI.order;
          if (['id', 'url', 'title', 'bookmarked_at'].indexOf(sort) !== -1) {
            options.sortName = sort;
          }
          if (['asc', 'desc'].indexOf(order) !== -1) {
            options.sortOrder = order;
          }
          return options;
        }

        $(ctrl.tableElem).bootstrapTable(addSortOptions({
          onCheck: function() {
            var row = $(ctrl.tableElem).bootstrapTable('getSelections')[0];
            ctrl.updateSelectedRow(row);
          }
        }));
      }
    };

    this.refresh = function() {
      $(ctrl.tableElem).bootstrapTable('refresh');
      ctrl.updateSelectedRow({});
    };
    PubSub.subscribe('BookmarksTable.refresh', this.refresh);

    this.deleteSelectedRow = function() {
      var id = ctrl.selectedRow().id;
      if (id !== undefined) {
        $(ctrl.tableElem).bootstrapTable('remove', {
          field: 'id',
          values: [id]
        });
        ctrl.updateSelectedRow({});
      }
    }
    PubSub.subscribe('BookmarksTable.deleteSelectedRow', this.deleteSelectedRow);
  },
  view: function(ctrl) {
    return m("table.bookmarks-table[data-click-to-select='true'][data-page-list='[10, 25, 50, 100]'][data-pagination='true'][data-query-params='saveBrowserHistory'][data-search='true'][data-show-columns='true'][data-show-toggle='true'][data-side-pagination='server'][data-striped='true'][data-toggle='table'][data-toolbar='#toolbar'][data-url='/api/v1/bookmarks/'][id='table']", { config: ctrl.configTable }, [
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

var API = {
  addBookmark: function(url, title) {
    var apiURL = '/api/v1/bookmarks/',
        data = {
          url: url,
          title: title
        },
        xhrConfig = function(xhr) {
          xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        };
    return m.request({
      method: 'POST',
      url: apiURL,
      config: xhrConfig,
      data: data,
      serialize: $.param
    });
  },
  deleteBookmark: function(id) {
    var apiURL = '/api/v1/bookmarks/' + id,
        xhrConfig = function(xhr) {
          xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
        };
    return m.request({
      method: 'DELETE',
      url: apiURL,
      config: xhrConfig
    });
  }
};

var AddBookmarkDialog = {
  controller: function() {
    var ctrl = this;
    this.url = m.prop('');
    this.title = m.prop('');
    this.configDialog = function(elem, isInitialized, context) {
      if (!isInitialized) {
        ctrl.dialogElem = elem;
      }
    };
    this.show = function() {
      ctrl.url('');
      ctrl.title('');
      $(ctrl.dialogElem).modal('show');
    };
    this.hide = function() {
      $(ctrl.dialogElem).modal('hide');
    };
    this.onClickAddButton = function() {
      API.addBookmark(ctrl.url(), ctrl.title())
        .then(ctrl.hide)
        .then(function() {
          PubSub.publish('BookmarksTable.showSuccessFlashMessage', {message: 'ブックマークを登録しました'});
          PubSub.publish('BookmarksTable.refresh');
        });
    };
    PubSub.subscribe('AddBookmarkDialog.show', this.show);
  },
  view: function(ctrl) {
    return m(".modal.fade", { config: ctrl.configDialog }, [
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
                m("input.form-control[type='text']",
                  {onchange: m.withAttr('value', ctrl.url), value: ctrl.url()})
              ]),
              m(".form-group", [
                m("label[for='addDialogTitle']", "タイトル"),
                m("input.form-control[type='text']",
                  {onchange: m.withAttr('value', ctrl.title), value: ctrl.title()})
              ])
            ])
          ]),
          m(".modal-footer", [
            m("button.btn.btn-default[data-dismiss='modal'][type='button']", "キャンセル"),
            m("button.btn.btn-primary[type='button']", { onclick: ctrl.onClickAddButton }, "追加")
          ])
        ])
      ])
    ]);
  }
};

var DeleteBookmarkDialog = {
  controller: function() {
    var ctrl = this;
    this.id = m.prop();
    this.url = m.prop('');
    this.title = m.prop('');
    this.configDialog = function(elem, isInitialized, context) {
      if (!isInitialized) {
        ctrl.dialogElem = elem;
      }
    };
    this.show = function(msg, data) {
      ctrl.id(data.id);
      ctrl.url(data.url);
      ctrl.title(data.title);
      m.redraw();
      $(ctrl.dialogElem).modal('show');
    };
    this.hide = function() {
      $(ctrl.dialogElem).modal('hide');
    };
    this.onClickDeleteButton = function() {
      API.deleteBookmark(ctrl.id())
        .then(ctrl.hide)
        .then(function() {
          PubSub.publish('BookmarksTable.showSuccessFlashMessage', {message: 'ブックマークを削除しました'});
          PubSub.publish('BookmarksTable.deleteSelectedRow');
        });
    };
    PubSub.subscribe('DeleteBookmarkDialog.show', this.show);
  },
  view: function(ctrl) {
    return m(".modal.fade", { config: ctrl.configDialog }, [
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
              m("dd", ctrl.url()),
              m("dt", "タイトル"),
              m("dd", ctrl.title())
            ])
          ]),
          m(".modal-footer", [
            m("button.btn.btn-default[data-dismiss='modal'][type='button']", "キャンセル"),
            m("button.btn.btn-primary[type='button']", { onclick: ctrl.onClickDeleteButton }, "削除")
          ])
        ])
      ])
    ]);
  }
};

m.mount(document.getElementById('componentContainer'), BookmarksPage);

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

function showErrorInDialog(dialogID, jqXHR) {
  var message = jqXHR.responseJSON ? jqXHR.responseJSON.errors[0].title : jqXHR.statusText;
  $('#' + dialogID + ' .alerts-container').prepend(
    '<div class="alert alert-danger" role="alert">' + message + '</div>'
  );
  $('#' + dialogID).one('hidden.bs.modal', function() {
    $('#' + dialogID + ' .alerts-container').empty();
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
