#!/bin/sh
rsync \
	bower_components/jquery/dist/jquery.min.js \
	bower_components/jquery/dist/jquery.min.map \
	bower_components/bootstrap/dist/js/bootstrap.min.js \
	bower_components/bootstrap-table/dist/bootstrap-table-all.min.js \
	bower_components/bootstrap-table/dist/locale/bootstrap-table-ja-JP.min.js \
	project/bookmarks/static/js/

rsync \
	bower_components/bootstrap/dist/css/bootstrap.min.css \
	bower_components/bootstrap/dist/css/bootstrap-theme.min.css \
	bower_components/bootstrap-table/dist/bootstrap-table.min.css \
	project/bookmarks/static/css/

