#!/bin/sh

set -e

trace() { echo "$ $*"; "$@"; }

D="$(realpath $(dirname $0))"

wgsldebugexample_update() {
	echo "[+] building wgsl-debug example"
	DIR_WGSLDEBUG="$HOME/code/wgsl-debug"
	dirname="wgsl-debug-example"

	trace cd "$DIR_WGSLDEBUG/"
	trace npm install
	trace npm run build
	trace cd "$DIR_WGSLDEBUG/wgsl-debug-table"
	trace npm install
	trace npm run build
	trace cd "$DIR_WGSLDEBUG/example"
	trace mkdir -p "$D/$dirname"
	trace npm install
	trace npx vite build -c config/vite.config.ts --base "/$dirname/" --outDir "$D/$dirname"
}

wgsldebugexample_commit() {
	echo "[+] commiting wgsl-debug example"
	cd "$D"
	trace git commit -m 'update wgsl-debug example' $dirname
	trace git status
}

[ "$1" = "commit" ] \
	&& ( wgsldebugexample_commit ) \
	|| ( wgsldebugexample_update )

