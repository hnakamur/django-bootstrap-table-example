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
