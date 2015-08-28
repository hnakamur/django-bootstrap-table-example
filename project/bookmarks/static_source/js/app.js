// NOTE: With browserify, you need to export jquery globally for plugins to find it
window.$ = window.jQuery = require('jquery');
require('jquery.cookie');
require('bootstrap');
require('bootstrap-table');
require('bootstrap-table-ja');
var m = require('mithril');
var PubSub = require('pubsub-js');
var URI = require('URIjs');

var BookmarksPage = {
  controller: function() {
    // NOTE: toolbar_dom_id is constant so we use a plain string instead of m.prop().
    this.toolbar_dom_id = 'toolbar1';
    this.selectedRow = m.prop({});
  },
  view: function(ctrl) {
    return [
      m.component(AlertPanel),
      m.component(Toolbar, { toolbar_dom_id: ctrl.toolbar_dom_id, selectedRow: ctrl.selectedRow }),
      m.component(BookmarksTable, {
        toolbar_dom_id: ctrl.toolbar_dom_id,
        selectedRow: ctrl.selectedRow,
        getBookmarksURL: API.getBookmarksURL
      }),
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
    return m('', [
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
  view: function(ctrl, args) {
    var deleteButtonAttrs = { onclick: ctrl.onClickDeleteButton };
    if (ctrl.selectedRow().id === undefined) {
      deleteButtonAttrs['class'] = 'disabled';
    }
    return m(".toolbar", { id: args.toolbar_dom_id }, [
      m(".btn-group",
        m("button.btn.btn-default[data-toggle='modal']", { onclick: ctrl.onClickAddButton }, "追加")
      ),
      m(".btn-group",
        m("button.btn.btn-default[data-toggle='modal']", deleteButtonAttrs, "削除")
      )
    ]);
  }
};

var BookmarksTable = {
  controller: function(args) {
    var ctrl = this;
    this.selectedRow = args.selectedRow;
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
              page = paramsInURI.page,
              page_size = paramsInURI.page_size,
              search_text = paramsInURI.search_text,
              ordering = paramsInURI.ordering;
          if (page) {
            options.pageNumber = page;
          }
          if (page_size) {
            options.pageSize = page_size;
          }
          if (search_text) {
            options.searchText = search_text;
          }
          if (ordering) {
            if (/^-/.test(ordering)) {
              options.sortOrder = 'desc';
              ordering = ordering.substr(1);
            } else {
              options.sortOrder = 'asc';
            }
            if (['id', 'url', 'title', 'bookmarked_at'].indexOf(ordering) !== -1) {
              options.sortName = ordering;
            }
          }
          return options;
        }

        function saveBrowserHistory(params) {
          var uri = new URI(),
              newURL;
          uri.query(params);
          newURL = '' + uri;
          if (newURL !== window.location.href) {
            window.history.pushState(undefined, document.title, '' + uri);
          }
        }

        function bookmarksTableQueryParamsAdaptor(params) {
          var newParams = {
            page: params.pageNumber,
            page_size: params.pageSize,
            search_text: params.searchText
          };
          if (params.sortName) {
            newParams.ordering = params.sortOrder === 'asc' ? params.sortName : '-' + params.sortName;
          }
          saveBrowserHistory(newParams);
          return newParams;
        }

        function bookmarksTableResponseHandler(res) {
          var res2 = {
            total: res.meta && res.meta.pagination && res.meta.pagination.count || res.data.length,
            rows: res.data.map(function(resource) {
              resource.attributes.id = resource.id;
              return resource.attributes;
            })
          };
          return res2;
        }

        function bookmarksTableURLFormatter(value) {
          if (/^https?:\/\//.test(value)) {
            return '<a href="' + value + '" target="_blank">' + value + '</a>';
          } else if (/^smb:\/\//.test(value)) {
            return value.substr('smb:'.length).replace(/\//g, '\\');
          } else {
            return value;
          }
        }

        function bookmarksTableDateTimeFormatter(value) {
          var dt = new Date(Date.parse(value));
          return dt.getFullYear() + '/' + format2digit(dt.getMonth() + 1) + '/' + format2digit(dt.getDay()) + ' ' +
            format2digit(dt.getHours()) + ':' + format2digit(dt.getMinutes()) + ':' + format2digit(dt.getSeconds());
        }
        function format2digit(value) {
          return value < 10 ? '0' + value : '' + value;
        }

        $(ctrl.tableElem).bootstrapTable(addSortOptions({
          url: args.getBookmarksURL,
          toolbar: '#' + args.toolbar_dom_id,
          pageList: [10, 25, 50, 100],
          columns: [
            {
              field: 'state',
              radio: true
            },
            {
              title: 'ID',
              field: 'id',
              sortable: true
            },
            {
              title: 'URL',
              field: 'url',
              sortable: true,
              formatter: bookmarksTableURLFormatter
            },
            {
              title: 'タイトル',
              field: 'title',
              sortable: true
            },
            {
              title: '作成日時',
              field: 'bookmarked_at',
              sortable: true,
              formatter: bookmarksTableDateTimeFormatter
            }
          ],
          queryParamsType: 'page',
          queryParams: bookmarksTableQueryParamsAdaptor,
          responseHandler: bookmarksTableResponseHandler,
          pagination: true,
          sidePagination: 'server',
          clickToSelect: true,
          striped: true,
          search: true,
          showColumns: true,
          showToggle: true,
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
  },
  view: function(ctrl, args) {
    return m("table.bookmarks-table", { config: ctrl.configTable }, [
      m("colgroup", [
        m("col.bookmarks-table-select-column"),
        m("col.bookmarks-table-id-column"),
        m("col.bookmarks-table-title-column"),
        m("col.bookmarks-table-url-column"),
        m("col.bookmarks-table-bookmarked-at-column")
      ])
    ]);
  }
};

var AddBookmarkDialog = {
  controller: function() {
    var ctrl = this;
    this.validated = m.prop(false);
    this.errorMessage = m.prop('');
    this.errorData = m.prop({});
    this.url = m.prop('');
    this.title = m.prop('');
    this.configDialog = function(elem, isInitialized, context) {
      if (!isInitialized) {
        ctrl.dialogElem = elem;
      }
    };
    this.configURLInput = function(elem, isInitialized, context) {
      if (!isInitialized) {
        ctrl.urlInputElem = elem;
      }
    };
    this.show = function() {
      ctrl.validated(false);
      ctrl.errorMessage('');
      ctrl.url('');
      ctrl.title('');
      m.redraw();
      $(ctrl.dialogElem).one('shown.bs.modal', function () {
          $(ctrl.urlInputElem).focus()
      })
      $(ctrl.dialogElem).modal('show');
    };
    this.hide = function() {
      $(ctrl.dialogElem).modal('hide');
    };
    this.onClickAddButton = function() {
      ctrl.validated(false);
      API.addBookmark(ctrl.url(), ctrl.title())
        .then(ctrl.hide)
        .then(function() {
          PubSub.publish('BookmarksTable.showSuccessFlashMessage', {message: 'ブックマークを登録しました'});
          PubSub.publish('BookmarksTable.refresh');
        })
        .then(null, function(data) {
          ctrl.validated(true);
          ctrl.errorData(data.errors);
          ctrl.errorMessage('ブックマーク登録に失敗しました');
        });
    };
    PubSub.subscribe('AddBookmarkDialog.show', this.show);
  },
  view: function(ctrl) {
    function errorMessageForKey(key) {
      if (ctrl.validated()) {
        var errors = ctrl.errorData(),
            r = new RegExp('/' + key + '$');
        for (var i = 0; i < errors.length; i++) {
          var error = errors[i];
          if (r.test(error.source.pointer)) {
            return m('ul.list-unstyled.help-block',
              m('li', error.detail)
            );
          }
        }
      }
      return null;
    }
    function validationStatusClass(key) {
      if (ctrl.validated()) {
        return {'class': errorMessageForKey(key) !== null ? 'has-error' : 'has-success'};
      } else {
        return {};
      }
    }
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
            m(".alerts-container", [
              ctrl.errorMessage() !== '' ? m(".alert.alert-danger[role='alert']", ctrl.errorMessage()) : ''
            ]),
            m("form", [
              m(".form-group", validationStatusClass('url'), [
                m("label.control-label[for='addDialogURL']", "URL"),
                m("input.form-control[type='text']", {
                  config: ctrl.configURLInput,
                  onchange: m.withAttr('value', ctrl.url),
                  value: ctrl.url()
                }),
                errorMessageForKey('url')
              ]),
              m(".form-group", validationStatusClass('title'), [
                m("label.control-label[for='addDialogTitle']", "タイトル"),
                m("input.form-control[type='text']", {
                  onchange: m.withAttr('value', ctrl.title),
                  value: ctrl.title()
                }),
                errorMessageForKey('title')
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
    this.errorMessage = m.prop('');
    this.id = m.prop();
    this.url = m.prop('');
    this.title = m.prop('');
    this.configDialog = function(elem, isInitialized, context) {
      if (!isInitialized) {
        ctrl.dialogElem = elem;
      }
    };
    this.show = function(msg, data) {
      ctrl.errorMessage('');
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
          PubSub.publish('BookmarksTable.refresh');
        })
        .then(null, function(data) {
          ctrl.errorMessage(data.errors[0].title);
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
            m(".alerts-container", [
              ctrl.errorMessage() !== '' ? m(".alert.alert-danger[role='alert']", ctrl.errorMessage()) : ''
            ]),
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

var API = {
  getBookmarksURL: '/api/v2/bookmarks/',
  addBookmark: function(url, title) {
    var apiURL = '/api/v2/bookmarks/',
        data = {
          data: {
            type: 'bookmark',
            attributes: {
              url: url,
              title: title
            }
          }
        },
        xhrConfig = function(xhr) {
          xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
          //xhr.setRequestHeader('Content-Type', 'application/vnd.api+json');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Accept', 'application/vnd.api+json');
        };
    return m.request({
      method: 'POST',
      url: apiURL,
      config: xhrConfig,
      data: data,
      unwrapError: API._unwrapError
    });
  },
  deleteBookmark: function(id) {
    var apiURL = '/api/v2/bookmarks/' + id,
        xhrConfig = function(xhr) {
          xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
          xhr.setRequestHeader('Accept', 'application/vnd.api+json');
        };
    return m.request({
      method: 'DELETE',
      url: apiURL,
      config: xhrConfig,
      unwrapError: API._unwrapError
    });
  },
  _unwrapError: function(data, xhr) {
    if (data.errors) {
      return data;
    } else {
      return {
        errors: [{
          title: xhr.statusText
        }]
      };
    }
  }
};

m.mount(document.getElementById('componentContainer'), BookmarksPage);
