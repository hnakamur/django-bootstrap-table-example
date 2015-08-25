#!/bin/sh
rsync \
	bower_components/jquery/dist/jquery.min.js \
	bower_components/jquery/dist/jquery.min.map \
	bower_components/bootstrap/dist/js/bootstrap.min.js \
	bower_components/bootstrap-table/dist/bootstrap-table-all.js \
	bower_components/bootstrap-table/dist/locale/bootstrap-table-ja-JP.min.js \
	bower_components/jquery.cookie/jquery.cookie.js \
	bower_components/URIjs/src/URI.js \
	bower_components/mithril/mithril.js \
	project/bookmarks/static/js/

rsync \
	bower_components/bootstrap/dist/css/bootstrap.min.css \
	bower_components/bootstrap/dist/css/bootstrap-theme.min.css \
	bower_components/bootstrap-table/dist/bootstrap-table.min.css \
	project/bookmarks/static/css/

rsync \
	bower_components/bootstrap/dist/fonts/* \
	project/bookmarks/static/fonts/
